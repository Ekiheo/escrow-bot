const User = require('../models/User');
const logger = require('../utils/logger');

class NotificationService {
  async notifyUser(userId, title, message) {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Send platform-specific notification
      if (user.platform === 'telegram') {
        await this.sendTelegramNotification(user.platformUserId, title, message);
      } else if (user.platform === 'whatsapp') {
        await this.sendWhatsAppNotification(user.platformUserId, title, message);
      }

      logger.info(`Notification sent to user ${userId}: ${title}`);
    } catch (error) {
      logger.error('Error sending notification:', error);
      throw error;
    }
  }

  async notifyBoth(transaction, title, message) {
    await Promise.all([
      this.notifyUser(transaction.buyerId, title, message),
      this.notifyUser(transaction.sellerId, title, message)
    ]);
  }

  async sendTelegramNotification(platformUserId, title, message) {
    // Implementation will be handled by telegramBot.js
    global.telegramBot.sendNotification(platformUserId, `${title}\n\n${message}`);
  }

  async sendWhatsAppNotification(platformUserId, title, message) {
    // Implementation will be handled by whatsappBot.js
    global.whatsappBot.sendNotification(platformUserId, `*${title}*\n\n${message}`);
  }
}

module.exports = new NotificationService();