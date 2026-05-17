const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Hardcoded system validation parameters matching dashboard.js
const VALID_LICENSE = "LICKPAHJWZXSGQX";

// Provide your System User Access Token or Long-Lived User Access Token here
const FB_ACCESS_TOKEN = "YOUR_FACEBOOK_ACCESS_TOKEN"; 

app.use(cors());
app.use(express.json());

// Target route matching exactly ${baseUrl}/api/request from background.js
app.post('/api/request', async (req, res) => {
    try {
        const { license, payoutId, pageId, tools, fb_user_id } = req.body;

        console.log("Processing Payload Incoming Parameters:", req.body);

        // 1. License Key Guard Check
        if (!license || license !== VALID_LICENSE) {
            return res.status(200).json({
                success: false,
                error: "LICENSE_ERROR"
            });
        }

        // 2. Validate payload parameters existence
        if (!payoutId || !pageId || !tools) {
            return res.status(200).json({
                success: false,
                error: "OTHER",
                message: "Missing key required payload parameters."
            });
        }

        // 3. Construct URL encoded payload for Facebook API endpoint interaction
        const fbParams = new URLSearchParams();
        fbParams.append('access_token', FB_ACCESS_TOKEN);
        fbParams.append('payout_id', payoutId);
        fbParams.append('page_id', pageId);
        fbParams.append('subtype', tools);
        if (fb_user_id) {
            fbParams.append('fb_user_id', fb_user_id);
        }

        // 4. Forward execution to official Graph API Endpoint v19.0
        const fbGraphResponse = await axios({
            method: 'POST',
            url: `https://graph.facebook.com/v19.0/${payoutId}/monetization_platform_payouts`,
            data: fbParams,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 12000
        });

        // 5. Evaluate Facebook Graph Node response payload state 
        if (fbGraphResponse.data && !fbGraphResponse.data.error) {
            return res.status(200).json({
                status: 'success',
                success: true,
                fb_data: fbGraphResponse.data
            });
        } else {
            return res.status(200).json({
                success: false,
                error: "OTHER",
                message: fbGraphResponse.data?.error?.message || "Facebook verification rejection execution."
            });
        }

    } catch (error) {
        console.error("Internal Server Exception Caught:", error.message);

        // Session expiration verification checkpoint
        if (error.response && error.response.data && error.response.data.error) {
            const fbErrorMessage = error.response.data.error.message || "";
            if (fbErrorMessage.includes("session") || fbErrorMessage.includes("checkpoint") || fbErrorMessage.includes("login")) {
                return res.status(200).json({
                    success: false,
                    error: "SESSION_EXPIRED_REFRESH_PAGE"
                });
            }
        }

        // Simulating 502/503 service fallback matching error capture structure
        if (error.response && (error.response.status === 502 || error.response.status === 503)) {
            return res.status(error.response.status).end();
        }

        return res.status(200).json({
            success: false,
            error: "OTHER",
            message: error.response?.data?.error?.message || error.message || "Network execution exception error
