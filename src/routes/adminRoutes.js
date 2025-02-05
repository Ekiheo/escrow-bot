const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middlewares/authMiddleware');
const DisputeService = require('../services/disputeService');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Dispute = require('../models/Dispute');

// Admin authentication middleware
router.use(authenticateAdmin);

// Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalTransactions: await Transaction.count(),
      activeDisputes: await Dispute.count({ where: { status: 'open' } }),
      totalUsers: await User.count(),
      recentTransactions: await Transaction.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [
          { model: User, as: 'buyer' },
          { model: User, as: 'seller' }
        ]
      })
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Dispute management
router.get('/disputes', async (req, res) => {
  try {
    const disputes = await Dispute.findAll({
      include: [
        { model: Transaction },
        { model: User, as: 'initiator' }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(disputes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch disputes' });
  }
});

router.post('/disputes/:id/resolve', async (req, res) => {
  try {
    const { resolution, action } = req.body;
    const dispute = await DisputeService.resolveDispute(
      req.params.id,
      req.user.id,
      resolution,
      action
    );
    res.json(dispute);
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve dispute' });
  }
});

// User management
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.update({ status });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

module.exports = router;