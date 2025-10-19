import { NextResponse } from "next/server";

// ⚙️ Bắt buộc khi deploy trên Vercel để tránh Edge Runtime
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// CORS headers
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
};

// =====================
// INTERFACES
// =====================
interface RequestBody {
  question: string;
  chatHistory: Array<{ role: string; parts: Array<{ text: string }> }>;
  apiKey: string;
  model: string;
}

// =====================
// OPTIONS (Preflight)
// =====================
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// =====================
// POST (Main logic with Streaming)
// =====================
export async function POST(request: Request): Promise<Response> {
  try {
    let body: RequestBody;

    // Parse body
    try {
      body = await request.json();
    } catch {
      return new NextResponse("Invalid JSON in request body", {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    const { question, chatHistory, apiKey, model } = body;

    if (!question || typeof question !== "string") {
      return new NextResponse("Question is required and must be a string", {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
      return new NextResponse("API key is required", {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    const trimmedApiKey = apiKey.trim();

    // Build message
    const userMessage = {
      role: "user" as const,
      parts: [{ text: question }],
    };
    const updatedChatHistory = [...chatHistory, userMessage];
    const requestBody = { contents: updatedChatHistory };

    // Call Gemini API with streaming
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`;

    let geminiResponse: Response;
    try {
      geminiResponse = await fetch(`${geminiApiUrl}&key=${trimmedApiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
    } catch {
      return new NextResponse("Failed to connect to Gemini API", {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    // Check Gemini API response
    if (!geminiResponse.ok) {
      let errorDetails = "";
      try {
        const errorData = await geminiResponse.json();
        errorDetails = errorData.error?.message || geminiResponse.statusText;
      } catch {
        errorDetails = geminiResponse.statusText;
      }

      const status =
        geminiResponse.status === 400
          ? 400
          : geminiResponse.status === 429
          ? 403
          : geminiResponse.status;

      return new NextResponse(
        `Gemini API error (${geminiResponse.status}): ${errorDetails}`,
        {
          status,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        }
      );
    }

    // Stream the response back to client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = geminiResponse.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              controller.close();
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const jsonStr = line.slice(6);
                  if (jsonStr.trim() === "") continue;

                  const data = JSON.parse(jsonStr);
                  const text =
                    data.candidates?.[0]?.content?.parts?.[0]?.text || "";

                  if (text) {
                    controller.enqueue(new TextEncoder().encode(text));
                  }
                } catch (e) {
                  console.error("Error parsing SSE data:", e);
                }
              }
            }
          }
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return new NextResponse("Internal server error", {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
}

// =====================
// GET (Health check)
// =====================
export async function GET(): Promise<NextResponse> {
  return new NextResponse("Chat API is running", {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "text/plain" },
  });
}
