require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error("❌ FACEBOOK_ACCESS_TOKEN is missing!");
  process.exit(1);
}

app.get('/', (req, res) => {
  res.json({ status: "✅ Server is running" });
});

app.post('/payout-source-transfer', async (req, res) => {
  res.json({ success: true, message: "Received payout request" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
