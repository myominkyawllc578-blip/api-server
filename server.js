const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/redirect/facebook_graph_endpoint/v24.1/:pageId/payout', async (req, res) => {
    try {
        const { pageId } = req.params;
        const { access_token } = req.query;
        const payload = req.body;

        console.log(`[${new Date().toISOString()}] Payout Request Received - Page: ${pageId}, Subtype: ${payload.tools}`);

        const graph_endpoint = `https://www.facebook.com/api/graphql/`;

        const fbPayload = {
            av: payload.__u,
            __user: payload.__u,
            __a: "1",
            __req: "3u",
            __hs: "19720.BP:DEFAULT.2.0",
            __rev: "1000000000",
            fb_dtsg: payload.fb_dtsg || payload.__s,
            jazoest: "21000",
            lsd: payload.lsd || "AVrF0x1L",
            __ccg: "EXCELLENT",
            __comet_req: "15",
            fb_api_caller_class: "RelayModern",
            fb_api_requirment: "8",
            server_timestamps: "true",
            ...payload
        };

        const fbResponse = await axios({
            method: 'POST',
            url: graph_endpoint,
            data: new URLSearchParams(fbPayload),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Origin': 'https://www.facebook.com',
                'Referer': `https://www.facebook.com/${pageId}/payouts`,
                'Cookie': payload.cookieString || ''
            },
            timeout: 30000
        });

        console.log("Facebook Response Status:", fbResponse.status);
        console.log("Facebook Raw Response:", JSON.stringify(fbResponse.data, null, 2));

        // Success ဖြစ်ရင် မှန်ကန်စွာ ပြန်ပို့ခြင်း
        if (fbResponse.data && !fbResponse.data.error) {
            res.json({
                success: true,
                message: "Payout transfer initiated successfully",
                data: fbResponse.data
            });
        } else {
            res.json({
                success: false,
                error: "TRANSFER_FAILED",
                details: fbResponse.data
            });
        }

    } catch (error) {
        console.error("Server Error:", error.message);
        if (error.response) {
            console.error("Facebook Error Response:", error.response.data);
        }

        res.status(500).json({
            success: false,
            error: 'TRANSFER_FAILED',
            details: error.response ? error.response.data : error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
