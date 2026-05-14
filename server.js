const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  next();
});

app.post('/payout', async (req, res) => {
  console.log('\n=== PAYOUT REQUEST RECEIVED ===');
  try {
    const { accessToken, pageId, payoutId, subtype } = req.body;

    const fbUrl = `https://graph.facebook.com/v24.1/${pageId}/payouts`;

    const payload = {
      payout_id: payoutId,
      subtype: subtype || "STARS"
    };

    const response = await axios.post(fbUrl, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('FB STATUS:', response.status);
    console.log('FB RESPONSE:', JSON.stringify(response.data, null, 2));

    res.json({ success: true, fbResponse: response.data });

  } catch (error) {
    console.error('ERROR:', error.message);
    if (error.response) console.error('FB ERROR:', JSON.stringify(error.response.data, null, 2));
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/', (req, res) => res.send('Server Running'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
