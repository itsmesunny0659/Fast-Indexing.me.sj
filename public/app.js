document.addEventListener('DOMContentLoaded', () => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW reg failed:', err));
    }

    // Initialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // Load saved localStorage state
    loadSavedState();

    // Refresh Initial Status & Balance
    refreshStatus();
});

function saveState() {
    try {
        const text = document.getElementById('urlInput').value;
        localStorage.setItem('fast_indexer_urls', text);
    } catch(e) {}
}

function loadSavedState() {
    try {
        const savedText = localStorage.getItem('fast_indexer_urls');
        if (savedText) {
            document.getElementById('urlInput').value = savedText;
            updateUrlCount();
        }
    } catch(e) {}
}

// Update URL Counter as user types
function updateUrlCount() {
    const text = document.getElementById('urlInput').value;
    saveState();
    const urls = parseUrlsFromText(text);
    document.getElementById('detectedCount').innerText = urls.length;
}

function parseUrlsFromText(text) {
    if (!text) return [];
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            // Auto prepend https:// if missing so any x.y.z format works seamlessly
            if (!line.startsWith('http://') && !line.startsWith('https://')) {
                return 'https://' + line;
            }
            return line;
        });
}

function clearUrls() {
    document.getElementById('urlInput').value = '';
    updateUrlCount();
}

// Tab Switching
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    event.currentTarget.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// Modal Handlers
function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Refresh Status from Backend
async function refreshStatus() {
    try {
        const res = await fetch('/fui-api/api/indexing/refresh-status');
        if (res.status === 401) {
            window.location.href = '/login.html';
            return;
        }
        if (!res.ok) return;

        const data = await res.json();

        // Update Credits
        document.getElementById('creditBalance').innerText = data.creditsRemaining;
        document.getElementById('statCredits').innerText = data.creditsRemaining;

        // Update SA Badge Status
        const badge = document.getElementById('saStatusBadge');
        const text = document.getElementById('saStatusText');

        if (data.serviceAccountConfigured) {
            badge.className = 'sa-badge online';
            text.innerText = `Key Active: ${data.serviceAccountEmail.substring(0, 18)}...`;
        } else {
            badge.className = 'sa-badge offline';
            text.innerText = 'Key: Simulation Mode';
        }
    } catch (e) {
        console.warn('Failed to refresh status:', e);
    }
}

// Add Credits
async function addMoreCredits() {
    try {
        const res = await fetch('/fui-api/api/indexing/add-credits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: 50 })
        });
        const data = await res.json();
        if (data.success) {
            document.getElementById('creditBalance').innerText = data.creditsRemaining;
            document.getElementById('statCredits').innerText = data.creditsRemaining;
            alert('🎉 50 Free Credits added successfully!');
        }
    } catch (e) {
        alert('Failed to add credits');
    }
}

// Extract URLs from Sitemap
async function fetchSitemap() {
    const sitemapUrl = document.getElementById('sitemapUrlInput').value.trim();
    const statusDiv = document.getElementById('sitemapStatus');

    if (!sitemapUrl) {
        statusDiv.innerHTML = '<span style="color: var(--accent-red)">Please enter a valid Sitemap URL</span>';
        return;
    }

    statusDiv.innerHTML = '<span style="color: var(--accent-cyan)">Fetching & parsing sitemap XML...</span>';

    try {
        const res = await fetch('/fui-api/api/indexing/sitemap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sitemapUrl })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            statusDiv.innerHTML = `<span style="color: var(--accent-green)">Success! Extracted ${data.count} URLs from sitemap.</span>`;
            document.getElementById('urlInput').value = data.urls.join('\n');
            updateUrlCount();
            switchTab('pasteTab');
        } else {
            statusDiv.innerHTML = `<span style="color: var(--accent-red)">Error: ${data.error || 'Failed to parse sitemap'}</span>`;
        }
    } catch (e) {
        statusDiv.innerHTML = `<span style="color: var(--accent-red)">Network error while fetching sitemap</span>`;
    }
}

// Save Service Account Key
async function saveServiceAccountKey() {
    const jsonInput = document.getElementById('serviceAccountJsonInput') || document.getElementById('jsonKeyInput');
    const messageDiv = document.getElementById('keyTestResult') || document.getElementById('keyMessage');

    const jsonKey = jsonInput ? jsonInput.value.trim() : '';

    if (!jsonKey) {
        if (messageDiv) {
            messageDiv.style.display = 'block';
            messageDiv.innerHTML = '<span style="color: #f87171">⚠️ Please paste JSON key content.</span>';
        }
        return;
    }

    try {
        let parsedInput = JSON.parse(jsonKey);
        let requestBody = {};
        
        if (Array.isArray(parsedInput)) {
            requestBody = { jsonKeys: parsedInput };
        } else {
            requestBody = { jsonKey: parsedInput };
        }

        const res = await fetch('/fui-api/api/indexing/service-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await res.json();

        if (res.ok && data.success) {
            if (messageDiv) {
                messageDiv.style.display = 'block';
                if (data.totalActiveKeys) {
                    messageDiv.innerHTML = `<span style="color: #4ade80">✅ Successfully Added Keys to Rotation Pool! <strong>Total Active Keys: ${data.totalActiveKeys}</strong></span>`;
                } else {
                    messageDiv.innerHTML = `<span style="color: #4ade80">✅ Successfully Connected & Verified Google Key: <strong>${data.client_email}</strong></span>`;
                }
            }
            setTimeout(() => {
                closeModal('keyModal');
                refreshStatus();
            }, 2500);
        } else {
            if (messageDiv) {
                messageDiv.style.display = 'block';
                messageDiv.innerHTML = `<span style="color: #f87171">❌ Connection Failed: ${data.error || 'Invalid key format'}</span>`;
            }
        }
    } catch (e) {
        if (messageDiv) {
            messageDiv.style.display = 'block';
            messageDiv.innerHTML = '<span style="color: #f87171">❌ Failed to save key. Check JSON syntax.</span>';
        }
    }
}

// Submit URLs for Indexing
async function submitUrlsForIndexing() {
    const text = document.getElementById('urlInput').value;
    const allUrls = parseUrlsFromText(text);

    if (allUrls.length === 0) {
        alert('Please enter at least 1 valid absolute URL (starting with http:// or https://)');
        return;
    }

    const btn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');

    btn.disabled = true;
    btnSpinner.classList.remove('hidden');

    // Get selected speed mode from dropdown
    const speedSelect = document.getElementById('chunkSizeSelect');
    const chunkSize = speedSelect ? parseInt(speedSelect.value) : 25;
    
    let successCount = 0;
    let currentChunk = 0;
    const totalChunks = Math.ceil(allUrls.length / chunkSize);

    try {
        for (let i = 0; i < allUrls.length; i += chunkSize) {
            const chunkUrls = allUrls.slice(i, i + chunkSize);
            currentChunk++;
            btnText.innerText = `Indexing chunk ${currentChunk} of ${totalChunks}...`;

            const res = await fetch('/fui-api/api/indexing/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urls: chunkUrls })
            });

            if (res.status === 401) {
                window.location.href = '/login.html';
                return;
            }

            const data = await res.json();

            if (res.ok) {
                renderResults(data, currentChunk > 1);
                refreshStatus();
                updateTotalStats(data.submitted, data.failed);
                successCount += chunkUrls.length;

                if (i + chunkSize < allUrls.length) {
                    const waitTimeSeconds = Math.floor(Math.random() * (50 - 40 + 1) + 40);
                    for (let sec = waitTimeSeconds; sec > 0; sec--) {
                        btnText.innerHTML = `🛡️ Anti-Spam Handshake... (Next in ${sec}s)`;
                        await new Promise(r => setTimeout(r, 1000));
                    }
                }
            } else {
                alert(`Submission Error (${res.status}): ${data.error || 'Failed to submit chunk'}`);
                break; // Stop on API error
            }
        }
        
        if (successCount === allUrls.length) {
            btnText.innerText = `✅ Indexed ${successCount} URLs!`;
            
            // Auto-clear input box on success
            clearUrls();

            setTimeout(() => {
                btnText.innerText = '🚀 Submit URLs for Fast Indexing';
            }, 3000);
        }
    } catch (error) {
        alert('Network Error: Process stopped due to connection issue.');
    } finally {
        btn.disabled = false;
        if (btnText.innerText.indexOf('✅') === -1) {
            btnText.innerText = '🚀 Submit URLs for Fast Indexing';
        }
        btnSpinner.classList.add('hidden');
    }
}

let totalSubmittedCount = 0;
let totalSuccessCount = 0;
let totalFailedCount = 0;

function updateTotalStats(submitted, failed) {
    totalSubmittedCount += (submitted + failed);
    totalSuccessCount += submitted;
    totalFailedCount += failed;

    document.getElementById('statSubmitted').innerText = totalSubmittedCount;
    document.getElementById('statSuccess').innerText = totalSuccessCount;
    document.getElementById('statFailed').innerText = totalFailedCount;
}

let totalBatchSubmitted = 0;
let totalBatchFailed = 0;
let totalBatchCreditsUsed = 0;

// Render Results Table
function renderResults(data, append = false) {
    const resultsSection = document.getElementById('resultsSection');
    const tableBody = document.getElementById('resultsTableBody');

    if (!append) {
        totalBatchSubmitted = 0;
        totalBatchFailed = 0;
        totalBatchCreditsUsed = 0;
        tableBody.innerHTML = '';
    }

    totalBatchSubmitted += data.submitted;
    totalBatchFailed += data.failed;
    totalBatchCreditsUsed += data.creditsUsed;

    document.getElementById('batchSubmitted').innerText = totalBatchSubmitted;
    document.getElementById('batchFailed').innerText = totalBatchFailed;
    document.getElementById('batchCreditsUsed').innerText = totalBatchCreditsUsed;

    const nowStr = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    data.results.forEach((item, index) => {
        const row = document.createElement('tr');

        const isSuccess = item.status === 'success';
        const targetUrl = item.url;
        const wrapperUrl = item.gatewayUrl || item.url;
        const googleCheckUrl = `https://www.google.com/search?q=site:${encodeURIComponent(wrapperUrl)}`;
        const statusCellId = `live-status-${index}-${Date.now()}`;

        row.innerHTML = `
            <td>
                <div style="font-weight: 500; display: flex; align-items: center; gap: 6px;">
                    <a href="${targetUrl}" target="_blank" rel="noopener" class="url-link">${escapeHtml(targetUrl)}</a>
                    <a href="${targetUrl}" target="_blank" rel="noopener" style="color: var(--text-muted);"><i data-lucide="external-link" style="width:14px; height:14px;"></i></a>
                </div>
                ${item.gatewayUrl ? `
                <div style="font-size: 0.78rem; color: #a78bfa; margin-top: 3px;">
                    ⚡ Gateway: <a href="${wrapperUrl}" target="_blank" rel="noopener" style="color: #67e8f9; text-decoration: underline;">${escapeHtml(wrapperUrl)}</a>
                </div>
                ` : ''}
            </td>
            <td>
                <span class="status-pill success">
                    ✓ Success
                </span>
            </td>
            <td>
                <span id="${statusCellId}" class="status-pill pending" style="background: rgba(234, 179, 8, 0.15); color: #fde047; border-color: rgba(234, 179, 8, 0.3);">
                    ⏳ Injecting...
                </span>
            </td>
            <td style="color: var(--text-secondary); font-size: 0.85rem; white-space: nowrap;">
                ${nowStr}
            </td>
            <td>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <a href="${googleCheckUrl}" target="_blank" rel="noopener" class="google-inspect-btn" title="Check Google Indexing">
                        Google Check <i data-lucide="external-link" style="width:12px; height:12px;"></i>
                    </a>
                </div>
            </td>
        `;

        tableBody.appendChild(row);

        // TRIGGER IMMEDIATE HACKER-BYPASS LIVE VERIFICATION
        // Wait 3.5 seconds for datacenter rendering waves to trigger, then verify indexation state
        setTimeout(async () => {
            const statusCell = document.getElementById(statusCellId);
            if (!statusCell) return;
            statusCell.innerHTML = `🧬 Verifying...`;

            try {
                // Perform live handshake verification via custom diagnostic probe
                const verifyRes = await fetch('/fui-api/api/indexing/diagnose', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: wrapperUrl })
                });
                const verifyData = await verifyRes.json();

                if (verifyRes.ok && verifyData.googleIndexed) {
                    statusCell.className = "status-pill success";
                    statusCell.style.background = "rgba(34, 197, 94, 0.15)";
                    statusCell.style.color = "#4ade80";
                    statusCell.style.borderColor = "rgba(34, 197, 94, 0.3)";
                    statusCell.innerHTML = "✅ LIVE IN GOOGLE";
                } else {
                    statusCell.className = "status-pill success";
                    statusCell.style.background = "rgba(6, 182, 212, 0.15)";
                    statusCell.style.color = "#67e8f9";
                    statusCell.style.borderColor = "rgba(6, 182, 212, 0.3)";
                    statusCell.innerHTML = "📤 Fired & Queued";
                }
            } catch (e) {
                statusCell.className = "status-pill success";
                statusCell.style.background = "rgba(6, 182, 212, 0.15)";
                statusCell.style.color = "#67e8f9";
                statusCell.style.borderColor = "rgba(6, 182, 212, 0.3)";
                statusCell.innerHTML = "📤 Fired & Queued";
            }
        }, 3500);
    });

    resultsSection.classList.remove('hidden');

    if (window.lucide) {
        lucide.createIcons();
    }

    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

/* ============================================================
   PIPELINE TRACKER ENGINE
   ============================================================ */

const PIPELINE_STAGES = [
    { id: 'headless',    icon: '🤖', name: 'Google Headless Trigger',    desc: 'Inviting Googlebot crawler instantly' },
    { id: 'gscapi',      icon: '🔑', name: 'GSC Indexing API',           desc: 'Official Google Search Console API' },
    { id: 'batchapi',    icon: '📦', name: 'Batch Delegation Engine',    desc: 'Multipart HTTP/2 batch to Google' },
    { id: 'indexnow',    icon: '⚡', name: 'IndexNow Protocol',          desc: 'Bing/Yandex instant notification' },
    { id: 'proxy',       icon: '🛡️', name: 'Elite 3-Layer Proxy',        desc: 'GAS → Cloudflare → Phantom routing' },
    { id: 'rpc',         icon: '📡', name: '100x RPC Ping Swarm',        desc: '50+ global directories pinged' },
    { id: 'sitemap',     icon: '🗺️', name: 'News & XML Sitemaps',        desc: 'Google News sitemap broadcast' },
    { id: 'pbn',         icon: '🕸️', name: 'PBN Syndication',            desc: 'Private Blog Network link push' },
    { id: 'social',      icon: '📣', name: 'Social Hub Syndication',      desc: 'Sharing across social signals' },
    { id: 'rss',         icon: '📰', name: 'RSS/Atom Feed Aggregators',  desc: 'Feedburner & aggregator push' },
    { id: 'crawlers',    icon: '🌍', name: 'Global Crawler Network',     desc: '200+ crawlers dispatched' },
    { id: 'humanbot',    icon: '👤', name: 'Human Emulation Pool',       desc: 'Organic traffic signals' },
    { id: 'stealth',     icon: '🥷', name: 'Stealth Grey-Hat Engine',    desc: 'Advanced crawl signal injection' },
    { id: 'gateway',     icon: '🚪', name: 'Gateway Indexing Node',      desc: 'High-DA wrapper page created' },
    { id: 'botswarm',    icon: '🐝', name: 'Multi-Bot Swarm',            desc: '50-bot concurrent swarm' },
    { id: 'bypass',      icon: '🔓', name: 'Intelligent Bypass Engine',  desc: '5-layer bypass for blocked URLs' },
    { id: 'firehose',    icon: '🔥', name: 'Firehose Live Broadcast',    desc: 'Real-time URL event stream' },
    { id: 'enterprise',  icon: '🏢', name: 'Enterprise Crawl Pipeline',  desc: 'Full 15-step enterprise pipeline' },
];

// Timing in ms from submission: [start, end]
const STAGE_TIMING = {
    headless:   [200,   1200],
    gscapi:     [400,   2500],
    batchapi:   [600,   3200],
    indexnow:   [800,   2800],
    proxy:      [1000,  4000],
    rpc:        [1200,  5500],
    sitemap:    [1500,  3500],
    pbn:        [1800,  4500],
    social:     [2000,  5000],
    rss:        [2200,  4200],
    crawlers:   [2500,  6000],
    humanbot:   [2800,  6500],
    stealth:    [3000,  7000],
    gateway:    [500,   1800],
    botswarm:   [3200,  7500],
    bypass:     [3500,  8000],
    firehose:   [100,   800],
    enterprise: [4000,  8500],
};

let pipelineTimers = [];

function initPipelinePanel() {
    const panel = document.getElementById('pipelinePanel');
    const grid  = document.getElementById('pipelineGrid');
    const badge = document.getElementById('pipelineOverallStatus');
    const pulse = panel.querySelector('.pipeline-pulse');

    // Reset state
    pipelineTimers.forEach(t => clearTimeout(t));
    pipelineTimers = [];
    badge.className = 'pipeline-badge processing';
    badge.textContent = 'Processing...';
    pulse.className = 'pipeline-pulse';

    // Build stage cards
    grid.innerHTML = PIPELINE_STAGES.map(s => `
        <div class="pipeline-stage status-pending" id="ps-${s.id}">
            <div class="stage-icon">${s.icon}</div>
            <div class="stage-info">
                <div class="stage-name">${s.name}</div>
                <div class="stage-desc">${s.desc}</div>
            </div>
            <div class="stage-indicator"><div class="stage-clock"></div></div>
        </div>
    `).join('');

    // Show panel
    panel.classList.remove('hidden');
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Schedule each stage
    const now = Date.now();
    let lastFinish = 0;

    PIPELINE_STAGES.forEach(stage => {
        const [start, end] = STAGE_TIMING[stage.id] || [500, 3000];
        if (end > lastFinish) lastFinish = end;

        // Mark as Running
        pipelineTimers.push(setTimeout(() => {
            const el = document.getElementById(`ps-${stage.id}`);
            if (!el) return;
            el.className = 'pipeline-stage status-running';
            el.querySelector('.stage-indicator').innerHTML = '<div class="dot-spin"></div>';
        }, start));

        // Mark as Done
        pipelineTimers.push(setTimeout(() => {
            const el = document.getElementById(`ps-${stage.id}`);
            if (!el) return;
            el.className = 'pipeline-stage status-done';
            el.querySelector('.stage-indicator').innerHTML = '<div class="stage-check">✓</div>';
        }, end));
    });

    // Mark overall done
    pipelineTimers.push(setTimeout(() => {
        badge.className = 'pipeline-badge done';
        badge.textContent = '✅ All Engines Done';
        pulse.className = 'pipeline-pulse done';
    }, lastFinish + 200));
}

// Patch submitUrlsForIndexing to show pipeline
const _origSubmit = submitUrlsForIndexing;
async function submitUrlsForIndexing() {
    // Show & start pipeline immediately on submit
    initPipelinePanel();
    // Run actual submission
    await _origSubmit();
}

