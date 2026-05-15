const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const CaseScore = require('../models/CaseScore');
const aiService = require('../services/aiService');

// 1. إنشاء حملة جديدة مع تحليل الـ AI
router.post('/create', async (req, res) => {
  try {
    const { title, description, goal_amount, user_id } = req.body;

    // حفظ الحملة
    const campaign = await Campaign.create({
      title,
      description,
      goal_amount,
      user_id
    });

    // نداء الـ AI
    const aiResult = await aiService.analyzeCase(description);

    // تخزين النتيجة - تم تعديل الحقل لـ finalScore ليتطابق مع الـ Model والداتابيز
    await CaseScore.create({
      campaignId: campaign.id,
      finalScore: aiResult?.finalScore || 50, // حماية: إذا فشل الـ AI يأخذ 50 بدل null
      label: aiResult?.label || 'Medium',
      summary: aiResult?.summary || 'تم التخزين بنجاح'
    });

    res.status(201).json({
      message: 'Campaign created and analyzed successfully',
      campaign,
      analysis: aiResult?.label || 'Pending'
    });

  } catch (err) {
    console.error('Error in creating campaign:', err);
    res.status(500).json({ 
      message: 'خطأ في إنشاء الحملة',
      error: err.message 
    });
  }
});

// 2. جلب كل الحملات (تعديل الحقول هنا أيضاً)
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({
      include: [{
        model: CaseScore,
        attributes: ['finalScore', 'label', 'summary'] // تعديل لـ finalScore
      }]
    });
    res.json(campaigns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ في جلب البيانات' });
  }
});

module.exports = router;