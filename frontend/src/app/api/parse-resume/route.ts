import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("user_id") as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "Missing file or user_id" },
        { status: 400 }
      );
    }

    // TODO: Your teammates will implement the Python backend
    // For now, return mock data

    // In production, this would call your Python backend:
    // const pythonApiUrl = process.env.NEXT_PUBLIC_API_URL;
    // const response = await fetch(`${pythonApiUrl}/parse-resume`, {
    //   method: "POST",
    //   body: formData,
    // });
    // const data = await response.json();

    // Mock field detection based on resume content
    // Your teammates will replace this with actual RAG parsing
    const mockField = detectFieldFromResume(file.name);

    return NextResponse.json({
      field: mockField,
      parsed_data: {
        sections: ["skills", "experience", "education"],
        chunks: [],
      },
    });
  } catch (error: any) {
    console.error("Error parsing resume:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse resume" },
      { status: 500 }
    );
  }
}

// Mock function - your teammates will replace with actual ML detection
function detectFieldFromResume(filename: string): string {
  const fields = [
    "Software Engineering",
    "Data Science",
    "Product Management",
    "UI/UX Design",
    "DevOps Engineering",
  ];
  return fields[Math.floor(Math.random() * fields.length)];
}
