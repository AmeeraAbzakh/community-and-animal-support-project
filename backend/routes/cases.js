const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const CaseScore = require('../models/CaseScore');
const checkToken = require('../middleware/checkToken');
const { analyzeCase } = require('../services/aiService');
const PriorityCalculator = require('../utils/PriorityCalculator');

// GET all cases sorted by priority score
router.get('/', async (req, res) => {
  try {
    const cases = await Campaign.findAll({
      include: [{ model: CaseScore, attributes: ['finalScore', 'label', 'summary', 'rawScores'] }],
      order: [[CaseScore, 'finalScore', 'DESC']]
    });
    res.json(cases);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// GET cases sorted by priority (same but explicit endpoint)
router.get('/priority', async (req, res) => {
  try {
    const cases = await Campaign.findAll({
      include: [{ model: CaseScore, attributes: ['finalScore', 'label', 'summary'] }],
      order: [[CaseScore, 'finalScore', 'DESC']]
    });
    const withScores = cases.filter(c => c.CaseScore !== null);
    res.json(withScores);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// GET single case by ID
router.get('/:id', async (req, res) => {
  try {
    const c = await Campaign.findByPk(req.params.id, {
      include: [{ model: CaseScore, attributes: ['finalScore', 'label', 'summary', 'rawScores'] }]
    });
    if (!c) return res.status(404).json({ message: 'Case not found' });
    res.json(c);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// POST create new case with AI scoring
router.post('/', checkToken, async (req, res) => {
  try {
    const {
      title, description, category,
      urgency, goal_amount,
      income_level, health_condition,
      family_size, location
    } = req.body;

    if (!title || !description || !category || !goal_amount) {
      return res.status(400).json({ message: 'Title, description, category and goal amount are required' });
    }

    // make sure category is saved correctly
    const validCategory = category === 'animal' ? 'animal' : 'human';

    // 1 - save the case
    const newCase = await Campaign.create({
      title,
      description,
      category: validCategory,
      urgency: urgency || 'medium',
      goal_amount,
      current_amount: 0,
      income_level: income_level || 'low',
      health_condition: health_condition || 'moderate',
      family_size: family_size || 1,
      location: location || 'Jordan',
      status: 'active',
      user_id: req.user.id
    });

    // 2 - send to Gemini AI
    let aiResult;
    try {
      aiResult = await analyzeCase(description);
    } catch (aiErr) {
      console.log('AI failed, using default score:', aiErr.message);
      aiResult = {
        aiScores: null,
        finalScore: 50,
        label: 'Medium',
        summary: 'Could not analyze automatically'
      };
    }

    // 3 - calculate final priority score
    let finalScore = aiResult.finalScore;
    let label = aiResult.label;

    if (aiResult.aiScores) {
      finalScore = PriorityCalculator.calculate(aiResult.aiScores);
      label = PriorityCalculator.getLabel(finalScore);
    }

    // 4 - save the score
    await CaseScore.create({
      campaignId: newCase.id,
      finalScore,
      label,
      summary: aiResult.summary,
      rawScores: JSON.stringify(aiResult.aiScores || {})
    });

    res.json({
      message: 'Case created successfully',
      case: newCase,
      priority: { score: finalScore, label, summary: aiResult.summary }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;