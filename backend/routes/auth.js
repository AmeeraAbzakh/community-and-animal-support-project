const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'revobin_secret_2025';

router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, phone, role } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const validRole = ['user', 'organization', 'admin'].includes(role) ? role : 'user';

    const user = await User.create({
      full_name,
      email,
      password: hashed,
      phone: phone || null,
      role: validRole
    });

    res.json({ message: 'Account created successfully', userId: user.id });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      name: user.full_name,
      role: user.role,
      userId: user.id
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;