const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Dispute = sequelize.define('Dispute', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  transactionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Transactions',
      key: 'id'
    }
  },
  initiatorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  evidence: {
    type: DataTypes.JSON,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('open', 'under_review', 'resolved', 'closed'),
    defaultValue: 'open'
  },
  resolution: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resolvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Dispute;