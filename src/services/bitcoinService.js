const axios = require('axios');
const { Transaction } = require('../models/Transaction');

class BitcoinService {
  constructor() {
    this.apiKey = process.env.BLOCKCYPHER_API_KEY;
    this.baseUrl = 'https://api.blockcypher.com/v1/btc/main';
  }

  async generateWallet(transactionId) {
    try {
      const response = await axios.post(`${this.baseUrl}/wallets/generate?token=${this.apiKey}`);
      return response.data.address;
    } catch (error) {
      console.error('Error generating Bitcoin wallet:', error);
      throw new Error('Failed to generate Bitcoin wallet');
    }
  }

  async checkPayment(address, expectedAmount) {
    try {
      const response = await axios.get(`${this.baseUrl}/addrs/${address}/balance`);
      return response.data.final_balance >= expectedAmount;
    } catch (error) {
      console.error('Error checking Bitcoin payment:', error);
      throw new Error('Failed to verify Bitcoin payment');
    }
  }

  async transferFunds(fromAddress, toAddress, amount) {
    try {
      // Implementation would depend on your Bitcoin wallet management system
      // This is a simplified example
      const response = await axios.post(`${this.baseUrl}/txs/new`, {
        inputs: [{ address: fromAddress }],
        outputs: [{ address: toAddress, value: amount }]
      });
      return response.data.tx.hash;
    } catch (error) {
      console.error('Error transferring Bitcoin:', error);
      throw new Error('Failed to transfer Bitcoin');
    }
  }
}

module.exports = new BitcoinService();