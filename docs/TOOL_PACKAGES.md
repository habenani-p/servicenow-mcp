# Role-Based Tool Packages

Set `MCP_TOOL_PACKAGE` in your environment to load a role-specific subset of tools instead of all 112. This keeps the tool list focused and relevant for each user role.

## Available Packages

| Package | Target Role | Tool Count |
|---------|-------------|------------|
| `full` | All roles (default) | 112 |
| `service_desk` | IT help desk agent | ~35 |
| `change_coordinator` | Change manager | ~25 |
| `knowledge_author` | KB content creator | ~20 |
| `catalog_builder` | Catalog administrator | ~20 |
| `system_administrator` | SysAdmin | ~30 |
| `platform_developer` | Platform developer | ~35 |
| `itom_engineer` | ITOM/CMDB engineer | ~25 |
| `agile_manager` | Agile team lead | ~20 |
| `ai_developer` | Now Assist/AI developer | ~25 |

## Usage

```bash
# In .env file
MCP_TOOL_PACKAGE=service_desk

# Or as environment variable
MCP_TOOL_PACKAGE=service_desk node dist/server.js

# In Claude Desktop config
"env": {
  "MCP_TOOL_PACKAGE": "service_desk"
}
```

## Package Definitions

### full
All 112 tools. Default when `MCP_TOOL_PACKAGE` is not set.

### service_desk
Tools for IT help desk agents handling incidents, requests, and approvals.

Includes:
- All incident tools (create, get, update, resolve, close, work notes, comments)
- All approval tools (list my approvals, approve, reject)
- Knowledge search and retrieval (read-only)
- Catalog browse and order
- SLA tracking
- Task management
- Core read tools

### change_coordinator
Tools for change managers reviewing and coordinating change requests.

Includes:
- All change request tools
- Approval tools
- Problem management (read + create)
- CMDB CI read tools
- Core read tools

### knowledge_author
Tools for creating and publishing knowledge base content.

Includes:
- Full knowledge base tools (create, update, publish)
- Catalog read tools
- Core read tools

### catalog_builder
Tools for building and managing the service catalog.

Includes:
- Full catalog tools
- User and group read tools
- Core read tools

### system_administrator
Tools for system administrators managing users, groups, and schedules.

Includes:
- Full user and group management
- Reporting and analytics
- Scheduled jobs
- System log
- Changeset management
- Core read tools

### platform_developer
Tools for platform developers managing scripts and automation.

Includes:
- Full scripting tools (business rules, script includes, client scripts)
- Changeset management
- ATF testing tools
- Core read tools
- Requires: `SCRIPTING_ENABLED=true`, `ATF_ENABLED=true`

### itom_engineer
Tools for IT operations and CMDB engineers.

Includes:
- Full CMDB tools (read + create/update with CMDB_WRITE_ENABLED)
- Discovery and MID server tools
- Event management tools
- Service Mapping
- Core read tools

### agile_manager
Tools for agile team leads managing sprints and backlogs.

Includes:
- Full agile/scrum tools (stories, epics, tasks)
- User read tools
- Core read tools

### ai_developer
Tools for developers building Now Assist and AI integrations.

Includes:
- Full Now Assist tools (NLQ, AI Search, summaries, agentic playbooks)
- Predictive Intelligence tools
- Knowledge read tools
- Core read tools
- Requires: `NOW_ASSIST_ENABLED=true`

## Permission Requirements by Package

| Package | WRITE_ENABLED | Additional Flags |
|---------|--------------|-----------------|
| `full` | Depends on use | All flags apply |
| `service_desk` | true (for create/resolve) | — |
| `change_coordinator` | true (for updates) | — |
| `knowledge_author` | true (for create/publish) | — |
| `catalog_builder` | true | — |
| `system_administrator` | true | — |
| `platform_developer` | true | `SCRIPTING_ENABLED=true`, `ATF_ENABLED=true` |
| `itom_engineer` | true | `CMDB_WRITE_ENABLED=true` |
| `agile_manager` | true | — |
| `ai_developer` | false | `NOW_ASSIST_ENABLED=true` |
