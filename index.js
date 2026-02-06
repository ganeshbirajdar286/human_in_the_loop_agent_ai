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
