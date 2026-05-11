const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running");
});

app.post("/redirect/facebook_graph_endpoint/:id/payout", async (req, res) => {
  res.json({
    success: true,
    message: "API Connected"
  });
});

app.post("/redirect/facebook_graph_endpoint/v24.1/:id/earning_sources", async (req, res) => {
  res.json({
    success: true,
    _sources: [],
    has_next_page: false
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
