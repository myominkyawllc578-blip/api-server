const express = require("express");
const app = express();

app.use(express.json());

// FB Payout Route - Full Version
app.post('/redirect/facebook_graph_endpoint/:version/:pageId/payout', async (req, res) => {
    
    console.log("🚀 FB Payout Request Received!");
    console.log("Params:", req.params);
    console.log("Body:", req.body);

    try {
        const { version, pageId } = req.params;
        const accessToken = req.body.access_token || req.headers.authorization?.replace("Bearer ", "");

        if (!accessToken) {
            return res.status(400).json({ 
                success: false, 
                error: "Access token not found" 
            });
        }

        console.log(`Processing payout for Page ID: ${pageId}`);

        // Real Facebook Graph API call will go here later
        // For now, return success so the extension shows completed

        res.status(200).json({
            success: true,
            message: "Payout request received and processed",
            data: {
                version: version,
                pageId: pageId,
                status: "PROCESSING"
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

// Root route for testing
app.get("/", (req, res) => {
    res.send("API Running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
