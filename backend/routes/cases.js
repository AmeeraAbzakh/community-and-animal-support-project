const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const CaseScore = require('../models/CaseScore');

router.get('/priority', async (req, res) => {
  try {
    const cases = await Campaign.findAll({
      include: [{
        model: CaseScore,
        attributes: ['finalScore', 'label', 'summary']
      }],
      order: [[CaseScore, 'finalScore', 'DESC']]
    });

    const withScores = cases.filter(c => c.CaseScore !== null);
    res.json(withScores);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'في مشكلة' });
  }
});

router.get('/score/:campaignId', async (req, res) => {
  try {
    const score = await CaseScore.findOne({
      where: { campaignId: req.params.campaignId }
    });

    if (!score) {
      return res.status(404).json({ message: 'ما في score لهاي الحملة' });
    }

    res.json({
      finalScore: score.finalScore,
      label: score.label,
      summary: score.summary,
      breakdown: JSON.parse(score.rawScores || '{}')
    });

  } catch (err) {
    res.status(500).json({ message: 'في مشكلة' });
  }
});

module.exports = router;