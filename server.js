const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ status: "✅ Server is running" });
});

// ==================== DECODED PROXY ====================
const PROXY = "http://user-spn5hz794h-country-us:C23iKelo2T1nE\~neqm@isp.decodo.com:10001";

app.post("/redirect/facebook_graph_endpoint/v24.1/:id/payout", async (req, res) => {
  try {
    const accessToken = req.query.access_token;

    console.log("→ PAYOUT REQUEST RECEIVED");

    const fbResponse = await fetch("https://www.facebook.com/api/graphql/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://www.facebook.com/",
      },
      body: JSON.stringify(req.body),
    });

    const text = await fbResponse.text();
    console.log("STATUS:", fbResponse.status);
    console.log("RAW RESPONSE:", text.substring(0, 800));

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return res.status(200).json({ success: true, data });
  } catch (e) {
    console.error("ERROR:", e.message);
    return res.status(500).json({ success: false, error: e.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
