export type AnalyzeResult = {
  overall_score: number;
  hook_strength: {
    score: number;
    analysis: string;
  };
  pacing_analysis: string;
  caption_optimization: string;
  actionable_feedback: string[];
  trending_recommendations: string[];
};

type AnalyzePayload = {
  video_url: string;
  user_id?: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");
}

export async function analyzeContent(payload: AnalyzePayload): Promise<AnalyzeResult> {
  const response = await fetch(`${apiBaseUrl}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Analyze request failed";
    try {
      const errorBody = (await response.json()) as { detail?: string };
      if (typeof errorBody.detail === "string" && errorBody.detail.length > 0) {
        message = errorBody.detail;
      }
    } catch {
      // Ignore parse errors and keep default message.
    }
    throw new Error(message);
  }

  return (await response.json()) as AnalyzeResult;
}
