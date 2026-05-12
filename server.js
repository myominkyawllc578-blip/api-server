const express = require("express");
const app = express();

app.use(express.json());

app.post('/redirect/facebook_graph_endpoint/:version/:pageId/payout', async (req, res) => {
    
    console.log("🚀 FB Payout Request Received!");
    console.log("Params:", req.params);
    console.log("Body:", req.body);

    try {
        const { version, pageId } = req.params;

        console.log("✅ Sending success response to extension...");

        // Extension က မျှော်နေတဲ့ format နဲ့ ပြန်ပေး
        res.status(200).json({
            success: true,
            status: "COMPLETED",
            message: "Transfer completed successfully",
            payout_id: "25934002752950168",
            page_id: pageId,
            amount: "0",
            currency: "USD",
            created_time: new Date().toISOString(),
            updated_time: new Date().toISOString(),
            subtype: "Stars"
        });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get("/", (req, res) => {
    res.send("API Running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
