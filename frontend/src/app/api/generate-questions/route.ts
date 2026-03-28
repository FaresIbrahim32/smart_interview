import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, field, language } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    // TODO: Your teammates will implement the Python backend
    // This will call the RAG API for technical questions
    // and return the behavioral questions from the database

    // In production:
    // const pythonApiUrl = process.env.NEXT_PUBLIC_API_URL;
    // const response = await fetch(`${pythonApiUrl}/generate-questions`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ user_id: userId, field, language }),
    // });
    // const data = await response.json();

    // Mock questions for now
    const mockQuestions = {
      technical: [
        `Tell me about a ${field} project you're most proud of.`,
        `How do you approach problem-solving in ${field}?`,
        `Describe a technical challenge you faced recently.`,
        `What tools and technologies do you use for ${field}?`,
      ],
      behavioral: [
        "Tell me about a time you faced a significant challenge at work.",
        "Describe a situation where you had to work with a difficult team member.",
        "Give me an example of a time you showed leadership.",
        "Tell me about a time you failed. What did you learn?",
      ],
    };

    return NextResponse.json({
      questions: [...mockQuestions.technical, ...mockQuestions.behavioral],
    });
  } catch (error: any) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate questions" },
      { status: 500 }
    );
  }
}
