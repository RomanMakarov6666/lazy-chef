export const recipeSchema = `
OUTPUT MUST BE VALID JSON ONLY:

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
`;