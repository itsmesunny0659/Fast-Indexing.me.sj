const projectUrls = [
    'https://ai-fast-indexing-engine.vercel.app',
    'https://ai-fast-indexing-engine.vercel.app/sitemap.html',
    'https://ai-fast-indexing-engine.vercel.app/news-sitemap.xml',
    'https://ai-fast-indexing-engine.vercel.app/atom.xml',
    'https://ai-fast-indexing-engine.vercel.app/resident-crawler',
    'https://ai-fast-indexing-engine.vercel.app/cloudflare-worker-template',
    'https://ai-fast-indexing-engine.vercel.app/fui-api/api/indexing/analytics'
];

async function submitSelf() {
    console.log('🚀 Submitting project self-endpoints for indexing...');
    const res = await fetch('https://ai-fast-indexing-engine.vercel.app/fui-api/api/indexing/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: projectUrls })
    });

    const data = await res.json();
    console.log('✅ Submission Response Summary:', data.summary || 'Dispatched');
}

submitSelf().catch(console.error);
