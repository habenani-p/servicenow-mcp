# ServiceNow MCP Server

A production-ready **Model Context Protocol (MCP)** server for the ServiceNow platform, built for the **Zurich release (2025)**. Provides **112 tools** across 13 domains — enabling AI assistants to interact with ServiceNow instances through a standardized, secure interface.

> Supports Claude Code, Claude Desktop, OpenAI Codex, Google Gemini/Vertex AI, Cursor, and VS Code.

---

## Quick Links

| Topic | Link |
|-------|------|
| Getting Started (Beginners) | [Jump to section](#getting-started-beginners) |
| Getting Started (Advanced) | [Jump to section](#getting-started-advanced-developers) |
| All 112 Tools Reference | [docs/TOOLS.md](docs/TOOLS.md) |
| Role-Based Tool Packages | [docs/TOOL_PACKAGES.md](docs/TOOL_PACKAGES.md) |
| Client Setup Guides | [docs/CLIENT_SETUP.md](docs/CLIENT_SETUP.md) |
| Now Assist / AI Integration | [docs/NOW_ASSIST.md](docs/NOW_ASSIST.md) |
| ATF Testing | [docs/ATF.md](docs/ATF.md) |
| Scripting Management | [docs/SCRIPTING.md](docs/SCRIPTING.md) |
| Reporting & Analytics | [docs/REPORTING.md](docs/REPORTING.md) |
| Multi-Instance Setup | [docs/MULTI_INSTANCE.md](docs/MULTI_INSTANCE.md) |
| Security Policy | [SECURITY.md](SECURITY.md) |
| Changelog | [CHANGELOG.md](CHANGELOG.md) |

---

## What's Included

### Tool Domains

| Domain | Tools | Permission Required | Key Capabilities |
|--------|-------|---------------------|-----------------|
| Core & CMDB | 16 | Read-only | Query records, schema discovery, CMDB, ITOM, Discovery, MID servers |
| Incident Management | 7 | Write for create/update | Create, update, resolve, close, work notes |
| Problem Management | 4 | Write for create/update | Create, get, update, resolve problems |
| Change Management | 5 | Write for updates | Get, list, update, submit for approval, close |
| Task Management | 4 | Write for updates | Get, list my tasks, update, complete |
| Knowledge Base | 6 | Write for create/publish | Search, get, create, update, publish articles |
| Service Catalog & Approvals | 10 | Write for orders/approvals | Browse catalog, order items, manage approvals, SLA tracking |
| User & Group Management | 8 | Write for create/update | List, create, update users and groups, manage membership |
| Reporting & Analytics | 8 | Read-only | Aggregate queries, trend analysis, performance analytics, scheduled jobs |
| ATF Testing | 9 | `ATF_ENABLED=true` | Run test suites, get results, Zurich Failure Insight |
| Now Assist / AI | 10 | `NOW_ASSIST_ENABLED=true` | NLQ, AI Search, summaries, resolution suggestions, agentic playbooks |
| Scripting | 16 | `SCRIPTING_ENABLED=true` | Business rules, script includes, client scripts, changesets |
| Agile / Scrum | 9 | Write for create/update | Stories, epics, scrum tasks |

### Authentication Support

Both **Basic Auth** and **OAuth 2.0** are supported for all client integrations:

| Method | Best For |
|--------|----------|
| Basic Auth | Development, personal use |
| OAuth Client Credentials | Production, service accounts |
| OAuth Password Grant | Automated pipelines |

---

## Getting Started: Beginners

This section walks you through connecting this MCP server to **Claude Desktop** step by step. No prior MCP experience needed.

### Step 1: Prerequisites

- **Node.js 20+** — Download from [nodejs.org](https://nodejs.org)
- **Claude Desktop** — Download from [claude.ai/download](https://claude.ai/download)
- A **ServiceNow instance** with your username and password

Verify Node.js:
```bash
node --version  # should print v20.x.x or higher
```

### Step 2: Get the Code

```bash
git clone https://github.com/habenani-p/servicenow-mcp.git
cd servicenow-mcp
```

### Step 3: Install and Build

```bash
npm install
npm run build
```

You should see no errors. The compiled server is now at `dist/server.js`.

### Step 4: Configure Your Credentials

Copy the example environment file:
```bash
cp .env.example .env
```

Open `.env` in a text editor and fill in your ServiceNow details:
```env
# Your ServiceNow instance URL (no trailing slash)
SERVICENOW_INSTANCE_URL=https://yourcompany.service-now.com

# Authentication — choose Basic Auth to start
SERVICENOW_AUTH_METHOD=basic
SERVICENOW_BASIC_USERNAME=your.username
SERVICENOW_BASIC_PASSWORD=your_password

# Keep writes disabled to start safely
WRITE_ENABLED=false
```

### Step 5: Connect to Claude Desktop

Find your Claude Desktop config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

Open (or create) that file and add the ServiceNow server. Replace `/absolute/path/to` with the actual path to where you cloned the repo:

```json
{
  "mcpServers": {
    "servicenow": {
      "command": "node",
      "args": ["/absolute/path/to/servicenow-mcp/dist/server.js"],
      "env": {
        "SERVICENOW_INSTANCE_URL": "https://yourcompany.service-now.com",
        "SERVICENOW_AUTH_METHOD": "basic",
        "SERVICENOW_BASIC_USERNAME": "your.username",
        "SERVICENOW_BASIC_PASSWORD": "your_password",
        "WRITE_ENABLED": "false"
      }
    }
  }
}
```

Ready-to-edit config files are in [`clients/claude-desktop/`](clients/claude-desktop/).

### Step 6: Test It

Restart Claude Desktop. Open a new chat and try:

```
List my 5 most recent open incidents
```

```
Search the knowledge base for "VPN issues"
```

```
Show me all active P1 and P2 incidents
```

If you see ServiceNow data in the response, it's working.

> **Troubleshooting**: Open Claude Desktop → Settings → Developer → MCP Servers. If `servicenow` shows a red dot, check that the path in the config is correct and that `npm run build` completed without errors.

### Step 7: Enable Writes (Optional)

When you're ready to create and update records, set `WRITE_ENABLED=true` in the config:

```json
"WRITE_ENABLED": "true"
```

Then you can try:
```
Create a P3 incident: "Email is slow for the sales team"
```

For detailed client-specific setup, see [docs/CLIENT_SETUP.md](docs/CLIENT_SETUP.md).

---

## Getting Started: Advanced Developers

### Clone and Build

```bash
git clone https://github.com/habenani-p/servicenow-mcp.git
cd servicenow-mcp
npm install
npm run build
npm test   # 41 tests, all should pass
```

### OAuth 2.0 Setup

For production deployments, use OAuth instead of Basic Auth:

**1. Create an OAuth Application in ServiceNow**

Navigate to: System OAuth → Application Registry → New → Create an OAuth API endpoint for external clients

Note down: Client ID and Client Secret.

**2. Configure the MCP Server**

```env
SERVICENOW_INSTANCE_URL=https://yourcompany.service-now.com
SERVICENOW_AUTH_METHOD=oauth
SERVICENOW_OAUTH_CLIENT_ID=your_client_id
SERVICENOW_OAUTH_CLIENT_SECRET=your_client_secret
SERVICENOW_OAUTH_USERNAME=service_account_user
SERVICENOW_OAUTH_PASSWORD=service_account_password
```

Full OAuth walkthrough: [docs/SERVICENOW_OAUTH_SETUP.md](docs/SERVICENOW_OAUTH_SETUP.md)

### Role-Based Tool Packages

Rather than loading all 112 tools, configure role-specific subsets using `MCP_TOOL_PACKAGE`:

```env
MCP_TOOL_PACKAGE=service_desk       # ~25 tools: incidents, approvals, KB, SLA
MCP_TOOL_PACKAGE=platform_developer # scripting, ATF, changesets
MCP_TOOL_PACKAGE=ai_developer       # Now Assist, NLQ, AI Search
MCP_TOOL_PACKAGE=full               # all 112 tools (default)
```

See all packages: [docs/TOOL_PACKAGES.md](docs/TOOL_PACKAGES.md)

### Permission Tiers

| Tier | Environment Variable | Tools Unlocked |
|------|---------------------|----------------|
| 0 | *(none)* | All read/search tools |
| 1 | `WRITE_ENABLED=true` | Create/update for ITSM, catalog, users, agile |
| 2 | `WRITE_ENABLED=true` + `CMDB_WRITE_ENABLED=true` | CMDB CI create/update/relate |
| 3 | `WRITE_ENABLED=true` + `SCRIPTING_ENABLED=true` | Business rules, script includes, changesets |
| AI | `NOW_ASSIST_ENABLED=true` | Generative AI, NLQ, AI Search, agentic playbooks |
| ATF | `ATF_ENABLED=true` | Run ATF test suites and cases |

### All Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVICENOW_INSTANCE_URL` | *(required)* | Your ServiceNow instance URL |
| `SERVICENOW_AUTH_METHOD` | `basic` | Auth method: `basic` or `oauth` |
| `SERVICENOW_BASIC_USERNAME` | — | Username for Basic Auth |
| `SERVICENOW_BASIC_PASSWORD` | — | Password for Basic Auth |
| `SERVICENOW_OAUTH_CLIENT_ID` | — | OAuth Client ID |
| `SERVICENOW_OAUTH_CLIENT_SECRET` | — | OAuth Client Secret |
| `SERVICENOW_OAUTH_USERNAME` | — | Username for OAuth Password Grant |
| `SERVICENOW_OAUTH_PASSWORD` | — | Password for OAuth Password Grant |
| `WRITE_ENABLED` | `false` | Enable create/update/delete operations |
| `CMDB_WRITE_ENABLED` | `false` | Enable CMDB write operations |
| `SCRIPTING_ENABLED` | `false` | Enable scripting management tools |
| `NOW_ASSIST_ENABLED` | `false` | Enable Now Assist / AI tools (Zurich) |
| `ATF_ENABLED` | `false` | Enable ATF test execution |
| `MCP_TOOL_PACKAGE` | `full` | Role-based tool package to load |
| `MAX_RECORDS` | `100` | Default max records per query |
| `AGILE_TABLE_PREFIX` | `rm_` | Table prefix for Agile/Scrum tables |

### Multi-Instance Setup

Connect to multiple ServiceNow instances (dev/staging/prod) in one MCP session:

```bash
cp instances.example.json instances.json
# Edit instances.json with your instance URLs and credentials
```

See [docs/MULTI_INSTANCE.md](docs/MULTI_INSTANCE.md) for full setup.

### Run with a Specific Package

```bash
# Service desk mode
MCP_TOOL_PACKAGE=service_desk node dist/server.js

# Developer mode with scripting and ATF
MCP_TOOL_PACKAGE=platform_developer SCRIPTING_ENABLED=true ATF_ENABLED=true node dist/server.js
```

---

## Client Setup Guides

Step-by-step setup for each supported AI client:

| Client | Guide | Auth Options |
|--------|-------|-------------|
| Claude Code | [clients/claude-code/SETUP.md](clients/claude-code/SETUP.md) | Basic, OAuth |
| Claude Desktop | [clients/claude-desktop/SETUP.md](clients/claude-desktop/SETUP.md) | Basic, OAuth |
| OpenAI Codex | [clients/codex/SETUP.md](clients/codex/SETUP.md) | Basic, OAuth |
| Google Gemini / Vertex AI | [clients/gemini/SETUP.md](clients/gemini/SETUP.md) | Basic, OAuth |
| Cursor | [clients/cursor/SETUP.md](clients/cursor/SETUP.md) | Basic, OAuth |
| VS Code | [clients/vscode/SETUP.md](clients/vscode/SETUP.md) | Basic, OAuth |

Full unified guide: [docs/CLIENT_SETUP.md](docs/CLIENT_SETUP.md)

---

## Build, Test, and Development

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript
npm test             # Run all tests (Vitest)
npm run type-check   # Type check without emit
npm run dev          # Watch mode for development
```

### Project Structure

```
src/
├── server.ts              # MCP server entry point
├── servicenow/
│   ├── client.ts          # HTTP client (Basic Auth + OAuth)
│   └── types.ts           # 200+ TypeScript interfaces
├── tools/
│   ├── index.ts           # Router + package system
│   ├── core.ts            # Core/CMDB/ITOM tools (16)
│   ├── incident.ts        # Incident tools (7)
│   ├── problem.ts         # Problem tools (4)
│   ├── change.ts          # Change request tools (5)
│   ├── task.ts            # Task tools (4)
│   ├── knowledge.ts       # Knowledge base tools (6)
│   ├── catalog.ts         # Catalog/approval/SLA tools (10)
│   ├── user.ts            # User/group tools (8)
│   ├── reporting.ts       # Reporting/analytics tools (8)
│   ├── atf.ts             # ATF testing tools (9)
│   ├── now-assist.ts      # Now Assist / AI tools (10)
│   ├── script.ts          # Scripting tools (16)
│   └── agile.ts           # Agile/Scrum tools (9)
└── utils/
    ├── errors.ts          # ServiceNowError class
    ├── logging.ts         # Structured logging
    └── permissions.ts     # Permission tier helpers

clients/
├── claude-code/           # Claude Code setup
├── claude-desktop/        # Claude Desktop configs (basic + oauth)
├── codex/                 # OpenAI Codex client + setup
├── gemini/                # Google Gemini client + setup
├── cursor/                # Cursor MCP configs
└── vscode/                # VS Code MCP configs

docs/                      # Detailed documentation
tests/                     # Vitest test suites (41 passing)
```

---

## ServiceNow API References (Zurich Release)

This implementation targets the **ServiceNow Zurich (2025)** release APIs:

- [Table API](https://docs.servicenow.com/bundle/zurich-api-reference/page/integrate/inbound-rest/concept/c_TableAPI.html)
- [Stats / Aggregate API](https://docs.servicenow.com/bundle/zurich-api-reference/page/integrate/inbound-rest/concept/c_AggregateAPI.html)
- [Service Catalog API](https://docs.servicenow.com/bundle/zurich-api-reference/page/integrate/inbound-rest/concept/c_ServiceCatalogAPI.html)
- [Now Assist Skills API](https://docs.servicenow.com/bundle/zurich-api-reference/page/integrate/inbound-rest/concept/c_NowAssistAPI.html)
- [AI Search API](https://docs.servicenow.com/bundle/zurich-api-reference/page/integrate/inbound-rest/concept/c_AISearchAPI.html)
- [ATF Runner API](https://docs.servicenow.com/bundle/zurich-api-reference/page/administer/auto-test-framework/concept/c_ATFRunnerAPI.html)
- [Performance Analytics API](https://docs.servicenow.com/bundle/zurich-api-reference/page/integrate/inbound-rest/concept/c_PAScorecardsAPI.html)
- [OAuth 2.0](https://docs.servicenow.com/bundle/zurich-platform-security/page/administer/security/concept/c_OAuthApplications.html)

---

## Security

- **Read-only by default** — write operations require explicit opt-in via `WRITE_ENABLED=true`
- **OAuth 2.0** with token caching and automatic refresh
- **Credential redaction** — secrets never appear in logs
- **Tiered permissions** — scripting and AI features require separate flags

See [SECURITY.md](SECURITY.md) for full details.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT License — see [LICENSE](LICENSE)

---

## Support

- Issues: [GitHub Issues](https://github.com/habenani-p/servicenow-mcp/issues)

**Note**: This is an open-source community project, not an official ServiceNow product.
