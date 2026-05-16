const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS securely to allow incoming traffic from Chrome Extensions
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Built-in body parser for handling incoming raw JSON structural transfers
app.use(express.json());

// Public GET indicator to confirm online state (Prevents 404 on deployment checks)
app.get('/', (req, res) => {
    res.status(200).json({ 
        status: "active", 
        message: "API Node server is running securely." 
    });
});

// Main POST processing engine mapping to your extension's request flow
app.post('/api/request', (req, res) => {
    try {
        const { license, payout_id, page_id, subtype, fb_user_id } = req.body;

        // Backend structural validation engine
        if (!license || !payout_id || !page_id || !subtype || !fb_user_id) {
            return res.status(400).json({
                success: false,
                error: "INVALID_PARAMETERS",
                message: "Missing mandatory fields inside request body payload."
            });
        }

        // License Authentication Block
        const VALID_LICENSE = "LICKPAHJWZXSGQX";
        if (license !== VALID_LICENSE) {
            return res.status(200).json({
                success: false,
                error: "LICENSE_ERROR",
                message: "Provided tool activation license is invalid or expired."
            });
        }

        // Log transaction meta maps for tracking operational sequences
        console.log(`[TASK RECEIVED] User: ${fb_user_id} | Page: ${page_id} | Payout: ${payout_id} | Tool Type: ${subtype}`);

        // --- Core Application Execution Space ---
        // Your analytics tasks, payload processing, or database tasks go here.
        // ----------------------------------------

        // Return affirmative response pattern matches matching client script expectations
        return res.status(200).json({
            success: true,
            status: "success",
            message: "Monetization command queued successfully."
        });

    } catch (error) {
        console.error("Critical server internal loop failure:", error);
        return res.status(500).json({
            success: false,
            error: "OTHER",
            error_message: "Internal server runtime processing disruption."
        });
    }
});

// Start listening safely across targeted deployment structures
app.listen(PORT, () => {
    console.log(`Server executing structurally operational loops on port ${PORT}`);
});

