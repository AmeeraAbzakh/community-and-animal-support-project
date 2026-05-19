const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// موديل Gemini
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash'
});

async function analyzeCase(description) {
  try {

    // Prompt
    const prompt = `
    Analyze this case:

    "${description}"

    Return ONLY valid JSON in this format:
    {
      "urgency": 5,
      "financialGap": 5,
      "vulnerability": 5,
      "medicalSeverity": 5,
      "socialIsolation": 5,
      "animalWelfare": 5,
      "sustainability": 5,
      "summary": "وصف مختصر"
    }
    `;

    // إرسال الطلب
    const result = await model.generateContent(prompt);

    const response = await result.response;
    const text = response.text();

    // تحويل الرد إلى JSON
    const aiScores = JSON.parse(
      text.replace(/```json|```/g, '').trim()
    );

    // السكورات
    const scores = [
      aiScores.urgency || 5,
      aiScores.financialGap || 5,
      aiScores.vulnerability || 5,
      aiScores.medicalSeverity || 5,
      aiScores.socialIsolation || 5,
      aiScores.animalWelfare || 5,
      aiScores.sustainability || 5
    ];

    // المتوسط
    const average =
      scores.reduce((sum, value) => sum + value, 0) / scores.length;

    // النهائي من 100
    const finalScore = Math.round(average * 10);

    // التصنيف
    let label = 'Low';

    if (finalScore >= 80) {
      label = 'High';
    } else if (finalScore >= 60) {
      label = 'Medium';
    }

    // النتيجة النهائية
    return {
      aiScores,
      finalScore,
      label,
      summary: aiScores.summary
    };

  } catch (err) {

    console.error(
      'Gemini AI Error caught in service:',
      err.message
    );

    // fallback
    return {
      aiScores: {},
      finalScore: 50,
      label: 'Medium',
      summary: 'تحليل افتراضي بسبب خطأ في السيرفر'
    };
  }
}

module.exports = { analyzeCase };