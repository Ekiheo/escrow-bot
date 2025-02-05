const { Telegraf, Markup } = require('telegraf');
const TransactionService = require('../services/transactionService');
const UserService = require('../services/userService');
const logger = require('../utils/logger');

class TelegramBot {
  constructor() {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.setupCommands();
    this.userStates = new Map();
  }

  setupCommands() {
    this.bot.command('start', this.handleStart.bind(this));
    this.bot.action('buyer', this.handleBuyer.bind(this));
    this.bot.action('seller', this.handleSeller.bind(this));
    this.bot.action(/^confirm_receipt/, this.handleConfirmReceipt.bind(this));
    this.bot.action(/^extend_time/, this.handleExtendTime.bind(this));
    this.bot.action(/^report_issue/, this.handleReportIssue.bind(this));
    this.bot.on('text', this.handleText.bind(this));
  }

  async handleStart(ctx) {
    const startPayload = ctx.message.text.split(' ')[1];
    
    if (startPayload) {
      return this.handleTransactionLink(ctx, startPayload);
    }

    await ctx.reply(
      'Are you a BUYER or SELLER? Please select:',
      Markup.inlineKeyboard([
        [
          Markup.button.callback('BUYER', 'buyer'),
          Markup.button.callback('SELLER', 'seller')
        ]
      ])
    );
  }

  async handleBuyer(ctx) {
    await ctx.reply('Please share the transaction link you received from the seller.');
    this.userStates.set(ctx.from.id, { step: 'awaiting_link' });
  }

  async handleSeller(ctx) {
    await ctx.reply('Please enter the product price (numbers only):');
    this.userStates.set(ctx.from.id, { step: 'awaiting_price' });
  }

  async handleText(ctx) {
    const state = this.userStates.get(ctx.from.id);
    if (!state) return;

    try {
      switch (state.step) {
        case 'awaiting_price':
          await this.handlePriceInput(ctx);
          break;
        case 'awaiting_description':
          await this.handleDescriptionInput(ctx);
          break;
        case 'awaiting_dispute_reason':
          await this.handleDisputeReason(ctx);
          break;
      }
    } catch (error) {
      logger.error('Error handling text:', error);
      await ctx.reply('An error occurred. Please try again.');
    }
  }

  async handlePriceInput(ctx) {
    const price = parseFloat(ctx.message.text);
    
    if (isNaN(price) || price <= 0) {
      return await ctx.reply('Please enter a valid price (numbers only).');
    }

    await ctx.reply('Please provide a brief description (max 50 words):');
    this.userStates.set(ctx.from.id, {
      step: 'awaiting_description',
      price
    });
  }

  async handleDescriptionInput(ctx) {
    const state = this.userStates.get(ctx.from.id);
    const description = ctx.message.text;
    
    if (description.split(' ').length > 50) {
      return await ctx.reply('Description too long. Please keep it under 50 words.');
    }

    const transaction = await TransactionService.createTransaction(
      ctx.from.id,
      state.price,
      description
    );

    const link = `https://t.me/${ctx.botInfo.username}?start=${transaction.id}`;
    
    await ctx.reply(
      'Transaction created! Share this link with the buyer:\n\n' +
      link
    );

    this.userStates.delete(ctx.from.id);
  }

  async handleTransactionLink(ctx, transactionId) {
    try {
      const transaction = await TransactionService.joinAsBuyer(transactionId, ctx.from.id);
      
      await ctx.reply(
        `Transaction Details:\n\n` +
        `Price: $${transaction.amount}\n` +
        `Description: ${transaction.description}\n\n` +
        `Do you want to proceed with the purchase?`,
        Markup.inlineKeyboard([
          [Markup.button.callback('Confirm & Pay', `confirm_pay_${transactionId}`)]
        ])
      );
    } catch (error) {
      logger.error('Error handling transaction link:', error);
      await ctx.reply('Invalid or expired transaction link.');
    }
  }

  async handleConfirmReceipt(ctx) {
    const transactionId = ctx.match[1];
    await TransactionService.confirmReceipt(transactionId, ctx.from.id);
    await ctx.reply('Receipt confirmed. Transaction completed!');
  }

  async handleExtendTime(ctx) {
    const transactionId = ctx.match[1];
    await TransactionService.extendInspection(transactionId, ctx.from.id);
    await ctx.reply('Inspection time extended by 10 minutes.');
  }

  async handleReportIssue(ctx) {
    const transactionId = ctx.match[1];
    await ctx.reply('Please describe the issue you encountered:');
    this.userStates.set(ctx.from.id, {
      step: 'awaiting_dispute_reason',
      transactionId
    });
  }

  async handleDisputeReason(ctx) {
    const state = this.userStates.get(ctx.from.id);
    await TransactionService.initiateDispute(
      state.transactionId,
      ctx.from.id,
      ctx.message.text
    );
    await ctx.reply('Dispute submitted. Our support team will review your case.');
    this.userStates.delete(ctx.from.id);
  }

  async sendNotification(userId, message) {
    try {
      await this.bot.telegram.sendMessage(userId, message);
    } catch (error) {
      logger.error('Error sending Telegram notification:', error);
    }
  }

  start() {
    this.bot.launch();
    global.telegramBot = this;
    logger.info('Telegram bot started');
  }
}

module.exports = new TelegramBot();