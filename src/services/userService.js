const { User } = require('../models/User');
const logger = require('../utils/logger');

class UserService {
  async checkBalance(userId, amount) {
    try {
      const user = await User.findOne({ where: { platformUserId: userId.toString() } });
      
      if (!user) {
        throw new Error('User not found');
      }

      return user.walletBalance >= amount;
    } catch (error) {
      logger.error('Error checking balance:', error);
      throw error;
    }
  }

  async updateBalance(userId, amount, operation) {
    try {
      const user = await User.findOne({ where: { platformUserId: userId.toString() } });
      
      if (!user) {
        throw new Error('User not found');
      }

      const newBalance = operation === 'add' 
        ? user.walletBalance + amount 
        : user.walletBalance - amount;

      await user.update({ walletBalance: newBalance });
      
      return newBalance;
    } catch (error) {
      logger.error('Error updating balance:', error);
      throw error;
    }
  }
}

module.exports = new UserService();