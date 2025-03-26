import { users, projects, deployments, environments, integrations, activities, approvals, logs, 
  type User, type InsertUser, type Project, type Deployment, type Environment, 
  type Integration, type Activity, type Approval, type Log } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Create session stores
const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Session store for authentication
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project operations
  getProjects(userId?: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: any): Promise<Project>;
  getRecentProjects(userId: number, limit: number): Promise<Project[]>;
  
  // Deployment operations
  getDeployments(): Promise<Deployment[]>;
  createDeployment(deployment: any): Promise<Deployment>;
  
  // Environment operations
  getEnvironments(): Promise<Environment[]>;
  getEnvironment(id: number): Promise<Environment | undefined>;
  updateEnvironment(id: number, data: any): Promise<Environment>;
  
  // Integration operations
  getIntegrations(): Promise<Integration[]>;
  createIntegration(integration: any): Promise<Integration>;
  
  // Activity operations
  getActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: any): Promise<Activity>;
  
  // Approval operations
  getApprovals(status?: string): Promise<Approval[]>;
  getApprovalsCount(status: string): Promise<number>;
  updateApprovalStatus(id: number, status: string): Promise<Approval>;
  
  // Log operations
  getLogs(): Promise<Log[]>;
  createLog(log: any): Promise<Log>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...insertUser,
      name: insertUser.name || null,
    }).returning();
    
    return result[0];
  }
  
  // Project methods
  async getProjects(userId?: number): Promise<Project[]> {
    if (userId) {
      return db.select().from(projects).where(eq(projects.userId, userId));
    }
    return db.select().from(projects);
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createProject(project: any): Promise<Project> {
    const result = await db.insert(projects).values(project).returning();
    return result[0];
  }
  
  async getRecentProjects(userId: number, limit: number): Promise<Project[]> {
    return db.select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt))
      .limit(limit);
  }
  
  // Deployment methods
  async getDeployments(): Promise<Deployment[]> {
    return db.select().from(deployments);
  }
  
  async createDeployment(deployment: any): Promise<Deployment> {
    const result = await db.insert(deployments).values(deployment).returning();
    return result[0];
  }
  
  // Environment methods
  async getEnvironments(): Promise<Environment[]> {
    return db.select().from(environments);
  }
  
  async getEnvironment(id: number): Promise<Environment | undefined> {
    const result = await db.select().from(environments).where(eq(environments.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async updateEnvironment(id: number, data: any): Promise<Environment> {
    const result = await db.update(environments)
      .set(data)
      .where(eq(environments.id, id))
      .returning();
      
    if (result.length === 0) {
      throw new Error("Environment not found");
    }
    
    return result[0];
  }
  
  // Integration methods
  async getIntegrations(): Promise<Integration[]> {
    return db.select().from(integrations);
  }
  
  async createIntegration(integration: any): Promise<Integration> {
    const result = await db.insert(integrations).values(integration).returning();
    return result[0];
  }
  
  // Activity methods
  async getActivities(limit = 20): Promise<Activity[]> {
    return db.select()
      .from(activities)
      .orderBy(desc(activities.timestamp))
      .limit(limit);
  }
  
  async createActivity(activity: any): Promise<Activity> {
    const result = await db.insert(activities).values({
      ...activity,
      timestamp: new Date()
    }).returning();
    
    return result[0];
  }
  
  // Approval methods
  async getApprovals(status?: string): Promise<Approval[]> {
    if (status) {
      return db.select().from(approvals).where(eq(approvals.status, status));
    }
    return db.select().from(approvals);
  }
  
  async getApprovalsCount(status: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(approvals)
      .where(eq(approvals.status, status));
      
    return result[0].count;
  }
  
  async updateApprovalStatus(id: number, status: string): Promise<Approval> {
    const result = await db.update(approvals)
      .set({ status })
      .where(eq(approvals.id, id))
      .returning();
      
    if (result.length === 0) {
      throw new Error("Approval not found");
    }
    
    return result[0];
  }
  
  // Log methods
  async getLogs(): Promise<Log[]> {
    return db.select()
      .from(logs)
      .orderBy(desc(logs.timestamp));
  }
  
  async createLog(log: any): Promise<Log> {
    const result = await db.insert(logs).values({
      ...log,
      timestamp: new Date()
    }).returning();
    
    return result[0];
  }
}

// Use the DatabaseStorage implementation
export const storage = new DatabaseStorage();
