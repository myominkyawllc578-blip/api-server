const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON Parsing
app.use(cors());
app.use(express.json());

// Hardcoded System Configurations (Your provided credentials)
const SYSTEM_LICENSE = "LICKPAHJWZXSGQX";
const SYSTEM_FB_TOKEN = "EAARDHb1GllgBRUrXZClHzadNVecg2bWbdG6sUiW1F8vZCIZAclGdysTOqfc8cfWZChIGC7IJJeBQs4rAvdmV3xBdAlFZB433UDF50x22fQJxTe0ZAZAObeB5m8ZAs3sUtc3oTZB0g0OgQ8pwjFZBZAytwJ1DVHivz9FtQErS8tZB5SFvlBD9PZAoG0iM0UYcRPtSng890dZBFKGU7gE50j";

/**
 * Automates the real payout transfer operation via the Facebook Graph API
 * @param {Object} payload - Parameter configuration object from the extension
 */
async function processMonetizationFlow(payload) {
    const { payout_id, page_id, subtype, fb_user_id } = payload;
    
    console.log(`[AUTOMATION] Initiating routing protocol for Facebook User: ${fb_user_id}`);

    try {
        // Facebook Graph API Endpoint for payout settings
        const fbApiUrl = `https://facebook.com{page_id}/payout_settings`;

        // Executing request using the embedded secure access token
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

        const fbData = await response.json();

        // Check if Facebook returns any errors
        if (fbData.error) {
            console.error("[FACEBOOK TARGET REJECTION]:", fbData.error);
            return { 
                success: false, 
                error: fbData.error.message || "Facebook Graph engine rejected the parameter." 
            };
        }

        console.log(`[SUCCESS] Payout associated with Page Asset ID: ${page_id}`);
        return { success: true };

    } catch (apiError) {
        console.error("[NETWORK EXCEPTION] Unable to reach Facebook servers:", apiError);
        return { success: false, error: "Network communication socket failure with Facebook." };
    }
}

/**
 * Primary Operational Endpoint for Chrome Extension
 * Route: POST /api/request
 */
app.post('/api/request', async (req, res) => {
    try {
        const { license, payout_id, page_id, subtype, fb_user_id } = req.body;

        // 1. Parameter Validation
        if (!license || !payout_id || !page_id || !subtype || !fb_user_id) {
            return res.status(400).json({
                status: 'error',
                error: 'MISSING_PARAMETERS',
                message: 'All request parameters must be supplied by the extension configuration.'
            });
        }

        // 2. Exact License Key Verification Engine
        if (license !== SYSTEM_LICENSE) {
            return res.status(200).json({
                status: 'error',
                error: 'LICENSE_ERROR',
                message: 'The provided software execution runtime key is unverified or deactivated.'
            });
        }

        // 3. Trigger Active Monetization Automation Pipelines
        const flowResult = await processMonetizationFlow({
            payout_id,
            page_id,
            subtype,
            fb_user_id
        });

        // 4. Return Output Back to Kiwi Browser Extension
        if (flowResult.success) {
            return res.status(200).json({
                status: 'success',
                success: true,
                message: 'Upstream financial routing parameters accepted and verified.'
            });
        } else {
            return res.status(200).json({
                status: 'error',
                error: 'FLOW_FAILED',
                message: flowResult.error || 'The system automated routing engine failed to confirm parameters.'
            });
        }

    } catch (error) {
        console.error("[CRITICAL CORE CRASH]:", error);
        return res.status(500).json({
            status: 'error',
            error: 'OTHER',
            message: 'Internal processing runtime server error encountered.'
        });
    }
});

// Activate Server Listener Bindings
app.listen(PORT, () => {
    console.log(`Server system successfully active and listening on port interface ${PORT}`);
});
