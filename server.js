const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const VALID_LICENSE = "LICKPAHJWZXSGQX";

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/redirect/facebook_graph_endpoint/:version/:pageId/payout', async (req, res) => {
    try {
        const { pageId } = req.params;
        const { access_token } = req.query; 
        const bodyData = req.body;

        if (bodyData.lsd !== VALID_LICENSE) {
            return res.json({ success: false, error: 'LICENSE_ERROR' });
        }

        const targetUrl = 'https://www.facebook.com/api/graphql/';

        const fbHeaders = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Origin': 'https://www.facebook.com',
            'Referer': 'https://www.facebook.com/'
        };

        if (access_token) {
            fbHeaders['Cookie'] = access_token;
        }

        const formData = new URLSearchParams();
        for (const key in bodyData) {
            formData.append(key, bodyData[key]);
        }

        console.log(`Forwarding Payout for Page: ${pageId}`);

        const fbResponse = await fetch(targetUrl, {
            method: 'POST',
            headers: fbHeaders,
            body: formData.toString()
        });

        const serverText = await fbResponse.text();
        
        let serverJson;
        try {
            serverJson = JSON.parse(serverText);
        } catch (e) {
            return res.json({ success: false, error: 'SESSION_EXPIRED_REFRESH_PAGE', error_message: "FB Blocked. Please Log out and Log in back to Facebook Facebook Tab." });
        }

        if (fbResponse.ok && !serverJson.errors) {
            return res.json({ success: true, ...serverJson });
        } else {
            const errMsg = serverJson.errors?.[0]?.message || "GraphQL Execution Failed";
            return res.json({ success: false, error: 'OTHER', error_message: `FB Error: ${errMsg}` });
        }

    } catch (error) {
        return res.json({ success: false, error: 'OTHER', error_message: error.message });
    }
});

app.post('/redirect/facebook_graph_endpoint/:version/:payoutId/earning_sources', async (req, res) => {
    try {
        const { payoutId } = req.params;
        const { access_token } = req.query;
        const bodyData = req.body;

        if (bodyData.lsd !== VALID_LICENSE) {
            return res.json({ success: false, error: 'LICENSE_ERROR' });
        }

        const targetUrl = 'https://www.facebook.com/api/graphql/';

        const fbHeaders = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Origin': 'https://www.facebook.com',
            'Referer': 'https://www.facebook.com/'
        };

        if (access_token) {
            fbHeaders['Cookie'] = access_token;
        }

        const formData = new URLSearchParams();
        for (const key in bodyData) {
            formData.append(key, bodyData[key]);
        }

        console.log(`Forwarding Sources Check for Payout: ${payoutId}`);

        const fbResponse = await fetch(targetUrl, {
            method: 'POST',
            headers: fbHeaders,
            body: formData.toString()
        });

        const serverText = await fbResponse.text();
        
        let serverJson;
        try {
            serverJson = JSON.parse(serverText);
        } catch (e) {
            return res.json({ success: false, error: 'SESSION_EXPIRED_REFRESH_PAGE' });
        }

        if (fbResponse.ok && !serverJson.errors) {
            return res.json({
                success: true,
                _sources: serverJson.data || [],
                has_next_page: false,
                cursor: null,
                after: 1
            });
        } else {
            return res.json({ success: false, error: 'OTHER', error_message: "Sources Sync Failed" });
        }

    } catch (error) {
        return res.json({ success: false, error: 'SERVER_DOWN_MAINTENANCE' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
