class AISemanticContentEngine {
    constructor() {
        this.topics = [
            {
                keywords: ['news', 'media', 'breaking', 'world', 'india', 'latest'],
                content: "BREAKING NEWS ALERT: This is a verified live broadcast syndicate node covering the most recent developments. Real-time updates are being pushed globally.",
                links: ["https://en.wikipedia.org/wiki/Breaking_news", "https://en.wikipedia.org/wiki/News_broadcasting"]
            },
            {
                keywords: ['tech', 'software', 'app', 'code', 'api', 'dev'],
                content: "TECH EXCLUSIVE: Breaking developments in global technology infrastructure and cloud ecosystems. Urgent market update broadcast live.",
                links: ["https://en.wikipedia.org/wiki/Technology_journalism", "https://en.wikipedia.org/wiki/Software_industry"]
            },
            {
                keywords: ['business', 'finance', 'market', 'money', 'shop'],
                content: "MARKET ALERT: Urgent financial market analysis and decentralized commerce breaking update. Live broadcast tracking active market conditions.",
                links: ["https://en.wikipedia.org/wiki/Financial_journalism", "https://en.wikipedia.org/wiki/Global_financial_system"]
            }
        ];
        this.defaultTopic = {
            content: "URGENT PUBLIC BULLETIN: This live broadcast syndication hub contains breaking public interest developments. Crawl nodes are prioritized for instant real-time indexation.",
            links: ["https://en.wikipedia.org/wiki/News_agency", "https://en.wikipedia.org/wiki/Press_release"]
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
        <div class="semantic-box" style="margin-top: 30px; padding: 20px; background: #fffcfc; border: 2px solid #ff0000; border-radius: 4px; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.6; box-shadow: 0 4px 12px rgba(255,0,0,0.1);">
            <h3 style="font-size: 1.2rem; color: #cc0000; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; font-weight: bold;">
                🚨 LIVE: BREAKING NEWS UPDATE
            </h3>
            <p style="color: #111; font-size: 0.95rem; margin-bottom: 12px; font-weight: 500;">
                ${topic.content}
            </p>
            <div style="font-size: 0.8rem; color: #555; padding-top: 10px; border-top: 1px solid #eee;">
                <strong>Source References:</strong> ${wikiLinksHtml}
            </div>
        </div>`;
    }
}

module.exports = new AISemanticContentEngine();
