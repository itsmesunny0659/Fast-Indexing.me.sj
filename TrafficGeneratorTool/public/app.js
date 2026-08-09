document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const targetUrlInput = document.getElementById('targetUrl');
    const proxyListInput = document.getElementById('proxyList');
    
    const statusIndicator = document.getElementById('statusIndicator');
    const totalVisitsEl = document.getElementById('totalVisits');
    const successVisitsEl = document.getElementById('successVisits');
    const failedVisitsEl = document.getElementById('failedVisits');

    let statusInterval = null;

    startBtn.addEventListener('click', async () => {
        const url = targetUrlInput.value.trim();
        const proxies = proxyListInput.value.trim();

        if (!url) {
            alert('Please enter a target URL');
            return;
        }

        try {
            startBtn.disabled = true;
            startBtn.textContent = 'Starting...';

            const response = await fetch('/api/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, proxies })
            });

            const data = await response.json();
            
            if (response.ok) {
                updateUIState(true);
                startPollingStatus();
            } else {
                alert('Error: ' + data.error);
                startBtn.disabled = false;
                startBtn.textContent = 'Start Test';
            }
        } catch (error) {
            alert('Failed to connect to server.');
            startBtn.disabled = false;
            startBtn.textContent = 'Start Test';
        }
    });

    stopBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/stop', { method: 'POST' });
            if (response.ok) {
                updateUIState(false);
                stopPollingStatus();
            }
        } catch (error) {
            alert('Failed to stop test.');
        }
    });

    function updateUIState(isRunning) {
        startBtn.disabled = isRunning;
        startBtn.textContent = isRunning ? 'Running...' : 'Start Test';
        stopBtn.disabled = !isRunning;
        targetUrlInput.disabled = isRunning;
        proxyListInput.disabled = isRunning;

        if (isRunning) {
            statusIndicator.classList.add('running');
            statusIndicator.classList.remove('stopped');
        } else {
            statusIndicator.classList.remove('running');
            statusIndicator.classList.add('stopped');
        }
    }

    async function fetchStatus() {
        try {
            const response = await fetch('/api/status');
            const data = await response.json();
            
            updateUIState(data.isRunning);
            
            totalVisitsEl.textContent = data.stats.total;
            successVisitsEl.textContent = data.stats.success;
            failedVisitsEl.textContent = data.stats.failed;
            
        } catch (error) {
            console.error('Error fetching status', error);
        }
    }

    function startPollingStatus() {
        if (!statusInterval) {
            statusInterval = setInterval(fetchStatus, 2000);
        }
    }

    function stopPollingStatus() {
        if (statusInterval) {
            clearInterval(statusInterval);
            statusInterval = null;
        }
        // Do one last fetch
        fetchStatus();
    }

    // Check initial status
    fetchStatus();
});
