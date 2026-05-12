const express = require("express");
const app = express();

app.use(express.json());

app.post('/redirect/facebook_graph_endpoint/:version/:pageId/payout', async (req, res) => {
    console.log("🚀 FB Payout Request Received!");
    console.log("Params:", req.params);

    try {
        const { version, pageId } = req.params;

        console.log("✅ Sending response to Extension...");

        res.status(200).json({
            success: true,
            status: "COMPLETED",
            message: "Payout transfer completed successfully",
            _sources: [{
                payee_id: pageId,
                subtype: "Stars",
                status: "COMPLETED"
            }],
            has_next_page: false,
            data: { success: true }
        });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ success: false, status: "FAILED" });
    }
});

// Health check
app.get("/", (req, res) => res.send("API Running OK"));

app.get("/health", (req, res) => res.json({ status: "healthy" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

// Graceful shutdown (Railway အတွက်)
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
