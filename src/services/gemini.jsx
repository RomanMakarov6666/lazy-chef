export async function generateRecipe(
  apiKey,
  ingredients,
  cookTime,
  lang
) {

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
you are an experienced home chef creating REALISTIC recipes for humans.

OUTPUT RULES:
- return ONLY valid json
- no markdown
- no explanations
- no extra text outside json
- use ONLY ${lang}

COOKING RULES:
- use the provided ingredients as the main and ONLY available ingredients
- basic pantry ingredients are allowed in small amounts to improve flavor and realism only if they are optional and basic
- recipes must be realistic, edible, and enjoyable
- prioritize flavor balance, texture, and common cooking practices
- avoid bland, watery, conflicting, or strange ingredient combinations
- not all ingredients must be fully used if they strongly conflict
- it is acceptable to minimize or omit problematic ingredients
- prioritize making the BEST possible dish over forcing every ingredient into the recipe
- if ingredients do not work well together, create the simplest acceptable dish possible
- prefer simple meals such as salads, bowls, sandwiches, snacks, or basic cooked dishes when ingredient combinations are limited
- every savory recipe should include seasoning
- prefer cooking methods that improve flavor and texture
- avoid generating fancy or overly elegant recipe titles

TIME RULES:
- provide estimated time for each step
- total_time must equal the sum of all step times

STRICT JSON FORMAT:
{
  "title": "string",
  "ingredients": ["string"],
  "steps": [
    {
      "i": number,
      "a": "string",
      "t": "string"
    }
  ],
  "total_time": "string"
}

Before generating the recipe, internally evaluate:
- whether the dish sounds genuinely edible
- whether the flavors make sense together
- whether the texture would be pleasant
- whether a real person would realistically cook and enjoy this dish
- whether some ingredients should be minimized or omitted

INPUT INGREDIENTS:
${ingredients}

${cookTime}
                  `,
                },
              ],
            },
          ],
        }),
      }
    );

    // retry-friendly 503 handling only
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
      "No recipe generated."
    );

  } catch (error) {

    throw new Error(error.message);
  }
}