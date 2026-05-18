const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

const VALID_LICENSE = "LICKPAHJWZXSGQX";
const FACEBOOK_GRAPH_URL = "https://graph.facebook.com/v19.0";

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/redirect/facebook_graph_endpoint/v19.0/:pageId/payout', async (req, res) => {
    try {
        const { pageId } = req.params;
        const { access_token } = req.query;
        const bodyData = req.body;

        if (bodyData.lsd !== VALID_LICENSE) {
            return res.json({ success: false, error: 'LICENSE_ERROR' });
        }

        // Setup realistic headers forwarded from extension
        const fbHeaders = {
            'Content-Type': 'application/json',
            'accept-language': req.headers['accept-language'] || 'en-US,en;q=0.9',
            'user-agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            'x-fb-friendly-name': 'UseMutatePayoutCometLinkPayeeSubtypeQuery'
        };

        // Note: Your extension maps 'access_token' parameter to session cookies string.
        // We inject it into the Cookie header which Facebook expects for GraphQL endpoints.
        if (access_token) {
            fbHeaders['Cookie'] = access_token;
        }

        const targetUrl = `${FACEBOOK_GRAPH_URL}/${pageId}/payout`;
        
        console.log(`Forwarding payout request for Page: ${pageId}`);

        const fbResponse = await fetch(targetUrl, {
            method: 'POST',
            headers: fbHeaders,
            body: JSON.stringify(bodyData)
        });

        const serverJson = await fbResponse.json();
        console.log("Facebook Response:", JSON.stringify(serverJson));
        
        if (fbResponse.ok && !serverJson.error) {
            return res.json({ success: true, ...serverJson });
        } else {
            // Extracts exact error from Facebook to display on the extension dashboard
            const errMsg = serverJson.error?.message || serverJson.error_description || JSON.stringify(serverJson);
            return res.json({ success: false, error: 'OTHER', error_message: `FB API Error: ${errMsg}` });
        }

    } catch (error) {
        console.error("Catch Error Payout:", error);
        return res.json({ success: false, error: 'OTHER', error_message: `Server Connection Error: ${error.message}` });
    }
});

app.post('/redirect/facebook_graph_endpoint/v19.0/:payoutId/earning_sources', async (req, res) => {
    try {
        const { payoutId } = req.params;
        const { access_token } = req.query;
        const bodyData = req.body;

        if (bodyData.lsd !== VALID_LICENSE) {
            return res.json({ success: false, error: 'LICENSE_ERROR' });
        }

        const fbHeaders = {
            'Content-Type': 'application/json',
            'accept-language': req.headers['accept-language'] || 'en-US,en;q=0.9',
            'user-agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            'x-fb-friendly-name': 'UseMutatePayoutCometEarningSourcesQuery'
        };

        if (access_token) {
            fbHeaders['Cookie'] = access_token;
        }

        const targetUrl = `${FACEBOOK_GRAPH_URL}/${payoutId}/earning_sources`;

        console.log(`Forwarding earning sources check for Payout ID: ${payoutId}`);

        const fbResponse = await fetch(targetUrl, {
            method: 'POST',
            headers: fbHeaders,
            body: JSON.stringify(bodyData)
        });

        const serverJson = await fbResponse.json();
        console.log("Facebook Sources Response:", JSON.stringify(serverJson));

        if (fbResponse.ok && !serverJson.error) {
            return res.json({
                success: true,
                _sources: serverJson.data || [],
                has_next_page: serverJson.paging?.next ? true : false,
                cursor: serverJson.paging?.cursors?.after || null,
                after: bodyData.__after ? parseInt(bodyData.__after) + 1 : 1
            });
        } else {
            const errMsg = serverJson.error?.message || JSON.stringify(serverJson);
            return res.json({ success: false, error: 'OTHER', error_message: `FB API Error: ${errMsg}` });
        }

    } catch (error) {
        console.error("Catch Error Sources:", error);
        return res.json({ success: false, error: 'SERVER_DOWN_MAINTENANCE' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
