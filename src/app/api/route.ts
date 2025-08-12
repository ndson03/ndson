import { NextResponse } from "next/server";

// Định nghĩa interface cho request body
interface RequestBody {
  question: string;
  chatHistory: Array<{ role: string; parts: Array<{ text: string }> }>;
  apiKey: string; // Thêm apiKey vào interface
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
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    let body: RequestBody;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        "Invalid JSON in request body",
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    }

    const { question, chatHistory, apiKey } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        "Question is required and must be a string",
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    }

    if (!Array.isArray(chatHistory)) {
      return NextResponse.json(
        "chatHistory must be an array",
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    }

    // Kiểm tra API key
    if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
      return NextResponse.json(
        "API key is required",
        {
          status: 200,
          headers: corsHeaders,
        }
      );
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
    const geminiApiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    // Call Gemini API với API key từ request
    let geminiResponse: Response;
    try {
      geminiResponse = await fetch(`${geminiApiUrl}?key=${trimmedApiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
        body: JSON.stringify(requestBody),
        cache: "no-cache" as RequestInit["cache"],
      });
    } catch (fetchError) {
      return NextResponse.json(
        "Failed to connect to Gemini API",
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    }

    // Check if Gemini API request was successful
    if (!geminiResponse.ok) {
      let errorDetails: string;
      try {
        const errorData = await geminiResponse.json();
        // Xử lý các loại lỗi phổ biến
        if (geminiResponse.status === 400) {
          return NextResponse.json(
            "Invalid API key or request format",
            {
              status: 200,
              headers: corsHeaders,
            }
          );
        }
        if (geminiResponse.status === 403) {
          return NextResponse.json(
            "API key không có quyền truy cập hoặc đã hết quota",
            {
              status: 200,
              headers: corsHeaders,
            }
          );
        }
        errorDetails = errorData.error?.message || geminiResponse.statusText;
      } catch (e) {
        errorDetails = geminiResponse.statusText;
      }

      return NextResponse.json(
        `Gemini API error (${geminiResponse.status}): ${errorDetails}`,
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    }

    // Parse Gemini API response
    let geminiData: GeminiResponse;
    try {
      geminiData = await geminiResponse.json();
    } catch (parseError) {
      return NextResponse.json(
        "Invalid response from Gemini API",
        {
          status: 200,
          headers: corsHeaders,
        }
      );
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
      return NextResponse.json(
        "Failed to extract response from Gemini API",
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    }

    // Return response text directly
    return NextResponse.json(responseText, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      "Internal server error",
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      status: "OK",
      timestamp: new Date().toISOString(),
      message: "Chat API is running",
    },
    {
      status: 200,
      headers: corsHeaders,
    }
  );
}