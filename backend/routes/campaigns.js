const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const CaseScore = require('../models/CaseScore');

// 1. جلب كل الحملات مع الـ Score تبعها
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({
      include: [{
        model: CaseScore,
        attributes: ['finalScore', 'label', 'summary']
      }]
    });
    res.json(campaigns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ في جلب البيانات' });
  }
});

// 2. جلب حملة واحدة بالتفصيل عن طريق الـ ID
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id, {
      include: [{
        model: CaseScore,
        attributes: ['finalScore', 'label', 'summary', 'rawScores']
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