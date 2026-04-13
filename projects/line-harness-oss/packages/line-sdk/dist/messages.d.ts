import type { Message, FlexContainer } from './types.js';
export declare function textMessage(text: string): Message;
export declare function imageMessage(originalContentUrl: string, previewImageUrl?: string): Message;
export declare function flexMessage(altText: string, contents: FlexContainer): Message;
export interface VideoMessage {
    type: 'video';
    originalContentUrl: string;
    previewImageUrl: string;
}
export declare function videoMessage(originalContentUrl: string, previewImageUrl: string): VideoMessage;
export interface TemplateAction {
    type: 'uri' | 'message' | 'postback';
    label: string;
    uri?: string;
    text?: string;
    data?: string;
}
export interface ButtonsTemplate {
    type: 'template';
    altText: string;
    template: {
        type: 'buttons';
        thumbnailImageUrl?: string;
        title?: string;
        text: string;
        actions: TemplateAction[];
    };
}
export declare function buttonsTemplate(opts: {
    altText: string;
    text: string;
    title?: string;
    thumbnailImageUrl?: string;
    actions: TemplateAction[];
}): ButtonsTemplate;
export interface ConfirmTemplate {
    type: 'template';
    altText: string;
    template: {
        type: 'confirm';
        text: string;
        actions: [TemplateAction, TemplateAction];
    };
}
export declare function confirmTemplate(opts: {
    altText: string;
    text: string;
    yesAction: TemplateAction;
    noAction: TemplateAction;
}): ConfirmTemplate;
export interface CarouselColumn {
    thumbnailImageUrl?: string;
    title?: string;
    text: string;
    actions: TemplateAction[];
}
export interface CarouselTemplate {
    type: 'template';
    altText: string;
    template: {
        type: 'carousel';
        columns: CarouselColumn[];
    };
}
export declare function carouselTemplate(altText: string, columns: CarouselColumn[]): CarouselTemplate;
export interface ImageMapAction {
    type: 'uri' | 'message';
    linkUri?: string;
    text?: string;
    area: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}
export interface ImageMapMessage {
    type: 'imagemap';
    baseUrl: string;
    altText: string;
    baseSize: {
        width: number;
        height: number;
    };
    actions: ImageMapAction[];
}
export declare function imageMapMessage(opts: {
    baseUrl: string;
    altText: string;
    baseSize: {
        width: number;
        height: number;
    };
    actions: ImageMapAction[];
}): ImageMapMessage;
export interface QuickReplyItem {
    type: 'action';
    imageUrl?: string;
    action: TemplateAction;
}
export interface QuickReply {
    items: QuickReplyItem[];
}
export declare function quickReply(items: QuickReplyItem[]): QuickReply;
export declare function withQuickReply<T extends object>(message: T, reply: QuickReply): T & {
    quickReply: QuickReply;
};
export interface FlexBox {
    type: 'box';
    layout: 'horizontal' | 'vertical' | 'baseline';
    contents: FlexComponent[];
    spacing?: string;
    margin?: string;
    paddingAll?: string;
    paddingTop?: string;
    backgroundColor?: string;
    cornerRadius?: string;
    action?: TemplateAction;
}
export interface FlexText {
    type: 'text';
    text: string;
    size?: string;
    weight?: string;
    color?: string;
    wrap?: boolean;
    align?: string;
    flex?: number;
    margin?: string;
    action?: TemplateAction;
}
export interface FlexImage {
    type: 'image';
    url: string;
    size?: string;
    aspectRatio?: string;
    aspectMode?: string;
    action?: TemplateAction;
}
export interface FlexButton {
    type: 'button';
    style?: 'primary' | 'secondary' | 'link';
    color?: string;
    action: TemplateAction;
    height?: string;
    margin?: string;
}
export interface FlexSeparator {
    type: 'separator';
    margin?: string;
    color?: string;
}
export interface FlexSpacer {
    type: 'spacer';
    size?: string;
}
export type FlexComponent = FlexBox | FlexText | FlexImage | FlexButton | FlexSeparator | FlexSpacer;
export interface FlexBubble {
    type: 'bubble';
    size?: string;
    header?: FlexBox;
    hero?: FlexImage;
    body?: FlexBox;
    footer?: FlexBox;
    styles?: Record<string, unknown>;
}
export interface FlexCarousel {
    type: 'carousel';
    contents: FlexBubble[];
}
export declare function flexBubble(opts: {
    size?: string;
    header?: FlexBox;
    hero?: FlexImage;
    body?: FlexBox;
    footer?: FlexBox;
}): FlexBubble;
export declare function flexCarousel(bubbles: FlexBubble[]): FlexCarousel;
export declare function flexBox(layout: 'horizontal' | 'vertical' | 'baseline', contents: FlexComponent[], opts?: Partial<Omit<FlexBox, 'type' | 'layout' | 'contents'>>): FlexBox;
export declare function flexText(text: string, opts?: Partial<Omit<FlexText, 'type' | 'text'>>): FlexText;
export declare function flexImage(url: string, opts?: Partial<Omit<FlexImage, 'type' | 'url'>>): FlexImage;
export declare function flexButton(action: TemplateAction, opts?: Partial<Omit<FlexButton, 'type' | 'action'>>): FlexButton;
export declare function productCard(opts: {
    imageUrl: string;
    name: string;
    price: string;
    description?: string;
    actionUrl: string;
}): FlexBubble;
export declare function receiptMessage(opts: {
    storeName: string;
    items: {
        name: string;
        quantity: number;
        price: number;
    }[];
    total: number;
}): FlexBubble;
//# sourceMappingURL=messages.d.ts.map