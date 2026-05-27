# GoHighLevel — Claude Code Integration

## Overview

This project integrates Claude Code with GoHighLevel (GHL) via:
- **Primary:** GHL MCP Server (36 tools, HTTP transport)
- **Fallback:** GHL REST API v2 (full surface area, for features outside MCP scope)

Authentication uses Private Integration Tokens (PIT) scoped to a single GHL sub-account (Location).

---

## Architecture

```
Claude Code Agent
      │
      ├── MCP Layer (primary)
      │     └── https://services.leadconnectorhq.com/mcp/
      │           Auth: Bearer ${GHL_TOKEN} + locationId header
      │           36 tools: Contacts, Conversations, Opportunities,
      │                     Calendar, Payments, Emails, Social, Blogs
      │
      └── API Fallback Layer (when MCP has gaps)
            └── https://services.leadconnectorhq.com/
                  Auth: Bearer ${GHL_TOKEN}
                  Routes: /funnels/, /reporting/, /conversations/messages/
                          /whatsapp/, /custom-fields/, /workflows/
```

---

## MCP Configuration

**File:** `.mcp.json`

```json
{
  "mcpServers": {
    "ghl": {
      "type": "http",
      "url": "https://services.leadconnectorhq.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${GHL_TOKEN}",
        "locationId": "${GHL_LOCATION_ID}"
      }
    }
  }
}
```

**Environment variables required before launching Claude Code:**

| Variable | Description |
|---|---|
| `GHL_TOKEN` | Private Integration Token from GHL Settings |
| `GHL_LOCATION_ID` | Sub-account (Location) ID from GHL |

**How to set (PowerShell):**
```powershell
$env:GHL_TOKEN = "pit_xxxxxxxxxxxxxxxxxxxx"
$env:GHL_LOCATION_ID = "abc123xyz"
```

**How to set (permanently via System Environment):**
```
Settings → System → Advanced system settings → Environment Variables
```

---

## MCP Tools Map (36 tools)

### Contacts
| Tool | Action |
|---|---|
| `contacts_create-contact` | Create a new contact |
| `contacts_get-contact` | Get contact by ID |
| `contacts_update-contact` | Update contact fields |
| `contacts_delete-contact` | Delete a contact |
| `contacts_search-contacts` | Search contacts by query |
| `contacts_add-tags` | Add tags to contact |
| `contacts_remove-tags` | Remove tags from contact |
| `contacts_get-tasks` | Get tasks for a contact |
| `contacts_create-task` | Create task for a contact |

### Conversations
| Tool | Action |
|---|---|
| `conversations_search-conversations` | Search conversation threads |
| `conversations_get-conversation` | Get conversation by ID |
| `conversations_send-message` | Send a message |
| `conversations_get-messages` | Get messages in thread |

### Opportunities
| Tool | Action |
|---|---|
| `opportunities_search-opportunities` | Search pipeline opportunities |
| `opportunities_get-opportunity` | Get opportunity by ID |
| `opportunities_create-opportunity` | Create pipeline entry |
| `opportunities_update-opportunity` | Update stage / value |
| `opportunities_get-pipelines` | List all pipelines |

### Calendar
| Tool | Action |
|---|---|
| `calendar_get-events` | Get calendar events |
| `calendar_create-event` | Create appointment |
| `calendar_get-appointment-notes` | Get notes on appointment |

### Payments
| Tool | Action |
|---|---|
| `payments_get-orders` | List payment orders |
| `payments_get-order` | Get order by ID |
| `payments_get-transactions` | List transactions |

### Locations
| Tool | Action |
|---|---|
| `locations_get-location` | Get sub-account details |
| `locations_get-custom-fields` | List custom fields |

### Emails
| Tool | Action |
|---|---|
| `emails_get-templates` | List email templates |
| `emails_create-template` | Create email template |

### Blogs & Social Media
| Tool | Action |
|---|---|
| `blogs_*` | Blog post management |
| `social_*` | Social accounts, posts, statistics |

---

## Feature → Layer Mapping

| Feature | Layer | Method |
|---|---|---|
| Contact CRUD | MCP | `contacts_*` |
| Lead tagging | MCP | `contacts_add-tags` |
| Pipeline management | MCP | `opportunities_*` |
| Conversations / SMS | MCP | `conversations_send-message` |
| Appointments | MCP | `calendar_create-event` |
| Email templates | MCP | `emails_*` |
| Payment tracking | MCP | `payments_*` |
| Funnel list (agency) | ❌ Not via PIT | Agency JWT required — see Funnel Notes |
| Funnel page content | API fallback | `GET /funnels/page?funnelId={id}` |
| Landing pages (build) | API fallback | `POST /funnels/page` with known funnelId |
| WhatsApp flows | API fallback | `POST /conversations/messages/` |
| Conversion tracking | API fallback | `GET /reporting/` |
| Pre-order funnels | API fallback | `/funnels/` + `/opportunities/` |
| Workflow triggers | API fallback | `POST /workflows/{id}/subscribe` |
| Custom fields (write) | API fallback | `POST /locations/{id}/customFields` |

---

## API Fallback Behavior

When a feature is outside MCP scope, use GHL REST API v2 directly.

**Base URL:** `https://services.leadconnectorhq.com`

**Standard headers for all API calls:**
```
Authorization: Bearer ${GHL_TOKEN}
Content-Type: application/json
Version: 2021-07-28
```

**Key endpoints:**
```
GET  /funnels/funnel?locationId={id}    ❌ Agency JWT only — not accessible via PIT
GET  /funnels/page?funnelId={id}        ✅ Read funnel page content (PIT accessible)
POST /funnels/page                      ✅ Create/update landing page (PIT accessible)
POST /conversations/messages/           Send WhatsApp / SMS message
GET  /reporting/revenue/                Revenue analytics
GET  /reporting/appointments/           Appointment analytics
POST /workflows/{workflowId}/subscribe  Enroll contact in workflow
GET  /locations/{locationId}/customFields  Custom fields
POST /locations/{locationId}/customFields  Create custom field
```

**Fallback rule:** If a tool call returns `tool not found` or `unsupported`, automatically switch to REST API call with equivalent parameters. Document each fallback instance in session logs.

### Funnel Notes (validated 2026-05-24)

- `GET /funnels/funnel` requires an **Agency-level JWT token** — not available to sub-account PITs regardless of scope configuration. Two tokens were tested with full funnel scope; both returned 401.
- `GET /funnels/page` and `POST /funnels/page` are **PIT-accessible** — validated (returns 422 when funnelId is missing, 200 when valid funnelId is provided).
- **Working pattern for landing pages:** obtain a funnelId out-of-band (from GHL UI or agency token), then use `/funnels/page` for all page-level read/write operations via PIT.

---

## Operating Instructions

### Starting a session

1. Set environment variables (see above).
2. Open Claude Code in this directory (`z:\Documentos\Gohighlevel`).
3. MCP server `ghl` will be available automatically via `.mcp.json`.
4. Verify connection: ask Claude to run `locations_get-location`.

### Working with leads

```
"Find contact with email john@example.com"
→ MCP: contacts_search-contacts

"Add tag 'pre-order-interested' to contact ID abc123"
→ MCP: contacts_add-tags

"Move opportunity xyz to Closed Won stage"
→ MCP: opportunities_update-opportunity
```

### Working with WhatsApp

```
"Send WhatsApp message to contact ID abc123"
→ API fallback: POST /conversations/messages/
  body: { type: "WhatsApp", contactId: "abc123", message: "..." }
```

### Working with funnels / landing pages

```
"List all funnels in my account"
→ API fallback: GET /funnels/
```

---

## Token Setup (GHL Side)

1. Log into GoHighLevel.
2. Navigate to **Settings → Private Integrations**.
3. Click **Create New Integration**.
4. Name it (e.g., `claude-code-integration`).
5. Enable the following scopes:
   - Contacts: Read, Write
   - Conversations: Read, Write, Messages
   - Opportunities: Read, Write
   - Calendars: Read, Write
   - Locations: Read
   - Custom Fields: Read, Write
   - Payments: Read
   - Blogs: Read, Write
   - Email Templates: Read, Write
   - Social Media: Read, Write
6. Click **Generate Token**.
7. Copy the token immediately — it will not be shown again.
8. Set it as `GHL_TOKEN` environment variable.

---

## Security Recommendations

- **Never commit `.mcp.json` with real tokens** — it uses env var references only.
- **Never hardcode tokens in scripts** — always read from environment.
- **Rotate tokens** if exposed — GHL PIT tokens can be revoked and regenerated in Settings.
- **Scope minimally** — only enable the scopes your workflows actually need.
- **Use per-environment tokens** — one token for dev, one for production.
- **Audit token usage** in GHL Settings → Private Integrations → Activity Log.
- **Add `.env` to `.gitignore`** if using a `.env` file locally.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| `401 Unauthorized` | Token missing or invalid | Check `$env:GHL_TOKEN` is set and correct |
| `403 Forbidden` | Missing scope | Add required scope to PIT in GHL Settings |
| `404 on MCP tool` | Tool name typo | Check tool name against MCP tools map above |
| MCP server not found | `.mcp.json` not in project root | Confirm file is at `z:\Documentos\Gohighlevel\.mcp.json` |
| `locationId` errors | Wrong or missing location | Check `$env:GHL_LOCATION_ID` matches your sub-account |
| API fallback 429 | Rate limit hit | Add exponential backoff; GHL limit is ~100 req/10s |
| `/funnels/funnel` returns 401 | Agency-only endpoint | Use `/funnels/page` with known funnelId instead |
| Funnel scope added but still 401 | PIT cannot access funnel list | Platform restriction — not a config error |

---

## Observability

- All MCP tool calls are logged in Claude Code's session transcript.
- API fallback calls should be logged with: endpoint, status code, timestamp.
- For production workflows, forward logs to a persistent store (file, webhook, or GHL custom field).
- Monitor for `429` (rate limit) and `5xx` (GHL service errors) responses.

---

## Maintainability Notes

- Keep `.mcp.json` minimal — one server entry, no redundancy.
- If GHL adds new MCP tools, they are available automatically without config changes.
- Document every API fallback added as a comment or entry in this file under the Fallback section.
- Re-validate token scopes when adding new features.
- Check GHL changelog quarterly: `https://www.gohighlevel.com/changelog`

---

## Future Components (planned)

| Component | Status | Layer |
|---|---|---|
| Landing pages | In Progress | API fallback — `/funnels/page` (funnelId required) |
| Lead management | Ready | MCP |
| WhatsApp automation | Planned | API fallback |
| Conversion tracking | Planned | API fallback |
| Pre-order system | Planned | API fallback + MCP |
| Appointment booking | Ready | MCP |
| Email campaigns | Ready | MCP |

---

## Landing Page Implementation

### Pattern (PIT-accessible)

Funnel listing is agency-only. All landing page work operates at the **page level** using a known `funnelId`.

**Step 1 — Obtain funnelId**
Get the funnelId from the GHL UI:
```
GHL → Sites → Funnels → [your funnel] → Settings or URL
funnelId appears in the funnel's URL: /funnels/{funnelId}/...
```

**Step 2 — Read existing pages**
```
GET /funnels/page?funnelId={funnelId}&locationId={locationId}
Headers: Authorization, Version: 2021-07-28
```

**Step 3 — Create or update a landing page**
```
POST /funnels/page
Body: {
  "funnelId": "{funnelId}",
  "locationId": "{locationId}",
  "name": "Pre-Order Page",
  "url": "pre-order",
  "stepId": "{stepId}"
}
```

**Step 4 — Link to opportunity pipeline (MCP)**
After landing page captures a lead:
```
MCP: contacts_upsert-contact   → create/update contact
MCP: opportunities_create-opportunity → push into pipeline
MCP: contacts_add-tags         → tag for pre-order segmentation
```

### Pre-Order Flow Architecture

```
Landing Page (/funnels/page)
      │
      ▼
Contact created (MCP: contacts_upsert-contact)
      │
      ▼
Tagged "pre-order" (MCP: contacts_add-tags)
      │
      ▼
Opportunity created in pipeline (MCP: opportunities_create-opportunity)
      │
      ▼
Follow-up conversation (MCP: conversations_send-a-new-message)
```

---

## Credentials Checklist (fill in after architecture approval)

- [ ] `GHL_TOKEN` — obtained from GHL Settings → Private Integrations
- [ ] `GHL_LOCATION_ID` — obtained from GHL Settings → Business Info (Location ID field)
- [ ] Environment variables set in shell before launching Claude Code
- [x] MCP connection tested — 36 tools active (session with system env vars)
- [x] Location read validated — Jo$$ publicity, Cucuta CO
- [x] Contact read validated — 5 contacts accessible
- [x] Funnel limitation documented — `/funnels/funnel` is agency-only
- [x] Funnel page access confirmed — `/funnels/page` accessible via PIT
- [ ] System env vars set permanently (Windows → Environment Variables)
- [ ] Claude Code restarted with system env vars for persistent MCP
- [ ] funnelId obtained from GHL UI for landing page implementation
- [ ] Landing page read tested via `/funnels/page?funnelId={id}`
