import type { FlexContainer, Message, RichMenuObject, UserProfile } from './types.js';
export declare class LineClient {
    private readonly channelAccessToken;
    constructor(channelAccessToken: string);
    private request;
    getProfile(userId: string): Promise<UserProfile>;
    pushMessage(to: string, messages: Message[]): Promise<void>;
    multicast(to: string[], messages: Message[]): Promise<void>;
    broadcast(messages: Message[]): Promise<void>;
    replyMessage(replyToken: string, messages: Message[]): Promise<void>;
    getRichMenuList(): Promise<{
        richmenus: RichMenuObject[];
    }>;
    createRichMenu(menu: RichMenuObject): Promise<{
        richMenuId: string;
    }>;
    deleteRichMenu(richMenuId: string): Promise<void>;
    setDefaultRichMenu(richMenuId: string): Promise<void>;
    linkRichMenuToUser(userId: string, richMenuId: string): Promise<void>;
    unlinkRichMenuFromUser(userId: string): Promise<void>;
    getRichMenuIdOfUser(userId: string): Promise<{
        richMenuId: string;
    }>;
    pushTextMessage(to: string, text: string): Promise<void>;
    pushFlexMessage(to: string, altText: string, contents: FlexContainer): Promise<void>;
    /** Upload image to a rich menu. Accepts PNG/JPEG binary (ArrayBuffer or Uint8Array). */
    uploadRichMenuImage(richMenuId: string, imageData: ArrayBuffer, contentType?: 'image/png' | 'image/jpeg'): Promise<void>;
}
//# sourceMappingURL=client.d.ts.map