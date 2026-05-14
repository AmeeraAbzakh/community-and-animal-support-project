const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const CaseScore = require('../models/CaseScore');
const aiService = require('../services/aiService'); // استدعاء خدمة الذكاء الاصطناعي

// 1. إنشاء حملة جديدة مع تحليل الـ AI (الجزء الجديد)
router.post('/create', async (req, res) => {
  try {
    const { title, description, goalAmount, userId } = req.body;

    // حفظ الحملة في قاعدة البيانات
    const campaign = await Campaign.create({
      title,
      description,
      goalAmount,
      userId
    });

    // نداء الـ AI لتحليل الحالة بناءً على الوصف
    const aiResult = await aiService.analyzeCase(description);

    // تخزين نتيجة التقييم في جدول CaseScore وربطها بالحملة
    await CaseScore.create({
      campaignId: campaign.id,
      priorityScore: aiResult.finalScore,
      label: aiResult.label,
      summary: aiResult.summary // استخدمت summary حسب ملفك الـ GET
    });

    res.status(201).json({
      message: 'Campaign created and analyzed successfully',
      campaign,
      analysis: aiResult.label
    });
  } catch (err) {
    console.error('Error in creating campaign:', err);
    res.status(500).json({ message: 'خطأ في إنشاء الحملة أو تحليل الـ AI' });
  }
});

// 2. جلب كل الحملات مع الـ Score تبعها (كودك الأصلي)
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({
      include: [{
        model: CaseScore,
        attributes: ['priorityScore', 'label', 'summary'] // عدلت finalScore لـ priorityScore ليتوافق مع الـ Model
      }]
    });
    res.json(campaigns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ في جلب البيانات' });
  }
});

// 3. جلب حملة واحدة بالتفصيل (كودك الأصلي)
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id, {
      include: [{
        model: CaseScore,
        attributes: ['priorityScore', 'label', 'summary']
      }]
    });

    if (!campaign) {
      return res.status(404).json({ message: 'الحملة غير موجودة' });
    }
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

module.exports = router;