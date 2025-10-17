import { NextResponse } from "next/server";

// ⚙️ Bắt buộc khi deploy trên Vercel để tránh Edge Runtime
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// CORS headers
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*", // Hoặc domain cụ thể: "https://yourdomain.vercel.app"
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

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
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
// POST (Main logic)
// =====================
export async function POST(request: Request): Promise<NextResponse> {
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

    // Call Gemini API
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    let geminiResponse: Response;
    try {
      geminiResponse = await fetch(`${geminiApiUrl}?key=${trimmedApiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
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

    // Parse Gemini data
    let geminiData: GeminiResponse;
    try {
      geminiData = await geminiResponse.json();
    } catch {
      return new NextResponse("Invalid response from Gemini API", {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    // Extract response text
    const text =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini";

    return new NextResponse(text, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
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
