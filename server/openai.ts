import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const DEFAULT_MODEL = "gpt-4o";

// Create OpenAI instance with API key from environment variables
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR
});

// Check if OpenAI API key is available
export function isConfigured(): boolean {
  return !!openai.apiKey;
}

/**
 * Create a chat completion with OpenAI API
 */
export async function createChatCompletion(options: {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "text" | "json_object" };
}) {
  if (!isConfigured()) {
    throw new Error("OpenAI API key not configured");
  }

  try {
    const response = await openai.chat.completions.create({
      model: options.model || DEFAULT_MODEL,
      messages: options.messages,
      temperature: options.temperature,
      max_tokens: options.max_tokens,
      response_format: options.response_format,
    });
    
    return response;
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

/**
 * Generate code using OpenAI
 */
export async function generateCode(
  prompt: string,
  language?: string,
  additionalInstructions?: string
) {
  const systemPrompt = `You are an expert programmer. Write clean, efficient, 
  and well-documented code. ${additionalInstructions || ''}
  
  Format your response as a valid, complete code file with proper syntax. 
  Do not include explanations or comments outside the code file itself.`;

  try {
    const response = await createChatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate ${language ? language + ' ' : ''}code for the following:\n\n${prompt}` }
      ],
      temperature: 0.2,
    });

    return response.choices[0].message.content;
  } catch (error: any) {
    console.error("Code generation error:", error);
    throw new Error(`Failed to generate code: ${error.message}`);
  }
}

/**
 * Analyze code and provide improvement suggestions
 */
export async function analyzeCode(code: string, language: string) {
  const systemPrompt = `You are an expert code reviewer. Analyze the provided ${language} code 
  and suggest improvements for efficiency, readability, and best practices.
  Format your response as a JSON object with the following structure:
  {
    "issues": [
      {
        "severity": "high|medium|low",
        "type": "performance|security|style|logic",
        "description": "Description of the issue",
        "suggestion": "Suggested fix",
        "lineNumbers": [line numbers where issue appears]
      }
    ],
    "summary": "Brief summary of overall code quality",
    "score": number between 0-100
  }`;

  try {
    const response = await createChatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this ${language} code:\n\n${code}` }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error: any) {
    console.error("Code analysis error:", error);
    throw new Error(`Failed to analyze code: ${error.message}`);
  }
}

/**
 * Generate documentation for code
 */
export async function generateDocumentation(code: string, language: string) {
  const systemPrompt = `You are an expert technical writer. Generate comprehensive documentation 
  for the provided ${language} code. Include function/class descriptions, parameter explanations, 
  return value details, and usage examples.`;

  try {
    const response = await createChatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate documentation for this ${language} code:\n\n${code}` }
      ],
      temperature: 0.3,
    });

    return response.choices[0].message.content;
  } catch (error: any) {
    console.error("Documentation generation error:", error);
    throw new Error(`Failed to generate documentation: ${error.message}`);
  }
}

/**
 * Transform natural language to technical requirements
 */
export async function naturalLanguageToRequirements(description: string) {
  const systemPrompt = `You are an expert product manager and developer. Transform the provided natural 
  language description into a structured set of technical requirements and specifications.
  Format your response as a JSON object with the following structure:
  {
    "functionalRequirements": [list of specific functional requirements],
    "nonFunctionalRequirements": [list of performance, security, usability requirements],
    "technicalSpecifications": {
      "suggestedArchitecture": "description",
      "keyComponents": [list of components],
      "dataModel": [list of entities with attributes],
      "apiEndpoints": [list of necessary endpoints]
    },
    "implementationPlan": [list of development steps in order]
  }`;

  try {
    const response = await createChatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Transform this project description to technical requirements:\n\n${description}` }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error: any) {
    console.error("Requirements generation error:", error);
    throw new Error(`Failed to generate requirements: ${error.message}`);
  }
}
