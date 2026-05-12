// FB Payout Route
app.post('/redirect/facebook_graph_endpoint/:version/:pageId/payout', async (req, res) => {
    
    console.log("🚀 FB Payout Request Received!");
    console.log("Params:", req.params);
    console.log("Body:", req.body);

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
