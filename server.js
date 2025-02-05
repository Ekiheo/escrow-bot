require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const telegramBot = require('./src/bots/telegramBot');
const whatsappBot = require('./src/bots/whatsappBot');
const sequelize = require('./src/config/db');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync database models
    await sequelize.sync();
    console.log('Database models synchronized.');

    // Start bots
    telegramBot.start();
    whatsappBot.start();
    
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
});