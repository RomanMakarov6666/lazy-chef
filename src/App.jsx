import "./App.css";
import { useEffect, useState } from "react";
import { generateRecipe } from "./services/gemini";
import { Analytics } from "@vercel/analytics/react"
import { analyzeFoodImage } from "./services/gemini_image";

function App() {
  const [apiKey, setApiKey] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cookTime, setCookTime] = useState("");
  const [error, setError] = useState("");
  const [lang, setLang] = useState(localStorage.getItem("recipe_lang") || "en");

  useEffect(() => {
    localStorage.setItem("recipe_lang", lang);
  }, [lang]);

  const languages = [
    { code: "en", name: "English" },
    { code: "pl", name: "Polski" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "it", name: "Italiano" },
    { code: "ja", name: "日本語" },
    { code: "zh", name: "中文" },
    { code: "ru", name: "Русский"}
  ];

  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api");

    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const saveApiKey = (value) => {
    setApiKey(value);
    localStorage.setItem("gemini_api", value);
  };

  const handleGenerateRecipe = async () => {
    if (!apiKey.trim()) {
      alert("Enter Gemini API key");
      return;
    }

    if (!ingredients.trim()) {
      alert("Enter ingredients");
      return;
    }

    setLoading(true);
    setRecipe(null);
    setError("");

    try {
      const result = await generateRecipe(
        apiKey,
        ingredients,
        cookTime
          ? `Cooking time preference: ${cookTime}`
          : "",
          lang
      );

      // API errors
      if (
        result.startsWith("Error") ||
        result.startsWith("Request failed")
      ) {
        throw new Error(result);
      }

      // remove markdown if Gemini adds it
      const clean = result
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

        const match = clean.match(/\{[\s\S]*\}/);

      if (!match) {
        throw new Error("No valid JSON found.");
      }

      const parsed = JSON.parse(match[0]);

      setRecipe(parsed);

    } catch (err) {
      // console.error("Recipe generation failed:", err);

      setError(
        "Gemini servers are too busy at the moment 🍳"
      );

      setRecipe(null);
    }

    setLoading(false);
  };
  const handleImageUpload = async (e) => {

  const file = e.target.files[0];

  if (!file) return;

  if (!apiKey.trim()) {
    alert("Enter Gemini API key");
    return;
  }

  try {

    setLoading(true);

    const reader = new FileReader();

    reader.onloadend = async () => {

      try {

        const base64 =
          reader.result.split(",")[1];

        const result = await analyzeFoodImage(
          apiKey,
          base64,
          file.type
        );

        const clean = result
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();

        const parsed = JSON.parse(clean);

        setIngredients(
          parsed.ingredients.join(", ")
        );

      } catch (err) {

        setError(
          "Could not analyze image."
        );
      }

      setLoading(false);
    };

    reader.readAsDataURL(file);

  } catch (err) {

    setLoading(false);

    setError(
      "Image upload failed."
    );
  }
};

  return (
    <div className="container">


      <div className="lang-selector">

        <div className="selected-lang">
          {lang}
        </div>

        <div className="lang-options">

          {languages
            .filter((l) => l.code !== lang)
            .map((l) => (
              <div
                key={l.code}
                className="lang-option"
                onClick={() => setLang(l.code)}
              >
                <span className="lang-code">
                  {l.code}
                </span>
              </div>
            ))}

        </div>
      </div>

      <h1 className="title">
        Lazy Chef
      </h1>

      <div className="fields">

        {/* API KEY */}
        <div className="panel">
          <h2>Gemini API Key</h2>

          <input
            className="api-input"
            type="password"
            placeholder="Paste your Gemini API key..."
            value={apiKey}
            onChange={(e) => saveApiKey(e.target.value)}
          />
        </div>

        {/* INGREDIENTS */}
        <div className="panel">
          <h2>Ingredients</h2>

          <textarea
            placeholder="eggs, rice, chicken..."
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            id="food-camera"
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />

          <button
            className="scan-btn"
            onClick={() =>
              document.getElementById("food-camera").click()
            }
          >
            <img src="/camera.png" alt="" />
            Scan ingredients
          </button>

          <div className="time-buttons">
            <button
              className={`time-btn ${cookTime === "Quick (0-15 minutes)" ? "active" : ""}`}
              onClick={() =>
                setCookTime(cookTime === "Quick (0-15 minutes)" ? "" : "Quick (0-15 minutes)")
              }
            >
              Quick (0–15 min)
            </button>

            <button
              className={`time-btn ${cookTime === "Normal (15-30 min)" ? "active" : ""}`}
              onClick={() =>
                setCookTime(cookTime === "Normal (15-30 min)" ? "" : "Normal (15-30 min)")
              }
            >
              Normal (15–30 min)
            </button>

            <button
              className={`time-btn ${cookTime === "Slow (30+ min)" ? "active" : ""}`}
              onClick={() =>
                setCookTime(cookTime === "Slow (30+ min)" ? "" : "Slow (30+ min)")
              }
            >
              Slow (30+ min)
            </button>
          </div>

          <button
            onClick={handleGenerateRecipe}
            disabled={loading || !ingredients}
          >
            {loading ? "generating..." : "generate recipe"}
          </button>
        </div>

        {/* OUTPUT */}
        <div className="panel">
          <h2>Recipe</h2>

          <div className="output">

            {error ? (
              <div className="error-box">
                {error}
              </div>
            ) : !recipe ? (
              loading
                ? "The chef is cooking..."
                : "Our chef will try to get you the best meal."
            ) : (
              <>
                <h3>{recipe.title}</h3>

                <div>
                  <ul>
                    {recipe.ingredients?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div>
                    {recipe.steps?.map((step) => (
                      <div key={step.i}>
                        {step.i}. {step.a} ({step.t})
                      </div>
                    ))}
                  </div>
                </div>

                <p>
                  {recipe.total_time}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="info-panel">

        <h3>Info</h3>

        <p>
          Lazy Chef uses your own Gemini API key to
          generate recipes.
        </p>

        <p>
          Your key is stored only in your browser and
          is sent directly to Gemini.
        </p>

        <p>
          No accounts, databases, or servers are used.
        </p>

        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
        >
          Create a free Gemini API key
        </a>

      </div>
      <Analytics debug={false}/>
    </div>
    
  );
}

export default App;