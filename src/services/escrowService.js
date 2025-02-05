const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { generateWallet } = require('./bitcoinService');

class EscrowService {
  async initiateTransaction(buyerId, sellerId, amount, currency, description) {
    const transaction = await Transaction.create({
      buyerId,
      sellerId,
      amount,
      currency,
      description,
      status: 'initiated'
    });

    if (currency === 'BTC') {
      const walletAddress = await generateWallet(transaction.id);
      await transaction.update({ escrowWalletAddress: walletAddress });
    }

    return transaction;
  }

  async confirmPayment(transactionId, paymentProof) {
    const transaction = await Transaction.findByPk(transactionId);
    if (!transaction) throw new Error('Transaction not found');

    await transaction.update({
      status: 'in_escrow',
      paymentProof
    });

    return transaction;
  }

  async releasePayment(transactionId) {
    const transaction = await Transaction.findByPk(transactionId, {
      include: [
        { model: User, as: 'seller' },
        { model: User, as: 'buyer' }
      ]
    });

    if (!transaction) throw new Error('Transaction not found');
    if (transaction.status !== 'in_escrow') throw new Error('Invalid transaction status');

    const { seller } = transaction;

    if (transaction.currency === 'BTC') {
      // Transfer BTC to seller's wallet
      await seller.increment('walletBalance', { by: transaction.amount });
    } else {
      // Transfer KSH to seller's account
      await seller.increment('kshBalance', { by: transaction.amount });
    }

    await transaction.update({
      status: 'completed',
      completedAt: new Date()
    });

    await seller.increment('transactionsCompleted');
    
    return transaction;
  }

  async initiateDispute(transactionId, reason) {
    const transaction = await Transaction.findByPk(transactionId);
    if (!transaction) throw new Error('Transaction not found');

    await transaction.update({
      status: 'disputed',
      disputeReason: reason
    });

    return transaction;
  }
}

module.exports = new EscrowService();