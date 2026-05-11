const express = require("express");
const fetch = require("node-fetch");

const app = express();

app.use(express.json({ limit: "50mb" }));

app.get("/", (req, res) => {
  res.send("API Running");
});

app.post("/redirect/facebook_graph_endpoint/v24.1/:id/payout", async (req, res) => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v24.1/${req.params.id}/payout?access_token=${req.query.access_token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      }
    );

    const data = await response.json();
    res.json(data);

  } catch (e) {
    res.json({
      success: false,
      error: e.toString()
    });
  }
});

app.post("/redirect/facebook_graph_endpoint/v24.1/:id/earning_sources", async (req, res) => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v24.1/${req.params.id}/earning_sources?access_token=${req.query.access_token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      }
    );

    const data = await response.json();
    res.json(data);

  } catch (e) {
    res.json({
      success: false,
      error: e.toString()
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
