import express from 'express';
import Rule from '../models/Rule.js'; // Include `.js` for ES Modules

const router = express.Router();

// GET all budgeting rules
router.get('/', async (req, res) => {
  try {
    const rules = await Rule.find();
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching rules' });
  }
});

export default router;
