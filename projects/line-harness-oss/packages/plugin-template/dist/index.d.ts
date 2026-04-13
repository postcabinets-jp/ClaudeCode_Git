/**
 * LINE Harness Plugin: MyService
 *
 * Cloudflare Worker that syncs data from MyService → LINE Harness
 * and sends notifications based on external conditions.
 *
 * Replace "MyService" with your actual service name throughout this template.
 */
interface Env {
    LINE_HARNESS_API_URL: string;
    LINE_HARNESS_API_KEY: string;
    EXTERNAL_API_KEY: string;
    LINE_ACCOUNT_ID?: string;
}
declare const _default: {
    /**
     * Cron trigger: runs on the schedule defined in wrangler.toml.
     * Use this for periodic sync and notification checks.
     */
    scheduled(_controller: ScheduledController, env: Env, _ctx: ExecutionContext): Promise<void>;
    /**
     * HTTP handler: use for webhooks from the external service.
     * e.g., MyService sends a webhook when a booking is confirmed.
     */
    fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response>;
};

export { type Env, _default as default };
