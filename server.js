const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.json({ status: "✅ Server running" }));

// PAYOUT ROUTE - ပိုကောင်းအောင် ပြင်ထားတယ်
app.post("/redirect/facebook_graph_endpoint/v24.1/:id/payout", async (req, res) => {
  try {
    const accessToken = req.query.access_token;

    console.log("→ PAYOUT REQUEST RECEIVED");

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
      "User-Agent": req.headers["user-agent"] || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
      "Referer": "https://www.facebook.com/",
      "Origin": "https://www.facebook.com",
      "x-fb-friendly-name": req.headers["x-fb-friendly-name"] || "RelayModern",
      "x-fb-lsd": req.headers["x-fb-lsd"] || "",
      "x-asbd-id": req.headers["x-asbd-id"] || "129477",
      "accept": "application/json",
      "accept-language": "en-US,en;q=0.9",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
    };

    const fbResponse = await fetch("https://www.facebook.com/api/graphql/", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(req.body),
    });

    const text = await fbResponse.text();
    console.log("STATUS:", fbResponse.status);
    console.log("RAW RESPONSE (first 400 chars):", text.substring(0, 400));

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text, isHtml: text.includes("<!DOCTYPE html>") };
    }

    return res.status(200).json({ success: true, data, status: fbResponse.status });
  } catch (e) {
    console.error("ERROR:", e.message);
    return res.status(500).json({ success: false, error: e.message });
  }
});

// EARNING SOURCES ROUTE ကိုလည်း အတူတူ ပြင်ပါ (အပေါ်က နဲ့ အတူတူ ကူးထည့်ပါ)
app.post("/redirect/facebook_graph_endpoint/v24.1/:id/earning_sources", async (req, res) => {
  // အထက်က payout route နဲ့ အတူတူ code ကူးထည့်ပါ
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
