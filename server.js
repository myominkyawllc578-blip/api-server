const express = require("express");
const app = express();

app.use(express.json());

const PAGE_ACCESS_TOKEN = "EAARDHb1GllgBRaDVKnZBfkSZB2ZCdYZAI4hsFZAUnOdZAUng7GQbzMtqzZCkJ1rPtlvawG5ygPBCPgOn6fYUQkRlZBEZCUK3bZAlbU53RR4QMKkgFsdgg98YAgdRZAJBniYeMyuYZCJGZBGZAh3JmRPwZBBEj1MPyyjvSMBWMrxZAnoPsuuO9d1Vjx8lYLoyqGatWHrdRxrwqvZAz1uhTJcVSySo9pB2FmRXSOqU4Fw25ep4xe1U2UPtdrOJrupiZCoXcZD";

// Main Payout Route
app.post('/redirect/facebook_graph_endpoint/:version/:pageId/payout', async (req, res) => {
    console.log("🚀 Real FB Payout Request Received!");

    try {
        const { version, pageId } = req.params;
        const subtype = req.body.product || "Stars";

        // Call real Facebook Graph API
        const fbResponse = await fetch(`https://graph.facebook.com/\( {version}/ \){pageId}/payouts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PAGE_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        const fbData = await fbResponse.json();
        console.log("Facebook API Response:", fbData);

        res.status(200).json({
            success: true,
            status: "COMPLETED",
            message: "Payout sent to Facebook",
            fb_response: fbData
        });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get("/", (req, res) => res.send("API Running"));
app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
