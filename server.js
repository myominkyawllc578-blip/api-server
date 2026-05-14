const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Detailed Logging
app.use((req, res, next) => {
  console.log(`\n=== NEW REQUEST ${new Date().toISOString()} ===`);
  console.log(`${req.method} ${req.url}`);
  console.log('Full Body:', JSON.stringify(req.body, null, 2));
  next();
});

app.post('/payout', async (req, res) => {
  console.log('\n=== PAYOUT REQUEST RECEIVED ===');

  try {
    // Kiwi Extension ကနေ ပို့လာတဲ့ body ကို ကိုင်တွယ်နည်း
    const body = req.body;
    
    const accessToken = body.access_token || body.accessToken;
    const pageId = body.page_id || body.pageId || '1018589514665410';
    const payoutId = body.payout_id || body.payoutId || body.pe;
    const subtype = body.subtype || 'STARS';

    if (!accessToken || !payoutId) {
      console.error('Missing accessToken or payoutId');
      return res.status(400).json({ error: 'Missing accessToken or payoutId' });
    }

    console.log('Extracted Data:', { pageId, payoutId, subtype });

    const fbUrl = `https://graph.facebook.com/v24.1/${pageId}/payouts`;

    const payload = {
      payout_id: payoutId,
      subtype: subtype
    };

    const response = await axios.post(fbUrl, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ FB STATUS:', response.status);
    console.log('FB RESPONSE:', JSON.stringify(response.data, null, 2));

    res.json({ success: true, fbResponse: response.data });

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.response) {
      console.error('FB ERROR DATA:', JSON.stringify(error.response.data, null, 2));
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/', (req, res) => res.send('Payout Server Running ✅'));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
