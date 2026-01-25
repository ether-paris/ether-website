import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { executeQuery } from "$lib/server/db";
import { z } from "zod";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";

// Global server instance
const mcp = new McpServer({
  name: "ether-website",
  version: "1.0.0",
});

// Resource: Visitors Log
mcp.resource("visitors", "visitors://logs", async (uri) => {
  const logs = executeQuery(
    "SELECT * FROM visitors ORDER BY timestamp DESC LIMIT 50",
  );
  return {
    contents: [
      {
        uri: uri.href,
        text: JSON.stringify(logs, null, 2),
        mimeType: "application/json",
      },
    ],
  };
});

// Tool: SQL Query
mcp.tool(
  "query_db",
  { query: z.string().describe("The SQL query to execute") },
  async ({ query }) => {
    try {
      const result = executeQuery(query);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }
  },
);

// Custom Transport for SvelteKit Web Streams
class SvelteKitSSETransport implements Transport {
  private controller: ReadableStreamDefaultController | null = null;
  public sessionId: string;
  public onmessage?: (message: JSONRPCMessage) => void;
  public onclose?: () => void;
  public onerror?: (error: Error) => void;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  // Called by McpServer to send messages TO the client
  async send(message: JSONRPCMessage): Promise<void> {
    if (!this.controller) return;
    this.controller.enqueue(
      `event: message\ndata: ${JSON.stringify(message)}\n\n`,
    );
  }

  async start(): Promise<void> {
    // No-op, connection starts when stream starts
  }

  async close(): Promise<void> {
    this.controller?.close();
    this.onclose?.();
  }

  // Called when SvelteKit initializes the stream
  setController(controller: ReadableStreamDefaultController) {
    this.controller = controller;
    // Send endpoint event so client knows where to POST
    // We append the sessionId to the URL
    this.controller.enqueue(
      `event: endpoint\ndata: /api/mcp?sessionId=${this.sessionId}\n\n`,
    );
  }

  // Called by our POST handler to feed data FROM the client
  handleMessage(message: JSONRPCMessage) {
    this.onmessage?.(message);
  }
}

// Store active transports
const transports = new Map<string, SvelteKitSSETransport>();

// Secure GET endpoint
export async function GET({ request }: { request: Request }) {
  // Simple Bearer token check
  const authHeader = request.headers.get("Authorization");
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ether-admin";

  // Allow access if "Authorization: Bearer <ADMIN_PASSWORD>" is present
  if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    // Alternatively, check for the admin cookie if we want browser-based SSE (optional)
    // But for MCP clients, Bearer token is standard.
    // For now, let's keep it open or just warn, but strictly speaking we should secure it.
    // Let's implement the check.
    return new Response("Unauthorized", { status: 401 });
  }

  const sessionId = crypto.randomUUID();
  const transport = new SvelteKitSSETransport(sessionId);
  transports.set(sessionId, transport);

  await mcp.connect(transport);

  const stream = new ReadableStream({
    start(controller) {
      transport.setController(controller);
    },
    cancel() {
      transport.close();
      transports.delete(sessionId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function POST({ request, url }: { request: Request; url: URL }) {
  // Auth check
  const authHeader = request.headers.get("Authorization");
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ether-admin";
  if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const sessionId = url.searchParams.get("sessionId");
  if (!sessionId) {
    return new Response("Missing sessionId", { status: 400 });
  }

  const transport = transports.get(sessionId);
  if (!transport) {
    return new Response("Session not found", { status: 404 });
  }

  try {
    const message = await request.json();
    transport.handleMessage(message);
    return new Response("Accepted", { status: 202 });
  } catch (error) {
    return new Response("Invalid JSON", { status: 400 });
  }
}
