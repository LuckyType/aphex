import { z } from 'zod';
export declare const agentChatMessageSchema: z.ZodObject<{
    role: z.ZodEnum<{
        system: "system";
        user: "user";
        assistant: "assistant";
        tool: "tool";
    }>;
    content: z.ZodString;
    toolCalls: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        arguments: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strip>>>;
    toolCallId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const agentChatRequest: z.ZodObject<{
    messages: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<{
            system: "system";
            user: "user";
            assistant: "assistant";
            tool: "tool";
        }>;
        content: z.ZodString;
        toolCalls: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            arguments: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strip>>>;
        toolCallId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    model: z.ZodOptional<z.ZodString>;
    documentContext: z.ZodOptional<z.ZodObject<{
        collection: z.ZodString;
        id: z.ZodString;
    }, z.core.$strip>>;
    changeSetId: z.ZodOptional<z.ZodString>;
    priorUsage: z.ZodOptional<z.ZodObject<{
        promptTokens: z.ZodNumber;
        completionTokens: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type AgentChatRequest = z.infer<typeof agentChatRequest>;
//# sourceMappingURL=agent-chat.d.ts.map