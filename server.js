const express = require("express");
const app = express();

app.use(express.json());

app.post('/redirect/facebook_graph_endpoint/:version/:pageId/payout', async (req, res) => {
    
    console.log("🚀 FB Payout Request Received!");
    console.log("Params:", req.params);
    console.log("Body product/subtype:", req.body.product);

    try {
        const { version, pageId } = req.params;
        const subtype = req.body.product || "Stars";

        console.log(`✅ Sending SUCCESS response for ${subtype}`);

        res.status(200).json({
            success: true,
            status: "COMPLETED",
            message: "Payout completed",
            _sources: [
                {
                    payee_id: pageId,
                    subtype: subtype,
                    status: "COMPLETED",
                    page_name: "Success Page"
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
        res.status(500).json({ success: false });
    }
});

app.get("/", (req, res) => res.send("API Running"));
app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on('SIGTERM', () => process.exit(0));
