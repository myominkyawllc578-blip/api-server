const express = require("express");
const app = express();

app.use(express.json());

// FB Payout Route - Improved for Extension
app.post('/redirect/facebook_graph_endpoint/:version/:pageId/payout', async (req, res) => {
    
    console.log("🚀 FB Payout Request Received!");
    console.log("Params:", req.params);
    console.log("Body:", req.body);

    try {
        const { version, pageId } = req.params;

        console.log(`Processing payout for Page: ${pageId}`);

        // Response that Extension likely expects
        res.status(200).json({
            success: true,
            message: "Payout request processed successfully",
            status: "COMPLETED",
            data: {
                payout_id: req.body.payoutId || "25934002752950168",
                page_id: pageId,
                amount: "0",
                status: "COMPLETED",
                created_time: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error("❌ Payout Error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Test route
app.get("/", (req, res) => {
    res.send("API Running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
