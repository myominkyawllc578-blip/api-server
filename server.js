const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ status: "✅ Server is running" });
});

/* PAYOUT ROUTE */
app.post("/redirect/facebook_graph_endpoint/v24.1/:id/payout", async (req, res) => {
  try {
    const accessToken = req.query.access_token;

    console.log("FACEBOOK PAYOUT REQUEST");
    console.log("PARAMS:", req.params);
    console.log("BODY:", req.body);

    const fbResponse = await fetch("https://www.facebook.com/api/graphql/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,   // ← ဒီနေရာ အရေးကြီး
        "User-Agent": req.headers["user-agent"] || "Mozilla/5.0",
        "Referer": "https://www.facebook.com/",
        "Origin": "https://www.facebook.com",
        "x-fb-friendly-name": req.headers["x-fb-friendly-name"] || "RelayModern",
      },
      body: JSON.stringify(req.body),
    });

    const text = await fbResponse.text();
    console.log("FACEBOOK RAW RESPONSE:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    console.log("FACEBOOK RESPONSE:", data);

    return res.status(200).json({ success: true, data });
  } catch (e) {
    console.error("FACEBOOK PAYOUT ERROR:", e);
    return res.status(500).json({ success: false, error: e.message });
  }
});

/* EARNING SOURCES ROUTE (တူညီအောင် ပြင်ပါ) */
app.post("/redirect/facebook_graph_endpoint/v24.1/:id/earning_sources", async (req, res) => {
  try {
    const accessToken = req.query.access_token;

    const fbResponse = await fetch("https://www.facebook.com/api/graphql/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "User-Agent": req.headers["user-agent"] || "Mozilla/5.0",
        "Referer": "https://www.facebook.com/",
      },
      body: JSON.stringify(req.body),
    });

    const text = await fbResponse.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return res.status(200).json({ success: true, data });
  } catch (e) {
    console.error("FACEBOOK SOURCES ERROR:", e);
    return res.status(500).json({ success: false, error: e.message });
  }
});

app.use((req, res) => res.status(404).json({ success: false, error: "Route not found" }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
