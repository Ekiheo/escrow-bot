const { Dispute, Transaction, User } = require('../models');
const { sendNotification } = require('../utils/notifications');

class DisputeService {
  async createDispute(transactionId, initiatorId, reason, evidence = null) {
    try {
      const dispute = await Dispute.create({
        transactionId,
        initiatorId,
        reason,
        evidence,
        status: 'open'
      });

      // Notify admins
      const admins = await User.findAll({ where: { role: 'admin' } });
      for (const admin of admins) {
        await sendNotification(admin.id, 'New dispute created', `Dispute #${dispute.id} requires attention`);
      }

      return dispute;
    } catch (error) {
      console.error('Error creating dispute:', error);
      throw new Error('Failed to create dispute');
    }
  }

  async resolveDispute(disputeId, adminId, resolution, action) {
    try {
      const dispute = await Dispute.findByPk(disputeId, {
        include: [{ model: Transaction }]
      });

      if (!dispute) {
        throw new Error('Dispute not found');
      }

      const transaction = dispute.Transaction;

      switch (action) {
        case 'refund_buyer':
          await transaction.update({ status: 'refunded' });
          break;
        case 'release_to_seller':
          await transaction.update({ status: 'completed' });
          break;
        default:
          throw new Error('Invalid resolution action');
      }

      await dispute.update({
        status: 'resolved',
        resolution,
        resolvedBy: adminId,
        resolvedAt: new Date()
      });

      // Notify parties
      await Promise.all([
        sendNotification(transaction.buyerId, 'Dispute resolved', `Dispute #${dispute.id} has been resolved`),
        sendNotification(transaction.sellerId, 'Dispute resolved', `Dispute #${dispute.id} has been resolved`)
      ]);

      return dispute;
    } catch (error) {
      console.error('Error resolving dispute:', error);
      throw new Error('Failed to resolve dispute');
    }
  }

  async getDisputeDetails(disputeId) {
    try {
      const dispute = await Dispute.findByPk(disputeId, {
        include: [
          { model: Transaction },
          { model: User, as: 'initiator' },
          { model: User, as: 'resolver' }
        ]
      });

      if (!dispute) {
        throw new Error('Dispute not found');
      }

      return dispute;
    } catch (error) {
      console.error('Error fetching dispute details:', error);
      throw new Error('Failed to fetch dispute details');
    }
  }
}

module.exports = new DisputeService();