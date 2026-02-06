import * as z from "zod";
import { createAgent, tool } from "langchain";
import { ChatGroq } from "@langchain/groq";
import { humanInTheLoopMiddleware } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import readline from "node:readline/promises";
import { Command } from "@langchain/langgraph";
import { type } from "node:os";

const llm = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
});
const r1 = readline.createInterface({
  input: process.stdin, // this take input for terminal
  output: process.stdout,
});

const gmailEmails = {
  messages: [
    {
      id: "18c3f2a1b5d6e789",
      threadId: "18c3f2a1b5d6e789",
      labelIds: ["INBOX", "UNREAD"],
      snippet:
        "Hi, I purchased your JavaScript masterclass course last week but I would like to request a refund. The course content doesn't match what was advertised...",
      payload: {
        headers: [
          { name: "From", value: "john.doe@example.com" },
          { name: "To", value: "support@codersgyan.com" },
          { name: "Subject", value: "Refund Request - JavaScript Course" },
          { name: "Date", value: "Mon, 4 Nov 2024 10:30:00 +0000" },
        ],
        body: {
          data: "SGksIEkgcHVyY2hhc2VkIHlvdXIgSmF2YVNjcmlwdCBtYXN0ZXJjbGFzcyBjb3Vyc2UgbGFzdCB3ZWVrIGJ1dCBJIHdvdWxkIGxpa2UgdG8gcmVxdWVzdCBhIHJlZnVuZC4gVGhlIGNvdXJzZSBjb250ZW50IGRvZXNuJ3QgbWF0Y2ggd2hhdCB3YXMgYWR2ZXJ0aXNlZC4=",
        },
      },
      internalDate: "1730715000000",
    },
    {
      id: "18c3e8f9a2c4b567",
      threadId: "18c3e8f9a2c4b567",
      labelIds: ["INBOX"],
      snippet:
        "Thank you for your recent purchase! Your order #CR-2024-1543 has been confirmed. We hope you enjoy the React Advanced Patterns course...",
      payload: {
        headers: [
          { name: "From", value: "noreply@codersgyan.com" },
          { name: "To", value: "sarah.williams@example.com" },
          { name: "Subject", value: "Order Confirmation - React Course" },
          { name: "Date", value: "Sun, 3 Nov 2024 14:20:00 +0000" },
        ],
        body: {
          data: "VGhhbmsgeW91IGZvciB5b3VyIHJlY2VudCBwdXJjaGFzZSEgWW91ciBvcmRlciAjQ1ItMjAyNC0xNTQzIGhhcyBiZWVuIGNvbmZpcm1lZC4=",
        },
      },
      internalDate: "1730642400000",
    },
    {
      id: "18c3d5b8e1f3a456",
      threadId: "18c3d5b8e1f3a456",
      labelIds: ["INBOX", "UNREAD"],
      snippet:
        "Hello Codersgyan team, I need to request a refund for the Full Stack course I bought 3 days ago. I'm facing some financial difficulties and cannot continue...",
      payload: {
        headers: [
          { name: "From", value: "mike.chen@example.com" },
          { name: "To", value: "support@codersgyan.com" },
          {
            name: "Subject",
            value: "Course Refund Request - Order #CR-2024-1538",
          },
          { name: "Date", value: "Sat, 2 Nov 2024 09:15:00 +0000" },
        ],
        body: {
          data: "SGVsbG8gQ29kZXJzZ3lhbiB0ZWFtLCBJIG5lZWQgdG8gcmVxdWVzdCBhIHJlZnVuZCBmb3IgdGhlIEZ1bGwgU3RhY2sgY291cnNlIEkgYm91Z2h0IDMgZGF5cyBhZ28u",
        },
      },
      internalDate: "1730538900000",
    },
    {
      id: "18c3c2a7d0e2b345",
      threadId: "18c3c2a7d0e2b345",
      labelIds: ["INBOX", "IMPORTANT"],
      snippet:
        "Weekly newsletter: New course announcement! We're excited to launch our new Node.js microservices course. Early bird discount available...",
      payload: {
        headers: [
          { name: "From", value: "newsletter@codersgyan.com" },
          { name: "To", value: "subscribers@codersgyan.com" },
          {
            name: "Subject",
            value: "🚀 New Course Launch - Node.js Microservices",
          },
          { name: "Date", value: "Fri, 1 Nov 2024 08:00:00 +0000" },
        ],
        body: {
          data: "V2Vla2x5IG5ld3NsZXR0ZXI6IE5ldyBjb3Vyc2UgYW5ub3VuY2VtZW50ISBXZSdyZSBleGNpdGVkIHRvIGxhdW5jaCBvdXIgbmV3IE5vZGUuanMgbWljcm9zZXJ2aWNlcyBjb3Vyc2Uu",
        },
      },
      internalDate: "1730448000000",
    },
    {
      id: "18c3b1c6f9d1a234",
      threadId: "18c3b1c6f9d1a234",
      labelIds: ["INBOX"],
      snippet:
        "Hi there! I have a question about the Python course. Can you tell me if it covers Django framework? Thanks!",
      payload: {
        headers: [
          { name: "From", value: "emma.taylor@example.com" },
          { name: "To", value: "support@codersgyan.com" },
          { name: "Subject", value: "Question about Python Course Content" },
          { name: "Date", value: "Thu, 31 Oct 2024 16:45:00 +0000" },
        ],
        body: {
          data: "SGkgdGhlcmUhIEkgaGF2ZSBhIHF1ZXN0aW9uIGFib3V0IHRoZSBQeXRob24gY291cnNlLiBDYW4geW91IHRlbGwgbWUgaWYgaXQgY292ZXJzIERqYW5nbyBmcmFtZXdvcms/",
        },
      },
      internalDate: "1730393100000",
    },
  ],
  resultSizeEstimate: 5,
};

const getEmails = tool(
  () => {
    return JSON.stringify(gmailEmails);
  },
  {
    name: "get_emails",
    description: "Get the email from inbox.",
  },
);

const refund = tool(
  ({ email }) => {
    return "all refunds processed succefully!";
  },
  {
    name: "refund",
    description: "process the refund for give emial",
    schema: z.object({
      emails: z
        .array(z.string())
        .describe("the list  of the email which  need to be refunder"),
    }),
  },
);

const agent = createAgent({
  model: llm,
  tools: [getEmails, refund],
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: {
        refund: true, // All decisions (approve, edit, reject) allowed
        execute_sql: {
          allowedDecisions: ["approve", "reject"],
          description: "🚨 SQL execution requires DBA approval",
        },
        read_data: false,
      },
      // Prefix for interrupt messages - combined with tool name and args to form the full message
      // e.g., "Tool execution pending approval: execute_sql with query='DELETE FROM...'"
      // Individual tools can override this by specifying a "description" in their interrupt config
      descriptionPrefix: "Tool execution pending approval",
    }),
  ],
  // Human-in-the-loop requires checkpointing to handle interrupts.
  // In production, use a persistent checkpointer like AsyncPostgresSaver.
  checkpointer: new MemorySaver(),
});

async function main() {
  let interrupt = [];

  while (true) {
    const userInput = await r1.question("You: ");

    const Response = await agent.invoke(
      interrupt.length
        ? {
            decisions: [
              {
                id: interrupt[0].id,
                decision:
                  userInput === "1"
                    ? "approve"
                    : "reject",
              },
            ],
          }
        : {
            messages: [
              {
                role: "user",
                content: userInput,
              },
            ],
          },
      {
        configurable: { thread_id: "1" },
      }
    );

    // If interrupt exists → approval UI
    if (Response.__interrupt__?.length) {
      interrupt = Response.__interrupt__;

      console.log(
        "\n" +
          interrupt[0].value.actionRequests[0]
            .description
      );

      console.log(
        "\nChoose:\n1. approve\n2. reject"
      );
    } else {
      interrupt = [];

      console.log(
        "\nAssistant:",
        Response.messages.at(-1).content
      );
    }
  }
}


main();

// this code for refernce whenn we use langGraph 

// import * as z from "zod";
// import { tool } from "@langchain/core/tools";
// import { ChatGroq } from "@langchain/groq";
// import { StateGraph, Annotation, MemorySaver } from "@langchain/langgraph";
// import { ToolNode } from "@langchain/langgraph/prebuilt";
// import readline from "node:readline/promises";

// // Define State
// const StateAnnotation = Annotation.Root({
//   messages: Annotation({
//     reducer: (x, y) => x.concat(y),
//   }),
// });

// const llm = new ChatGroq({
//   model: "llama3-70b-8192",
//   temperature: 0,
// });

// const r1 = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// const gmailEmails = {
//   messages: [
//     {
//       id: "18c3f2a1b5d6e789",
//       from: "john.doe@example.com",
//       subject: "Refund Request - JavaScript Course",
//       snippet: "Hi, I purchased your JavaScript masterclass course last week but I would like to request a refund...",
//     },
//     {
//       id: "18c3e8f9a2c4b567",
//       from: "sarah.williams@example.com",
//       subject: "Order Confirmation - React Course",
//       snippet: "Thank you for your recent purchase! Your order #CR-2024-1543 has been confirmed...",
//     },
//     {
//       id: "18c3d5b8e1f3a456",
//       from: "mike.chen@example.com",
//       subject: "Course Refund Request - Order #CR-2024-1538",
//       snippet: "Hello Codersgyan team, I need to request a refund for the Full Stack course I bought 3 days ago...",
//     },
//     {
//       id: "18c3c2a7d0e2b345",
//       from: "newsletter@codersgyan.com",
//       subject: "🚀 New Course Launch - Node.js Microservices",
//       snippet: "Weekly newsletter: New course announcement!...",
//     },
//     {
//       id: "18c3b1c6f9d1a234",
//       from: "emma.taylor@example.com",
//       subject: "Question about Python Course Content",
//       snippet: "Hi there! I have a question about the Python course. Can you tell me if it covers Django framework?",
//     },
//   ],
// };

// // Define Tools
// const getEmails = tool(
//   () => {
//     return JSON.stringify(gmailEmails);
//   },
//   {
//     name: "get_emails",
//     description: "Get all emails from inbox",
//   }
// );

// const refund = tool(
//   ({ emails }) => {
//     return `✅ Refunds processed successfully for: ${emails.join(", ")}`;
//   },
//   {
//     name: "refund",
//     description: "Process refunds for given email addresses",
//     schema: z.object({
//       emails: z.array(z.string()).describe("List of email addresses to refund"),
//     }),
//   }
// );

// // Bind tools to LLM
// const tools = [getEmails, refund];
// const llmWithTools = llm.bindTools(tools);

// // Define Nodes
// async function callModel(state) {
//   const response = await llmWithTools.invoke(state.messages);
//   return { messages: [response] };
// }

// const toolNode = new ToolNode(tools);

// // Define conditional edge function
// function shouldContinue(state) {
//   const lastMessage = state.messages[state.messages.length - 1];
  
//   // If there are tool calls, continue to tools
//   if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
//     // Check if it's a refund call - interrupt for human approval
//     const hasRefund = lastMessage.tool_calls.some(
//       (call) => call.name === "refund"
//     );
    
//     if (hasRefund) {
//       return "human"; // Interrupt for human approval
//     }
//     return "tools";
//   }
  
//   // Otherwise, end
//   return "end";
// }

// // Human approval node
// async function humanApproval(state) {
//   const lastMessage = state.messages[state.messages.length - 1];
//   const refundCall = lastMessage.tool_calls.find((call) => call.name === "refund");
  
//   console.log("\n" + "=".repeat(60));
//   console.log("⚠️  REFUND APPROVAL REQUIRED");
//   console.log("=".repeat(60));
//   console.log("\n📧 Emails to refund:");
//   refundCall.args.emails.forEach((email, i) => {
//     console.log(`   ${i + 1}. ${email}`);
//   });
//   console.log("\n🔹 Choose:\n   1. Approve\n   2. Reject\n");
  
//   const decision = await r1.question("Your decision: ");
  
//   if (decision === "1") {
//     console.log("\n✅ Approved! Processing refund...\n");
//     return { messages: [] }; // Continue to tools
//   } else {
//     console.log("\n❌ Rejected! Refund cancelled.\n");
//     // Remove the tool call to prevent execution
//     lastMessage.tool_calls = [];
//     return { messages: [] };
//   }
// }

// // Build the Graph
// const workflow = new StateGraph(StateAnnotation)
//   .addNode("agent", callModel)
//   .addNode("tools", toolNode)
//   .addNode("human", humanApproval)
//   .addEdge("__start__", "agent")
//   .addConditionalEdges("agent", shouldContinue, {
//     tools: "tools",
//     human: "human",
//     end: "__end__",
//   })
//   .addEdge("tools", "agent")
//   .addEdge("human", "tools");

// // Compile with checkpointer
// const checkpointer = new MemorySaver();
// const app = workflow.compile({ checkpointer });

// // Main function
// async function main() {
//   console.log("🤖 Email Refund Agent Started!");
//   console.log("Try: 'Process refunds for all refund requests'\n");

//   const config = { configurable: { thread_id: "1" } };

//   while (true) {
//     const userInput = await r1.question("You: ");

//     if (userInput.toLowerCase() === "exit") {
//       console.log("Goodbye!");
//       r1.close();
//       process.exit(0);
//     }

//     const result = await app.invoke(
//       {
//         messages: [{ role: "user", content: userInput }],
//       },
//       config
//     );

//     const lastMessage = result.messages[result.messages.length - 1];
//     console.log("\n🤖 Assistant:", lastMessage.content, "\n");
//   }
// }

// main().catch(console.error);
// ```



//// Step-by-step execution:

//  1️⃣ AGENT decides to call refund
// agent → shouldContinue() checks:
//   ├─ Has tool_calls? ✅ YES (refund)
//   ├─ Is it refund? ✅ YES
//   └─ return "human" ← Routes to HUMAN node

// // 2️⃣ HUMAN node executes
// human → Shows approval UI
//   ├─ User types: 1 (approve)
//   └─ return { messages: [] } ← Empty messages, just continues flow

// // 3️⃣ After HUMAN, graph follows the edge
// workflow.addEdge("human", "tools") ← This edge is pre-defined!
//   └─ Goes to TOOLS node (not because of shouldContinue)

// // 4️⃣ TOOLS executes the refund
// tools → Executes refund tool
//   └─ Returns refund result

// // 5️⃣ After TOOLS, graph follows the edge
// workflow.addEdge("tools", "agent") ← Back to AGENT
//   └─ Goes to AGENT node

// // 6️⃣ AGENT sees refund result, no more tools needed
// agent → shouldContinue() checks:
//   ├─ Has tool_calls? ❌ NO
//   └─ return "end" ← Finishes!
// ```



// ┌─────────────────────────────────────────────────────────────────┐
// │                         START                                    │
// └────────────────────────────┬────────────────────────────────────┘
//                              │
//                              ▼
//                     ┌────────────────┐
//                     │     AGENT      │
//                     │  (callModel)   │
//                     │                │
//                     │ LLM decides    │
//                     │ what to do     │
//                     └────────┬───────┘
//                              │
//                     ┌────────▼────────┐
//                     │  shouldContinue │
//                     │   (decision)    │
//                     └─┬─────┬─────┬──┘
//                       │     │     │
//         ┌─────────────┘     │     └─────────────┐
//         │                   │                   │
//         ▼                   ▼                   ▼
//    ┌────────┐         ┌─────────┐         ┌────────┐
//    │ "tools"│         │ "human" │         │  "end" │
//    └───┬────┘         └────┬────┘         └────┬───┘
//        │                   │                   │
//        ▼                   ▼                   ▼
//   ┌─────────┐       ┌──────────────┐      ┌───────┐
//   │  TOOLS  │       │    HUMAN     │      │  END  │
//   │ (normal │       │  (approval)  │      │       │
//   │  tools) │       │              │      │ Done! │
//   └────┬────┘       └──────┬───────┘      └───────┘
//        │                   │
//        │         ┌─────────▼──────────┐
//        │         │  User Decision:    │
//        │         │  1. Approve → ✅   │
//        │         │  2. Reject  → ❌   │
//        │         └─────────┬──────────┘
//        │                   │
//        │                   ▼
//        │            ┌─────────────┐
//        │            │    TOOLS    │
//        │            │  (refund)   │
//        │            └──────┬──────┘
//        │                   │
//        └───────────────────┴──────────┐
//                                       │
//                                       ▼
//                               ┌───────────────┐
//                               │     AGENT     │
//                               │  (continues)  │
//                               └───────────────┘
// ## 📊 Visual Flow Diagram
// ```
//          ┌─────────────────────────────────────────┐
//          │         AGENT (refund needed)           │
//          └──────────────────┬──────────────────────┘
//                             │
//                     ┌───────▼────────┐
//                     │ shouldContinue │
//                     │  hasRefund?    │
//                     │     ✅ YES     │
//                     │ return "human" │
//                     └───────┬────────┘
//                             │
//          ┌──────────────────▼──────────────────────┐
//          │           HUMAN NODE                    │
//          │  Shows: Approve/Reject?                 │
//          │  User: 1 (approve)                      │
//          │  return { messages: [] }                │
//          └──────────────────┬──────────────────────┘
//                             │
//                 ┌───────────▼───────────┐
//                 │ .addEdge("human",     │ ← Pre-defined edge!
//                 │          "tools")     │    NOT from shouldContinue
//                 └───────────┬───────────┘
//                             │
//          ┌──────────────────▼──────────────────────┐
//          │           TOOLS NODE                    │
//          │  Executes: refund(emails=[...])         │
//          │  Returns: "Refunds processed!"          │
//          └──────────────────┬──────────────────────┘
//                             │
//                 ┌───────────▼───────────┐
//                 │ .addEdge("tools",     │ ← Pre-defined edge!
//                 │          "agent")     │
//                 └───────────┬───────────┘
//                             │
//          ┌──────────────────▼──────────────────────┐
//          │         AGENT (has refund result)       │
//          └──────────────────┬──────────────────────┘
//                             │
//                     ┌───────▼────────┐
//                     │ shouldContinue │
//                     │  Has tools?    │
//                     │     ❌ NO      │
//                     │ return "end"   │
//                     └───────┬────────┘
//                             │
//          ┌──────────────────▼──────────────────────┐
//          │                 END                     │
//          └─────────────────────────────────────────┘