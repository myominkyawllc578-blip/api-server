const express = require("express");
const app = express();

app.use(express.json());

// FB Payout Route (မှန်ကန်တဲ့ ဗားရှင်း)
app.post('/redirect/facebook_graph_endpoint/:version/:pageId/payout', async (req, res) => {
    
    console.log("🚀 FB Payout Request Received!");
    console.log("Params:", req.params);
    console.log("Body:", req.body);
    console.log("Query:", req.query);

    try {
        const { version, pageId } = req.params;

        res.status(200).json({
            success: true,
            message: "Payout request received successfully",
            data: {
                version: version,
                pageId: pageId,
                body: req.body
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

// Root route (စမ်းသပ်ဖို့)
app.get("/", (req, res) => {
    res.send("API Running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
