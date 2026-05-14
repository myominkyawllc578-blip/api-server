const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    status: "✅ Server is running",
  });
});

app.post(
  "/redirect/facebook_graph_endpoint/v24.1/:id/payout",
  async (req, res) => {
    try {
      console.log("PAYOUT REQUEST");
      console.log("PARAMS:", req.params);
      console.log("BODY:", req.body);

      return res.json({
        success: true,
        message: "Payout endpoint working",
        payoutId: req.body.fp || null,
        pageId: req.body.pe || null,
        subtype: req.body.product || null,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.error("PAYOUT ERROR:", e);

      return res.status(500).json({
        success: false,
        error: e.message,
      });
    }
  }
);

app.post(
  "/redirect/facebook_graph_endpoint/v24.1/:id/earning_sources",
  async (req, res) => {
    try {
      console.log("EARNING SOURCES REQUEST");
      console.log("PARAMS:", req.params);
      console.log("BODY:", req.body);

      return res.json({
        success: true,
        _sources: [],
        has_next_page: false,
        cursor: null,
        after: 0,
      });
    } catch (e) {
      console.error("EARNING SOURCES ERROR:", e);

      return res.status(500).json({
        success: false,
        error: e.message,
      });
    }
  }
);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
