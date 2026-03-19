import { GEMINI_API_KEY_STORAGE_KEY } from "@/lib/design-tools/constants";

export interface ExtractedPaletteResponse {
  colors: string[];
}

export async function extractPaletteWithGemini(
  imageDataUrl: string,
  apiKey: string,
) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Extract exactly 10 unique HEX colors (#RRGGBB) from the image, ordered by dominance. Return JSON only with a single key 'colors' containing an array of the hex strings.",
              },
              {
                inlineData: {
                  mimeType: getMimeTypeFromDataUrl(imageDataUrl),
                  data: imageDataUrl.split(",")[1],
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`;

    try {
      const errorBody = await response.json();
      message = errorBody?.error?.message ?? message;
    } catch {
      // Keep the fallback message when the response body is not JSON.
    }

    throw new Error(message);
  }

  const result = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
  };

  const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!jsonText) {
    throw new Error("API did not return a valid response.");
  }

  const cleanedJson = jsonText.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleanedJson) as ExtractedPaletteResponse;

  if (
    !parsed.colors ||
    !Array.isArray(parsed.colors) ||
    parsed.colors.some((color) => !/^#[0-9a-f]{6}$/i.test(color))
  ) {
    throw new Error("Gemini returned an invalid palette payload.");
  }

  return {
    colors: parsed.colors.map((color) => color.toUpperCase()),
  };
}

export function getStoredGeminiApiKey() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);
}

function getMimeTypeFromDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,/i);
  return match?.[1] ?? "image/jpeg";
}
