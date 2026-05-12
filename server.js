const express = require("express");
const app = express();

app.use(express.json());

app.post('/redirect/facebook_graph_endpoint/:version/:pageId/payout', async (req, res) => {
    
    console.log("🚀 FB Payout Request Received!");
    console.log("Params:", req.params);
    console.log("Body:", req.body);

    try {
        const { version, pageId } = req.params;

        console.log("✅ Sending response that should update status...");

        // Extension က လက်ခံနိုင်ဖို့ အသေးစိတ် response
        res.status(200).json({
            success: true,
            status: "COMPLETED",
            message: "Payout transfer completed successfully",
            _sources: [
                {
                    payee_id: pageId,
                    subtype: req.body.product || "Stars",
                    page_name: "Your Page",
                    status: "COMPLETED"
                }
            ],
            has_next_page: false,
            cursor: null,
            after: 0,
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
