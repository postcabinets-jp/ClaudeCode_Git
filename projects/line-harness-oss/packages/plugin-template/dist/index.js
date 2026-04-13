// src/sync.ts
import { LineHarness } from "@line-harness/sdk";

// src/external-api.ts
var BASE_URL = "https://api.myservice.example.com/v1";
var MyServiceClient = class {
  apiKey;
  constructor(apiKey) {
    this.apiKey = apiKey;
  }
  async request(path, init) {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...init?.headers
      }
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`MyService API error ${response.status}: ${text}`);
    }
    return response.json();
  }
  /**
   * List all customers from MyService.
   */
  async listCustomers() {
    return this.request("/customers");
  }
  /**
   * Get a single customer by ID.
   */
  async getCustomer(id) {
    return this.request(`/customers/${id}`);
  }
  /**
   * Get appointments within the next N hours.
   */
  async getUpcomingAppointments(withinHours) {
    return this.request(
      `/appointments?upcoming_hours=${withinHours}`
    );
  }
  /**
   * Get memberships expiring within the next N days.
   */
  async getExpiringMemberships(withinDays) {
    return this.request(
      `/memberships?expiring_within_days=${withinDays}`
    );
  }
};

// src/sync.ts
function createClients(env) {
  const harness = new LineHarness({
    apiUrl: env.LINE_HARNESS_API_URL,
    apiKey: env.LINE_HARNESS_API_KEY,
    lineAccountId: env.LINE_ACCOUNT_ID
  });
  const myService = new MyServiceClient(env.EXTERNAL_API_KEY);
  return { harness, myService };
}
async function syncExternalData(env) {
  const { harness, myService } = createClients(env);
  const customers = await myService.listCustomers();
  const allTags = await harness.tags.list();
  const tagMap = new Map(allTags.map((t) => [t.name, t.id]));
  async function ensureTag(name, color) {
    const existing = tagMap.get(name);
    if (existing) return existing;
    const created = await harness.tags.create({ name, color });
    tagMap.set(name, created.id);
    return created.id;
  }
  const tierTags = {};
  for (const tier of ["free", "basic", "premium"]) {
    tierTags[tier] = await ensureTag(`myservice:${tier}`, "#3B82F6");
  }
  for (const customer of customers) {
    if (!customer.lineUserId) continue;
    try {
      let friend = null;
      let offset = 0;
      const pageSize = 100;
      while (!friend) {
        const page = await harness.friends.list({ limit: pageSize, offset });
        friend = page.items.find(
          (f) => f.metadata?.externalId === customer.id
        ) ?? null;
        if (!page.hasNextPage) break;
        offset += pageSize;
      }
      if (!friend) continue;
      await harness.friends.setMetadata(friend.id, {
        externalId: customer.id,
        myserviceTier: customer.tier,
        myserviceLastVisit: customer.lastVisitDate,
        myserviceVisitCount: customer.visitCount
      });
      const currentTierTagId = tierTags[customer.tier];
      if (currentTierTagId) {
        for (const [tier, tagId] of Object.entries(tierTags)) {
          if (tier !== customer.tier) {
            try {
              await harness.friends.removeTag(friend.id, tagId);
            } catch {
            }
          }
        }
        await harness.friends.addTag(friend.id, currentTierTagId);
      }
      console.log(`[Sync] Updated friend ${friend.id} (${customer.id})`);
    } catch (error) {
      console.error(`[Sync] Failed for customer ${customer.id}:`, error);
    }
  }
  console.log(`[Sync] Completed. Processed ${customers.length} customers.`);
}

// src/notify.ts
import { LineHarness as LineHarness2 } from "@line-harness/sdk";
async function checkAndNotify(env) {
  const harness = new LineHarness2({
    apiUrl: env.LINE_HARNESS_API_URL,
    apiKey: env.LINE_HARNESS_API_KEY,
    lineAccountId: env.LINE_ACCOUNT_ID
  });
  const myService = new MyServiceClient(env.EXTERNAL_API_KEY);
  await sendAppointmentReminders(harness, myService);
  await notifyExpiringMemberships(harness, myService);
}
async function sendAppointmentReminders(harness, myService) {
  const upcoming = await myService.getUpcomingAppointments(24);
  const allTags = await harness.tags.list();
  let reminderTag = allTags.find((t) => t.name === "myservice:appt-reminded");
  if (!reminderTag) {
    reminderTag = await harness.tags.create({ name: "myservice:appt-reminded", color: "#6B7280" });
  }
  for (const appointment of upcoming) {
    if (!appointment.lineHarnessFriendId) continue;
    try {
      const friend = await harness.friends.get(appointment.lineHarnessFriendId);
      if (friend.tags.some((t) => t.name === "myservice:appt-reminded")) {
        console.log(`[Notify] Skipping (already reminded): ${appointment.lineHarnessFriendId}`);
        continue;
      }
      await harness.friends.addTag(appointment.lineHarnessFriendId, reminderTag.id);
      await harness.sendTextToFriend(
        appointment.lineHarnessFriendId,
        `Reminder: you have an appointment tomorrow at ${appointment.time}.

Location: ${appointment.location}
If you need to reschedule, please contact us.`
      );
      console.log(`[Notify] Sent reminder to ${appointment.lineHarnessFriendId}`);
    } catch (error) {
      console.error(`[Notify] Failed to send reminder:`, error);
    }
  }
}
async function notifyExpiringMemberships(harness, myService) {
  const expiring = await myService.getExpiringMemberships(7);
  const allTags = await harness.tags.list();
  let renewalTag = allTags.find((t) => t.name === "myservice:renewal-reminder");
  if (!renewalTag) {
    renewalTag = await harness.tags.create({ name: "myservice:renewal-reminder", color: "#F59E0B" });
  }
  for (const membership of expiring) {
    if (!membership.lineHarnessFriendId) continue;
    try {
      const friend = await harness.friends.get(membership.lineHarnessFriendId);
      if (friend.tags.some((t) => t.name === "myservice:renewal-reminder")) {
        console.log(`[Notify] Skipping (already notified): ${membership.lineHarnessFriendId}`);
        continue;
      }
      await harness.friends.addTag(membership.lineHarnessFriendId, renewalTag.id);
      const flexMessage = JSON.stringify({
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "Membership Expiring Soon",
              weight: "bold",
              size: "lg"
            },
            {
              type: "text",
              text: `Your ${membership.planName} membership expires on ${membership.expiresAt}.`,
              wrap: true,
              margin: "md"
            }
          ]
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              action: {
                type: "uri",
                label: "Renew Now",
                uri: membership.renewUrl
              },
              style: "primary"
            }
          ]
        }
      });
      await harness.sendFlexToFriend(
        membership.lineHarnessFriendId,
        flexMessage
      );
      console.log(`[Notify] Sent renewal reminder to ${membership.lineHarnessFriendId}`);
    } catch (error) {
      console.error(`[Notify] Failed to send renewal reminder:`, error);
    }
  }
}

// src/index.ts
var index_default = {
  /**
   * Cron trigger: runs on the schedule defined in wrangler.toml.
   * Use this for periodic sync and notification checks.
   */
  async scheduled(_controller, env, _ctx) {
    console.log("[MyService Plugin] Cron triggered");
    await syncExternalData(env);
    await checkAndNotify(env);
  },
  /**
   * HTTP handler: use for webhooks from the external service.
   * e.g., MyService sends a webhook when a booking is confirmed.
   */
  async fetch(request, env, _ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok", plugin: "myservice" }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (url.pathname === "/webhook" && request.method === "POST") {
      try {
        const body = await request.json();
        console.log("[MyService Plugin] Webhook received:", JSON.stringify(body));
        return new Response(JSON.stringify({ received: true }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (error) {
        console.error("[MyService Plugin] Webhook error:", error);
        return new Response(JSON.stringify({ error: "Invalid request" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    return new Response("Not Found", { status: 404 });
  }
};
export {
  index_default as default
};
