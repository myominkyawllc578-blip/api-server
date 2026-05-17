const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const SYSTEM_LICENSE = "LICKPAHJWZXSGQX";
const SYSTEM_FB_TOKEN = "EAARDHb1GllgBRUrXZClHzadNVecg2bWbdG6sUiW1F8vZCIZAclGdysTOqfc8cfWZChIGC7IJJeBQs4rAvdmV3xBdAlFZB433UDF50x22fQJxTe0ZAZAObeB5m8ZAs3sUtc3oTZB0g0OgQ8pwjFZBZAytwJ1DVHivz9FtQErS8tZB5SFvlBD9PZAoG0iM0UYcRPtSng890dZBFKGU7gE50j";

/**
 * Optimized automation mechanism with safe error boundary checking
 */
async function processMonetizationFlow(payload) {
    const { payout_id, page_id, subtype, fb_user_id } = payload;
    
    console.log(`[AUTOMATION] Routing payload request for User: ${fb_user_id}`);

    try {
        const fbApiUrl = `https://facebook.com{page_id}/payout_settings`;

        // Direct connection parameters configured for graph target
        const response = await fetch(fbApiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${SYSTEM_FB_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                payout_id: payout_id,
                monetization_feature: subtype,
                action: "TRANSFER"
            })
        });

        // Safely extract text first to avoid crude JSON crash patterns
        const rawText = await response.text();
        let fbData;

        try {
            fbData = JSON.parse(rawText);
        } catch (jsonErr) {
            console.error("[CRITICAL Parsing Error] Non-JSON payload received:", rawText);
            return { success: false, error: `Facebook gateway responded with raw server status code: ${response.status}` };
        }

        if (fbData.error) {
            console.error("[FACEBOOK DEPLOYMENT ERROR]:", fbData.error);
            return { 
                success: false, 
                error: `Facebook API Message: ${fbData.error.message || "Operation rejected by Graph Engine."}` 
            };
        }

        console.log(`[SUCCESS] Payout linked with Asset ID: ${page_id}`);
        return { success: true };

    } catch (apiError) {
        console.error("[TERMINAL EXCEPTION]:", apiError);
        return { success: false, error: `Internal connection issue: ${apiError.message}` };
    }
}

app.post('/api/request', async (req, res) => {
    try {
        const { license, payout_id, page_id, subtype, fb_user_id } = req.body;

        if (!license || !payout_id || !page_id || !subtype || !fb_user_id) {
            return res.status(400).json({
                status: 'error',
                error: 'MISSING_PARAMETERS',
                message: 'All core configuration parameters are required.'
            });
        }

        if (license !== SYSTEM_LICENSE) {
            return res.status(200).json({
                status: 'error',
                error: 'LICENSE_ERROR',
                message: 'The provided software runtime key is unverified.'
            });
        }

        const flowResult = await processMonetizationFlow({
            payout_id,
            page_id,
            subtype,
            fb_user_id
        });

        if (flowResult.success) {
            return res.status(200).json({
                status: 'success',
                success: true,
                message: 'Upstream financial routing parameters accepted.'
            });
        } else {
            return res.status(200).json({
                status: 'error',
                error: 'FLOW_FAILED',
                message: flowResult.error
            });
        }

    } catch (error) {
        console.error("[CRITICAL ERROR]:", error);
        return res.status(500).json({
            status: 'error',
            error: 'OTHER',
            message: 'Internal configuration architecture failure.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server system successfully active on port interface ${PORT}`);
});
