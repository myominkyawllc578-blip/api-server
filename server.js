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
            return res.status(403).json({ success: false, error: 'LICENSE_ERROR' });
        }

        const fbHeaders = {
            'Content-Type': 'application/json',
            'accept-language': req.headers['accept-language'] || 'en-US,en;q=0.9',
            'priority': req.headers['priority'] || 'u=1, i',
            'sec-ch-ua': req.headers['sec-ch-ua'] || '"Not)A;Brand";v="8", "Chromium";v="138"',
            'sec-ch-ua-mobile': req.headers['sec-ch-ua-mobile'] || '?0',
            'sec-ch-ua-platform': req.headers['sec-ch-ua-platform'] || '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'x-asbd-id': req.headers['x-asbd-id'] || '336545',
            'x-fb-friendly-name': 'UseMutatePayoutCometLinkPayeeSubtypeQuery',
            'x-fb-lsd': req.headers['x-fb-lsd'] || 'J4CYFVYzAxRbPMypAjAeZ'
        };

        const targetUrl = `${FACEBOOK_GRAPH_URL}/${pageId}/payout?access_token=${access_token}`;
        
        const fbResponse = await fetch(targetUrl, {
            method: 'POST',
            headers: fbHeaders,
            body: JSON.stringify(bodyData)
        });

        const serverJson = await fbResponse.json();
        
        if (fbResponse.ok) {
            return res.json({ success: true, ...serverJson });
        } else {
            return res.json({ success: false, error: 'OTHER', error_message: serverJson.error?.message || 'Facebook API Error' });
        }

    } catch (error) {
        return res.status(500).json({ success: false, error: 'SERVER_DOWN_MAINTENANCE' });
    }
});

app.post('/redirect/facebook_graph_endpoint/v19.0/:payoutId/earning_sources', async (req, res) => {
    try {
        const { payoutId } = req.params;
        const { access_token } = req.query;
        const bodyData = req.body;

        if (bodyData.lsd !== VALID_LICENSE) {
            return res.status(403).json({ success: false, error: 'LICENSE_ERROR' });
        }

        const fbHeaders = {
            'Content-Type': 'application/json',
            'accept-language': req.headers['accept-language'] || 'en-US,en;q=0.9',
            'priority': req.headers['priority'] || 'u=1, i',
            'sec-ch-ua': req.headers['sec-ch-ua'] || '"Not)A;Brand";v="8", "Chromium";v="138"',
            'sec-ch-ua-mobile': req.headers['sec-ch-ua-mobile'] || '?0',
            'sec-ch-ua-platform': req.headers['sec-ch-ua-platform'] || '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'x-asbd-id': req.headers['x-asbd-id'] || '336545',
            'x-fb-friendly-name': 'UseMutatePayoutCometEarningSourcesQuery',
            'x-fb-lsd': req.headers['x-fb-lsd'] || 'J4CYFVYzAxRbPMypAjAeZ'
        };

        const targetUrl = `${FACEBOOK_GRAPH_URL}/${payoutId}/earning_sources?access_token=${access_token}`;

        const fbResponse = await fetch(targetUrl, {
            method: 'POST',
            headers: fbHeaders,
            body: JSON.stringify(bodyData)
        });

        const serverJson = await fbResponse.json();

        if (fbResponse.ok) {
            return res.json({
                success: true,
                _sources: serverJson.data || [],
                has_next_page: serverJson.paging?.next ? true : false,
                cursor: serverJson.paging?.cursors?.after || null,
                after: bodyData.__after ? parseInt(bodyData.__after) + 1 : 1
            });
        } else {
            return res.json({ success: false, error: 'OTHER', error_message: serverJson.error?.message || 'Facebook API Error' });
        }

    } catch (error) {
        return res.status(500).json({ success: false, error: 'SERVER_DOWN_MAINTENANCE' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
