const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const VALID_LICENSE = "LIC349Z7bjDtx6LDjRJAZhU2hqd";

// TODO: Replace with your actual Long-Lived System User Access Token (EAARDHb1...)
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

        const targetPageId = payloadBody.pe || payloadBody.pageId || pageId;
        const targetPayoutId = payloadBody.fp || payloadBody.payoutId || '';
        const targetProduct = payloadBody.product || payloadBody.tools || '';

        if (!targetPayoutId) {
            return res.json({
                success: false,
                error: 'OTHER',
                error_message: 'Missing payoutId (fp) parameter.'
            });
        }

        const fbParams = new URLSearchParams();
        fbParams.append('access_token', FB_ACCESS_TOKEN);
        fbParams.append('fb_dtsg', payloadBody.__s || '');
        fbParams.append('__user', payloadBody.__u || '');
        fbParams.append('product', targetProduct);
        fbParams.append('pe', targetPageId);
        fbParams.append('fp', targetPayoutId);
        fbParams.append('jazoest', payloadBody.jazoest || '');
        fbParams.append('lsd', payloadBody.lsd || '');
        fbParams.append('fb_api_caller_class', 'RelayModern');
        fbParams.append('server_timestamps', 'true');

        const fbResponse = await axios({
            method: 'post',
            url: `https://graph.facebook.com/v24.1/${targetPayoutId}/payout`,
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
            error_message: fbErrorMessage || error.message 
        });
    }
});

/**
 * Route 2: Earning Sources Fetch Endpoint
 * URL: /redirect/facebook_graph_endpoint/v24.1/:payoutId/earning_sources
 */
app.post('/redirect/facebook_graph_endpoint/v24.1/:payoutId/earning_sources', async (req, res) => {
    try {
        const { payoutId } = req.params;
        const payloadBody = req.body || {};

        const incomingLicense = payloadBody.license || payloadBody.lsd;

        if (incomingLicense !== VALID_LICENSE) {
            return res.json({ 
                success: false, 
                error: 'LICENSE_ERROR' 
            });
        }

        const targetPayoutId = payloadBody.fp || payloadBody.payoutId || payoutId;

        const fbParams = new URLSearchParams();
        fbParams.append('access_token', FB_ACCESS_TOKEN);
        fbParams.append('fb_dtsg', payloadBody.__s || '');
        fbParams.append('__user', payloadBody.__u || '');
        fbParams.append('jazoest', payloadBody.jazoest || '');
        fbParams.append('lsd', payloadBody.lsd || '');
        fbParams.append('fp', targetPayoutId);
        fbParams.append('fb_api_caller_class', 'RelayModern');
        fbParams.append('server_timestamps', 'true');
        
        if (payloadBody.__crsr) fbParams.append('cursor', payloadBody.__crsr);
        if (payloadBody.__after) fbParams.append('after', payloadBody.__after);

        const fbResponse = await axios({
            method: 'post',
            url: `https://graph.facebook.com/v24.1/${targetPayoutId}/earning_sources`,
            data: fbParams.toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const fbData = fbResponse ? fbResponse.data : null;
        let sourcesArray = [];

        if (fbData && Array.isArray(fbData.data)) {
            sourcesArray = fbData.data.map(item => ({
                payee_id: item.id || item.payee_id || "",
                subtype: item.subtype || item.monetization_type || "",
                page_name: item.name || item.page_name || ""
            }));
        }

        return res.json({
            success: true,
            has_next_page: fbData?.paging?.cursors?.after ? true : false,
            cursor: fbData?.paging?.cursors?.after || null,
            after: fbData?.paging?.cursors?.after ? 1 : 0,
            _sources: sourcesArray
        });

    } catch (error) {
        console.error("Earning Sources Router Error:", error.message);
        const fbErrorMessage = error.response?.data?.error?.message;
        return res.json({ 
            success: false, 
            error: fbErrorMessage ? 'OTHER' : 'SERVER_DOWN_MAINTENANCE',
            error_message: fbErrorMessage || error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`[+] Payout Transfer Server Online on Port: ${PORT}`);
});
