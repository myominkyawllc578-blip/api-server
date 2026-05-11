const express = require("express");
const fetch = require("node-fetch");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running");
});

app.post("/redirect/facebook_graph_endpoint/:id/payout", async (req, res) => {
  try {
    res.json({
      success: true,
      message: "API Connected"
    });
  } catch (e) {
    res.json({
      success: false,
      error: e.toString()
    });
  }
});

app.post("/redirect/facebook_graph_endpoint/v24.1/:id/earning_sources", async (req, res) => {
  try {
    res.json({
      success: true,
      message: "API Connected"
    });
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
