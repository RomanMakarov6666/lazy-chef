export async function analyzeFoodImage(apiKey, base64Image, mimeType = "image/jpeg") {
  try {
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
                  text: `
Analyze this food image.

Return ONLY valid JSON.

FORMAT:
{
  "ingredients": ["string"]
}

RULES:
- identify visible ingredients only
- use simple ingredient names
- no explanations
- no markdown
- no extra text
- english only
                  `,
                },

                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (response.status === 503) {
      throw new Error(
        "Gemini servers are busy right now. Please try again."
      );
    }

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Error ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();

    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No ingredients detected."
    );

  } catch (error) {
    throw new Error(error.message);
  }
}