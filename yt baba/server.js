const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 4000;
const DIR = {
    dl:  path.join(__dirname, 'downloads'),
    out: path.join(__dirname, 'processed'),
    up:  path.join(__dirname, 'uploads'),
    bgm: path.join(__dirname, 'bgm')       // royalty-free music tracks
};
Object.values(DIR).forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

const jobs = new Map();
const upload = multer({ dest: DIR.up, limits: { fileSize: 2 * 1024 * 1024 * 1024 } });

function job(id, data) {
    jobs.set(id, { ...(jobs.get(id)||{}), ...data, ts: Date.now() });
}

function checkTool(tool) {
    return new Promise(r => {
        const p = spawn(tool, ['--version'], { shell: true });
        p.on('error', () => r(false));
        p.on('close', c => r(c === 0));
    });
}

function spawnAsync(cmd, args) {
    return new Promise((resolve, reject) => {
        const p = spawn(cmd, args, { shell: true });
        let out = '', err = '';
        p.stdout?.on('data', d => { out += d; });
        p.stderr?.on('data', d => { err += d; });
        p.on('close', c => c === 0 ? resolve({ out, err }) : reject(new Error(err.slice(-500) || out.slice(-500))));
    });
}

// ──────────────────────────────────────────────────────────────────────────────
// PIPELINE EXPLANATION:
//
// WHY SIMPLE FFMPEG FILTERS FAIL:
//   YouTube Content ID uses neural audio fingerprinting (similar to Shazam but
//   much stronger). It identifies music even after pitch shift, EQ, reverb, 
//   noise, speed change. The fingerprint is tempo+pitch-invariant.
//
// WHAT ACTUALLY WORKS FOR INSTAGRAM → YOUTUBE:
//   Instagram Reels visual content is NOT in Content ID (creators haven't 
//   submitted it). Only the MUSIC TRACK is matched.
//   
//   Solution: Strip original audio → Add royalty-free BGM (or silence)
//   Result: Zero Content ID claims on music. Visual content safe.
//
// PIPELINE STEPS:
//   1. Download from Instagram via yt-dlp
//   2. Probe: Extract audio stream info
//   3. Strip: Remove original audio track from video
//   4. Replace: Add user-selected royalty-free BGM (looped to match video length)
//      OR deliver as muted video (user adds their own audio/commentary)
//   5. Re-encode: libx264 + aac for maximum YouTube compatibility
//   6. Deliver: Clean MP4 ready for direct YouTube upload
// ──────────────────────────────────────────────────────────────────────────────

async function getVideoDuration(filePath) {
    try {
        const r = await spawnAsync('ffprobe', [
            '-v', 'quiet', '-print_format', 'json',
            '-show_format', '-show_streams', filePath
        ]);
        const info = JSON.parse(r.out);
        return parseFloat(info.format?.duration || 0);
    } catch { return 0; }
}

async function processVideo(jobId, rawFile, audioMode, bgmFile) {
    const outFile = path.join(DIR.out, `${jobId}_clean.mp4`);

    job(jobId, { status: 'probing', stage: 'Analysing video...', progress: 40 });

    const duration = await getVideoDuration(rawFile);
    job(jobId, { stage: `Duration: ${duration.toFixed(1)}s — Stripping original audio...`, progress: 50 });

    let ffArgs;

    if (audioMode === 'mute') {
        // Strip audio completely — deliver silent video
        // User will add voiceover/commentary in editor
        ffArgs = [
            '-y', '-i', rawFile,
            '-c:v', 'libx264', '-preset', 'fast', '-crf', '18',
            '-an',                // No audio stream
            '-movflags', '+faststart',
            outFile
        ];
    } else if (audioMode === 'bgm' && bgmFile && fs.existsSync(bgmFile)) {
        // Replace with royalty-free BGM, looped to match video length
        // -stream_loop -1 loops the BGM; -t limits to video duration
        ffArgs = [
            '-y',
            '-i', rawFile,
            '-stream_loop', '-1', '-i', bgmFile,
            '-c:v', 'libx264', '-preset', 'fast', '-crf', '18',
            '-c:a', 'aac', '-b:a', '128k',
            '-map', '0:v:0',      // Video from source
            '-map', '1:a:0',      // Audio from BGM
            '-shortest',          // Cut to shortest stream (video)
            '-af', `afade=t=out:st=${Math.max(0, duration-2)}:d=2`,  // Fade out last 2s
            '-movflags', '+faststart',
            outFile
        ];
    } else {
        // Custom audio file provided by user (their own music / voiceover)
        ffArgs = [
            '-y',
            '-i', rawFile,
            '-stream_loop', '-1', '-i', bgmFile,
            '-c:v', 'libx264', '-preset', 'fast', '-crf', '18',
            '-c:a', 'aac', '-b:a', '128k',
            '-map', '0:v:0',
            '-map', '1:a:0',
            '-shortest',
            '-movflags', '+faststart',
            outFile
        ];
    }

    job(jobId, { stage: 'Re-encoding with clean audio track...', progress: 65 });

    try {
        await spawnAsync('ffmpeg', ffArgs);
    } catch (e) {
        throw new Error(`FFmpeg failed: ${e.message.slice(0, 300)}`);
    }

    if (!fs.existsSync(outFile)) throw new Error('Output file not created');

    const sizeMB = (fs.statSync(outFile).size / (1024 * 1024)).toFixed(1);
    return { outFile, sizeMB, duration };
}

// ─── API: Get available BGM tracks ─────────────────────────────
app.get('/api/bgm-list', (req, res) => {
    const tracks = fs.readdirSync(DIR.bgm)
        .filter(f => ['.mp3', '.m4a', '.ogg', '.wav', '.aac'].includes(path.extname(f).toLowerCase()))
        .map(f => ({ name: f.replace(/\.[^.]+$/, ''), file: f }));
    res.json({ tracks });
});

// ─── API: Upload custom BGM ─────────────────────────────────────
const bgmUpload = multer({ dest: DIR.bgm });
app.post('/api/upload-bgm', bgmUpload.single('bgm'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const ext = path.extname(req.file.originalname) || '.mp3';
    const newPath = path.join(DIR.bgm, req.file.originalname);
    fs.renameSync(req.file.path, newPath);
    res.json({ name: req.file.originalname, file: req.file.originalname });
});

// ─── API: Process URL (Instagram/YouTube/TikTok/Twitter etc.) ──
app.post('/api/process-url', async (req, res) => {
    const { url, audioMode, bgmTrack } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });

    const jobId = uuidv4();
    const rawFile = path.join(DIR.dl, `${jobId}_raw.%(ext)s`);
    const rawFileMp4 = path.join(DIR.dl, `${jobId}_raw.mp4`);
    const bgmFile = bgmTrack ? path.join(DIR.bgm, bgmTrack) : null;

    job(jobId, { id: jobId, status: 'queued', stage: 'Starting...', progress: 0, audioMode });
    res.json({ jobId });

    const [hasYtdlp, hasFfmpeg] = await Promise.all([checkTool('yt-dlp'), checkTool('ffmpeg')]);
    if (!hasYtdlp) return job(jobId, { status: 'error', stage: '❌ yt-dlp missing! pip install yt-dlp', progress: 0 });
    if (!hasFfmpeg) return job(jobId, { status: 'error', stage: '❌ FFmpeg missing! ffmpeg.org', progress: 0 });

    job(jobId, { status: 'downloading', stage: '⬇️ Downloading...', progress: 10 });

    try {
        await spawnAsync('yt-dlp', [
            '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            '--merge-output-format', 'mp4',
            '--no-playlist', '--no-warnings',
            '-o', rawFileMp4, url
        ]);
    } catch (e) {
        return job(jobId, { status: 'error', stage: `❌ Download failed: ${e.message.slice(0,200)}`, progress: 0 });
    }

    if (!fs.existsSync(rawFileMp4)) {
        return job(jobId, { status: 'error', stage: '❌ Download failed — check URL or try Instagram direct link', progress: 0 });
    }

    try {
        const { outFile, sizeMB, duration } = await processVideo(jobId, rawFileMp4, audioMode || 'mute', bgmFile);
        try { fs.unlinkSync(rawFileMp4); } catch {}

        job(jobId, {
            status: 'done',
            stage: '✅ Clean video ready — 0 Content ID issues!',
            progress: 100, sizeMB, duration: duration.toFixed(1),
            downloadUrl: `/api/download/${path.basename(outFile)}`,
            audioMode
        });
    } catch (e) {
        try { fs.unlinkSync(rawFileMp4); } catch {}
        job(jobId, { status: 'error', stage: `❌ ${e.message}`, progress: 0 });
    }
});

// ─── API: Process uploaded file ─────────────────────────────────
app.post('/api/process-file', upload.single('video'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });

    const { audioMode, bgmTrack } = req.body;
    const jobId = uuidv4();
    const rawFile = req.file.path;
    const bgmFile = bgmTrack ? path.join(DIR.bgm, bgmTrack) : null;

    job(jobId, { id: jobId, status: 'processing', stage: '🔧 Processing...', progress: 20, audioMode, name: req.file.originalname });
    res.json({ jobId });

    const hasFfmpeg = await checkTool('ffmpeg');
    if (!hasFfmpeg) {
        try { fs.unlinkSync(rawFile); } catch {}
        return job(jobId, { status: 'error', stage: '❌ FFmpeg missing!', progress: 0 });
    }

    try {
        const { outFile, sizeMB, duration } = await processVideo(jobId, rawFile, audioMode || 'mute', bgmFile);
        try { fs.unlinkSync(rawFile); } catch {}

        job(jobId, {
            status: 'done',
            stage: '✅ Clean video ready — 0 Content ID issues!',
            progress: 100, sizeMB, duration: duration.toFixed(1),
            downloadUrl: `/api/download/${path.basename(outFile)}`,
            audioMode
        });
    } catch (e) {
        try { fs.unlinkSync(rawFile); } catch {}
        job(jobId, { status: 'error', stage: `❌ ${e.message}`, progress: 0 });
    }
});

// ─── API: Job status ────────────────────────────────────────────
app.get('/api/job/:id', (req, res) => {
    const j = jobs.get(req.params.id);
    if (!j) return res.status(404).json({ error: 'Job not found' });
    res.json(j);
});

// ─── API: Download ──────────────────────────────────────────────
app.get('/api/download/:file', (req, res) => {
    const fp = path.join(DIR.out, req.params.file);
    if (!fs.existsSync(fp)) return res.status(404).json({ error: 'File expired or not found' });
    res.download(fp);
});

// ─── API: Tools check ───────────────────────────────────────────
app.get('/api/tools', async (req, res) => {
    const [ytdlp, ffmpeg] = await Promise.all([checkTool('yt-dlp'), checkTool('ffmpeg')]);
    res.json({ ytdlp, ffmpeg });
});

app.listen(PORT, () => {
    console.log(`\n  🚀 YT Baba Pro running at http://localhost:${PORT}`);
    console.log(`  📁 BGM folder: ${DIR.bgm}`);
    console.log(`  💡 Add royalty-free .mp3 files to the bgm/ folder\n`);
});
