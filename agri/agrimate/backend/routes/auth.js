import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const sanitizeUser = (u) => ({
  id: u._id, name: u.name, email: u.email, phone: u.phone,
  farm: u.farm, location: u.location, preferredLang: u.preferredLang,
  notifications: u.notifications,
});

router.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, password, state, district, village, lang } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email, and password are required' });

    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ error: 'An account with this email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      passwordHash,
      location: { state: state || 'Punjab', district: district || 'Ludhiana', village: village || '' },
      farm: { state: state || 'Punjab', area: 12, crops: ['Wheat', 'Cotton'], soilType: 'Loamy' },
      preferredLang: lang || 'en',
    });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Signup error:', err.message);
    if (err.code === 11000) return res.status(409).json({ error: 'An account with this email already exists' });
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Signin error:', err.message);
    res.status(500).json({ error: 'Signin failed. Please try again.' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -analysisHistory');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('Me error:', err.message);
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

/* Update profile / location / preferences */
router.put('/profile', requireAuth, async (req, res) => {
  const { name, phone, state, district, village, soilType, crops, area, preferredLang, notifications } = req.body;
  const update = {};
  if (name) update.name = name;
  if (phone !== undefined) update.phone = phone;
  if (preferredLang) update.preferredLang = preferredLang;
  if (state || district || village !== undefined) {
    update['location.state']   = state || undefined;
    update['location.district']= district || undefined;
    update['location.village'] = village !== undefined ? village : undefined;
    update['farm.state']       = state || undefined;
    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);
  }
  if (soilType) update['farm.soilType'] = soilType;
  if (crops) update['farm.crops'] = crops;
  if (area) update['farm.area'] = Number(area);
  if (notifications) update.notifications = notifications;

  try {
    const user = await User.findByIdAndUpdate(req.user.id, { $set: update }, { new: true }).select('-passwordHash');
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

export default router;
