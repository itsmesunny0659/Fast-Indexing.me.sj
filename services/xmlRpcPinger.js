const fetch = require('node-fetch');

class XmlRpcPinger {
    constructor() {
        this.pingEndpoints = [
            'http://rpc.pingomatic.com/',
            'http://ping.blogs.yandex.ru/RPC2',
            'http://blogsearch.google.com/ping/RPC2'
        ];
    }

    async ping(title, url) {
        console.log(`📣 [XmlRpcPinger] Blasting XML-RPC pings for: ${url}`);
        
        const xmlPayload = `<?xml version="1.0"?>
<methodCall>
  <methodName>weblogUpdates.ping</methodName>
  <params>
    <param>
      <value><string>${title}</string></value>
    </param>
    <param>
      <value><string>${url}</string></value>
    </param>
  </params>
</methodCall>`;

        const promises = this.pingEndpoints.map(async (endpoint) => {
            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/xml',
                        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
                    },
                    body: xmlPayload,
                    timeout: 5000
                });
                return { endpoint, ok: res.ok };
            } catch (e) {
                return { endpoint, ok: false };
            }
        });

        const results = await Promise.allSettled(promises);
        let successCount = 0;
        
        results.forEach(r => {
            if (r.status === 'fulfilled' && r.value.ok) successCount++;
        });

        console.log(`✅ [XmlRpcPinger] Successfully hit ${successCount}/${this.pingEndpoints.length} RPC aggregators.`);
        return successCount > 0;
    }
}

module.exports = new XmlRpcPinger();
