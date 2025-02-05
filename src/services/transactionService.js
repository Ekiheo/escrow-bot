const Transaction = require('../models/Transaction');
const UserService = require('./userService');
const NotificationService = require('./notificationService');
const logger = require('../utils/logger');

class TransactionService {
  constructor() {
    this.transactionTokens = new Map();
    this.INSPECTION_PERIOD = 30 * 60 * 1000; // 30 minutes
    this.EXTENSION_TIME = 10 * 60 * 1000; // 10 minutes
  }

  async createTransaction(sellerId, amount, description) {
    try {
      const transaction = await Transaction.create({
        sellerId,
        amount,
        description,
        status: 'created'
      });

      await NotificationService.notifyUser(sellerId, 'Transaction created', 
        `Your listing for $${amount} has been created. Share the link with potential buyers.`);

      return transaction;
    } catch (error) {
      logger.error('Error creating transaction:', error);
      throw error;
    }
  }

  async joinAsBuyer(transactionId, buyerId) {
    try {
      const transaction = await Transaction.findByPk(transactionId);
      
      if (!transaction || transaction.status !== 'created') {
        throw new Error('Invalid transaction');
      }

      await transaction.update({
        buyerId,
        status: 'buyer_joined'
      });

      await NotificationService.notifyUser(transaction.sellerId, 'Buyer joined', 
        'A buyer has joined your transaction. Waiting for escrow funding.');

      return transaction;
    } catch (error) {
      logger.error('Error joining as buyer:', error);
      throw error;
    }
  }

  async fundEscrow(transactionId, buyerId) {
    try {
      const transaction = await Transaction.findByPk(transactionId);
      
      if (!transaction || transaction.buyerId !== buyerId) {
        throw new Error('Invalid transaction');
      }

      await UserService.updateBalance(buyerId, transaction.amount, 'subtract');
      await transaction.update({ status: 'escrow_funded' });

      await NotificationService.notifyUser(transaction.sellerId, 'Escrow funded', 
        'The buyer has funded the escrow. You can now send the item.');

      return transaction;
    } catch (error) {
      logger.error('Error funding escrow:', error);
      throw error;
    }
  }

  async confirmDelivery(transactionId, buyerId) {
    try {
      const transaction = await Transaction.findByPk(transactionId);
      
      if (!transaction || transaction.buyerId !== buyerId) {
        throw new Error('Invalid transaction');
      }

      const inspectionStartTime = new Date();
      const inspectionEndTime = new Date(inspectionStartTime.getTime() + this.INSPECTION_PERIOD);

      await transaction.update({
        status: 'inspection_period',
        inspectionStartTime,
        inspectionEndTime
      });

      // Schedule auto-completion
      this.scheduleAutoCompletion(transactionId, inspectionEndTime);

      await NotificationService.notifyBoth(transaction, 'Inspection period started',
        `Inspection period will end at ${inspectionEndTime.toLocaleString()}`);

      return transaction;
    } catch (error) {
      logger.error('Error confirming delivery:', error);
      throw error;
    }
  }

  async extendInspection(transactionId, buyerId) {
    try {
      const transaction = await Transaction.findByPk(transactionId);
      
      if (!transaction || transaction.buyerId !== buyerId || transaction.extensionUsed) {
        throw new Error('Invalid extension request');
      }

      const newEndTime = new Date(transaction.inspectionEndTime.getTime() + this.EXTENSION_TIME);

      await transaction.update({
        inspectionEndTime: newEndTime,
        extensionUsed: true
      });

      await NotificationService.notifyBoth(transaction, 'Inspection period extended',
        `Inspection period extended to ${newEndTime.toLocaleString()}`);

      return transaction;
    } catch (error) {
      logger.error('Error extending inspection:', error);
      throw error;
    }
  }

  async confirmReceipt(transactionId, buyerId) {
    try {
      const transaction = await Transaction.findByPk(transactionId);
      
      if (!transaction || transaction.buyerId !== buyerId) {
        throw new Error('Invalid transaction');
      }

      await transaction.update({ status: 'completed' });
      await UserService.updateBalance(transaction.sellerId, transaction.amount, 'add');

      await NotificationService.notifyBoth(transaction, 'Transaction completed',
        'The transaction has been completed successfully.');

      return transaction;
    } catch (error) {
      logger.error('Error confirming receipt:', error);
      throw error;
    }
  }

  async initiateDispute(transactionId, buyerId, reason, evidence) {
    try {
      const transaction = await Transaction.findByPk(transactionId);
      
      if (!transaction || transaction.buyerId !== buyerId) {
        throw new Error('Invalid transaction');
      }

      await transaction.update({
        status: 'disputed',
        disputeReason: reason,
        disputeEvidence: evidence
      });

      await NotificationService.notifyBoth(transaction, 'Dispute opened',
        'A dispute has been opened for this transaction. Support will review the case.');

      return transaction;
    } catch (error) {
      logger.error('Error initiating dispute:', error);
      throw error;
    }
  }

  scheduleAutoCompletion(transactionId, endTime) {
    const timeoutMs = endTime.getTime() - Date.now();
    
    setTimeout(async () => {
      try {
        const transaction = await Transaction.findByPk(transactionId);
        
        if (transaction && transaction.status === 'inspection_period') {
          await this.confirmReceipt(transactionId, transaction.buyerId);
        }
      } catch (error) {
        logger.error('Error in auto-completion:', error);
      }
    }, timeoutMs);
  }
}

module.exports = new TransactionService();