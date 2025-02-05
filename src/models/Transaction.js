const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  buyerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  sellerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(280),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      'created',
      'buyer_joined',
      'escrow_funded',
      'item_sent',
      'delivery_confirmed',
      'inspection_period',
      'completed',
      'disputed',
      'refunded'
    ),
    defaultValue: 'created'
  },
  inspectionStartTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  inspectionEndTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  extensionUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  disputeReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  disputeEvidence: {
    type: DataTypes.JSON,
    allowNull: true
  }
});

module.exports = Transaction;