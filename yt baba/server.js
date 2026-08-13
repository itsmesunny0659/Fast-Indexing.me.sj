const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// In-Memory Database for demonstration
const mockWhitelistedChannels = new Set(['channel-partner-delegate-1']);
const mockActiveClaims = [
    { id: 'claim-101', assetId: 'music-sony-203', videoId: 'user-vid-777', status: 'ACTIVE', policy: 'MONETIZE', matchPercentage: 94 },
    { id: 'claim-102', assetId: 'movie-warner-501', videoId: 'user-vid-888', status: 'ACTIVE', policy: 'BLOCK', matchPercentage: 98 }
];
const mockOverrideRegistry = [];

// Custom Licenses Database
const mockLicenses = [
    { id: 'lic-901', assetId: 'music-sony-203', licensedChannelId: 'JohnDoeChannel', expiresAt: '2028-12-31' }
];

// MCN & Cross-Ownership Agreements Database
const mockMcnAgreements = [
    { mcnId: 'mcn-media-group', channels: ['VlogStarChannel', 'CreatorBuddyChannel'], partners: ['sony-music-corp'] }
];

// Partner API Keys & Delegations
const partnerApiKeys = new Map([
    ['partner-api-key-xyz', { partnerName: 'SonyMusicPartner', delegatedRights: ['whitelist', 'release_claim'] }]
]);

// Signal Robustness and Verification Standards
const verificationStandards = {
    minMatchPercentage: 80, // Claims under 80% similarity are marked as INSUFFICIENT_ROBUSTNESS
    minMatchDurationSec: 5
};

// Mock database representing videos uploaded by platform users
let mockUploadedVideos = [
    { id: 'user-vid-777', title: 'My Awesome Cover Song', uploader: 'JohnDoe', channelId: 'JohnDoeChannel', status: 'ACTIVE', fingerprint: 'a3f9b2d8e4c71025' },
    { id: 'user-vid-888', title: 'Warner Bros Movie Clips HD', uploader: 'MovieFan99', channelId: 'MovieFanChannel', status: 'ACTIVE', fingerprint: 'f8e7c6b5a4938271' },
    { id: 'user-vid-999', title: 'Vlog Day 5 - Walking in City', uploader: 'VlogStar', channelId: 'VlogStarChannel', status: 'ACTIVE', fingerprint: '1234567890abcdef' }
];

// 1. API to trigger fingerprint extraction via Python AI Engine
app.post('/api/fingerprint', (req, res) => {
    console.log('[YTBaba-API] Initiating audio/video matching pipeline...');
    
    // Execute our Python feature extraction engine
    exec('python fingerprint.py', (error, stdout, stderr) => {
        if (error) {
            console.error(`[Error] ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
        
        res.json({
            message: "Matching analysis complete.",
            engine_output: stdout.trim().split('\n')
        });
    });
});

// 1.5 API to run advanced signal processing and adversarial alterations
app.post('/api/alter-media', (req, res) => {
    console.log('[YTBaba-API] Initiating advanced media alteration DSP simulations (FGSM, Masking, DTW, Decimation/Interpolation)...');
    
    exec('python alter_media.py --api', (error, stdout, stderr) => {
        if (error) {
            console.error(`[Error] ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
        
        try {
            const result = JSON.parse(stdout.trim());
            res.json(result);
        } catch (e) {
            res.json({
                message: "Raw output from engine received.",
                engine_output: stdout.trim().split('\n')
            });
        }
    });
});

// 2. INTERNAL ADMIN TOOL: Whitelist Channel API
app.post('/api/admin/whitelist', (req, res) => {
    const { channelId, metadataProof } = req.body;
    if (!channelId) return res.status(400).json({ error: 'Channel ID is required' });

    // Partner API Key Delegation check (Bypassed for Handshaking Mode)
    const partnerKey = req.headers['x-partner-api-key'];
    console.log(`[YTBaba-PartnerDelegation] Channel whitelisted. Handshaking mode active (Restriction Bypassed).`);

    mockWhitelistedChannels.add(channelId);
    console.log(`[YTBaba-Admin] Whitelisted channel ID: ${channelId} with proof: ${JSON.stringify(metadataProof || 'none')}`);
    res.json({ 
        message: `Channel ${channelId} successfully whitelisted. All matching claims bypassed.`,
        channelId,
        whitelistedByPartner: !!partnerKey,
        metadataProof: metadataProof || null
    });
});

// 2.1 API: Check Whitelist Status
app.get('/api/admin/whitelist-status/:channelId', (req, res) => {
    const { channelId } = req.params;
    
    // 1. Direct Whitelist
    if (mockWhitelistedChannels.has(channelId)) {
        return res.json({ channelId, isWhitelisted: true, type: 'DIRECT' });
    }
    
    // 2. Check MCN membership/cross-ownership
    const mcn = mockMcnAgreements.find(agreement => agreement.channels.includes(channelId));
    if (mcn) {
        return res.json({ 
            channelId, 
            isWhitelisted: true, 
            type: 'MCN_CROSS_OWNERSHIP', 
            mcnId: mcn.mcnId,
            partners: mcn.partners
        });
    }
    
    // 3. Check active custom licenses
    const license = mockLicenses.find(lic => lic.licensedChannelId === channelId && new Date(lic.expiresAt) > new Date());
    if (license) {
        return res.json({ 
            channelId, 
            isWhitelisted: true, 
            type: 'LICENSED', 
            licenseId: license.id, 
            expiresAt: license.expiresAt 
        });
    }
    
    res.json({ channelId, isWhitelisted: false, type: 'NONE' });
});

// 2.2 API: Register Custom License
app.post('/api/admin/licenses', (req, res) => {
    const { id, assetId, licensedChannelId, expiresAt, signatureProof } = req.body;
    if (!id || !assetId || !licensedChannelId || !expiresAt) {
        return res.status(400).json({ error: 'Missing required license fields: id, assetId, licensedChannelId, expiresAt' });
    }
    
    const newLicense = { id, assetId, licensedChannelId, expiresAt, signatureProof };
    mockLicenses.push(newLicense);
    console.log(`[YTBaba-License] Registered custom license: ${id} for channel: ${licensedChannelId}`);
    res.status(201).json({ message: 'Custom license registered successfully', license: newLicense });
});

// 2.3 API: Register MCN Cross-Ownership Agreement
app.post('/api/admin/mcn-agreement', (req, res) => {
    const { mcnId, channels, partners } = req.body;
    if (!mcnId || !channels || !partners) {
        return res.status(400).json({ error: 'Missing required MCN fields: mcnId, channels, partners' });
    }
    
    const newAgreement = { mcnId, channels, partners };
    mockMcnAgreements.push(newAgreement);
    console.log(`[YTBaba-MCN] Registered cross-ownership agreement for MCN: ${mcnId}`);
    res.status(201).json({ message: 'MCN cross-ownership agreement registered successfully', agreement: newAgreement });
});

// 2.4 API: Verify Metadata Proof
app.post('/api/admin/verify-metadata-proof', (req, res) => {
    const { isrc, upc, digitalSignature } = req.body;
    if (!isrc && !upc && !digitalSignature) {
        return res.status(400).json({ error: 'At least one proof metadata is required: isrc, upc, digitalSignature' });
    }
    
    // Simulating validation rules
    const isValidISRC = isrc ? /^[A-Z]{2}-[A-Z0-9]{3}-\d{2}-\d{5}$/.test(isrc) : true;
    const isValidSignature = digitalSignature ? digitalSignature.length > 20 : true;
    
    if (!isValidISRC || !isValidSignature) {
        return res.status(422).json({ 
            status: 'REJECTED', 
            reason: 'Invalid metadata format or signature verification failed' 
        });
    }
    
    res.json({ 
        status: 'VERIFIED', 
        proofDetails: { isrc: isrc || null, upc: upc || null, digitalSignature: !!digitalSignature } 
    });
});

// 3. INTERNAL ADMIN TOOL: Override and Release Claims
app.post('/api/admin/override-claim', (req, res) => {
    const { claimId, reason } = req.body;
    const claim = mockActiveClaims.find(c => c.id === claimId);
    
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    
    claim.status = 'RELEASED_BY_ADMIN';
    claim.overrideReason = reason;
    
    console.log(`[YTBaba-Admin] Claim ${claimId} has been manually released by Admin. Reason: ${reason}`);
    res.json({ message: `Claim ${claimId} successfully overridden and released.`, claim });
});

// 3.5 API: Register manual claim override under verification standards
app.post('/api/admin/override-registry', (req, res) => {
    const { claimId, overrideReason, metadataProof, verifierSignature } = req.body;
    if (!claimId || !overrideReason || !verifierSignature) {
        return res.status(400).json({ error: 'Missing override parameters: claimId, overrideReason, verifierSignature' });
    }

    const claim = mockActiveClaims.find(c => c.id === claimId);
    if (!claim) return res.status(404).json({ error: 'Claim target not found' });

    // Update claim state in DB
    claim.status = 'OVERRIDDEN';
    claim.overrideReason = overrideReason;
    claim.verifierSignature = verifierSignature;
    claim.metadataProof = metadataProof || null;

    mockOverrideRegistry.push({
        claimId,
        overrideReason,
        metadataProof,
        verifierSignature,
        timestamp: new Date().toISOString()
    });

    console.log(`[YTBaba-Registry] Claim ${claimId} successfully registered in Override Registry by ${verifierSignature}`);
    res.json({ message: 'Claim manual override registered successfully', claim });
});

// 4. INTERNAL ADMIN TOOL: Match Reference Video against Platform Uploads
app.post('/api/admin/match-and-take-down', (req, res) => {
    const { originalFingerprint, originalOwnerChannelId, assetId } = req.body;
    if (!originalFingerprint) {
        return res.status(400).json({ error: 'Original video fingerprint is required' });
    }

    console.log(`[YTBaba-Admin] Scanning database for reference fingerprint: ${originalFingerprint}`);
    
    // Scan uploaded videos for matching fingerprints
    const scans = mockUploadedVideos.map(vid => {
        // Simple mock matching metric: similarity calculation based on string overlap
        let overlap = 0;
        const len = Math.min(originalFingerprint.length, vid.fingerprint.length);
        for (let i = 0; i < len; i++) {
            if (originalFingerprint[i] === vid.fingerprint[i]) overlap++;
        }
        const matchPercentage = Math.floor((overlap / len) * 100);
        
        // 1. Signal Robustness Verification Standard check
        const meetsRobustness = matchPercentage >= verificationStandards.minMatchPercentage;
        
        // 2. Check Whitelist, MCN, and Licenses for the uploader channel
        let whitelistStatus = { isWhitelisted: false, reason: 'NONE' };
        
        // Direct Whitelist
        if (mockWhitelistedChannels.has(vid.channelId)) {
            whitelistStatus = { isWhitelisted: true, reason: 'DIRECT_WHITELIST' };
        }
        
        // MCN / Cross-ownership Agreements check
        if (!whitelistStatus.isWhitelisted && originalOwnerChannelId) {
            const mcnAgreement = mockMcnAgreements.find(agreement => 
                agreement.channels.includes(vid.channelId) && 
                (agreement.channels.includes(originalOwnerChannelId) || agreement.partners.includes(originalOwnerChannelId))
            );
            if (mcnAgreement) {
                whitelistStatus = { isWhitelisted: true, reason: `MCN_CROSS_OWNERSHIP (${mcnAgreement.mcnId})` };
            }
        }
        
        // Custom License check
        if (!whitelistStatus.isWhitelisted && assetId) {
            const activeLicense = mockLicenses.find(lic => 
                lic.licensedChannelId === vid.channelId && 
                lic.assetId === assetId && 
                new Date(lic.expiresAt) > new Date()
            );
            if (activeLicense) {
                whitelistStatus = { isWhitelisted: true, reason: `VALID_CUSTOM_LICENSE (${activeLicense.id})` };
            }
        }
        
        let resolution = 'PENDING_CLAIM';
        if (!meetsRobustness) {
            resolution = 'Bypassed: INSUFFICIENT_ROBUSTNESS';
        } else if (whitelistStatus.isWhitelisted) {
            resolution = `Bypassed: UPLOADER_WHITELISTED_VIA_${whitelistStatus.reason}`;
        }
        
        return { 
            ...vid, 
            matchPercentage, 
            meetsRobustness, 
            whitelistStatus, 
            resolution 
        };
    });

    // Return matches above a baseline search threshold (e.g. 50%) to demonstrate verification details
    const matches = scans.filter(m => m.matchPercentage > 50);

    res.json({ matches });
});

// 5. INTERNAL ADMIN TOOL: Remove / Delete Video from Platform
app.delete('/api/admin/delete-video/:id', (req, res) => {
    const videoId = req.params.id;
    const initialLength = mockUploadedVideos.length;
    mockUploadedVideos = mockUploadedVideos.filter(v => v.id !== videoId);

    if (mockUploadedVideos.length < initialLength) {
        console.log(`[YTBaba-Admin] 🚨 Video ${videoId} has been forcefully removed/deleted due to copyright violation.`);
        return res.json({ message: `Video ${videoId} has been removed successfully.` });
    }
    
    res.status(404).json({ error: 'Video not found' });
});

// Get current state
app.get('/api/admin/status', (req, res) => {
    res.json({
        activeClaimsCount: mockActiveClaims.filter(c => c.status === 'ACTIVE').length,
        whitelistedCount: mockWhitelistedChannels.size,
        claims: mockActiveClaims,
        whitelist: Array.from(mockWhitelistedChannels),
        uploadedVideos: mockUploadedVideos
    });
});

app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`🚀 YT Baba Copyright System API Server active on port: ${PORT}`);
    console.log(`👉 Ingestion and Extraction endpoint: http://localhost:${PORT}/api/fingerprint`);
    console.log(`👉 Master Admin Whitelist endpoint: http://localhost:${PORT}/api/admin/whitelist`);
    console.log(`👉 Matching & Takedown endpoint: http://localhost:${PORT}/api/admin/match-and-take-down`);
    console.log(`================================================================`);
});
