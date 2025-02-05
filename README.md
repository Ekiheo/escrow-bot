# SecureEscrow Bot

A secure escrow service bot that operates on both WhatsApp and Telegram, facilitating safe transactions using Bitcoin and M-PESA (Kenyan Shillings).

## Features

- **Multi-Platform Support**
  - WhatsApp integration
  - Telegram integration
  - Unified user experience across platforms

- **Payment Methods**
  - Bitcoin transactions with secure wallet generation
  - M-PESA integration for KSH transactions
  - Real-time payment verification

- **Security Features**
  - Secure escrow system
  - Multi-step transaction verification
  - Dispute resolution system
  - Rate limiting and DDoS protection
  - Input validation and sanitization

- **User Features**
  - Transaction history tracking
  - Real-time notifications
  - User ratings and reputation system
  - Wallet balance management

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- Telegram Bot Token
- WhatsApp Business API credentials
- M-PESA API credentials
- BlockCypher API key for Bitcoin integration

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/escrow-bot.git
   cd escrow-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your credentials.

4. Initialize the database:
   ```bash
   npm run db:migrate
   ```

5. Start the server:
   ```bash
   npm start
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/escrow_db

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# WhatsApp
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Bitcoin
BLOCKCYPHER_API_KEY=your_blockcypher_api_key

# MPESA
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_PASSKEY=your_mpesa_passkey
MPESA_SHORTCODE=your_mpesa_shortcode

# JWT
JWT_SECRET=your_jwt_secret
```

## API Documentation

The API documentation is available at `/api-docs` when running in development mode.

## Commands

### Telegram Commands
- `/start` - Initialize the bot
- `/escrow` - Start a new escrow transaction
- `/balance` - Check wallet balance
- `/help` - Display help information

### WhatsApp Commands
- `!start` - Initialize the bot
- `!escrow` - Start a new escrow transaction
- `!balance` - Check wallet balance
- `!help` - Display help information

## Security

- All transactions are protected by escrow
- Funds are only released after buyer confirmation
- Automated dispute resolution system
- Rate limiting on all API endpoints
- Input validation and sanitization
- SSL/TLS encryption for all communications

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please contact us through:
- Email: support@yourdomain.com
- Telegram: @YourSupportHandle
- WhatsApp: Your support number