export const recipeSchema = `
FORMAT:
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