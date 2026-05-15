const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// استخدام gemini-1.5-flash هو الصحيح، والخطأ 404 غالباً بسبب تحديثات جوجل أو المكتبة
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function analyzeCase(description) {
  try {
    // محاولة الاتصال بالذكاء الاصطناعي
    const prompt = `Analyze: "${description}". Return JSON: {"urgency":5,"financialGap":5,"vulnerability":5,"medicalSeverity":5,"socialIsolation":5,"animalWelfare":5,"sustainability":5,"summary":"وصف"}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const aiScores = JSON.parse(text.replace(/```json|```/g, '').trim());

    // حساب السكور (عملية حسابية بسيطة)
    const finalScore = Math.round((aiScores.urgency || 5) * 10); 

    return { 
      finalScore: finalScore, 
      label: finalScore > 70 ? 'High' : 'Medium', 
      summary: aiScores.summary || 'تم التحليل' 
    };

  } catch (err) {
    console.error("Gemini AI Error caught in service:", err.message);
    // القيمة المنقذة: إذا فشل الـ AI بنرجع قيم ثابتة عشان الداتابيز ما ترفض
    return { 
      finalScore: 50, 
      label: 'Medium', 
      summary: 'تحليل افتراضي بسبب خطأ في السيرفر' 
    };
  }
}

module.exports = { analyzeCase };