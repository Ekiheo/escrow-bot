const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  platform: {
    type: DataTypes.ENUM('whatsapp', 'telegram'),
    allowNull: false
  },
  platformUserId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  walletBalance: {
    type: DataTypes.DECIMAL(15, 8),
    defaultValue: 0
  },
  kshBalance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  transactionsCompleted: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended', 'banned'),
    defaultValue: 'active'
  }
});

module.exports = User;