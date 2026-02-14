#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import OpenAI from "openai";

const SUPPORTED_MODELS = [
  "gpt-4o",
  "gpt-4o-mini",
  "o1",
  "o1-preview",
  "o1-mini",
  "gpt-5",
  "gpt-5-chat-latest",
  "gpt-5-pro",
  "gpt-5-nano",
  "gpt-5.2",
  "gpt-5.2-chat-latest",
  "gpt-5.2-pro",
  "gpt-5.2-codex",
  "gpt-5.1",
  "gpt-5.1-chat-latest",
  "gpt-5.1-codex",
  "gpt-5.1-codex-mini",
  "gpt-5.1-codex-max",
  "gpt-5-codex",
  "codex-mini-latest",
  "gpt-5-mini",
] as const;

type SupportedModel = (typeof SUPPORTED_MODELS)[number];

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: SupportedModel;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const server = new Server(
  {
    name: "mcp-openai-extended",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "openai_chat",
        description:
          "Send messages to OpenAI using a specified model. Supports GPT-4o, o1, and GPT-5 series models.",
        inputSchema: {
          type: "object",
          properties: {
            messages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  role: {
                    type: "string",
                    enum: ["system", "user", "assistant"],
                    description: "Role of the message sender",
                  },
                  content: {
                    type: "string",
                    description: "Content of the message",
                  },
                },
                required: ["role", "content"],
              },
              description: "Array of messages to send to the API",
            },
            model: {
              type: "string",
              enum: SUPPORTED_MODELS,
              description:
                "Model to use for completion (gpt-4o, gpt-4o-mini, o1, o1-preview, o1-mini, gpt-5/gpt-5.1/gpt-5.2 families, and codex variants)",
              default: "gpt-5.2-codex",
            },
          },
          required: ["messages"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "openai_chat") {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const args = request.params.arguments as unknown as ChatCompletionRequest;
  const model = args.model || "gpt-5.2-codex";

  if (!SUPPORTED_MODELS.includes(model)) {
    throw new Error(
      `Unsupported model: ${model}. Must be one of: ${SUPPORTED_MODELS.join(", ")}`
    );
  }

  try {
    // Codex models use Responses API
    if (model.includes("codex")) {
      // Convert messages array to Responses API format
      const systemMessage = args.messages.find(m => m.role === "system");
      const userMessages = args.messages.filter(m => m.role === "user" || m.role === "assistant");

      // Combine user and assistant messages into input
      const input = userMessages
        .map(m => {
          if (m.role === "user") return m.content;
          return `Assistant: ${m.content}`;
        })
        .join("\n\n");

      const response = await openai.responses.create({
        model: model,
        input: input,
        instructions: systemMessage?.content || undefined,
      });

      return {
        content: [
          {
            type: "text",
            text: response.output_text,
          },
        ],
      };
    }

    // Other models use chat completions API
    const completion = await openai.chat.completions.create({
      model: model,
      messages: args.messages,
    });

    const responseContent = completion.choices[0]?.message?.content || "";

    return {
      content: [
        {
          type: "text",
          text: responseContent,
        },
      ],
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`OpenAI API error: ${errorMessage}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP OpenAI Extended server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
