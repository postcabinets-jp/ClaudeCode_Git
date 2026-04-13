#!/usr/bin/env node

// src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// src/tools/send-message.ts
import { z } from "zod";

// src/client.ts
import { LineHarness } from "@line-harness/sdk";
var clientInstance = null;
function getClient() {
  if (clientInstance) return clientInstance;
  const apiUrl = process.env.LINE_HARNESS_API_URL;
  const apiKey = process.env.LINE_HARNESS_API_KEY;
  const accountId = process.env.LINE_HARNESS_ACCOUNT_ID;
  if (!apiUrl) {
    throw new Error("LINE_HARNESS_API_URL environment variable is required");
  }
  if (!apiKey) {
    throw new Error("LINE_HARNESS_API_KEY environment variable is required");
  }
  clientInstance = new LineHarness({
    apiUrl,
    apiKey,
    lineAccountId: accountId
  });
  return clientInstance;
}

// src/tools/auto-track-urls.ts
async function autoTrackUrls(client, messageContent, messageType, title) {
  if (messageType !== "flex") {
    return { content: messageContent, trackedUrls: [] };
  }
  let parsed;
  try {
    parsed = JSON.parse(messageContent);
  } catch {
    return { content: messageContent, trackedUrls: [] };
  }
  const urlMap = /* @__PURE__ */ new Map();
  collectUris(parsed, urlMap);
  if (urlMap.size === 0) {
    return { content: messageContent, trackedUrls: [] };
  }
  const trackedUrls = [];
  for (const originalUrl of urlMap.keys()) {
    try {
      const link = await client.trackedLinks.create({
        name: `${title} \u2014 ${truncate(originalUrl, 50)}`,
        originalUrl
      });
      urlMap.set(originalUrl, link.trackingUrl);
      trackedUrls.push({ original: originalUrl, tracking: link.trackingUrl });
    } catch {
    }
  }
  replaceUris(parsed, urlMap);
  return {
    content: JSON.stringify(parsed),
    trackedUrls
  };
}
function collectUris(obj, urlMap) {
  if (obj === null || obj === void 0 || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      collectUris(item, urlMap);
    }
    return;
  }
  const record = obj;
  if (record.type === "uri" && typeof record.uri === "string") {
    const uri = record.uri;
    if (uri.startsWith("http://") || uri.startsWith("https://")) {
      if (!urlMap.has(uri)) {
        urlMap.set(uri, uri);
      }
    }
  }
  for (const value of Object.values(record)) {
    collectUris(value, urlMap);
  }
}
function replaceUris(obj, urlMap) {
  if (obj === null || obj === void 0 || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      replaceUris(item, urlMap);
    }
    return;
  }
  const record = obj;
  if (record.type === "uri" && typeof record.uri === "string") {
    const tracked = urlMap.get(record.uri);
    if (tracked && tracked !== record.uri) {
      record.uri = tracked;
    }
  }
  for (const value of Object.values(record)) {
    replaceUris(value, urlMap);
  }
}
function truncate(str, max) {
  return str.length > max ? str.slice(0, max) + "\u2026" : str;
}

// src/tools/send-message.ts
function registerSendMessage(server2) {
  server2.tool(
    "send_message",
    "Send a text, image, or flex message to a specific friend. Use messageType 'image' for standalone image messages, 'flex' for rich card layouts.",
    {
      friendId: z.string().describe("The friend's ID to send the message to"),
      content: z.string().describe(
        "Message content. For text: plain string. For image: JSON string with originalContentUrl and previewImageUrl (both HTTPS URLs). For flex: JSON string of LINE Flex Message."
      ),
      messageType: z.enum(["text", "image", "flex"]).default("text").describe(
        "Message type: 'text' for plain text, 'image' for standalone image, 'flex' for Flex Message JSON"
      ),
      altText: z.string().optional().describe(
        "Custom notification preview text for Flex Messages (shown on lock screen). If omitted, auto-extracted from Flex content."
      )
    },
    async ({ friendId, content, messageType, altText }) => {
      try {
        const client = getClient();
        const { content: trackedContent } = await autoTrackUrls(
          client,
          content,
          messageType,
          `DM to ${friendId.slice(0, 8)}`
        );
        const result = await client.friends.sendMessage(
          friendId,
          trackedContent,
          messageType,
          altText
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: true, messageId: result.messageId },
                null,
                2
              )
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: String(error) },
                null,
                2
              )
            }
          ],
          isError: true
        };
      }
    }
  );
}

// src/tools/broadcast.ts
import { z as z2 } from "zod";
function registerBroadcast(server2) {
  server2.tool(
    "broadcast",
    "Send a broadcast message to all friends, a specific tag group, or a filtered segment. Creates and immediately sends the broadcast.",
    {
      title: z2.string().describe("Internal title for this broadcast (not shown to users)"),
      messageType: z2.enum(["text", "flex"]).describe("Message type"),
      messageContent: z2.string().describe(
        "Message content. For text: plain string. For flex: JSON string."
      ),
      targetType: z2.enum(["all", "tag", "segment"]).default("all").describe(
        "Target audience: 'all' for everyone, 'tag' for a tag group, 'segment' for filtered conditions"
      ),
      targetTagId: z2.string().optional().describe("Tag ID when targetType is 'tag'"),
      segmentConditions: z2.string().optional().describe(
        "JSON string of segment conditions when targetType is 'segment'. Format: { operator: 'AND'|'OR', rules: [{ type: 'tag_exists'|'tag_not_exists'|'metadata_equals'|'metadata_not_equals'|'ref_code'|'is_following', value: string|boolean|{key,value} }] }"
      ),
      scheduledAt: z2.string().optional().describe("ISO 8601 datetime to schedule. Omit to send immediately."),
      altText: z2.string().optional().describe(
        "Custom notification preview text for Flex Messages (shown on lock screen). If omitted, auto-extracted from Flex content."
      ),
      accountId: z2.string().optional().describe("LINE account ID (uses default if omitted)")
    },
    async ({
      title,
      messageType,
      messageContent,
      targetType,
      targetTagId,
      segmentConditions,
      scheduledAt,
      altText,
      accountId
    }) => {
      try {
        const client = getClient();
        if (targetType === "segment" && !segmentConditions) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: false,
                    error: "segmentConditions is required when targetType is 'segment'"
                  },
                  null,
                  2
                )
              }
            ],
            isError: true
          };
        }
        if (targetType === "segment" && scheduledAt) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: false,
                    error: "Scheduled segment broadcasts are not supported. Use scheduledAt only with targetType 'all' or 'tag'."
                  },
                  null,
                  2
                )
              }
            ],
            isError: true
          };
        }
        if (targetType === "segment" && segmentConditions) {
          let parsedConditions;
          try {
            parsedConditions = JSON.parse(segmentConditions);
          } catch {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: false,
                      error: "segmentConditions must be valid JSON"
                    },
                    null,
                    2
                  )
                }
              ],
              isError: true
            };
          }
          const { content: trackedContent2 } = await autoTrackUrls(
            client,
            messageContent,
            messageType,
            title
          );
          const broadcast2 = await client.broadcasts.create({
            title: `[SEGMENT] ${title}`,
            messageType,
            messageContent: trackedContent2,
            targetType: "all",
            lineAccountId: accountId,
            altText
          });
          try {
            const result2 = await client.broadcasts.sendToSegment(
              broadcast2.id,
              parsedConditions
            );
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    { success: true, broadcast: result2 },
                    null,
                    2
                  )
                }
              ]
            };
          } catch (sendError) {
            await client.broadcasts.delete(broadcast2.id).catch(() => {
            });
            throw sendError;
          }
        }
        const { content: trackedContent, trackedUrls } = await autoTrackUrls(
          client,
          messageContent,
          messageType,
          title
        );
        const broadcast = await client.broadcasts.create({
          title,
          messageType,
          messageContent: trackedContent,
          targetType,
          targetTagId,
          scheduledAt,
          lineAccountId: accountId,
          altText
        });
        const result = scheduledAt ? broadcast : await client.broadcasts.send(broadcast.id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: true, broadcast: result },
                null,
                2
              )
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: String(error) },
                null,
                2
              )
            }
          ],
          isError: true
        };
      }
    }
  );
}

// src/tools/create-scenario.ts
import { z as z3 } from "zod";
import { parseDelay } from "@line-harness/sdk";
function registerCreateScenario(server2) {
  server2.tool(
    "create_scenario",
    "Create a step delivery scenario with multiple message steps. Each step has a delay and message content. Scenarios auto-trigger on friend_add, tag_added, or manual enrollment.",
    {
      name: z3.string().describe("Scenario name"),
      triggerType: z3.enum(["friend_add", "tag_added", "manual"]).describe(
        "When to start: 'friend_add' on new friends, 'tag_added' when a tag is applied, 'manual' for explicit enrollment"
      ),
      triggerTagId: z3.string().optional().describe(
        "Required when triggerType is 'tag_added': the tag ID that triggers this scenario"
      ),
      steps: z3.array(
        z3.object({
          delay: z3.string().describe(
            "Delay before sending. Format: '0m' for immediate, '30m' for 30 minutes, '24h' for 24 hours"
          ),
          type: z3.enum(["text", "flex"]).describe("Message type"),
          content: z3.string().describe("Message content")
        })
      ).describe("Ordered list of message steps"),
      accountId: z3.string().optional().describe("LINE account ID (uses default if omitted)")
    },
    async ({ name, triggerType, triggerTagId, steps, accountId }) => {
      try {
        if (triggerType === "tag_added" && !triggerTagId) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: false,
                    error: "triggerTagId is required when triggerType is 'tag_added'"
                  },
                  null,
                  2
                )
              }
            ],
            isError: true
          };
        }
        const parsedSteps = [];
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          let delayMinutes;
          try {
            delayMinutes = parseDelay(step.delay);
          } catch {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: false,
                      error: `Invalid delay format at step ${i + 1}: "${step.delay}". Use formats like '0m', '30m', '24h'.`
                    },
                    null,
                    2
                  )
                }
              ],
              isError: true
            };
          }
          parsedSteps.push({
            delayMinutes,
            type: step.type,
            content: step.content
          });
        }
        const client = getClient();
        const scenario = await client.scenarios.create({
          name,
          triggerType,
          triggerTagId,
          lineAccountId: accountId
        });
        try {
          for (let i = 0; i < parsedSteps.length; i++) {
            const step = parsedSteps[i];
            await client.scenarios.addStep(scenario.id, {
              stepOrder: i + 1,
              delayMinutes: step.delayMinutes,
              messageType: step.type,
              messageContent: step.content
            });
          }
        } catch (stepError) {
          await client.scenarios.delete(scenario.id).catch(() => {
          });
          throw stepError;
        }
        const scenarioWithSteps = await client.scenarios.get(scenario.id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: true, scenario: scenarioWithSteps },
                null,
                2
              )
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: String(error) },
                null,
                2
              )
            }
          ],
          isError: true
        };
      }
    }
  );
}

// src/tools/enroll-scenario.ts
import { z as z4 } from "zod";
function registerEnrollScenario(server2) {
  server2.tool(
    "enroll_in_scenario",
    "Enroll a friend into a scenario. The friend will start receiving the scenario's step messages from step 1.",
    {
      scenarioId: z4.string().describe("The scenario ID to enroll the friend in"),
      friendId: z4.string().describe("The friend's ID to enroll")
    },
    async ({ scenarioId, friendId }) => {
      try {
        const client = getClient();
        const enrollment = await client.scenarios.enroll(scenarioId, friendId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: true, enrollment },
                null,
                2
              )
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: String(error) },
                null,
                2
              )
            }
          ],
          isError: true
        };
      }
    }
  );
}

// src/tools/manage-tags.ts
import { z as z5 } from "zod";
function registerManageTags(server2) {
  server2.tool(
    "manage_tags",
    "List, create, or delete tags, and add/remove tags to/from friends. Supports batch operations on multiple friends.",
    {
      action: z5.enum(["list", "create", "delete", "add", "remove"]).describe("Action to perform"),
      tagName: z5.string().optional().describe("Tag name (for 'create' action)"),
      tagColor: z5.string().optional().describe("Tag color hex code (for 'create' action, e.g. '#FF0000')"),
      tagId: z5.string().optional().describe("Tag ID (for 'add' or 'remove' actions)"),
      friendIds: z5.array(z5.string()).optional().describe(
        "Friend IDs to add/remove the tag from (for 'add' or 'remove' actions)"
      )
    },
    async ({ action, tagName, tagColor, tagId, friendIds }) => {
      try {
        const client = getClient();
        if (action === "list") {
          const tags = await client.tags.list();
          return {
            content: [{ type: "text", text: JSON.stringify({ success: true, tags }, null, 2) }]
          };
        }
        if (action === "delete") {
          if (!tagId) throw new Error("tagId is required for delete action");
          await client.tags.delete(tagId);
          return {
            content: [{ type: "text", text: JSON.stringify({ success: true, deleted: tagId }, null, 2) }]
          };
        }
        if (action === "create") {
          if (!tagName) throw new Error("tagName is required for create action");
          const tag = await client.tags.create({
            name: tagName,
            color: tagColor
          });
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ success: true, tag }, null, 2)
              }
            ]
          };
        }
        if (!tagId)
          throw new Error("tagId is required for add/remove actions");
        if (!friendIds?.length)
          throw new Error("friendIds is required for add/remove actions");
        const results = [];
        for (const friendId of friendIds) {
          if (action === "add") {
            await client.friends.addTag(friendId, tagId);
          } else {
            await client.friends.removeTag(friendId, tagId);
          }
          results.push({ friendId, status: "ok" });
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, results }, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: String(error) },
                null,
                2
              )
            }
          ],
          isError: true
        };
      }
    }
  );
}

// src/tools/create-form.ts
import { z as z6 } from "zod";
function registerCreateForm(server2) {
  server2.tool(
    "create_form",
    "Create a form for collecting user responses. Can auto-tag responders and enroll them in scenarios.",
    {
      name: z6.string().describe("Form name"),
      description: z6.string().optional().describe("Form description shown to users"),
      fields: z6.string().describe(
        "JSON string of form fields. Format: [{ name: string, label: string, type: 'text'|'email'|'tel'|'number'|'textarea'|'select'|'radio'|'checkbox'|'date', required?: boolean, options?: string[], placeholder?: string }]"
      ),
      onSubmitTagId: z6.string().optional().describe("Tag ID to auto-apply when form is submitted"),
      onSubmitScenarioId: z6.string().optional().describe("Scenario ID to auto-enroll when form is submitted"),
      saveToMetadata: z6.boolean().default(true).describe("Save form responses to friend metadata"),
      accountId: z6.string().optional().describe("LINE account ID (uses default if omitted)")
    },
    async ({
      name,
      description,
      fields,
      onSubmitTagId,
      onSubmitScenarioId,
      saveToMetadata
    }) => {
      try {
        const client = getClient();
        const form = await client.forms.create({
          name,
          description,
          fields: JSON.parse(fields),
          onSubmitTagId,
          onSubmitScenarioId,
          saveToMetadata
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, form }, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: String(error) },
                null,
                2
              )
            }
          ],
          isError: true
        };
      }
    }
  );
}

// src/tools/create-tracked-link.ts
import { z as z7 } from "zod";
function registerCreateTrackedLink(server2) {
  server2.tool(
    "create_tracked_link",
    "Create a click-tracking link. When clicked, can auto-tag the user and enroll them in a scenario.",
    {
      name: z7.string().describe("Link name (internal label)"),
      originalUrl: z7.string().describe("The destination URL to redirect to"),
      tagId: z7.string().optional().describe("Tag ID to auto-apply on click"),
      scenarioId: z7.string().optional().describe("Scenario ID to auto-enroll on click")
    },
    async ({ name, originalUrl, tagId, scenarioId }) => {
      try {
        const client = getClient();
        const link = await client.trackedLinks.create({
          name,
          originalUrl,
          tagId,
          scenarioId
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, link }, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: String(error) },
                null,
                2
              )
            }
          ],
          isError: true
        };
      }
    }
  );
}

// src/tools/create-rich-menu.ts
import { z as z8 } from "zod";
function registerCreateRichMenu(server2) {
  server2.tool(
    "create_rich_menu",
    "Create a LINE rich menu with optional image upload. Provide imageData (base64) to attach the menu image in one step.",
    {
      name: z8.string().describe("Rich menu name"),
      chatBarText: z8.string().default("\u30E1\u30CB\u30E5\u30FC").describe("Text shown on the chat bar button"),
      size: z8.object({
        width: z8.number().default(2500).describe("Menu width in pixels (2500 for full-width)"),
        height: z8.number().default(1686).describe("Menu height: 1686 for full, 843 for half")
      }).default({ width: 2500, height: 1686 }).describe("Menu size in pixels"),
      selected: z8.boolean().default(false).describe("Whether the rich menu is displayed by default"),
      areas: z8.string().describe(
        "JSON string of menu button areas. Format: [{ bounds: { x, y, width, height }, action: { type: 'uri'|'message'|'postback', uri?, text?, data? } }]"
      ),
      imageData: z8.string().optional().describe("Base64-encoded image data for the rich menu (PNG or JPEG, 2500x1686 or 2500x843)"),
      imageContentType: z8.enum(["image/png", "image/jpeg"]).default("image/jpeg").describe("Image MIME type"),
      setAsDefault: z8.boolean().default(false).describe("Set this as the default rich menu for all friends")
    },
    async ({ name, chatBarText, size, selected, areas, imageData, imageContentType, setAsDefault }) => {
      try {
        const client = getClient();
        const menu = await client.richMenus.create({
          name,
          chatBarText,
          size,
          selected,
          areas: JSON.parse(areas)
        });
        if (imageData) {
          await client.richMenus.uploadImage(menu.richMenuId, imageData, imageContentType);
        }
        if (setAsDefault) {
          await client.richMenus.setDefault(menu.richMenuId);
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  richMenuId: menu.richMenuId,
                  imageUploaded: !!imageData,
                  isDefault: setAsDefault
                },
                null,
                2
              )
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: String(error) },
                null,
                2
              )
            }
          ],
          isError: true
        };
      }
    }
  );
}

// src/tools/list-friends.ts
import { z as z9 } from "zod";
function registerListFriends(server2) {
  server2.tool(
    "list_friends",
    "List friends with optional filtering by tag, name search, or metadata values. Returns paginated results with friend details.",
    {
      search: z9.string().optional().describe("Search friends by display name (partial match)"),
      tagId: z9.string().optional().describe("Filter by tag ID"),
      metadataFilter: z9.string().optional().describe(`JSON string of metadata filters. e.g. '{"monthly_cost": "\u301C100\u4E07\u5186", "business_type": "EC\u30FB\u7269\u8CA9"}'`),
      limit: z9.number().default(20).describe("Number of friends to return (max 100)"),
      offset: z9.number().default(0).describe("Offset for pagination"),
      accountId: z9.string().optional().describe("LINE account ID (uses default if omitted)")
    },
    async ({ search, tagId, metadataFilter, limit, offset, accountId }) => {
      try {
        const client = getClient();
        const metadata = metadataFilter ? JSON.parse(metadataFilter) : void 0;
        const result = await client.friends.list({
          search,
          tagId,
          metadata,
          limit,
          offset,
          accountId
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  total: result.total,
                  hasNextPage: result.hasNextPage,
                  friends: result.items
                },
                null,
                2
              )
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: String(error) },
                null,
                2
              )
            }
          ],
          isError: true
        };
      }
    }
  );
}

// src/tools/get-friend-detail.ts
import { z as z10 } from "zod";
function registerGetFriendDetail(server2) {
  server2.tool(
    "get_friend_detail",
    "Get detailed information about a specific friend including tags, metadata, and profile.",
    {
      friendId: z10.string().describe("The friend's ID")
    },
    async ({ friendId }) => {
      try {
        const client = getClient();
        const friend = await client.friends.get(friendId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, friend }, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: String(error) },
                null,
                2
              )
            }
          ],
          isError: true
        };
      }
    }
  );
}

// src/tools/get-form-submissions.ts
import { z as z11 } from "zod";
function registerGetFormSubmissions(server2) {
  server2.tool(
    "get_form_submissions",
    "Get all submissions for a specific form. Returns response data with timestamps and friend IDs.",
    {
      formId: z11.string().describe("The form ID to get submissions for")
    },
    async ({ formId }) => {
      try {
        const client = getClient();
        const submissions = await client.forms.getSubmissions(formId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: true, submissions },
                null,
                2
              )
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: String(error) },
                null,
                2
              )
            }
          ],
          isError: true
        };
      }
    }
  );
}

// src/tools/get-link-clicks.ts
import { z as z12 } from "zod";
function registerGetLinkClicks(server2) {
  server2.tool(
    "get_link_clicks",
    "Get click analytics for a tracked link including total clicks and per-friend click history.",
    {
      linkId: z12.string().describe("The tracked link ID")
    },
    async ({ linkId }) => {
      try {
        const client = getClient();
        const link = await client.trackedLinks.get(linkId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, link }, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: String(error) },
                null,
                2
              )
            }
          ],
          isError: true
        };
      }
    }
  );
}

// src/tools/account-summary.ts
import { z as z13 } from "zod";
function registerAccountSummary(server2) {
  server2.tool(
    "account_summary",
    "Get a high-level summary of the LINE account: friend count per account (DB + LINE API stats), active scenarios, recent broadcasts, tags, and forms. Use this to understand the current state before making changes.",
    {
      accountId: z13.string().optional().describe("LINE account ID (uses default if omitted)")
    },
    async ({ accountId }) => {
      try {
        const client = getClient();
        const apiUrl = process.env.LINE_HARNESS_API_URL;
        const apiKey = process.env.LINE_HARNESS_API_KEY;
        const accountsRes = await fetch(`${apiUrl}/api/line-accounts`, {
          headers: { Authorization: `Bearer ${apiKey}` }
        });
        const accountsData = await accountsRes.json();
        const accounts = accountsData.success ? accountsData.data : [];
        const accountStats = [];
        for (const acc of accounts) {
          const countRes = await fetch(
            `${apiUrl}/api/friends/count?lineAccountId=${encodeURIComponent(acc.id)}`,
            { headers: { Authorization: `Bearer ${apiKey}` } }
          );
          const countData = await countRes.json();
          const count = countData.success ? countData.data.count : 0;
          accountStats.push({
            id: acc.id,
            name: acc.name,
            channelId: acc.channelId,
            friendsInDb: count
          });
        }
        for (const acc of accountStats) {
          try {
            const healthRes = await fetch(
              `${apiUrl}/api/accounts/${acc.id}/health`,
              { headers: { Authorization: `Bearer ${apiKey}` } }
            );
            const healthData = await healthRes.json();
            if (healthData.success) {
              acc.riskLevel = healthData.data.riskLevel;
            }
          } catch {
          }
        }
        const [totalFriends, scenarios, broadcasts, tags, forms] = await Promise.all([
          client.friends.count(),
          client.scenarios.list({ accountId }),
          client.broadcasts.list({ accountId }),
          client.tags.list(),
          client.forms.list()
        ]);
        const activeScenarios = scenarios.filter(
          (s) => s.isActive
        );
        const recentBroadcasts = broadcasts.slice(0, 5);
        const summary = {
          friends: {
            totalDbRecords: totalFriends,
            note: "totalDbRecords includes both Account \u2460 and \u2461 records. Same user on different accounts = separate records. Use per-account counts below for accurate numbers.",
            perAccount: accountStats
          },
          scenarios: {
            total: scenarios.length,
            active: activeScenarios.length,
            activeList: activeScenarios.map(
              (s) => ({
                id: s.id,
                name: s.name,
                triggerType: s.triggerType
              })
            )
          },
          broadcasts: {
            total: broadcasts.length,
            recent: recentBroadcasts.map(
              (b) => ({
                id: b.id,
                title: b.title,
                status: b.status,
                sentAt: b.sentAt
              })
            )
          },
          tags: {
            total: tags.length,
            list: tags.map((t) => ({
              id: t.id,
              name: t.name
            }))
          },
          forms: {
            total: forms.length,
            list: forms.map(
              (f) => ({
                id: f.id,
                name: f.name,
                submitCount: f.submitCount
              })
            )
          }
        };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(summary, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: String(error) },
                null,
                2
              )
            }
          ],
          isError: true
        };
      }
    }
  );
}

// src/tools/list-crm-objects.ts
import { z as z14 } from "zod";
function registerListCrmObjects(server2) {
  server2.tool(
    "list_crm_objects",
    "List all CRM objects of a specific type: scenarios, forms, tags, rich menus, tracked links, or broadcasts.",
    {
      objectType: z14.enum([
        "scenarios",
        "forms",
        "tags",
        "rich_menus",
        "tracked_links",
        "broadcasts"
      ]).describe("Type of CRM object to list"),
      accountId: z14.string().optional().describe("LINE account ID (uses default if omitted)")
    },
    async ({ objectType, accountId }) => {
      try {
        const client = getClient();
        let items;
        switch (objectType) {
          case "scenarios":
            items = await client.scenarios.list({ accountId });
            break;
          case "forms":
            items = await client.forms.list();
            break;
          case "tags":
            items = await client.tags.list();
            break;
          case "rich_menus":
            items = await client.richMenus.list();
            break;
          case "tracked_links":
            items = await client.trackedLinks.list();
            break;
          case "broadcasts":
            items = await client.broadcasts.list({ accountId });
            break;
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: true, objectType, items },
                null,
                2
              )
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: String(error) },
                null,
                2
              )
            }
          ],
          isError: true
        };
      }
    }
  );
}

// src/tools/manage-ad-platforms.ts
import { z as z15 } from "zod";
function registerManageAdPlatforms(server2) {
  server2.tool(
    "manage_ad_platforms",
    "Manage ad platform integrations for conversion tracking. Supports Meta (Facebook/Instagram), X (Twitter), Google Ads, and TikTok. Use 'list' to see configured platforms, 'create' to add a new one, 'update' to modify settings, 'delete' to remove, or 'test' to verify the connection.",
    {
      action: z15.enum(["list", "create", "update", "delete", "test"]).describe("Action to perform"),
      platformId: z15.string().optional().describe("Platform ID (required for 'update' and 'delete')"),
      name: z15.enum(["meta", "x", "google", "tiktok"]).optional().describe("Platform name (required for 'create' and 'test')"),
      displayName: z15.string().optional().describe("Display name for the platform (e.g. 'Meta\u5E83\u544A')"),
      config: z15.record(z15.unknown()).optional().describe(
        "Platform config JSON. Meta: {pixel_id, access_token, test_event_code?}. X: {pixel_id, api_key, api_secret}. Google: {customer_id, conversion_action_id, oauth_token}. TikTok: {pixel_code, access_token}"
      ),
      isActive: z15.boolean().optional().describe("Enable/disable the platform (for 'update')"),
      eventName: z15.string().optional().describe("Event name for test conversion (for 'test', e.g. 'Lead')"),
      friendId: z15.string().optional().describe("Friend ID for test conversion (for 'test')")
    },
    async ({ action, platformId, name, displayName, config, isActive, eventName, friendId }) => {
      try {
        const client = getClient();
        switch (action) {
          case "list": {
            const platforms = await client.adPlatforms.list();
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: true,
                      count: platforms.length,
                      platforms
                    },
                    null,
                    2
                  )
                }
              ]
            };
          }
          case "create": {
            if (!name) throw new Error("name is required for create action");
            if (!config)
              throw new Error("config is required for create action");
            const platform = await client.adPlatforms.create({
              name,
              displayName,
              config
            });
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({ success: true, platform }, null, 2)
                }
              ]
            };
          }
          case "update": {
            if (!platformId)
              throw new Error("platformId is required for update action");
            const platform = await client.adPlatforms.update(platformId, {
              name,
              displayName,
              config,
              isActive
            });
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({ success: true, platform }, null, 2)
                }
              ]
            };
          }
          case "delete": {
            if (!platformId)
              throw new Error("platformId is required for delete action");
            await client.adPlatforms.delete(platformId);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    success: true,
                    message: `Platform ${platformId} deleted`
                  })
                }
              ]
            };
          }
          case "test": {
            if (!name) throw new Error("name is required for test action");
            if (!eventName)
              throw new Error("eventName is required for test action");
            const result = await client.adPlatforms.test(
              name,
              eventName,
              friendId
            );
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({ success: true, ...result }, null, 2)
                }
              ]
            };
          }
          default:
            throw new Error(`Unknown action: ${action}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: String(error) },
                null,
                2
              )
            }
          ],
          isError: true
        };
      }
    }
  );
}

// src/tools/get-conversion-logs.ts
import { z as z16 } from "zod";
function registerGetConversionLogs(server2) {
  server2.tool(
    "get_conversion_logs",
    "View ad conversion send logs for a specific platform. Shows the history of conversion events sent to Meta CAPI, X, Google Ads, or TikTok, including status (sent/failed) and error details.",
    {
      platformId: z16.string().describe(
        "Ad platform ID to get logs for. Use manage_ad_platforms with action 'list' first to get the ID."
      ),
      limit: z16.number().optional().default(50).describe("Maximum number of logs to return (default: 50)")
    },
    async ({ platformId, limit }) => {
      try {
        const client = getClient();
        const logs = await client.adPlatforms.getLogs(platformId, limit);
        const summary = {
          total: logs.length,
          sent: logs.filter((l) => l.status === "sent").length,
          failed: logs.filter((l) => l.status === "failed").length
        };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: true, summary, logs },
                null,
                2
              )
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: false, error: String(error) },
                null,
                2
              )
            }
          ],
          isError: true
        };
      }
    }
  );
}

// src/tools/manage-staff.ts
import { z as z17 } from "zod";
function registerManageStaff(server2) {
  server2.tool(
    "manage_staff",
    "\u30B9\u30BF\u30C3\u30D5\u30A2\u30AB\u30A6\u30F3\u30C8\u306E\u8FFD\u52A0\u30FB\u4E00\u89A7\u30FB\u66F4\u65B0\u30FB\u524A\u9664\u30FBAPI\u30AD\u30FC\u518D\u751F\u6210\u3002\u30AA\u30FC\u30CA\u30FC\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059\u3002",
    {
      action: z17.enum(["create", "list", "get", "update", "delete", "regenerate_key", "me"]).describe("Action to perform"),
      name: z17.string().optional().describe("Staff name (for 'create' action)"),
      email: z17.string().nullable().optional().describe("Staff email (optional, null to clear)"),
      role: z17.enum(["admin", "staff"]).optional().describe("Staff role (for 'create'/'update')"),
      staffId: z17.string().optional().describe("Staff ID (for 'get','update','delete','regenerate_key')"),
      isActive: z17.boolean().optional().describe("Activate/deactivate (for 'update')")
    },
    async ({ action, name, email, role, staffId, isActive }) => {
      try {
        const client = getClient();
        if (action === "me") {
          const profile = await client.staff.me();
          return {
            content: [{ type: "text", text: JSON.stringify({ success: true, profile }, null, 2) }]
          };
        }
        if (action === "list") {
          const members = await client.staff.list();
          return {
            content: [{ type: "text", text: JSON.stringify({ success: true, members }, null, 2) }]
          };
        }
        if (action === "create") {
          if (!name) throw new Error("name is required for create action");
          if (!role) throw new Error("role is required for create action");
          const member = await client.staff.create({ name, email, role });
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                success: true,
                member,
                note: "API\u30AD\u30FC\u306F\u4E00\u5EA6\u3060\u3051\u8868\u793A\u3055\u308C\u307E\u3059\u3002\u5B89\u5168\u306B\u4FDD\u7BA1\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
              }, null, 2)
            }]
          };
        }
        if (action === "get") {
          if (!staffId) throw new Error("staffId is required for get action");
          const member = await client.staff.get(staffId);
          return {
            content: [{ type: "text", text: JSON.stringify({ success: true, member }, null, 2) }]
          };
        }
        if (action === "update") {
          if (!staffId) throw new Error("staffId is required for update action");
          const updates = {};
          if (name !== void 0) updates.name = name;
          if (email !== void 0) updates.email = email;
          if (role !== void 0) updates.role = role;
          if (isActive !== void 0) updates.isActive = isActive;
          const member = await client.staff.update(staffId, updates);
          return {
            content: [{ type: "text", text: JSON.stringify({ success: true, member }, null, 2) }]
          };
        }
        if (action === "delete") {
          if (!staffId) throw new Error("staffId is required for delete action");
          await client.staff.delete(staffId);
          return {
            content: [{ type: "text", text: JSON.stringify({ success: true, deleted: staffId }, null, 2) }]
          };
        }
        if (action === "regenerate_key") {
          if (!staffId) throw new Error("staffId is required for regenerate_key action");
          const result = await client.staff.regenerateKey(staffId);
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                success: true,
                staffId,
                newApiKey: result.apiKey,
                note: "\u65B0\u3057\u3044API\u30AD\u30FC\u306F\u4E00\u5EA6\u3060\u3051\u8868\u793A\u3055\u308C\u307E\u3059\u3002\u5B89\u5168\u306B\u4FDD\u7BA1\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
              }, null, 2)
            }]
          };
        }
        throw new Error(`Unknown action: ${action}`);
      } catch (error) {
        return {
          content: [{ type: "text", text: JSON.stringify({ success: false, error: String(error) }, null, 2) }],
          isError: true
        };
      }
    }
  );
}

// src/tools/upload-image.ts
import { z as z18 } from "zod";
function registerUploadImage(server2) {
  server2.tool(
    "upload_image",
    "Upload an image to get a public URL for use in LINE messages (Flex Message hero images, image messages, etc.). Accepts base64-encoded image data. Returns public URL.",
    {
      data: z18.string().describe("Base64-encoded image data (with or without data:image/...;base64, prefix)"),
      mimeType: z18.enum(["image/png", "image/jpeg", "image/gif", "image/webp"]).default("image/png").describe("Image MIME type"),
      filename: z18.string().optional().describe("Optional original filename for reference")
    },
    async ({ data, mimeType, filename }) => {
      try {
        const client = getClient();
        const result = await client.images.upload({ data, mimeType, filename });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  url: result.url,
                  key: result.key,
                  mimeType: result.mimeType,
                  size: result.size
                },
                null,
                2
              )
            }
          ]
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: false, error: String(err) })
            }
          ]
        };
      }
    }
  );
}

// src/tools/manage-friends.ts
import { z as z19 } from "zod";
function registerManageFriends(server2) {
  server2.tool(
    "manage_friends",
    "\u53CB\u3060\u3061\u306E\u7BA1\u7406\u64CD\u4F5C\u3002count: \u53CB\u3060\u3061\u6570\u53D6\u5F97\u3001set_metadata: \u30E1\u30BF\u30C7\u30FC\u30BF\u66F4\u65B0\u3001set_rich_menu: \u30EA\u30C3\u30C1\u30E1\u30CB\u30E5\u30FC\u5272\u5F53\u3001remove_rich_menu: \u30EA\u30C3\u30C1\u30E1\u30CB\u30E5\u30FC\u89E3\u9664\u3002",
    {
      action: z19.enum(["count", "set_metadata", "set_rich_menu", "remove_rich_menu"]).describe("Action to perform"),
      friendId: z19.string().optional().describe("Friend ID (required for set_metadata, set_rich_menu, remove_rich_menu)"),
      metadata: z19.string().optional().describe("JSON string of metadata fields to set (for 'set_metadata')"),
      richMenuId: z19.string().optional().describe("Rich menu ID to assign (for 'set_rich_menu')")
    },
    async ({ action, friendId, metadata, richMenuId }) => {
      try {
        const client = getClient();
        if (action === "count") {
          const count = await client.friends.count();
          return {
            content: [{ type: "text", text: JSON.stringify({ success: true, count }, null, 2) }]
          };
        }
        if (!friendId) throw new Error("friendId is required for this action");
        if (action === "set_metadata") {
          if (!metadata) throw new Error("metadata (JSON string) is required for set_metadata");
          const fields = JSON.parse(metadata);
          const friend = await client.friends.setMetadata(friendId, fields);
          return {
            content: [{ type: "text", text: JSON.stringify({ success: true, friend }, null, 2) }]
          };
        }
        if (action === "set_rich_menu") {
          if (!richMenuId) throw new Error("richMenuId is required for set_rich_menu");
          await client.friends.setRichMenu(friendId, richMenuId);
          return {
            content: [{ type: "text", text: JSON.stringify({ success: true, friendId, richMenuId }, null, 2) }]
          };
        }
        if (action === "remove_rich_menu") {
          await client.friends.removeRichMenu(friendId);
          return {
            content: [{ type: "text", text: JSON.stringify({ success: true, friendId, removed: true }, null, 2) }]
          };
        }
        throw new Error(`Unknown action: ${action}`);
      } catch (err) {
        return {
          content: [{ type: "text", text: JSON.stringify({ success: false, error: String(err) }) }],
          isError: true
        };
      }
    }
  );
}

// src/tools/manage-scenarios.ts
import { z as z20 } from "zod";
function registerManageScenarios(server2) {
  server2.tool(
    "manage_scenarios",
    "\u30B7\u30CA\u30EA\u30AA\u306E\u7BA1\u7406\u64CD\u4F5C\u3002list: \u4E00\u89A7\u3001get: \u8A73\u7D30\uFF08\u30B9\u30C6\u30C3\u30D7\u542B\u3080\uFF09\u3001update: \u66F4\u65B0\u3001delete: \u524A\u9664\u3001add_step: \u30B9\u30C6\u30C3\u30D7\u8FFD\u52A0\u3001update_step: \u30B9\u30C6\u30C3\u30D7\u66F4\u65B0\u3001delete_step: \u30B9\u30C6\u30C3\u30D7\u524A\u9664\u3002",
    {
      action: z20.enum(["list", "get", "update", "delete", "add_step", "update_step", "delete_step"]).describe("Action to perform"),
      scenarioId: z20.string().optional().describe("Scenario ID (required for get, update, delete, add_step, update_step, delete_step)"),
      stepId: z20.string().optional().describe("Step ID (required for update_step, delete_step)"),
      name: z20.string().optional().describe("Scenario name (for update)"),
      description: z20.string().nullable().optional().describe("Scenario description (for update)"),
      triggerType: z20.enum(["friend_add", "tag_added", "manual"]).optional().describe("Trigger type (for update)"),
      triggerTagId: z20.string().nullable().optional().describe("Trigger tag ID (for update)"),
      isActive: z20.boolean().optional().describe("Active status (for update)"),
      stepOrder: z20.number().optional().describe("Step order number (for add_step, update_step)"),
      delayMinutes: z20.number().optional().describe("Delay in minutes (for add_step, update_step)"),
      messageType: z20.enum(["text", "image", "flex"]).optional().describe("Message type (for add_step, update_step)"),
      messageContent: z20.string().optional().describe("Message content (for add_step, update_step)"),
      conditionType: z20.string().nullable().optional().describe("Condition type (for add_step, update_step)"),
      conditionValue: z20.string().nullable().optional().describe("Condition value (for add_step, update_step)"),
      nextStepOnFalse: z20.number().nullable().optional().describe("Next step on false (for add_step, update_step)"),
      accountId: z20.string().optional().describe("LINE account ID for list (uses default if omitted)")
    },
    async ({ action, scenarioId, stepId, name, description, triggerType, triggerTagId, isActive, stepOrder, delayMinutes, messageType, messageContent, conditionType, conditionValue, nextStepOnFalse, accountId }) => {
      try {
        const client = getClient();
        if (action === "list") {
          const scenarios = await client.scenarios.list(accountId ? { accountId } : void 0);
          return { content: [{ type: "text", text: JSON.stringify({ success: true, scenarios }, null, 2) }] };
        }
        if (!scenarioId) throw new Error("scenarioId is required for this action");
        if (action === "get") {
          const scenario = await client.scenarios.get(scenarioId);
          return { content: [{ type: "text", text: JSON.stringify({ success: true, scenario }, null, 2) }] };
        }
        if (action === "update") {
          const input = {};
          if (name !== void 0) input.name = name;
          if (description !== void 0) input.description = description;
          if (triggerType !== void 0) input.triggerType = triggerType;
          if (triggerTagId !== void 0) input.triggerTagId = triggerTagId;
          if (isActive !== void 0) input.isActive = isActive;
          const scenario = await client.scenarios.update(scenarioId, input);
          return { content: [{ type: "text", text: JSON.stringify({ success: true, scenario }, null, 2) }] };
        }
        if (action === "delete") {
          await client.scenarios.delete(scenarioId);
          return { content: [{ type: "text", text: JSON.stringify({ success: true, deleted: scenarioId }, null, 2) }] };
        }
        if (action === "add_step") {
          if (stepOrder === void 0 || delayMinutes === void 0 || !messageType || !messageContent) {
            throw new Error("stepOrder, delayMinutes, messageType, messageContent are required for add_step");
          }
          const step = await client.scenarios.addStep(scenarioId, {
            stepOrder,
            delayMinutes,
            messageType,
            messageContent,
            conditionType: conditionType ?? null,
            conditionValue: conditionValue ?? null,
            nextStepOnFalse: nextStepOnFalse ?? null
          });
          return { content: [{ type: "text", text: JSON.stringify({ success: true, step }, null, 2) }] };
        }
        if (action === "update_step") {
          if (!stepId) throw new Error("stepId is required for update_step");
          const input = {};
          if (stepOrder !== void 0) input.stepOrder = stepOrder;
          if (delayMinutes !== void 0) input.delayMinutes = delayMinutes;
          if (messageType !== void 0) input.messageType = messageType;
          if (messageContent !== void 0) input.messageContent = messageContent;
          if (conditionType !== void 0) input.conditionType = conditionType;
          if (conditionValue !== void 0) input.conditionValue = conditionValue;
          if (nextStepOnFalse !== void 0) input.nextStepOnFalse = nextStepOnFalse;
          const step = await client.scenarios.updateStep(scenarioId, stepId, input);
          return { content: [{ type: "text", text: JSON.stringify({ success: true, step }, null, 2) }] };
        }
        if (action === "delete_step") {
          if (!stepId) throw new Error("stepId is required for delete_step");
          await client.scenarios.deleteStep(scenarioId, stepId);
          return { content: [{ type: "text", text: JSON.stringify({ success: true, deleted: stepId }, null, 2) }] };
        }
        throw new Error(`Unknown action: ${action}`);
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: String(err) }) }], isError: true };
      }
    }
  );
}

// src/tools/manage-broadcasts.ts
import { z as z21 } from "zod";
function registerManageBroadcasts(server2) {
  server2.tool(
    "manage_broadcasts",
    "\u914D\u4FE1\u306E\u7BA1\u7406\u64CD\u4F5C\u3002list: \u4E00\u89A7\u3001get: \u8A73\u7D30\u3001create_draft: \u4E0B\u66F8\u304D\u4F5C\u6210\uFF08\u9001\u4FE1\u3057\u306A\u3044\uFF09\u3001update: \u66F4\u65B0\u3001send: \u9001\u4FE1\u3001send_to_segment: \u30BB\u30B0\u30E1\u30F3\u30C8\u914D\u4FE1\u3002",
    {
      action: z21.enum(["list", "get", "create_draft", "update", "send", "send_to_segment"]).describe("Action to perform"),
      broadcastId: z21.string().optional().describe("Broadcast ID (required for get, update, send, send_to_segment)"),
      title: z21.string().optional().describe("Broadcast title (for create_draft, update)"),
      messageType: z21.enum(["text", "image", "flex"]).optional().describe("Message type (for create_draft, update)"),
      messageContent: z21.string().optional().describe("Message content (for create_draft, update)"),
      targetType: z21.enum(["all", "tag"]).optional().describe("Target type (for create_draft, update)"),
      targetTagId: z21.string().nullable().optional().describe("Target tag ID (for create_draft, update)"),
      scheduledAt: z21.string().nullable().optional().describe("ISO 8601 datetime to schedule (for create_draft, update)"),
      segmentConditions: z21.string().optional().describe("JSON string of segment conditions: {operator: 'AND'|'OR', rules: [{type, value}]} (for send_to_segment)"),
      accountId: z21.string().optional().describe("LINE account ID (uses default if omitted)")
    },
    async ({ action, broadcastId, title, messageType, messageContent, targetType, targetTagId, scheduledAt, segmentConditions, accountId }) => {
      try {
        const client = getClient();
        if (action === "list") {
          const broadcasts = await client.broadcasts.list(accountId ? { accountId } : void 0);
          return { content: [{ type: "text", text: JSON.stringify({ success: true, broadcasts }, null, 2) }] };
        }
        if (action === "create_draft") {
          if (!title || !messageType || !messageContent) {
            throw new Error("title, messageType, messageContent are required for create_draft");
          }
          const input = { title, messageType, messageContent, targetType: targetType ?? "all" };
          if (targetTagId) input.targetTagId = targetTagId;
          if (scheduledAt) input.scheduledAt = scheduledAt;
          if (accountId) input.lineAccountId = accountId;
          const broadcast = await client.broadcasts.create(input);
          return { content: [{ type: "text", text: JSON.stringify({ success: true, broadcast }, null, 2) }] };
        }
        if (!broadcastId) throw new Error("broadcastId is required for this action");
        if (action === "get") {
          const broadcast = await client.broadcasts.get(broadcastId);
          return { content: [{ type: "text", text: JSON.stringify({ success: true, broadcast }, null, 2) }] };
        }
        if (action === "update") {
          const input = {};
          if (title !== void 0) input.title = title;
          if (messageType !== void 0) input.messageType = messageType;
          if (messageContent !== void 0) input.messageContent = messageContent;
          if (targetType !== void 0) input.targetType = targetType;
          if (targetTagId !== void 0) input.targetTagId = targetTagId;
          if (scheduledAt !== void 0) input.scheduledAt = scheduledAt;
          const broadcast = await client.broadcasts.update(broadcastId, input);
          return { content: [{ type: "text", text: JSON.stringify({ success: true, broadcast }, null, 2) }] };
        }
        if (action === "send") {
          const broadcast = await client.broadcasts.send(broadcastId);
          return { content: [{ type: "text", text: JSON.stringify({ success: true, broadcast }, null, 2) }] };
        }
        if (action === "send_to_segment") {
          if (!segmentConditions) throw new Error("segmentConditions (JSON string) is required for send_to_segment");
          const conditions = JSON.parse(segmentConditions);
          const broadcast = await client.broadcasts.sendToSegment(broadcastId, conditions);
          return { content: [{ type: "text", text: JSON.stringify({ success: true, broadcast }, null, 2) }] };
        }
        throw new Error(`Unknown action: ${action}`);
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: String(err) }) }], isError: true };
      }
    }
  );
}

// src/tools/manage-rich-menus.ts
import { z as z22 } from "zod";
function registerManageRichMenus(server2) {
  server2.tool(
    "manage_rich_menus",
    "\u30EA\u30C3\u30C1\u30E1\u30CB\u30E5\u30FC\u306E\u7BA1\u7406\u64CD\u4F5C\u3002list: \u4E00\u89A7\u53D6\u5F97\u3001delete: \u524A\u9664\u3001set_default: \u30C7\u30D5\u30A9\u30EB\u30C8\u8A2D\u5B9A\u3002\u4F5C\u6210\u306F create_rich_menu \u30C4\u30FC\u30EB\u3092\u4F7F\u7528\u3002",
    {
      action: z22.enum(["list", "delete", "set_default"]).describe("Action to perform"),
      richMenuId: z22.string().optional().describe("Rich menu ID (required for delete, set_default)")
    },
    async ({ action, richMenuId }) => {
      try {
        const client = getClient();
        if (action === "list") {
          const menus = await client.richMenus.list();
          return { content: [{ type: "text", text: JSON.stringify({ success: true, richMenus: menus }, null, 2) }] };
        }
        if (!richMenuId) throw new Error("richMenuId is required for this action");
        if (action === "delete") {
          await client.richMenus.delete(richMenuId);
          return { content: [{ type: "text", text: JSON.stringify({ success: true, deleted: richMenuId }, null, 2) }] };
        }
        if (action === "set_default") {
          await client.richMenus.setDefault(richMenuId);
          return { content: [{ type: "text", text: JSON.stringify({ success: true, defaultRichMenuId: richMenuId }, null, 2) }] };
        }
        throw new Error(`Unknown action: ${action}`);
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: String(err) }) }], isError: true };
      }
    }
  );
}

// src/tools/manage-forms.ts
import { z as z23 } from "zod";
function registerManageForms(server2) {
  server2.tool(
    "manage_forms",
    "\u30D5\u30A9\u30FC\u30E0\u306E\u7BA1\u7406\u64CD\u4F5C\u3002list: \u4E00\u89A7\u3001get: \u8A73\u7D30\u3001update: \u66F4\u65B0\u3001delete: \u524A\u9664\u3002\u4F5C\u6210\u306F create_form \u30C4\u30FC\u30EB\u3092\u4F7F\u7528\u3002",
    {
      action: z23.enum(["list", "get", "update", "delete"]).describe("Action to perform"),
      formId: z23.string().optional().describe("Form ID (required for get, update, delete)"),
      name: z23.string().optional().describe("Form name (for update)"),
      description: z23.string().nullable().optional().describe("Form description (for update)"),
      fields: z23.string().optional().describe("JSON string of form fields array (for update)"),
      onSubmitTagId: z23.string().nullable().optional().describe("Tag to add on submit (for update)"),
      onSubmitScenarioId: z23.string().nullable().optional().describe("Scenario to enroll on submit (for update)"),
      saveToMetadata: z23.boolean().optional().describe("Save responses to friend metadata (for update)"),
      isActive: z23.boolean().optional().describe("Active status (for update)")
    },
    async ({ action, formId, name, description, fields, onSubmitTagId, onSubmitScenarioId, saveToMetadata, isActive }) => {
      try {
        const client = getClient();
        if (action === "list") {
          const forms = await client.forms.list();
          return { content: [{ type: "text", text: JSON.stringify({ success: true, forms }, null, 2) }] };
        }
        if (!formId) throw new Error("formId is required for this action");
        if (action === "get") {
          const form = await client.forms.get(formId);
          return { content: [{ type: "text", text: JSON.stringify({ success: true, form }, null, 2) }] };
        }
        if (action === "update") {
          const input = {};
          if (name !== void 0) input.name = name;
          if (description !== void 0) input.description = description;
          if (fields !== void 0) input.fields = JSON.parse(fields);
          if (onSubmitTagId !== void 0) input.onSubmitTagId = onSubmitTagId;
          if (onSubmitScenarioId !== void 0) input.onSubmitScenarioId = onSubmitScenarioId;
          if (saveToMetadata !== void 0) input.saveToMetadata = saveToMetadata;
          if (isActive !== void 0) input.isActive = isActive;
          const form = await client.forms.update(formId, input);
          return { content: [{ type: "text", text: JSON.stringify({ success: true, form }, null, 2) }] };
        }
        if (action === "delete") {
          await client.forms.delete(formId);
          return { content: [{ type: "text", text: JSON.stringify({ success: true, deleted: formId }, null, 2) }] };
        }
        throw new Error(`Unknown action: ${action}`);
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: String(err) }) }], isError: true };
      }
    }
  );
}

// src/tools/manage-tracked-links.ts
import { z as z24 } from "zod";
function registerManageTrackedLinks(server2) {
  server2.tool(
    "manage_tracked_links",
    "\u30C8\u30E9\u30C3\u30AD\u30F3\u30B0\u30EA\u30F3\u30AF\u306E\u7BA1\u7406\u64CD\u4F5C\u3002list: \u4E00\u89A7\u3001delete: \u524A\u9664\u3002\u4F5C\u6210\u306F create_tracked_link \u30C4\u30FC\u30EB\u3092\u4F7F\u7528\u3002",
    {
      action: z24.enum(["list", "delete"]).describe("Action to perform"),
      linkId: z24.string().optional().describe("Tracked link ID (required for delete)")
    },
    async ({ action, linkId }) => {
      try {
        const client = getClient();
        if (action === "list") {
          const links = await client.trackedLinks.list();
          return { content: [{ type: "text", text: JSON.stringify({ success: true, trackedLinks: links }, null, 2) }] };
        }
        if (action === "delete") {
          if (!linkId) throw new Error("linkId is required for delete");
          await client.trackedLinks.delete(linkId);
          return { content: [{ type: "text", text: JSON.stringify({ success: true, deleted: linkId }, null, 2) }] };
        }
        throw new Error(`Unknown action: ${action}`);
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, error: String(err) }) }], isError: true };
      }
    }
  );
}

// src/tools/index.ts
function registerAllTools(server2) {
  registerSendMessage(server2);
  registerBroadcast(server2);
  registerCreateScenario(server2);
  registerEnrollScenario(server2);
  registerManageTags(server2);
  registerCreateForm(server2);
  registerCreateTrackedLink(server2);
  registerCreateRichMenu(server2);
  registerListFriends(server2);
  registerGetFriendDetail(server2);
  registerGetFormSubmissions(server2);
  registerGetLinkClicks(server2);
  registerAccountSummary(server2);
  registerListCrmObjects(server2);
  registerManageAdPlatforms(server2);
  registerGetConversionLogs(server2);
  registerManageStaff(server2);
  registerUploadImage(server2);
  registerManageFriends(server2);
  registerManageScenarios(server2);
  registerManageBroadcasts(server2);
  registerManageRichMenus(server2);
  registerManageForms(server2);
  registerManageTrackedLinks(server2);
}

// src/resources/index.ts
function registerAllResources(server2) {
  server2.resource(
    "Account Summary",
    "line-harness://account/summary",
    async (_uri) => {
      const client = getClient();
      const [friendCount, scenarios, tags] = await Promise.all([
        client.friends.count(),
        client.scenarios.list(),
        client.tags.list()
      ]);
      const summary = {
        friends: friendCount,
        activeScenarios: scenarios.filter(
          (s) => s.isActive
        ).length,
        totalScenarios: scenarios.length,
        tags: tags.map((t) => ({
          id: t.id,
          name: t.name
        }))
      };
      return {
        contents: [
          {
            uri: "line-harness://account/summary",
            mimeType: "application/json",
            text: JSON.stringify(summary, null, 2)
          }
        ]
      };
    }
  );
  server2.resource(
    "Active Scenarios",
    "line-harness://scenarios/active",
    async (_uri) => {
      const client = getClient();
      const scenarios = await client.scenarios.list();
      const active = scenarios.filter(
        (s) => s.isActive
      );
      return {
        contents: [
          {
            uri: "line-harness://scenarios/active",
            mimeType: "application/json",
            text: JSON.stringify(active, null, 2)
          }
        ]
      };
    }
  );
  server2.resource(
    "Tags List",
    "line-harness://tags/list",
    async (_uri) => {
      const client = getClient();
      const tags = await client.tags.list();
      return {
        contents: [
          {
            uri: "line-harness://tags/list",
            mimeType: "application/json",
            text: JSON.stringify(tags, null, 2)
          }
        ]
      };
    }
  );
}

// src/index.ts
var server = new McpServer({
  name: "line-harness",
  version: "0.3.0"
});
registerAllTools(server);
registerAllResources(server);
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("LINE Harness MCP Server running on stdio");
}
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
