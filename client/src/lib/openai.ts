import { apiRequest } from "./queryClient";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

export interface ChatCompletionOptions {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  responseFormat?: { type: "text" | "json_object" };
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Generate a chat completion using the OpenAI API
 */
export async function generateChatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
  const response = await apiRequest(
    "POST",
    "/api/ai/chat",
    {
      model: MODEL,
      ...options,
    }
  );
  return await response.json();
}

/**
 * Generate code using the OpenAI API
 */
export async function generateCode(
  prompt: string, 
  language?: string, 
  additionalInstructions?: string
): Promise<string> {
  const messages = [
    {
      role: "system" as const,
      content: `You are an expert programmer. Write clean, efficient, and well-documented code. ${additionalInstructions || ''}`
    },
    {
      role: "user" as const,
      content: `Generate ${language ? language + ' ' : ''}code for the following:\n\n${prompt}`
    }
  ];

  const response = await generateChatCompletion({
    messages,
    temperature: 0.2,
  });

  return response.choices[0].message.content;
}

/**
 * Extract code from a string that may contain markdown code blocks
 */
export function extractCodeFromMarkdown(markdown: string): string {
  // If the string contains markdown code blocks, extract just the code
  const codeBlockRegex = /```(?:\w+)?\n([\s\S]+?)```/g;
  const matches = [...markdown.matchAll(codeBlockRegex)];
  
  if (matches.length > 0) {
    return matches.map(match => match[1]).join('\n\n');
  }
  
  // If no code blocks found, return the original string
  return markdown;
}

/**
 * Generate JSON using the OpenAI API
 */
export async function generateJSON<T>(
  prompt: string,
  schema?: Record<string, any>
): Promise<T> {
  const schemaDescription = schema 
    ? `The response should match this schema: ${JSON.stringify(schema, null, 2)}` 
    : 'Respond with a valid JSON object.';

  const messages = [
    {
      role: "system" as const,
      content: `You are a helpful assistant that always responds with valid JSON. ${schemaDescription}`
    },
    {
      role: "user" as const,
      content: prompt
    }
  ];

  const response = await generateChatCompletion({
    messages,
    temperature: 0,
    responseFormat: { type: "json_object" }
  });

  const content = response.choices[0].message.content;
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${content}`);
  }
}
