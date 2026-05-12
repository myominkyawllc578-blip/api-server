require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: "✅ Server is running" });
});

app.post('/payout-source-transfer', (req, res) => {
  res.json({ success: true, message: "Request received" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
