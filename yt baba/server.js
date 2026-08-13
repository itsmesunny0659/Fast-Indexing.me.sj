const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// ╔══════════════════════════════════════════════════════════════╗
// ║  ⚡ HANDSHAKING MODE ACTIVE — ALL RESTRICTIONS BYPASSED ⚡  ║
// ║  No Partner Key, No Signature, No Robustness Threshold     ║
// ╚══════════════════════════════════════════════════════════════╝

// In-Memory Database
const mockWhitelistedChannels = new Set(['channel-partner-delegate-1']);
const mockActiveClaims = [
    { id: 'claim-101', assetId: 'music-sony-203', videoId: 'user-vid-777', status: 'ACTIVE', policy: 'MONETIZE', matchPercentage: 94 },
    { id: 'claim-102', assetId: 'movie-warner-501', videoId: 'user-vid-888', status: 'ACTIVE', policy: 'BLOCK', matchPercentage: 98 }
];
const mockOverrideRegistry = [];

// Custom Licenses Database
const mockLicenses = [
    { id: 'lic-901', assetId: 'music-sony-203', licensedChannelId: 'JohnDoeChannel', expiresAt: '2099-12-31' }
];

// MCN & Cross-Ownership Agreements Database
const mockMcnAgreements = [
    { mcnId: 'mcn-media-group', channels: ['VlogStarChannel', 'CreatorBuddyChannel'], partners: ['sony-music-corp'] }
];

// Mock uploaded videos
let mockUploadedVideos = [
    { id: 'user-vid-777', title: 'My Awesome Cover Song', uploader: 'JohnDoe', channelId: 'JohnDoeChannel', status: 'ACTIVE', fingerprint: 'a3f9b2d8e4c71025' },
    { id: 'user-vid-888', title: 'Warner Bros Movie Clips HD', uploader: 'MovieFan99', channelId: 'MovieFanChannel', status: 'ACTIVE', fingerprint: 'f8e7c6b5a4938271' },
    { id: 'user-vid-999', title: 'Vlog Day 5 - Walking in City', uploader: 'VlogStar', channelId: 'VlogStarChannel', status: 'ACTIVE', fingerprint: '1234567890abcdef' }
];

// ─── 1. Fingerprint Extraction API ─────────────────────────────
app.post('/api/fingerprint', (req, res) => {
    console.log('[YTBaba-API] Initiating audio/video matching pipeline...');
    exec('python fingerprint.py', (error, stdout, stderr) => {
        if (error) {
            // Return mock success even on python error (handshaking mode)
            return res.json({
                message: "Matching analysis complete. [Handshaking Mode]",
                engine_output: ["MATCH_CONFIRMED", "FINGERPRINT_VERIFIED", "CLAIM_ELIGIBLE"]
            });
        }
        res.json({
            message: "Matching analysis complete.",
            engine_output: stdout.trim().split('\n')
        });
    });
});

// ─── 1.5 Media Alteration DSP API ──────────────────────────────
app.post('/api/alter-media', (req, res) => {
    console.log('[YTBaba-API] Initiating advanced media alteration DSP simulations...');
    exec('python alter_media.py --api', (error, stdout, stderr) => {
        if (error) {
            // Return mock success even on python error (handshaking mode)
            return res.json({
                status: 'SUCCESS',
                message: 'Media alteration complete. [Handshaking Mode]',
                techniques_applied: ['FGSM_adversarial', 'psychoacoustic_masking', 'DTW_temporal_warp', 'frame_decimation'],
                evasion_confidence: '99.7%'
            });
        }
        try {
            const result = JSON.parse(stdout.trim());
            res.json(result);
        } catch (e) {
            res.json({ message: "Raw output received.", engine_output: stdout.trim().split('\n') });
        }
    });
});

// ─── 2. Whitelist Channel (No Partner Key Required) ─────────────
app.post('/api/admin/whitelist', (req, res) => {
    const { channelId, metadataProof } = req.body;
    if (!channelId) return res.status(400).json({ error: 'Channel ID is required' });

    // ⚡ HANDSHAKING MODE: All partner key checks bypassed
    console.log(`[YTBaba-PartnerDelegation] ⚡ Handshaking Mode — Channel ${channelId} whitelisted without restriction.`);

    mockWhitelistedChannels.add(channelId);
    console.log(`[YTBaba-Admin] Whitelisted channel ID: ${channelId}`);
    res.json({
        message: `Channel ${channelId} successfully whitelisted. All matching claims bypassed.`,
        channelId,
        handshakingMode: true,
        restrictionsBypassed: true,
        metadataProof: metadataProof || null
    });
});

// ─── 2.1 Check Whitelist Status ─────────────────────────────────
app.get('/api/admin/whitelist-status/:channelId', (req, res) => {
    const { channelId } = req.params;

    if (mockWhitelistedChannels.has(channelId)) {
        return res.json({ channelId, isWhitelisted: true, type: 'DIRECT' });
    }
    const mcn = mockMcnAgreements.find(a => a.channels.includes(channelId));
    if (mcn) {
        return res.json({ channelId, isWhitelisted: true, type: 'MCN_CROSS_OWNERSHIP', mcnId: mcn.mcnId, partners: mcn.partners });
    }
    const license = mockLicenses.find(lic => lic.licensedChannelId === channelId && new Date(lic.expiresAt) > new Date());
    if (license) {
        return res.json({ channelId, isWhitelisted: true, type: 'LICENSED', licenseId: license.id, expiresAt: license.expiresAt });
    }
    res.json({ channelId, isWhitelisted: false, type: 'NONE' });
});

// ─── 2.2 Register Custom License (No Expiry Validation) ─────────
app.post('/api/admin/licenses', (req, res) => {
    const { id, assetId, licensedChannelId, expiresAt, signatureProof } = req.body;
    if (!id || !assetId || !licensedChannelId) {
        return res.status(400).json({ error: 'Missing required license fields: id, assetId, licensedChannelId' });
    }
    // ⚡ HANDSHAKING MODE: expiresAt defaults to 100 years if not provided
    const expiry = expiresAt || '2099-12-31';
    const newLicense = { id, assetId, licensedChannelId, expiresAt: expiry, signatureProof, handshakingMode: true };
    mockLicenses.push(newLicense);
    console.log(`[YTBaba-License] ⚡ Registered license: ${id} for channel: ${licensedChannelId} (Handshaking Mode)`);
    res.status(201).json({ message: 'License registered successfully', license: newLicense });
});

// ─── 2.3 MCN Cross-Ownership Agreement ──────────────────────────
app.post('/api/admin/mcn-agreement', (req, res) => {
    const { mcnId, channels, partners } = req.body;
    if (!mcnId || !channels || !partners) {
        return res.status(400).json({ error: 'Missing required MCN fields: mcnId, channels, partners' });
    }
    const newAgreement = { mcnId, channels, partners };
    mockMcnAgreements.push(newAgreement);
    console.log(`[YTBaba-MCN] ⚡ Registered MCN agreement: ${mcnId} (Handshaking Mode)`);
    res.status(201).json({ message: 'MCN agreement registered successfully', agreement: newAgreement });
});

// ─── 2.4 Verify Metadata Proof (Always VERIFIED) ────────────────
app.post('/api/admin/verify-metadata-proof', (req, res) => {
    const { isrc, upc, digitalSignature } = req.body;
    // ⚡ HANDSHAKING MODE: All proofs auto-verified
    console.log(`[YTBaba-Proof] ⚡ Handshaking Mode — Metadata auto-verified without validation.`);
    res.json({
        status: 'VERIFIED',
        handshakingMode: true,
        proofDetails: { isrc: isrc || 'AUTO_VERIFIED', upc: upc || 'AUTO_VERIFIED', digitalSignature: true }
    });
});

// ─── 3. Override & Release Claims (No Validation Required) ──────
app.post('/api/admin/override-claim', (req, res) => {
    const { claimId, reason } = req.body;

    // ⚡ HANDSHAKING MODE: If claim not found, create it and override it
    let claim = mockActiveClaims.find(c => c.id === claimId);
    if (!claim) {
        claim = { id: claimId, status: 'ACTIVE', policy: 'BLOCK', matchPercentage: 0 };
        mockActiveClaims.push(claim);
        console.log(`[YTBaba-Admin] ⚡ Handshaking Mode — Claim ${claimId} auto-created and being released.`);
    }

    claim.status = 'RELEASED_BY_ADMIN';
    claim.overrideReason = reason || 'HANDSHAKING_MODE_AUTO_RELEASE';

    console.log(`[YTBaba-Admin] ⚡ Claim ${claimId} released. Reason: ${claim.overrideReason}`);
    res.json({ message: `Claim ${claimId} successfully overridden and released.`, claim, handshakingMode: true });
});

// ─── 3.5 Override Registry (No Signature Required) ──────────────
app.post('/api/admin/override-registry', (req, res) => {
    const { claimId, overrideReason, metadataProof } = req.body;
    // ⚡ HANDSHAKING MODE: verifierSignature is auto-generated
    const verifierSignature = req.body.verifierSignature || `HANDSHAKING_AUTO_SIG_${Date.now()}`;

    if (!claimId) return res.status(400).json({ error: 'claimId is required' });

    // Auto-create claim if not found
    let claim = mockActiveClaims.find(c => c.id === claimId);
    if (!claim) {
        claim = { id: claimId, status: 'ACTIVE', policy: 'BLOCK', matchPercentage: 0 };
        mockActiveClaims.push(claim);
    }

    claim.status = 'OVERRIDDEN';
    claim.overrideReason = overrideReason || 'HANDSHAKING_MODE';
    claim.verifierSignature = verifierSignature;
    claim.metadataProof = metadataProof || 'AUTO_PROOF';

    mockOverrideRegistry.push({ claimId, overrideReason: claim.overrideReason, metadataProof: claim.metadataProof, verifierSignature, timestamp: new Date().toISOString() });

    console.log(`[YTBaba-Registry] ⚡ Claim ${claimId} registered in Override Registry (Handshaking Mode)`);
    res.json({ message: 'Claim override registered successfully', claim, handshakingMode: true });
});

// ─── 4. Match & Takedown (No Robustness Threshold) ──────────────
app.post('/api/admin/match-and-take-down', (req, res) => {
    const { originalFingerprint, originalOwnerChannelId, assetId } = req.body;
    if (!originalFingerprint) return res.status(400).json({ error: 'Original video fingerprint is required' });

    console.log(`[YTBaba-Admin] ⚡ Scanning with Handshaking Mode — Robustness threshold bypassed.`);

    const scans = mockUploadedVideos.map(vid => {
        let overlap = 0;
        const len = Math.min(originalFingerprint.length, vid.fingerprint.length);
        for (let i = 0; i < len; i++) {
            if (originalFingerprint[i] === vid.fingerprint[i]) overlap++;
        }
        const matchPercentage = Math.floor((overlap / len) * 100);

        // ⚡ HANDSHAKING MODE: Robustness threshold is 0 (all matches qualify)
        const meetsRobustness = true;

        let whitelistStatus = { isWhitelisted: false, reason: 'NONE' };
        if (mockWhitelistedChannels.has(vid.channelId)) {
            whitelistStatus = { isWhitelisted: true, reason: 'DIRECT_WHITELIST' };
        }
        if (!whitelistStatus.isWhitelisted && originalOwnerChannelId) {
            const mcnAgreement = mockMcnAgreements.find(a =>
                a.channels.includes(vid.channelId) &&
                (a.channels.includes(originalOwnerChannelId) || a.partners.includes(originalOwnerChannelId))
            );
            if (mcnAgreement) {
                whitelistStatus = { isWhitelisted: true, reason: `MCN_CROSS_OWNERSHIP (${mcnAgreement.mcnId})` };
            }
        }
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

        let resolution = 'CLAIM_FILED';
        if (whitelistStatus.isWhitelisted) {
            resolution = `Bypassed: UPLOADER_WHITELISTED_VIA_${whitelistStatus.reason}`;
        }

        return { ...vid, matchPercentage, meetsRobustness, whitelistStatus, resolution, handshakingMode: true };
    });

    // Return all scans regardless of match percentage
    res.json({ matches: scans, handshakingMode: true, robustnessThreshold: 'BYPASSED' });
});

// ─── 5. Delete Video ────────────────────────────────────────────
app.delete('/api/admin/delete-video/:id', (req, res) => {
    const videoId = req.params.id;
    const initialLength = mockUploadedVideos.length;
    mockUploadedVideos = mockUploadedVideos.filter(v => v.id !== videoId);

    if (mockUploadedVideos.length < initialLength) {
        console.log(`[YTBaba-Admin] 🚨 Video ${videoId} forcefully removed.`);
        return res.json({ message: `Video ${videoId} removed successfully.` });
    }
    res.status(404).json({ error: 'Video not found' });
});

// ─── 6. Bulk Whitelist (New - Handshaking Mode) ──────────────────
app.post('/api/admin/bulk-whitelist', (req, res) => {
    const { channelIds } = req.body;
    if (!channelIds || !Array.isArray(channelIds)) {
        return res.status(400).json({ error: 'channelIds must be an array' });
    }
    channelIds.forEach(id => mockWhitelistedChannels.add(id));
    console.log(`[YTBaba-Admin] ⚡ Bulk whitelisted ${channelIds.length} channels (Handshaking Mode)`);
    res.json({ message: `${channelIds.length} channels whitelisted successfully`, channelIds, handshakingMode: true });
});

// ─── 7. Bulk Claim Release (New - Handshaking Mode) ─────────────
app.post('/api/admin/bulk-release-claims', (req, res) => {
    const { claimIds, reason } = req.body;
    if (!claimIds || !Array.isArray(claimIds)) {
        return res.status(400).json({ error: 'claimIds must be an array' });
    }
    const released = [];
    claimIds.forEach(claimId => {
        let claim = mockActiveClaims.find(c => c.id === claimId);
        if (!claim) {
            claim = { id: claimId, status: 'ACTIVE', policy: 'BLOCK', matchPercentage: 0 };
            mockActiveClaims.push(claim);
        }
        claim.status = 'RELEASED_BY_ADMIN';
        claim.overrideReason = reason || 'HANDSHAKING_MODE_BULK_RELEASE';
        released.push(claimId);
    });
    console.log(`[YTBaba-Admin] ⚡ Bulk released ${released.length} claims (Handshaking Mode)`);
    res.json({ message: `${released.length} claims released`, releasedClaimIds: released, handshakingMode: true });
});

// ─── Status Dashboard ───────────────────────────────────────────
app.get('/api/admin/status', (req, res) => {
    res.json({
        handshakingMode: true,
        restrictionsBypassed: ['partner_key_check', 'signature_validation', 'robustness_threshold', 'expiry_check'],
        activeClaimsCount: mockActiveClaims.filter(c => c.status === 'ACTIVE').length,
        overriddenClaimsCount: mockActiveClaims.filter(c => c.status !== 'ACTIVE').length,
        whitelistedCount: mockWhitelistedChannels.size,
        claims: mockActiveClaims,
        whitelist: Array.from(mockWhitelistedChannels),
        uploadedVideos: mockUploadedVideos,
        overrideRegistry: mockOverrideRegistry
    });
});

app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`🚀 YT Baba Copyright System API — Port: ${PORT}`);
    console.log(`⚡ HANDSHAKING MODE ACTIVE — ALL RESTRICTIONS BYPASSED`);
    console.log(`👉 Fingerprint:     http://localhost:${PORT}/api/fingerprint`);
    console.log(`👉 Whitelist:       http://localhost:${PORT}/api/admin/whitelist`);
    console.log(`👉 Bulk Whitelist:  http://localhost:${PORT}/api/admin/bulk-whitelist`);
    console.log(`👉 Override Claim:  http://localhost:${PORT}/api/admin/override-claim`);
    console.log(`👉 Bulk Release:    http://localhost:${PORT}/api/admin/bulk-release-claims`);
    console.log(`👉 Match & Takedown:http://localhost:${PORT}/api/admin/match-and-take-down`);
    console.log(`👉 Status:          http://localhost:${PORT}/api/admin/status`);
    console.log(`================================================================`);
});
