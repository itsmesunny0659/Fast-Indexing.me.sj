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

// Background Queue for submitting chunks asynchronously without blocking the UI
let isQueueRunning = false;
const submissionQueue = [];

async function processSubmissionQueue() {
    if (isQueueRunning || submissionQueue.length === 0) return;
    isQueueRunning = true;

    while (submissionQueue.length > 0) {
        const { chunkUrls } = submissionQueue.shift();
        
        try {
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
                renderResults(data, true); // Append to table
                refreshStatus();
                updateTotalStats(data.submitted, data.failed);
            }
        } catch (error) {
            console.error('Background submission error:', error);
        }

        // Anti-Spam Handshake Wait between chunks in background
        if (submissionQueue.length > 0) {
            // Calculate remaining URLs in the queue
            const remainingUrlsCount = submissionQueue.reduce((acc, item) => acc + item.chunkUrls.length, 0);
            let waitTimeSeconds = 10; // Default fast delay

            if (remainingUrlsCount > 50) {
                waitTimeSeconds = Math.floor(Math.random() * (45 - 35 + 1) + 35); // 35-45s for massive bulk
            } else if (remainingUrlsCount > 20) {
                waitTimeSeconds = Math.floor(Math.random() * (25 - 15 + 1) + 15); // 15-25s for medium bulk
            } else {
                waitTimeSeconds = Math.floor(Math.random() * (10 - 5 + 1) + 5);   // 5-10s for small leftovers
            }

            await new Promise(r => setTimeout(r, waitTimeSeconds * 1000));
        }
    }

    isQueueRunning = false;
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
    btnText.innerText = 'Submitting...';

    // Get selected speed mode from dropdown
    const speedSelect = document.getElementById('chunkSizeSelect');
    const chunkSize = speedSelect ? parseInt(speedSelect.value) : 25;
    
    const totalChunks = Math.ceil(allUrls.length / chunkSize);

    try {
        // Send the FIRST chunk immediately
        const firstChunkUrls = allUrls.slice(0, chunkSize);
        
        const res = await fetch('/fui-api/api/indexing/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls: firstChunkUrls })
        });

        if (res.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        const data = await res.json();

        if (res.ok) {
            renderResults(data, false); // Clear and render first chunk
            refreshStatus();
            updateTotalStats(data.submitted, data.failed);

            // Queue the remaining chunks in the background
            for (let i = chunkSize; i < allUrls.length; i += chunkSize) {
                const chunkUrls = allUrls.slice(i, i + chunkSize);
                submissionQueue.push({ chunkUrls });
            }
            
            // Trigger background processing of queued chunks
            processSubmissionQueue();

            // Clear input box immediately so user can type/submit more URLs!
            clearUrls();
        } else {
            alert(`Submission Error (${res.status}): ${data.error || 'Failed to submit'}`);
        }
    } catch (error) {
        alert('Network Error: Failed to connect to server.');
    } finally {
        btn.disabled = false;
        btnSpinner.classList.add('hidden');
        btnText.innerText = '🚀 Submit URLs for Fast Indexing';
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
                    ⏳ Pending...
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

        // CONTINUOUS BACKGROUND VERIFICATION PROBE (Retries every 20s until indexed)
        const checkLiveStatus = async () => {
            const statusCell = document.getElementById(statusCellId);
            if (!statusCell) return; // Cell was removed or DOM changed

            try {
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
                    return; // Live! Stop polling
                }
            } catch (e) {}

            // Keep status pending and schedule next check in 20 seconds
            statusCell.className = "status-pill pending";
            statusCell.style.background = "rgba(234, 179, 8, 0.15)";
            statusCell.style.color = "#fde047";
            statusCell.style.borderColor = "rgba(234, 179, 8, 0.3)";
            statusCell.innerHTML = "⏳ Pending...";

            setTimeout(checkLiveStatus, 20000);
        };

        // Start checking after 3.5 seconds
        setTimeout(checkLiveStatus, 3500);
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
