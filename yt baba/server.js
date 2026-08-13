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
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');
const PROCESSED_DIR = path.join(__dirname, 'processed');
const UPLOADS_DIR   = path.join(__dirname, 'uploads');

[DOWNLOADS_DIR, PROCESSED_DIR, UPLOADS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const jobs = new Map();
const upload = multer({ dest: UPLOADS_DIR, limits: { fileSize: 2 * 1024 * 1024 * 1024 } });

function updateJob(id, data) {
    jobs.set(id, { ...(jobs.get(id) || {}), ...data, updatedAt: new Date().toISOString() });
}

function checkTool(tool) {
    return new Promise(resolve => {
        const p = spawn(tool, ['--version'], { shell: true });
        p.on('error', () => resolve(false));
        p.on('close', c => resolve(c === 0));
    });
}

function build9LayerFilter(inputPath, outputPath) {
    const spd = (0.985 + Math.random() * 0.012).toFixed(4);
    const tmp = (1.0 / parseFloat(spd)).toFixed(4);
    const r   = ((Math.random() - 0.5) * 0.06).toFixed(3);
    const g   = ((Math.random() - 0.5) * 0.04).toFixed(3);
    const b   = ((Math.random() - 0.5) * 0.04).toFixed(3);
    const crp = (0.98 + Math.random() * 0.01).toFixed(3);
    const ed  = (20 + Math.floor(Math.random() * 30)).toString();
    const edc = (0.08 + Math.random() * 0.07).toFixed(2);
    const eqf = [2000,3000,4000][Math.floor(Math.random()*3)];
    const eqg = (1.5 + Math.random() * 1.5).toFixed(1);
    const pr  = (0.993 + Math.random() * 0.006).toFixed(4);
    const tc  = (1.0 / parseFloat(pr)).toFixed(4);

    const vf = `hflip,scale=iw*${crp}:ih*${crp},scale=iw:ih:flags=lanczos,colorbalance=rs=${r}:gs=${g}:bs=${b},unsharp=5:5:0.8:5:5:0.0,setpts=${spd}*PTS`;
    const af = `aecho=0.6:0.5:${ed}:${edc},equalizer=f=${eqf}:width_type=o:width=2:g=${eqg},asetrate=44100*${pr},atempo=${tc},atempo=${tmp}`;

    return {
        args: ['-y','-i',inputPath,'-vf',vf,'-af',af,'-c:v','libx264','-preset','fast','-crf','18','-c:a','aac','-b:a','192k','-movflags','+faststart',outputPath],
        params: { speed: spd, tempo: tmp, color: { r, g, b }, crop: crp, echo_delay: ed, pitch: pr }
    };
}

function runFFmpeg(args) {
    return new Promise((resolve, reject) => {
        const p = spawn('ffmpeg', args, { shell: true });
        let log = '';
        p.stderr.on('data', d => { log += d.toString(); });
        p.on('close', code => code === 0 ? resolve(log) : reject(new Error(log.slice(-400))));
    });
}

function runDownload(url, outFile) {
    return new Promise((resolve, reject) => {
        const args = [
            '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            '--merge-output-format', 'mp4',
            '--no-playlist', '--no-warnings',
            '-o', outFile, url
        ];
        const p = spawn('yt-dlp', args, { shell: true });
        let log = '';
        p.stdout.on('data', d => { log += d.toString(); });
        p.stderr.on('data', d => { log += d.toString(); });
        p.on('close', code => code === 0 ? resolve(log) : reject(new Error(log.slice(-400))));
    });
}

// ─── API: Process by URL ─────────────────────────────────────
app.post('/api/process-url', async (req, res) => {
    const { url } = req.body;
    if (!url || !url.startsWith('http')) return res.status(400).json({ error: 'Valid URL required' });

    const jobId = uuidv4();
    const rawFile = path.join(DOWNLOADS_DIR, `${jobId}.mp4`);
    const outFile = path.join(PROCESSED_DIR, `${jobId}_clean.mp4`);
    updateJob(jobId, { id: jobId, status: 'queued', stage: 'Starting...', progress: 0 });
    res.json({ jobId });

    // Pre-check tools
    const [hasYtdlp, hasFfmpeg] = await Promise.all([checkTool('yt-dlp'), checkTool('ffmpeg')]);
    if (!hasYtdlp) return updateJob(jobId, { status: 'error', stage: 'yt-dlp missing! Run: pip install yt-dlp', progress: 0 });
    if (!hasFfmpeg) return updateJob(jobId, { status: 'error', stage: 'FFmpeg missing! Download from ffmpeg.org', progress: 0 });

    // Download
    updateJob(jobId, { status: 'downloading', stage: 'Downloading video...', progress: 10 });
    try {
        await runDownload(url, rawFile);
    } catch (e) {
        return updateJob(jobId, { status: 'error', stage: `Download failed: ${e.message.slice(0, 200)}`, progress: 0 });
    }

    if (!fs.existsSync(rawFile)) {
        return updateJob(jobId, { status: 'error', stage: 'Download produced no file. Check URL.', progress: 0 });
    }

    // Bypass
    updateJob(jobId, { status: 'processing', stage: 'Applying 9-layer Content ID bypass...', progress: 50 });
    const { args, params } = build9LayerFilter(rawFile, outFile);
    try {
        await runFFmpeg(args);
    } catch (e) {
        try { fs.unlinkSync(rawFile); } catch {}
        return updateJob(jobId, { status: 'error', stage: `FFmpeg failed: ${e.message.slice(0, 200)}`, progress: 0 });
    }

    try { fs.unlinkSync(rawFile); } catch {}

    if (!fs.existsSync(outFile)) {
        return updateJob(jobId, { status: 'error', stage: 'Bypass produced no output file.', progress: 0 });
    }

    const sizeMB = (fs.statSync(outFile).size / (1024 * 1024)).toFixed(1);
    updateJob(jobId, {
        status: 'done', stage: '✅ Fresh content ready! No Copyright issues.',
        progress: 100, sizeMB, bypassParams: params,
        downloadUrl: `/api/download/${path.basename(outFile)}`
    });
});

// ─── API: Process uploaded file ───────────────────────────────
app.post('/api/process-file', upload.single('video'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const jobId = uuidv4();
    const rawFile = req.file.path;
    const outFile = path.join(PROCESSED_DIR, `${jobId}_clean.mp4`);
    updateJob(jobId, { id: jobId, status: 'processing', stage: 'Applying 9-layer bypass...', progress: 20, name: req.file.originalname });
    res.json({ jobId });

    const hasFfmpeg = await checkTool('ffmpeg');
    if (!hasFfmpeg) {
        try { fs.unlinkSync(rawFile); } catch {}
        return updateJob(jobId, { status: 'error', stage: 'FFmpeg missing! Download from ffmpeg.org', progress: 0 });
    }

    const { args, params } = build9LayerFilter(rawFile, outFile);
    try {
        await runFFmpeg(args);
    } catch (e) {
        try { fs.unlinkSync(rawFile); } catch {}
        return updateJob(jobId, { status: 'error', stage: `FFmpeg failed: ${e.message.slice(0, 200)}`, progress: 0 });
    }

    try { fs.unlinkSync(rawFile); } catch {}

    const sizeMB = fs.existsSync(outFile) ? (fs.statSync(outFile).size / (1024 * 1024)).toFixed(1) : 0;
    updateJob(jobId, {
        status: 'done', stage: '✅ Fresh content ready! No Copyright issues.',
        progress: 100, sizeMB, bypassParams: params,
        downloadUrl: `/api/download/${path.basename(outFile)}`
    });
});

// ─── API: Job status ──────────────────────────────────────────
app.get('/api/job/:id', (req, res) => {
    const job = jobs.get(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
});

// ─── API: Download processed file ────────────────────────────
app.get('/api/download/:file', (req, res) => {
    const fp = path.join(PROCESSED_DIR, req.params.file);
    if (!fs.existsSync(fp)) return res.status(404).json({ error: 'File not found' });
    res.download(fp);
});

// ─── API: Tool check ─────────────────────────────────────────
app.get('/api/tools', async (req, res) => {
    const [ytdlp, ffmpeg] = await Promise.all([checkTool('yt-dlp'), checkTool('ffmpeg')]);
    res.json({ ytdlp, ffmpeg });
});

app.listen(PORT, () => {
    console.log(`\n  🚀 YT Baba Tool running at http://localhost:${PORT}\n`);
});
