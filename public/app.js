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
        const res = await fetch('/fui-api/api/indexing/service-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonKey })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            if (messageDiv) {
                messageDiv.style.display = 'block';
                messageDiv.innerHTML = `<span style="color: #4ade80">✅ Successfully Connected & Verified Google Key: <strong>${data.client_email}</strong></span>`;
            }
            setTimeout(() => {
                closeModal('keyModal');
                refreshStatus();
            }, 1500);
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
    const urls = parseUrlsFromText(text);

    if (urls.length === 0) {
        alert('Please enter at least 1 valid absolute URL (starting with http:// or https://)');
        return;
    }

    const btn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');

    btn.disabled = true;
    btnText.innerText = `Indexing ${urls.length} URLs...`;
    btnSpinner.classList.remove('hidden');

    try {
        const res = await fetch('/fui-api/api/indexing/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls })
        });

        if (res.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        const data = await res.json();

        if (res.ok) {
            renderResults(data);
            refreshStatus();
            updateTotalStats(data.submitted, data.failed);
        } else {
            alert(`Submission Error (${res.status}): ${data.error || 'Failed to submit'}`);
        }
    } catch (error) {
        alert('Network Error: Unable to connect to Indexing Server API.');
    } finally {
        btn.disabled = false;
        btnText.innerText = '🚀 Submit URLs for Fast Indexing';
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

// Render Results Table
function renderResults(data) {
    const resultsSection = document.getElementById('resultsSection');
    const tableBody = document.getElementById('resultsTableBody');

    document.getElementById('batchSubmitted').innerText = data.submitted;
    document.getElementById('batchFailed').innerText = data.failed;
    document.getElementById('batchCreditsUsed').innerText = data.creditsUsed;

    tableBody.innerHTML = '';

    const nowStr = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    data.results.forEach(item => {
        const row = document.createElement('tr');

        const isSuccess = item.status === 'success';
        const targetUrl = item.url;
        const wrapperUrl = item.wrapperUrl || item.url;
        const googleCheckUrl = `https://www.google.com/search?q=site:${encodeURIComponent(wrapperUrl)}`;

        row.innerHTML = `
            <td>
                <div style="font-weight: 500; display: flex; align-items: center; gap: 6px;">
                    <a href="${targetUrl}" target="_blank" rel="noopener" class="url-link">${escapeHtml(targetUrl)}</a>
                    <a href="${targetUrl}" target="_blank" rel="noopener" style="color: var(--text-muted);"><i data-lucide="external-link" style="width:14px; height:14px;"></i></a>
                </div>
                ${item.wrapperUrl ? `
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
                <span class="status-pill success" style="background: rgba(6, 182, 212, 0.15); color: #67e8f9; border-color: rgba(6, 182, 212, 0.3);">
                    ✓ Delivered
                </span>
            </td>
            <td style="color: var(--text-secondary); font-size: 0.85rem; white-space: nowrap;">
                ${nowStr}
            </td>
            <td>
                <a href="${googleCheckUrl}" target="_blank" rel="noopener" class="google-inspect-btn" title="Check Google Indexing">
                    Google Check <i data-lucide="external-link" style="width:12px; height:12px;"></i>
                </a>
            </td>
        `;

        tableBody.appendChild(row);
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
