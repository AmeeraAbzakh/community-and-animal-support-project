const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const checkToken = require('../middleware/checkToken');
router.post('/', checkToken, async (req, res) => {
  try {
    const { campaignId, amount } = req.body;

     const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'الحملة مش موجودة' });
    }
    const donation = await Donation.create({
      amount,
      campaignId,
      userId: req.user.id 
    });
    campaign.raised = parseFloat(campaign.raised) + parseFloat(amount);
    await campaign.save();
    res.json({
      message: 'تم التبرع بنجاح',
      donation,
      newTotal: campaign.raised
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'في مشكلة، حاولي مرة ثانية' });
  }
});
router.get('/:campaignId', async (req, res) => {
  try {
    const donations = await Donation.findAll({
      where: { campaignId: req.params.campaignId }
    });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: 'في مشكلة' });
  }
});

module.exports = router;