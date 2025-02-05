const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const UserController = require('../controllers/userController');
const TransactionController = require('../controllers/transactionController');

class WhatsAppBot {
  constructor() {
    this.client = new Client({
      puppeteer: {
        args: ['--no-sandbox']
      }
    });
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
      console.log('Please scan the QR code to authenticate WhatsApp');
    });

    this.client.on('ready', () => {
      console.log('WhatsApp bot is ready!');
    });

    this.client.on('message', this.handleMessage.bind(this));
  }

  async handleMessage(message) {
    const command = message.body.split(' ')[0].toLowerCase();
    
    switch (command) {
      case '!start':
        await this.handleStart(message);
        break;
      case '!escrow':
        await this.handleEscrow(message);
        break;
      case '!balance':
        await this.handleBalance(message);
        break;
      case '!help':
        await this.handleHelp(message);
        break;
      default:
        // Handle ongoing transactions or unknown commands
        break;
    }
  }

  async handleStart(message) {
    const welcomeMessage = `
Welcome to SecureEscrow! 🔒

Available commands:
!escrow - Start a new escrow transaction
!balance - Check your wallet balance
!help - Show this help message

For your security, all transactions are protected by our escrow service.`;
    
    await message.reply(welcomeMessage);
  }

  async handleEscrow(message) {
    const instructions = `Starting new escrow transaction.
Please provide the following details in this format:

!escrow create <seller_phone> <amount> <currency> <description>

Example:
!escrow create +254712345678 0.001 BTC "Twitter account purchase"`;

    await message.reply(instructions);
  }

  async handleBalance(message) {
    try {
      const user = await UserController.getUserByPhone(message.from);
      const balanceMessage = `Your current balance:
BTC: ${user.walletBalance}
KSH: ${user.kshBalance}`;
      
      await message.reply(balanceMessage);
    } catch (error) {
      await message.reply('Error fetching balance. Please try again later.');
    }
  }

  async handleHelp(message) {
    const helpMessage = `
SecureEscrow Commands:

!start - Get started with SecureEscrow
!escrow - Begin new escrow transaction
!balance - Check wallet balance
!help - Show this help message

Need support? Contact our support at +1234567890`;

    await message.reply(helpMessage);
  }

  start() {
    this.client.initialize();
    console.log('WhatsApp bot initializing...');
  }
}

module.exports = new WhatsAppBot();