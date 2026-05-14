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
      const pageId = req.params.id;
      const accessToken = req.query.access_token;

      const fbResponse = await fetch(
        `https://graph.facebook.com/v24.1/${pageId}/payout?access_token=${accessToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(req.body),
        }
      );

      const data = await fbResponse.json();

      console.log("FACEBOOK RESPONSE:", data);

      return res.status(fbResponse.status).json(data);
    } catch (e) {
      console.error("FACEBOOK PAYOUT ERROR:", e);

      return res.status(500).json({
        success: false,
        error: e.message,
      });
    }
  }
);
