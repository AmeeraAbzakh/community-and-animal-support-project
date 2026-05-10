const express = require('express');
const { Op } = require('sequelize');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const checkToken = require('../middleware/checkToken');
const PriorityCalculator = require('../utils/PriorityCalculator');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, status } = req.query;
    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;
    else where.status = 'active';

    const campaigns = await Campaign.findAll({
      where,
      include: [{ model: User, as: 'creator', attributes: ['id', 'full_name', 'role'] }],
      order: [['priority_score', 'DESC']],
    });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'full_name', 'role'] }],
    });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', checkToken, async (req, res) => {
  try {
    const { title, description, category, urgency, income_level, health_condition, family_size, location, goal_amount } = req.body;

    if (!title || !description || !category || !urgency || !income_level || !health_condition || !family_size || !location || !goal_amount) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const priority_score = PriorityCalculator.calculate({ health_condition, income_level, family_size: parseInt(family_size), urgency, category });

    const campaign = await Campaign.create({
      user_id: req.user.id,
      title,
      description,
      category,
      urgency,
      income_level,
      health_condition,
      family_size: parseInt(family_size),
      location,
      goal_amount: parseFloat(goal_amount),
      priority_score,
    });

    res.status(201).json(campaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/user/mine', checkToken, async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
    });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

Campaign.belongsTo(User, { foreignKey: 'user_id', as: 'creator' });
User.hasMany(Campaign, { foreignKey: 'user_id', as: 'campaigns' });

module.exports = router;