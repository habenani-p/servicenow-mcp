# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] — 2025-02-20

### Added

#### Core Architecture
- Modular domain-based tool architecture — each domain has its own `src/tools/domain.ts` file
- Role-based tool packaging via `MCP_TOOL_PACKAGE` environment variable (10 packages)
- Four-tier permission system (`WRITE_ENABLED`, `CMDB_WRITE_ENABLED`, `SCRIPTING_ENABLED`, `NOW_ASSIST_ENABLED`)
- `src/utils/permissions.ts` — centralized permission gate functions
- ATF execution gating via `ATF_ENABLED` environment variable

#### New Tool Domains (97 new tools, 112 total)
- **Incident Management** (7 tools): `create_incident`, `get_incident`, `update_incident`, `resolve_incident`, `close_incident`, `add_work_note`, `add_comment`
- **Problem Management** (4 tools): `create_problem`, `get_problem`, `update_problem`, `resolve_problem`
- **Change Management** (5 tools): `get_change_request`, `list_change_requests`, `update_change_request`, `submit_change_for_approval`, `close_change_request`
- **Task Management** (4 tools): `get_task`, `list_my_tasks`, `update_task`, `complete_task`
- **Knowledge Base** (6 tools): `list_knowledge_bases`, `search_knowledge`, `get_knowledge_article`, `create_knowledge_article`, `update_knowledge_article`, `publish_knowledge_article`
- **Service Catalog** (4 tools): `list_catalog_items`, `search_catalog`, `get_catalog_item`, `order_catalog_item`
- **Approvals** (4 tools): `get_my_approvals`, `list_approvals`, `approve_request`, `reject_request`
- **SLA** (2 tools): `get_sla_details`, `list_active_slas`
- **User & Group Management** (8 tools): `list_users`, `create_user`, `update_user`, `list_groups`, `create_group`, `update_group`, `add_user_to_group`, `remove_user_from_group`
- **Reporting & Analytics** (8 tools): `list_reports`, `get_report`, `run_aggregate_query`, `trend_query`, `get_performance_analytics`, `export_report_data`, `get_sys_log`, `list_scheduled_jobs`
- **ATF Testing** (9 tools): `list_atf_suites`, `get_atf_suite`, `run_atf_suite`, `list_atf_tests`, `get_atf_test`, `run_atf_test`, `get_atf_suite_result`, `list_atf_test_results`, `get_atf_failure_insight`
- **Now Assist / AI** (10 tools): `nlq_query`, `ai_search`, `generate_summary`, `suggest_resolution`, `categorize_incident`, `get_pi_models`, `get_virtual_agent_topics`, `trigger_agentic_playbook`, `get_ms_copilot_topics`, `get_virtual_agent_stream`
- **Scripting** (16 tools): Business rules, script includes, client scripts, changesets (full CRUD)
- **Agile / Scrum** (9 tools): Stories, epics, scrum tasks (full CRUD)

#### Latest Release API Support
- Now Assist Agentic Playbooks (`POST /api/sn_assist/playbook/trigger`)
- ATF Failure Insight (`GET /api/now/table/sys_atf_failure_insight`)
- AI Search (`GET /api/now/ai_search/search`)
- Predictive Intelligence with LightGBM (`POST /api/sn_ml/solution/{id}/predict`)
- Performance Analytics API (`GET /api/now/pa/widget/{sys_id}`)
- Stats/Aggregate API (`GET /api/now/stats/{table}`)
- Microsoft Copilot 365 topic bridge (`/api/sn_assist/copilot/topics`)
- Virtual Agent streaming API

#### Client Integration Support
- **Claude Desktop**: Basic Auth and OAuth config templates (`clients/claude-desktop/`)
- **Claude Code**: Setup guide with `claude mcp add` commands
- **OpenAI Codex / GPT-4o**: Python function-calling client (`clients/codex/servicenow_openai_client.py`)
- **Google Gemini / Vertex AI**: Python function-calling client (`clients/gemini/servicenow_gemini_client.py`)
- **Cursor**: MCP config files for basic and OAuth (`clients/cursor/.cursor/`)
- **VS Code**: MCP config files with extensions recommendations (`clients/vscode/.vscode/`)
- All clients include both `.env.basic.example` and `.env.oauth.example` files

#### ServiceNow Client Enhancements
- `createRecord(table, data)` — POST to Table API
- `updateRecord(table, sysId, data)` — PATCH to Table API
- `deleteRecord(table, sysId)` — DELETE from Table API
- `callNowAssist(endpoint, payload)` — POST to Now Assist / AI endpoints
- `runAggregateQuery(table, groupBy, aggregate, query)` — GET Stats API

#### Documentation
- Comprehensive `README.md` with beginner and advanced developer guides
- `docs/TOOLS.md` — full 112-tool reference with parameters and permissions
- `docs/TOOL_PACKAGES.md` — role-based package documentation
- `docs/CLIENT_SETUP.md` — unified setup guide for all 6 AI clients
- `docs/NOW_ASSIST.md` — Now Assist / AI integration guide
- `docs/ATF.md` — ATF testing guide with Failure Insight walkthrough
- `docs/SCRIPTING.md` — scripting management guide with latest release notes
- `docs/REPORTING.md` — reporting and analytics guide
- `docs/MULTI_INSTANCE.md` — multi-instance setup guide
- Per-client `SETUP.md` in each `clients/*/` directory
- `instances.example.json` — multi-instance config template

#### Configuration
- Updated `.env.example` with all new environment variables

### Changed
- `src/tools/index.ts` refactored into a domain router with package filtering
- Original 15 tools migrated to `src/tools/core.ts` (unchanged behavior)
- `src/servicenow/types.ts` expanded with 100+ new interfaces
- Version bumped from 1.0.0 to 2.0.0

---

## [1.0.0] — 2025-02-12

### Added
- Initial release with 15 tools
- Core platform tools: query records, get record, get table schema, get user, get group
- CMDB tools: search CI, get CI, list relationships
- ITOM tools: list discovery schedules, list MID servers, list active events, CMDB health dashboard, service mapping summary
- ITSM: create change request
- Experimental: natural language search, natural language update
- Basic Auth and OAuth 2.0 support
- Read-only by default with `WRITE_ENABLED` flag
- Vitest test suite
