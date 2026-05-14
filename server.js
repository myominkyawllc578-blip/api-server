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

      return res.json({
        success: fbResponse.ok,
        facebook_status: fbResponse.status,
        response: data,
      });

    } catch (e) {
      console.error("FACEBOOK PAYOUT ERROR:", e);

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

      return res.json({
        success: fbResponse.ok,
        facebook_status: fbResponse.status,
        response: data,
      });

    } catch (e) {
      console.error("FACEBOOK SOURCES ERROR:", e);

      return res.status(500).json({
        success: false,
        error: e.message,
      });
    }
  }
);
