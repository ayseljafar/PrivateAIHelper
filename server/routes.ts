import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import * as openai from "./openai";
import session from "express-session";
import multer from "multer";
import path from "path";
import fs from "fs";
import { promisify } from "util";

// Extend the Express session type to include our custom properties
declare module "express-session" {
  interface SessionData {
    messages?: Array<{
      id: string;
      role: "user" | "assistant";
      content: string;
      timestamp: string;
    }>;
  }
}

// Extend the Request type to handle Express session and user auth
interface AuthRequest extends Request {
  session: session.Session & {
    messages?: Array<{
      id: string;
      role: "user" | "assistant";
      content: string;
      timestamp: string;
    }>;
  };
}

// Helper function to ensure user is authenticated
function ensureAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Helper function to handle async errors
function asyncHandler(fn: Function) {
  return async (req: Request, res: Response, next: Function) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup file upload storage
  const uploadDir = path.join(process.cwd(), 'uploads');
  // Ensure uploads directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  // Configure multer for file uploads
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  });
  
  const upload = multer({ 
    storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB file size limit
    },
    fileFilter: function(req, file, cb) {
      // Accept all common file types
      const allowedTypes = [
        // Code files
        '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.cs', '.php', '.go', '.rb', '.rs', 
        // Data files
        '.json', '.csv', '.xml', '.yaml', '.yml',
        // Web files
        '.html', '.css', '.scss', '.sass', '.less',
        // Doc files
        '.md', '.txt', '.pdf',
        // Image files
        '.jpg', '.jpeg', '.png', '.gif', '.svg'
      ];
      
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(ext)) {
        return cb(null, true);
      }
      
      cb(new Error('Only common file types are allowed'));
    }
  });
  
  // Setup authentication routes
  setupAuth(app);
  
  // Projects routes
  app.get("/api/projects", ensureAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    const projects = await storage.getProjects(req.user?.id);
    res.json(projects);
  }));
  
  app.get("/api/projects/recent", ensureAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    const projects = await storage.getRecentProjects(req.user!.id, 5);
    res.json(projects);
  }));
  
  app.get("/api/projects/:id", ensureAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    const project = await storage.getProject(parseInt(req.params.id));
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  }));
  
  app.post("/api/projects", ensureAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    const project = await storage.createProject({
      ...req.body,
      userId: req.user!.id
    });
    
    // Record activity
    await storage.createActivity({
      type: "project_created",
      description: `Project "${project.name}" was created`,
      projectId: project.id,
      metadata: { projectType: project.type }
    });
    
    res.status(201).json(project);
  }));
  
  // Deployments routes
  app.get("/api/deployments", ensureAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    const deployments = await storage.getDeployments();
    res.json(deployments);
  }));
  
  app.post("/api/deployments", ensureAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    const deployment = await storage.createDeployment({
      ...req.body,
      deployedBy: req.user!.username
    });
    
    // Record activity
    await storage.createActivity({
      type: "deployment_created",
      description: `New deployment to ${deployment.environment} environment`,
      projectId: deployment.projectId,
      metadata: { status: deployment.status }
    });
    
    res.status(201).json(deployment);
  }));
  
  // Environments routes
  app.get("/api/environments", ensureAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    const environments = await storage.getEnvironments();
    res.json(environments);
  }));
  
  app.get("/api/environments/:id", ensureAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    const environment = await storage.getEnvironment(parseInt(req.params.id));
    if (!environment) {
      return res.status(404).json({ message: "Environment not found" });
    }
    res.json(environment);
  }));
  
  app.patch("/api/environments/:id", ensureAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    const environment = await storage.updateEnvironment(parseInt(req.params.id), req.body);
    res.json(environment);
  }));
  
  // Integrations routes
  app.get("/api/integrations", ensureAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    const integrations = await storage.getIntegrations();
    res.json(integrations);
  }));
  
  app.post("/api/integrations", ensureAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    const integration = await storage.createIntegration(req.body);
    
    // Record activity
    await storage.createActivity({
      type: "integration_created",
      description: `New integration "${integration.name}" was added`,
      metadata: { integrationType: integration.type }
    });
    
    res.status(201).json(integration);
  }));
  
  // Activities routes
  app.get("/api/activities", ensureAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const activities = await storage.getActivities(limit);
    res.json(activities);
  }));
  
  // Approvals routes
  app.get("/api/approvals", ensureAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as string | undefined;
    const approvals = await storage.getApprovals(status);
    res.json(approvals);
  }));
  
  app.get("/api/approvals/count", ensureAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as string || "pending";
    const count = await storage.getApprovalsCount(status);
    res.json({ count });
  }));
  
  app.patch("/api/approvals/:id/status", ensureAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const approval = await storage.updateApprovalStatus(parseInt(req.params.id), status);
    
    // Record activity
    await storage.createActivity({
      type: "approval_updated",
      description: `Approval "${approval.title}" was ${status}`,
      metadata: { approvalType: approval.type, status }
    });
    
    res.json(approval);
  }));
  
  // Logs routes
  app.get("/api/logs", ensureAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    const logs = await storage.getLogs();
    res.json(logs);
  }));
  
  // Messages routes
  app.get("/api/messages", ensureAuthenticated, asyncHandler(async (req: AuthRequest, res: Response) => {
    // For now, we'll store messages in memory without persisting them to storage
    // In a production environment, you'd want to store these in a database
    const messages = req.session.messages || [];
    res.json(messages);
  }));
  
  app.post("/api/messages", ensureAuthenticated, asyncHandler(async (req: AuthRequest, res: Response) => {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: "Message content is required" });
    }
    
    // Initialize messages array if it doesn't exist
    if (!req.session.messages) {
      req.session.messages = [];
    }
    
    // Create user message
    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content,
      timestamp: new Date().toISOString()
    };
    
    // Add user message to session
    req.session.messages.push(userMessage);
    
    try {
      // Generate AI response using OpenAI
      const messages = [
        { role: "system", content: "You are Rashed, a private AI developer assistant that helps with coding, deployments, and integrations." },
        ...req.session.messages.map((msg) => ({ 
          role: (msg.role === "user" ? "user" : "assistant") as "user" | "assistant" | "system", 
          content: msg.content 
        }))
      ];
      
      const completion = await openai.createChatCompletion({
        messages,
        temperature: 0.7,
        max_tokens: 1000
      });
      
      // Create assistant message
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: completion.choices[0].message.content || "",
        timestamp: new Date().toISOString()
      };
      
      // Add assistant message to session
      req.session.messages.push(assistantMessage);
      
      // Record activity for the conversation
      await storage.createActivity({
        type: "chat_interaction",
        description: "Chat interaction with AI assistant",
        metadata: { messageCount: req.session.messages.length }
      });
      
      // Return the assistant message
      res.status(201).json(assistantMessage);
    } catch (error: any) {
      console.error("Chat processing error:", error.message);
      res.status(500).json({ 
        message: "Error processing message", 
        error: error.message 
      });
    }
  }));
  
  app.post("/api/messages/reset", ensureAuthenticated, asyncHandler(async (req: AuthRequest, res: Response) => {
    // Clear messages from session
    req.session.messages = [];
    res.status(200).json({ message: "Conversation reset successfully" });
  }));
  
  // OpenAI integration routes
  app.post("/api/ai/chat", ensureAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    const schema = z.object({
      messages: z.array(z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string()
      })),
      temperature: z.number().optional(),
      max_tokens: z.number().optional()
    });
    
    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: "Invalid request body", errors: validation.error.format() });
    }
    
    try {
      const result = await openai.createChatCompletion(validation.data);
      res.json(result);
    } catch (error: any) {
      console.error("OpenAI API error:", error.message);
      res.status(500).json({ 
        message: "Error from OpenAI API", 
        error: error.message 
      });
    }
  }));
  
  app.post("/api/ai/code", ensureAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    const { prompt, language } = req.body;
    
    if (!prompt || !language) {
      return res.status(400).json({ message: "Prompt and language are required" });
    }
    
    try {
      const result = await openai.generateCode(prompt, language);
      res.json(result);
    } catch (error: any) {
      console.error("OpenAI API error:", error.message);
      res.status(500).json({ 
        message: "Error from OpenAI API", 
        error: error.message 
      });
    }
  }));
  
  app.post("/api/ai/analyze", ensureAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    const { code, language } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ message: "Code and language are required" });
    }
    
    try {
      const result = await openai.analyzeCode(code, language);
      res.json(result);
    } catch (error: any) {
      console.error("OpenAI API error:", error.message);
      res.status(500).json({ 
        message: "Error from OpenAI API", 
        error: error.message 
      });
    }
  }));
  
  app.post("/api/ai/document", ensureAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    const { code, language } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ message: "Code and language are required" });
    }
    
    try {
      const result = await openai.generateDocumentation(code, language);
      res.json({ documentation: result });
    } catch (error: any) {
      console.error("OpenAI API error:", error.message);
      res.status(500).json({ 
        message: "Error from OpenAI API", 
        error: error.message 
      });
    }
  }));
  
  app.post("/api/ai/requirements", ensureAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ message: "Project description is required" });
    }
    
    try {
      const result = await openai.naturalLanguageToRequirements(description);
      res.json(result);
    } catch (error: any) {
      console.error("OpenAI API error:", error.message);
      res.status(500).json({ 
        message: "Error from OpenAI API", 
        error: error.message 
      });
    }
  }));
  
  // File upload routes
  app.post("/api/files/upload", ensureAuthenticated, upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    // Return file information
    const fileInfo = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      mimetype: req.file.mimetype,
      uploadedAt: new Date().toISOString()
    };
    
    // Record activity for the file upload
    await storage.createActivity({
      type: "file_uploaded",
      description: `File "${req.file.originalname}" was uploaded`,
      metadata: { filesize: req.file.size, filetype: path.extname(req.file.originalname) }
    });
    
    res.status(201).json(fileInfo);
  }));
  
  app.get("/api/files", ensureAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    const readdir = promisify(fs.readdir);
    const stat = promisify(fs.stat);
    
    try {
      const uploadDir = path.join(process.cwd(), 'uploads');
      const files = await readdir(uploadDir);
      
      const fileInfoPromises = files.map(async (filename) => {
        const filePath = path.join(uploadDir, filename);
        const stats = await stat(filePath);
        
        // Extract the original filename from the stored filename pattern
        const originalFilename = filename.split('-').slice(2).join('-') || filename;
        
        return {
          filename,
          originalname: originalFilename,
          size: stats.size,
          path: filePath,
          uploadedAt: stats.mtime.toISOString()
        };
      });
      
      const fileInfos = await Promise.all(fileInfoPromises);
      res.json(fileInfos);
    } catch (error: any) {
      console.error("Error reading upload directory:", error);
      res.status(500).json({ message: "Error retrieving files", error: error.message });
    }
  }));
  
  app.post("/api/files/analyze", ensureAuthenticated, upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    try {
      const readFile = promisify(fs.readFile);
      const fileContent = await readFile(req.file.path, 'utf8');
      const fileExt = path.extname(req.file.originalname).slice(1); // Remove the dot
      
      // Map file extension to a programming language name
      const languageMap: {[key: string]: string} = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'java': 'java',
        'c': 'c',
        'cpp': 'c++',
        'cs': 'c#',
        'php': 'php',
        'go': 'go',
        'rb': 'ruby',
        'rs': 'rust',
        'html': 'html',
        'css': 'css',
        'json': 'json',
        'md': 'markdown'
      };
      
      const language = languageMap[fileExt] || fileExt;
      
      // Analyze the code using OpenAI
      const analysis = await openai.analyzeCode(fileContent, language);
      
      // Record activity
      await storage.createActivity({
        type: "file_analyzed",
        description: `File "${req.file.originalname}" was analyzed`,
        metadata: { language, filesize: req.file.size }
      });
      
      res.json({
        filename: req.file.originalname,
        language,
        analysis
      });
    } catch (error: any) {
      console.error("Error analyzing file:", error);
      res.status(500).json({ 
        message: "Error analyzing file", 
        error: error.message 
      });
    }
  }));

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}