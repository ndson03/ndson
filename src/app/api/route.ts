import { NextResponse } from "next/server";

// Định nghĩa interface cho request body
interface RequestBody {
  question: string;
  chatHistory: Array<{ role: string; parts: Array<{ text: string }> }>;
  apiKey: string;
  model: string;
}

// Định nghĩa interface cho Gemini API response
interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

// CORS headers
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204, // 204 No Content cho OPTIONS
    headers: corsHeaders,
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    let body: RequestBody;
    try {
      body = await request.json();
    } catch (parseError) {
      return new NextResponse("Invalid JSON in request body", {
        status: 400, // Bad Request
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    const { question, chatHistory, apiKey, model } = body;

    if (!question || typeof question !== "string") {
      return new NextResponse("Question is required and must be a string", {
        status: 400, // Bad Request
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
      return new NextResponse("API key is required", {
        status: 400, // Bad Request
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    const trimmedApiKey = apiKey.trim();

    // Prepare user message
    const userMessage = {
      role: "user" as const,
      parts: [{ text: question }],
    };

    // Build chat history for Gemini API
    const updatedChatHistory = [...chatHistory, userMessage];

    const requestBody = {
      contents: updatedChatHistory,
    };

    // Gemini API configuration
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    // Call Gemini API
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
        cache: "no-cache" as RequestInit["cache"],
      });
    } catch (fetchError) {
      return new NextResponse("Failed to connect to Gemini API", {
        status: 500, // Internal Server Error
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    // Check if Gemini API request was successful
    if (!geminiResponse.ok) {
      let errorDetails: string;
      try {
        const errorData = await geminiResponse.json();
        if (geminiResponse.status === 400) {
          return new NextResponse("Invalid API key or request format", {
            status: 400, // Bad Request
            headers: { ...corsHeaders, "Content-Type": "text/plain" },
          });
        }
        if (geminiResponse.status === 429) {
          return new NextResponse(
            "API key does not have access or has exceeded quota",
            {
              status: 403, // Forbidden
              headers: { ...corsHeaders, "Content-Type": "text/plain" },
            }
          );
        }
        errorDetails = errorData.error?.message || geminiResponse.statusText;
      } catch (e) {
        errorDetails = geminiResponse.statusText;
      }

      return new NextResponse(
        `Gemini API error (${geminiResponse.status}): ${errorDetails}`,
        {
          status: geminiResponse.status, // Sử dụng status từ Gemini API
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        }
      );
    }

    // Parse Gemini API response
    let geminiData: GeminiResponse;
    try {
      geminiData = await geminiResponse.json();
    } catch (parseError) {
      return new NextResponse("Invalid response from Gemini API", {
        status: 500, // Internal Server Error
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    // Extract text from Gemini response
    let responseText: string;
    try {
      if (!geminiData.candidates || geminiData.candidates.length === 0) {
        throw new Error("No candidates in Gemini response");
      }

      if (
        !geminiData.candidates[0].content ||
        !geminiData.candidates[0].content.parts
      ) {
        throw new Error("Invalid content structure in Gemini response");
      }

      if (geminiData.candidates[0].content.parts.length === 0) {
        throw new Error("No parts in Gemini response content");
      }

      responseText = geminiData.candidates[0].content.parts[0].text;

      if (!responseText) {
        throw new Error("Empty text in Gemini response");
      }
    } catch (extractError) {
      return new NextResponse("Failed to extract response from Gemini API", {
        status: 500, // Internal Server Error
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    // Return plain text response
    return new NextResponse(responseText, {
      status: 200, // OK
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  } catch (error) {
    return new NextResponse("Internal server error", {
      status: 500, // Internal Server Error
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
}

export async function GET(): Promise<NextResponse> {
  return new NextResponse("Chat API is running", {
    status: 200, // OK
    headers: { ...corsHeaders, "Content-Type": "text/plain" },
  });
}
