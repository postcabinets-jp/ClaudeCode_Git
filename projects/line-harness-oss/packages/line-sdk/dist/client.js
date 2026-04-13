const LINE_API_BASE = 'https://api.line.me/v2/bot';
export class LineClient {
    channelAccessToken;
    constructor(channelAccessToken) {
        this.channelAccessToken = channelAccessToken;
    }
    // ─── Core request helper ──────────────────────────────────────────────────
    async request(path, body, method = 'POST') {
        const url = `${LINE_API_BASE}${path}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.channelAccessToken}`,
            },
        };
        if (method !== 'GET' && method !== 'DELETE') {
            options.body = JSON.stringify(body);
        }
        const res = await fetch(url, options);
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`LINE API error: ${res.status} ${res.statusText} — ${text}`);
        }
        // Some endpoints (e.g. push, reply) return an empty body with 200.
        const contentType = res.headers.get('content-type') ?? '';
        if (contentType.includes('application/json')) {
            return res.json();
        }
        return undefined;
    }
    // ─── Profile ──────────────────────────────────────────────────────────────
    async getProfile(userId) {
        return this.request(`/profile/${encodeURIComponent(userId)}`, {}, 'GET');
    }
    // ─── Messaging ───────────────────────────────────────────────────────────
    async pushMessage(to, messages) {
        const body = { to, messages };
        await this.request('/message/push', body);
    }
    async multicast(to, messages) {
        const body = { to, messages };
        await this.request('/message/multicast', body);
    }
    async broadcast(messages) {
        const body = { messages };
        await this.request('/message/broadcast', body);
    }
    async replyMessage(replyToken, messages) {
        const body = { replyToken, messages };
        await this.request('/message/reply', body);
    }
    // ─── Rich Menu ────────────────────────────────────────────────────────────
    async getRichMenuList() {
        return this.request('/richmenu/list', {}, 'GET');
    }
    async createRichMenu(menu) {
        return this.request('/richmenu', menu);
    }
    async deleteRichMenu(richMenuId) {
        await this.request(`/richmenu/${encodeURIComponent(richMenuId)}`, {}, 'DELETE');
    }
    async setDefaultRichMenu(richMenuId) {
        await this.request(`/user/all/richmenu/${encodeURIComponent(richMenuId)}`, {});
    }
    async linkRichMenuToUser(userId, richMenuId) {
        await this.request(`/user/${encodeURIComponent(userId)}/richmenu/${encodeURIComponent(richMenuId)}`, {});
    }
    async unlinkRichMenuFromUser(userId) {
        await this.request(`/user/${encodeURIComponent(userId)}/richmenu`, {}, 'DELETE');
    }
    async getRichMenuIdOfUser(userId) {
        return this.request(`/user/${encodeURIComponent(userId)}/richmenu`, {}, 'GET');
    }
    // ─── Helpers ──────────────────────────────────────────────────────────────
    async pushTextMessage(to, text) {
        await this.pushMessage(to, [{ type: 'text', text }]);
    }
    async pushFlexMessage(to, altText, contents) {
        await this.pushMessage(to, [{ type: 'flex', altText, contents }]);
    }
    // ─── Rich Menu Image Upload ─────────────────────────────────────────────
    /** Upload image to a rich menu. Accepts PNG/JPEG binary (ArrayBuffer or Uint8Array). */
    async uploadRichMenuImage(richMenuId, imageData, contentType = 'image/png') {
        const url = `https://api-data.line.me/v2/bot/richmenu/${encodeURIComponent(richMenuId)}/content`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': contentType,
                Authorization: `Bearer ${this.channelAccessToken}`,
            },
            body: imageData,
        });
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`LINE API error: ${res.status} ${res.statusText} — ${text}`);
        }
    }
}
//# sourceMappingURL=client.js.map