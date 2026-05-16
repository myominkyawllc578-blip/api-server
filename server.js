const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const VALID_LICENSE = "LIC349Z7bjDtx6LDjRJAZhU2hqd";

// TODO: Replace with your actual 60-day or lifetime System User Access Token from Facebook
const FB_ACCESS_TOKEN = "YOUR_FACEBOOK_ACCESS_TOKEN_HERE";

/**
 * Route 1: Payout Transfer Endpoint
 * URL: /redirect/facebook_graph_endpoint/v24.1/:pageId/payout
 */
app.post('/redirect/facebook_graph_endpoint/v24.1/:pageId/payout', async (req, res) => {
    try {
        const { pageId } = req.params;
        const payloadBody = req.body || {};

        const incomingLicense = payloadBody.license || payloadBody.lsd;

        if (incomingLicense !== VALID_LICENSE) {
            return res.json({ 
                success: false, 
                error: 'LICENSE_ERROR',
                error_message: 'Invalid license key provided.' 
            });
        }

        const fbParams = new URLSearchParams();
        fbParams.append('access_token', FB_ACCESS_TOKEN);
        fbParams.append('fb_dtsg', payloadBody.__s || '');
        fbParams.append('__user', payloadBody.__u || '');
        fbParams.append('product', payloadBody.product || payloadBody.tools || '');
        fbParams.append('pe', payloadBody.pe || payloadBody.pageId || pageId);
        fbParams.append('fp', payloadBody.fp || payloadBody.payoutId || '');
        fbParams.append('jazoest', payloadBody.jazoest || '');
        fbParams.append('lsd', payloadBody.lsd || '');
        fbParams.append('fb_api_caller_class', 'RelayModern');
        fbParams.append('server_timestamps', 'true');

        const fbResponse = await axios({
            method: 'post',
            url: `https://graph.facebook.com/v24.1/${pageId}/payout`,
            data: fbParams.toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (fbResponse && fbResponse.data && !fbResponse.data.error) {
            return res.json({
                success: true,
                status: 'Pending',
                fb_data: fbResponse.data
            });
        } else {
            return res.json({
                success: false,
                error: 'OTHER',
                error_message: fbResponse?.data?.error?.message || 'Facebook API Error'
            });
        }

    } catch (error) {
        console.error("Payout Router Error:", error.message);
        const fbErrorMessage = error.response?.data?.error?.message;
        
        if (fbErrorMessage && (fbErrorMessage.includes('session') || fbErrorMessage.includes('checkpoint'))) {
            return res.json({
                success: false,
                error: 'SESSION_EXPIRED_REFRESH_PAGE'
            });
        }

        return res.json({ 
            success: false, 
            error: fbErrorMessage ? 'OTHER' : 'SERVER_DOWN_MAINTENANCE',
