const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ status: "✅ Server is running" });
});

// PAYOUT ROUTE
app.post("/redirect/facebook_graph_endpoint/v24.1/:id/payout", async (req, res) => {
  try {
    const accessToken = req.query.access_token;

    console.log("→ FACEBOOK PAYOUT REQUEST");

    const fbResponse = await fetch("https://www.facebook.com/api/graphql/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "User-Agent": req.headers["user-agent"] || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://www.facebook.com/",
        "Origin": "https://www.facebook.com",
        "x-fb-friendly-name": req.headers["x-fb-friendly-name"] || "RelayModern",
        "x-fb-lsd": req.headers["x-fb-lsd"] || "",
        "accept": "application/json",
        "accept-language": "en-US,en;q=0.9",
      },
      body: JSON.stringify(req.body),
    });

    const text = await fbResponse.text();
    console.log("FACEBOOK RAW RESPONSE:", text.substring(0, 500) + "..."); // အရမ်းရှည်ရင် အတိုချုံး

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return res.status(200).json({ success: true, data, status: fbResponse.status });
  } catch (e) {
    console.error("ERROR:", e);
    return res.status(500).json({ success: false, error: e.message });
  }
});

// EARNING SOURCES ROUTE (တူညီအောင် ပြင်ထားပါ)
app.post("/redirect/facebook_graph_endpoint/v24.1/:id/earning_sources", async (req, res) => {
  // အပေါ်က payout route နဲ့ အတူတူ ကူးထည့်ပါ (အတိုချုံး version)
  // ... (အထက်က code နဲ့ အတူတူ ရေးပါ)
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
