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

export const MOCK_VIRAL_RESULT: AnalyzeResult = {
  overall_score: 92,
  hook_strength: {
    score: 9,
    analysis:
      "The first 3 seconds open with immediate movement and a clear on-screen promise. The audio cue lands quickly, and the visual framing keeps attention anchored without cognitive overload.",
  },
  pacing_analysis:
    "Pacing is strong overall with tight cuts and consistent visual progression. Retention dips slightly around the setup midpoint where a short pause slows momentum. Trimming transitional dead space will improve completion rate.",
  caption_optimization:
    "I tested this 15-second edit framework and it increased hold rate in 24 hours. Want the exact cut map? Save this and comment 'CUT MAP' for the template.",
  actionable_feedback: [
    "Cut the 0.5s pause at 0:02.8 to keep hook momentum continuous.",
    "Move the value statement text 6 frames earlier so the promise lands before the second shot change.",
    "Add a subtle beat-synced zoom at 0:06.2 to reinforce the key proof moment and avoid a retention valley.",
  ],
  trending_recommendations: [
    "Audio: Crisp bounce edit track with fast snare transitions for tutorial-style reels.",
    "Audio: Minimal vocal house loop currently trending in creator education niches.",
    "Hashtag: #ContentStrategy",
    "Hashtag: #CreatorTips",
  ],
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
  try {
    const response = await fetch(`${apiBaseUrl}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 503) {
      console.warn("API unreachable: Falling back to offline mock data");
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent('system-status-offline'));
      return MOCK_VIRAL_RESULT;
    }

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
  } catch (error) {
    if (error instanceof Error && error.message === "Failed to fetch") {
      console.warn("API unreachable: Falling back to offline mock data");
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent('system-status-offline'));
      return MOCK_VIRAL_RESULT;
    }
    throw error;
  }
}
