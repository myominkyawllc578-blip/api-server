const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  next();
});

// Main Payout Endpoint
app.post('/payout', async (req, res) => {
  console.log('\n=== PAYOUT REQUEST RECEIVED ===');

  try {
    const { accessToken, pageId, payoutId, amount, subtype } = req.body;

    if (!accessToken || !pageId || !payoutId) {
      console.error('Missing required fields');
      return res.status(400).json({ error: 'Missing accessToken, pageId or payoutId' });
    }

    console.log('Payout Details:', { pageId, payoutId, subtype, amount });

    // Facebook Graph API Payout Request
    const fbUrl = `https://graph.facebook.com/v24.1/${pageId}/payouts`;

    const payload = {
      payout_id: payoutId,
      // Add other required fields based on your needs
      // amount, subtype, etc.
    };

    const config = {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    console.log('Sending to Facebook:', fbUrl);

    const fbResponse = await axios.post(fbUrl, payload, config);

    console.log('STATUS:', fbResponse.status);
    console.log('HEADERS:', JSON.stringify(fbResponse.headers, null, 2));
    console.log('FULL RAW RESPONSE:', JSON.stringify(fbResponse.data, null, 2));

    // Send success back to extension
    res.status(200).json({
      success: true,
      message: 'Payout request sent to Facebook',
      fbResponse: fbResponse.data
    });

  } catch (error) {
    console.error('=== PAYOUT ERROR ===');
    console.error('Message:', error.message);

    if (error.response) {
      console.error('FB Status:', error.response.status);
      console.error('FB Error Data:', JSON.stringify(error.response.data, null, 2));
    }

    res.status(500).json({
      success: false,
      error: error.message,
      fbError: error.response?.data || null
    });
  }
});

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'Server is running on port ' + PORT });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
