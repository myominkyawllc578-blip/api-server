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

/*
|--------------------------------------------------------------------------
| PAYOUT ROUTE
|--------------------------------------------------------------------------
*/

app.post(
  "/redirect/facebook_graph_endpoint/v24.1/:id/payout",
  async (req, res) => {
    try {
      const pageId = req.params.id;
      const accessToken = req.query.access_token;

      console.log("FACEBOOK PAYOUT REQUEST");
      console.log("PARAMS:", req.params);
      console.log("BODY:", req.body);

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

/*
|--------------------------------------------------------------------------
| EARNING SOURCES ROUTE
|--------------------------------------------------------------------------
*/

app.post(
  "/redirect/facebook_graph_endpoint/v24.1/:id/earning_sources",
  async (req, res) => {
    try {
      const payoutId = req.params.id;
      const accessToken = req.query.access_token;

      console.log("FACEBOOK SOURCES REQUEST");
      console.log("PARAMS:", req.params);
      console.log("BODY:", req.body);

      const fbResponse = await fetch(
        `https://graph.facebook.com/v24.1/${payoutId}/earning_sources?access_token=${accessToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(req.body),
        }
      );

      const data = await fbResponse.json();

      console.log("FACEBOOK SOURCES RESPONSE:", data);

      return res.status(fbResponse.status).json(data);
    } catch (e) {
      console.error("FACEBOOK SOURCES ERROR:", e);

      return res.status(500).json({
        success: false,
        error: e.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| 404 ROUTE
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
