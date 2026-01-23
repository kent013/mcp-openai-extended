#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import OpenAI from "openai";
const SUPPORTED_MODELS = [
    "gpt-4o",
    "gpt-4o-mini",
    "o1-preview",
    "o1-mini",
    "gpt-5.2",
    "gpt-5.2-chat-latest",
    "gpt-5.2-pro",
    "gpt-5.2-codex",
    "gpt-5-mini",
];
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const server = new Server({
    name: "mcp-openai-extended",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "openai_chat",
                description: "Send messages to OpenAI's chat completion API using specified model. Supports GPT-4o, o1, and GPT-5.2 series models.",
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
                            description: "Model to use for completion (gpt-4o, gpt-4o-mini, o1-preview, o1-mini, gpt-5.2, gpt-5.2-chat-latest, gpt-5.2-pro, gpt-5.2-codex, gpt-5-mini)",
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
    const args = request.params.arguments;
    const model = args.model || "gpt-4o";
    if (!SUPPORTED_MODELS.includes(model)) {
        throw new Error(`Unsupported model: ${model}. Must be one of: ${SUPPORTED_MODELS.join(", ")}`);
    }
    try {
        // gpt-5.2-codex uses Responses API
        if (model === "gpt-5.2-codex") {
            // Convert messages array to Responses API format
            const systemMessage = args.messages.find(m => m.role === "system");
            const userMessages = args.messages.filter(m => m.role === "user" || m.role === "assistant");
            // Combine user and assistant messages into input
            const input = userMessages
                .map(m => {
                if (m.role === "user")
                    return m.content;
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
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
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
