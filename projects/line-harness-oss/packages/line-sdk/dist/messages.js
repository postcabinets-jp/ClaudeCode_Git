// =============================================================================
// Rich Message Builders — LINE Messaging API message type builders
// =============================================================================
// ── Text Message ────────────────────────────────────────────────────────────
export function textMessage(text) {
    return { type: 'text', text };
}
// ── Image Message ───────────────────────────────────────────────────────────
export function imageMessage(originalContentUrl, previewImageUrl) {
    return {
        type: 'image',
        originalContentUrl,
        previewImageUrl: previewImageUrl || originalContentUrl,
    };
}
// ── Flex Message ────────────────────────────────────────────────────────────
export function flexMessage(altText, contents) {
    return { type: 'flex', altText, contents };
}
export function videoMessage(originalContentUrl, previewImageUrl) {
    return { type: 'video', originalContentUrl, previewImageUrl };
}
export function buttonsTemplate(opts) {
    return {
        type: 'template',
        altText: opts.altText,
        template: {
            type: 'buttons',
            thumbnailImageUrl: opts.thumbnailImageUrl,
            title: opts.title,
            text: opts.text,
            actions: opts.actions,
        },
    };
}
export function confirmTemplate(opts) {
    return {
        type: 'template',
        altText: opts.altText,
        template: {
            type: 'confirm',
            text: opts.text,
            actions: [opts.yesAction, opts.noAction],
        },
    };
}
export function carouselTemplate(altText, columns) {
    return {
        type: 'template',
        altText,
        template: {
            type: 'carousel',
            columns,
        },
    };
}
export function imageMapMessage(opts) {
    return {
        type: 'imagemap',
        baseUrl: opts.baseUrl,
        altText: opts.altText,
        baseSize: opts.baseSize,
        actions: opts.actions,
    };
}
export function quickReply(items) {
    return { items };
}
export function withQuickReply(message, reply) {
    return { ...message, quickReply: reply };
}
export function flexBubble(opts) {
    return { type: 'bubble', ...opts };
}
export function flexCarousel(bubbles) {
    return { type: 'carousel', contents: bubbles };
}
export function flexBox(layout, contents, opts) {
    return { type: 'box', layout, contents, ...opts };
}
export function flexText(text, opts) {
    return { type: 'text', text, ...opts };
}
export function flexImage(url, opts) {
    return { type: 'image', url, ...opts };
}
export function flexButton(action, opts) {
    return { type: 'button', action, ...opts };
}
// ── Receipt / Product Card Helpers ──────────────────────────────────────────
export function productCard(opts) {
    return flexBubble({
        hero: flexImage(opts.imageUrl, {
            size: 'full',
            aspectRatio: '20:13',
            aspectMode: 'cover',
        }),
        body: flexBox('vertical', [
            flexText(opts.name, { weight: 'bold', size: 'lg' }),
            ...(opts.description ? [flexText(opts.description, { size: 'sm', color: '#999999', wrap: true, margin: 'md' })] : []),
            flexText(opts.price, { size: 'xl', weight: 'bold', color: '#06C755', margin: 'md' }),
        ]),
        footer: flexBox('vertical', [
            flexButton({ type: 'uri', label: '詳細を見る', uri: opts.actionUrl }, { style: 'primary', color: '#06C755' }),
        ]),
    });
}
export function receiptMessage(opts) {
    const itemComponents = opts.items.map((item) => flexBox('horizontal', [
        flexText(item.name, { size: 'sm', flex: 3 }),
        flexText(`x${item.quantity}`, { size: 'sm', flex: 1, align: 'end' }),
        flexText(`¥${item.price.toLocaleString()}`, { size: 'sm', flex: 2, align: 'end' }),
    ]));
    return flexBubble({
        body: flexBox('vertical', [
            flexText(opts.storeName, { weight: 'bold', size: 'lg' }),
            { type: 'separator', margin: 'md' },
            flexBox('vertical', itemComponents, { margin: 'md', spacing: 'sm' }),
            { type: 'separator', margin: 'md' },
            flexBox('horizontal', [
                flexText('合計', { weight: 'bold', size: 'md', flex: 3 }),
                flexText(`¥${opts.total.toLocaleString()}`, { weight: 'bold', size: 'md', flex: 2, align: 'end', color: '#06C755' }),
            ], { margin: 'md' }),
        ]),
    });
}
//# sourceMappingURL=messages.js.map