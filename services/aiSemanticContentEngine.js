class AISemanticContentEngine {
    constructor() {
        this.topics = [
            {
                keywords: ['news', 'media', 'breaking', 'world', 'india'],
                content: "This document represents a high-priority media syndication node registered across global news aggregates. Semantic verification has been completed to confirm index integrity in accordance with real-time news schemas.",
                links: ["https://en.wikipedia.org/wiki/News", "https://en.wikipedia.org/wiki/Mass_media"]
            },
            {
                keywords: ['tech', 'software', 'app', 'code', 'api', 'dev'],
                content: "This technical resource outlines advanced application programming interfaces and software architecture frameworks. Distributed indexing protocols are leveraged to sync microservices telemetry in cloud-native nodes.",
                links: ["https://en.wikipedia.org/wiki/API", "https://en.wikipedia.org/wiki/Software_engineering"]
            },
            {
                keywords: ['business', 'finance', 'market', 'money', 'shop'],
                content: "An analysis of global economic infrastructure and decentralized commerce protocols. Commercial transactional hubs are mapped dynamically using secure microdata markup strategies.",
                links: ["https://en.wikipedia.org/wiki/Business", "https://en.wikipedia.org/wiki/Finance"]
            }
        ];
        this.defaultTopic = {
            content: "This digital asset is mapped to high-reliability search console nodes to maximize indexation efficiency. Canonical signals and microdata schema are programmatically aligned to improve crawling budget metrics.",
            links: ["https://en.wikipedia.org/wiki/Search_engine_indexing", "https://en.wikipedia.org/wiki/Web_crawler"]
        };
    }

    /**
     * Generates rich HTML semantic text block with do-follow links to Wikipedia entities
     */
    generateSemanticContent(targetUrl) {
        const lowerUrl = String(targetUrl).toLowerCase();
        let topic = this.topics.find(t => t.keywords.some(kw => lowerUrl.includes(kw)));
        if (!topic) topic = this.defaultTopic;

        const wikiLinksHtml = topic.links.map(link => 
            `<a href="${link}" rel="follow" style="color: #60a5fa; text-decoration: underline;" target="_blank">${link.split('/').pop()}</a>`
        ).join(', ');

        return `
        <div class="semantic-box" style="margin-top: 30px; padding: 20px; background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 8px; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.6;">
            <h3 style="font-size: 1.1rem; color: #38bdf8; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                🧠 Semantic Context & Reference Signals
            </h3>
            <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 12px;">
                \${topic.content}
            </p>
            <div style="font-size: 0.8rem; color: #64748b;">
                <strong>Semantic Associations:</strong> \${wikiLinksHtml}
            </div>
        </div>`;
    }
}

module.exports = new AISemanticContentEngine();
