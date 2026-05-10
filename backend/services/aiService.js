const { GoogleGenerativeAI } = require("@google/generative-ai");

// مناداة المفتاح من ملف الـ .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function getLabel(score) {
  if (score >= 85) return 'Critical';
  if (score >= 65) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

function calculate(scores) {
  const weights = {
    urgency: 0.20,
    financialGap: 0.18,
    vulnerability: 0.18,
    medicalSeverity: 0.15,
    socialIsolation: 0.12,
    animalWelfare: 0.10,
    sustainability: 0.07,
  };
  let total = 0;
  for (const key in weights) {
    total += (scores[key] || 0) * weights[key];
  }
  return Math.round(total * 10);
}

async function analyzeCase(description) {
  if (!description || description.length < 20) {
    return { aiScores: null, finalScore: 30, label: 'Low', summary: 'الوصف قصير جداً للتحليل' };
  }

  const prompt = `
    Analyze this humanitarian case and score it from 0 to 10 for each criterion.
    Return ONLY valid JSON.
    Case description: "${description}"
    Format:
    {
      "urgency": 0-10,
      "financialGap": 0-10,
      "vulnerability": 0-10,
      "medicalSeverity": 0-10,
      "socialIsolation": 0-10,
      "animalWelfare": 0-10,
      "sustainability": 0-10,
      "summary": "جملة واحدة بالعربي تشرح الحالة"
    }`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // تنظيف النص في حال الـ AI أضاف علامات ```json
    const cleanJSON = text.replace(/```json|```/g, '').trim();
    const aiScores = JSON.parse(cleanJSON);

    const finalScore = calculate(aiScores);
    const label = getLabel(finalScore);

    return { aiScores, finalScore, label, summary: aiScores.summary };
  } catch (err) {
    console.error("Gemini AI Error:", err.message);
    return { aiScores: null, finalScore: 50, label: 'Medium', summary: 'لم يتم التحليل تلقائياً' };
  }
}

module.exports = { analyzeCase, calculate, getLabel };