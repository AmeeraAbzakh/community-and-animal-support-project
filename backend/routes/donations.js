const express = require('express');
const router = express.Router();

const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');

const checkToken = require('../middleware/checkToken');


// CREATE DONATION
router.post('/', checkToken, async (req, res) => {

  try {

    const { case_id, amount } = req.body;

    // validation
    if (!case_id || !amount || amount <= 0) {

      return res.status(400).json({
        message: 'case_id and valid amount are required'
      });
    }

    // find campaign
    const campaign = await Campaign.findByPk(case_id);

    if (!campaign) {

      return res.status(404).json({
        message: 'Case not found'
      });
    }

    // check status
    if (campaign.status !== 'active') {

      return res.status(400).json({
        message: 'This case is not accepting donations'
      });
    }

    // create donation
    const donation = await Donation.create({

      amount: amount,

      campaignId: case_id,

      userId: req.user.id
    });

    // update raised amount
    const newAmount =
      parseFloat(campaign.current_amount || 0)
      + parseFloat(amount);

    campaign.current_amount = newAmount;

    await campaign.save();

    // response
    res.json({

      message: 'Donation successful',

      donation: donation,

      newTotal: newAmount
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: 'Something went wrong'
    });
  }
});


// GET DONATIONS BY CAMPAIGN
router.get('/:campaignId', async (req, res) => {

  try {

    const donations = await Donation.findAll({

      where: {
        campaignId: req.params.campaignId
      }
    });

    res.json(donations);

  } catch (err) {

    res.status(500).json({
      message: 'Something went wrong'
    });
  }
});


module.exports = router;