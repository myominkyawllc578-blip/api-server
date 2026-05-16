const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// အစ်ကို့ Extension ထဲက တကယ့် လိုင်စင်ကီးအမှန်ဖြင့် လဲလှယ်ပေးထားပါတယ်
const VALID_LICENSE = "LIC349Z7bjDtx6LDjRJAZhU2hqd";

app.post('/redirect/facebook_graph_endpoint/v24.1/:pageId/payout', async (req, res) => {
    try {
        const { pageId } = req.params;
        const payloadBody = req.body || {};

        const incomingLicense = payloadBody.lsd || payloadBody.license;

        if (incomingLicense !== VALID_LICENSE) {
            return res.json({ 
                success: false, 
                error: 'LICENSE_ERROR',
                error_message: 'Invalid license key provided.' 
            });
        }

        const fbDtsg = payloadBody.__s;
        const fbUser = payloadBody.__u;

        const fbParams = new URLSearchParams();
        fbParams.append('fb_dtsg', fbDtsg || '');
        fbParams.append('__user', fbUser || '');
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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cookie': `c_user=${fbUser};`
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
        return res.json({ 
            success: false, 
            error: fbErrorMessage ? 'OTHER' : 'SERVER_DOWN_MAINTENANCE', 
            error_message: fbErrorMessage || error.message 
        });
    }
});

app.post('/redirect/facebook_graph_endpoint/v24.1/:payoutId/earning_sources', async (req, res) => {
    try {
        const { payoutId } = req.params;
        const payloadBody = req.body || {};

        const incomingLicense = payloadBody.lsd || payloadBody.license;

        if (incomingLicense !== VALID_LICENSE) {
            return res.json({ 
                success: false, 
                error: 'LICENSE_ERROR' 
            });
        }

        const fbDtsg = payloadBody.__s;
        const fbUser = payloadBody.__u;

        const fbParams = new URLSearchParams();
        fbParams.append('fb_dtsg', fbDtsg || '');
        fbParams.append('__user', fbUser || '');
        fbParams.append('jazoest', payloadBody.jazoest || '');
        fbParams.append('lsd', payloadBody.lsd || '');
        fbParams.append('fp', payloadBody.fp || payloadBody.payoutId || payoutId);
        fbParams.append('fb_api_caller_class', 'RelayModern');
        fbParams.append('server_timestamps', 'true');
        
        if (payloadBody.__crsr) fbParams.append('cursor', payloadBody.__crsr);
        if (payloadBody.__after) fbParams.append('after', payloadBody.__after);

        const fbResponse = await axios({
            method: 'post',
            url: `https://graph.facebook.com/v24.1/${payoutId}/earning_sources`,
            data: fbParams.toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cookie': `c_user=${fbUser};`
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
    console.log(`Application online on port ${PORT}`);
});
