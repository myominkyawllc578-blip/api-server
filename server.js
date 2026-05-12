const express = require("express");
const app = express();

app.use(express.json());

app.post('/redirect/facebook_graph_endpoint/:version/:pageId/payout', async (req, res) => {
    
    console.log("🚀 FB Payout Request Received!");
    console.log("Params:", req.params);

    try {
        const { version, pageId } = req.params;

        console.log("✅ Sending FINAL COMPLETED response...");

        res.status(200).json({
            success: true,
            status: "COMPLETED",
            message: "Payout transfer completed successfully",
            id: "payout_" + Date.now(),
            payout_id: "25934002752950168",
            page_id: pageId,
            amount: "0",
            currency: "USD",
            subtype: "Stars",
            created_time: new Date().toISOString(),
            updated_time: new Date().toISOString(),
            error: null,
            data: {
                success: true,
                status: "COMPLETED"
            }
        });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ success: false, status: "FAILED" });
    }
});

app.get("/", (req, res) => res.send("API Running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
