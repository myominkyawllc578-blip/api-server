// server.js - MYO MIN KYAW Payout Manager
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error("❌ FACEBOOK_ACCESS_TOKEN is missing in .env file");
  process.exit(1);
}

// Health check
app.get('/', (req, res) => {
  res.json({ status: "MYO MIN KYAW Payout Server is running" });
});

// Payout Source Transfer Endpoint
app.post('/payout-source-transfer', async (req, res) => {
  const { page_id, target_payout_account_id } = req.body;

  if (!page_id || !target_payout_account_id) {
    return res.status(400).json({
      success: false,
      error: "page_id and target_payout_account_id are required"
    });
  }

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${page_id}/payout_source_transfer`,
      {
        target_payout_account_id: target_payout_account_id
      },
      {
        params: { access_token: ACCESS_TOKEN },
        headers: { 'Content-Type': 'application/json' }
      }
    );

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error("Payout Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || error.message
    });
  }
});

// Get Payout Accounts (Optional helper)
app.get('/payout-accounts/:page_id', async (req, res) => {
  const { page_id } = req.params;

  try {
    const response = await axios.get(
      `https://graph.facebook.com/v21.0/${page_id}/payout_accounts`,
      {
        params: { access_token: ACCESS_TOKEN }
      }
    );
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 MYO MIN KYAW Payout Server running on port ${PORT}`);
});
