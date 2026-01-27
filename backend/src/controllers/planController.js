import { Plan } from '../models/Plan.js';

export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.findAll(true);
    res.json(plans);
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to get plans' });
  }
};

