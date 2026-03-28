import { NextRequest, NextResponse } from "next/server";

// Simple field detection based on resume keywords
function detectField(chunks: { section: string; text: string }[]): string {
  const fullText = chunks.map((c) => c.text).join(" ").toLowerCase();

  const fieldKeywords: Record<string, string[]> = {
    "Software Engineering": ["software engineer", "full stack", "frontend", "backend", "react", "node", "python", "java", "typescript", "api", "microservices"],
    "Data Science": ["machine learning", "deep learning", "data science", "neural network", "pytorch", "tensorflow", "pandas", "numpy", "sklearn", "nlp"],
    "Data Engineering": ["data pipeline", "etl", "spark", "airflow", "kafka", "data warehouse", "dbt", "bigquery", "snowflake"],
    "DevOps / Cloud": ["devops", "kubernetes", "docker", "ci/cd", "aws", "gcp", "azure", "terraform", "ansible"],
    "Cybersecurity": ["security", "penetration testing", "soc", "vulnerability", "firewall", "encryption", "siem"],
    "Product Management": ["product manager", "roadmap", "stakeholder", "agile", "scrum", "product strategy"],
    "UX / Design": ["ux", "ui design", "figma", "user research", "wireframe", "prototyping"],
  };

  let bestField = "Software Engineering";
  let bestScore = 0;

  for (const [field, keywords] of Object.entries(fieldKeywords)) {
    const score = keywords.filter((kw) => fullText.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestField = field;
    }
  }

  return bestField;
}

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

    // Call Python backend
    const pythonApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const response = await fetch(`${pythonApiUrl}/parse-resume`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to parse resume");
    }

    const data = await response.json();

    // Detect field from chunks
    const field = detectField(data.chunks || []);

    // Return what setup page expects
    return NextResponse.json({
      field,
      parsed_data: {
        fields: data.fields,
        chunks: data.chunks,
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