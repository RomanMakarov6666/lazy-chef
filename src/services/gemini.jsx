import { languagePrompts } from "../prompts/languages";
import { systemPrompt } from "../prompts/behavior";
import { cookingRules } from "../prompts/cooking_rules";
import { recipeSchema } from "../prompts/schema";
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
${languagePrompts[lang] || languagePrompts.en}

${systemPrompt}

${cookingRules}

${recipeSchema}

INPUT INGREDIENTS:
${ingredients}

COOKING TIME:
${cookTime || "no preference"}`,
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
      "No recipe generated."
    );

  } catch (error) {

    throw new Error(error.message);
  }
}