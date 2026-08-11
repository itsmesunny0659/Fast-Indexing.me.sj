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
    console.log('🚀 Authenticating local session...');
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: "sj7835860705@gmail.com",
            password: "@Support9267"
        })
    });

    if (!loginRes.ok) {
        throw new Error('Authentication failed');
    }

    const cookieHeader = loginRes.headers.get('set-cookie');
    
    console.log('🚀 Submitting project self-endpoints for indexing...');
    const res = await fetch('http://localhost:3000/fui-api/api/indexing/submit', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Cookie': cookieHeader
        },
        body: JSON.stringify({ urls: projectUrls })
    });

    const data = await res.json();
    console.log('✅ Submission Response Summary:', data);
}

submitSelf().catch(console.error);
