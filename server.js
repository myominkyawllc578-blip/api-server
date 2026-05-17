const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const VALID_LICENSE = "LICKPAHJWZXSGQX";
const FB_ACCESS_TOKEN = "YOUR_FACEBOOK_ACCESS_TOKEN"; // ဤနေရာတွင် သင့် Token ထည့်ပါ

app.use(cors());
app.use(express.json());

// လမ်းကြောင်းသည် တိတိကျကျ /api/request ဖြစ်ရပါမည်
app.post('/api/request', async (req, res) => {
    try {
        const { license, payoutId, pageId, tools, fb_user_id } = req.body;

        if (!license || license !== VALID_LICENSE) {
            return res.status(200).json({ success: false, error: "LICENSE_ERROR" });
        }

        if (!payoutId || !pageId || !tools) {
            return res.status(200).json({ 
                success: false, 
                error: "OTHER", 
                message: "Missing required payload parameters." 
            });
        }

        const fbParams = new URLSearchParams();
        fbParams.append('access_token', FB_ACCESS_TOKEN);
        fbParams.append('payout_id', payoutId);
        fbParams.append('page_id', pageId);
        fbParams.append('subtype', tools);
        if (fb_user_id) fbParams.append('fb_user_id', fb_user_id);

        const fbGraphResponse = await axios({
            method: 'POST',
            url: `https://graph.facebook.com/v19.0/${payoutId}/monetization_platform_payouts`,
            data: fbParams,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0'
            },
            timeout: 12000
        });

        if (fbGraphResponse.data && !fbGraphResponse.data.error) {
            return res.status(200).json({ status: 'success', success: true });
        } else {
            return res.status(200).json({
                success: false,
                error: "OTHER",
                message: fbGraphResponse.data?.error?.message || "Facebook API error."
            });
        }
    } catch (error) {
        console.error("Execution Error:", error.message);
        
        if (error.response && (error.response.status === 502 || error.response.status === 503)) {
            return res.status(error.response.status).end();
        }

        return res.status(200).json({
            success: false,
            error: "OTHER",
            message: error.response?.data?.error?.message || error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening actively on port: ${PORT}`);
});
