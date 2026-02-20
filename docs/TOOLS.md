# Tool Reference — ServiceNow MCP Server (Latest Release)

Complete reference for all 112 tools. All tools accept a `table` parameter override where applicable.

## Permission Tiers

| Tier | Requirement | Applies To |
|------|-------------|------------|
| Read | None (default) | All query/get/list tools |
| Write | `WRITE_ENABLED=true` | Create, update, resolve, order, approve |
| CMDB Write | `WRITE_ENABLED=true` + `CMDB_WRITE_ENABLED=true` | CI create/update/relate |
| Scripting | `WRITE_ENABLED=true` + `SCRIPTING_ENABLED=true` | Business rules, script includes, changesets |
| Now Assist | `NOW_ASSIST_ENABLED=true` | AI summaries, NLQ, agentic playbooks |
| ATF | `ATF_ENABLED=true` | Run test suites and individual tests |

---

## Core & CMDB (16 tools)

### query_records
Query records from any ServiceNow table with filtering, sorting and pagination.

**Parameters**:
- `table` (required) — Table name (e.g. `incident`, `sys_user`)
- `query` — Encoded query string (e.g. `state=1^priority=1`)
- `fields` — Comma-separated list of fields to return
- `limit` — Max records to return (default: 100)
- `offset` — Pagination offset

### get_record
Retrieve a single record by sys_id.

**Parameters**:
- `table` (required) — Table name
- `sys_id` (required) — Record sys_id

### get_table_schema
Get field definitions and metadata for a table.

**Parameters**:
- `table` (required) — Table name

### get_user
Look up a ServiceNow user by username, email, or sys_id.

**Parameters**:
- `identifier` (required) — Username, email, or sys_id

### get_group
Look up a ServiceNow group by name or sys_id.

**Parameters**:
- `identifier` (required) — Group name or sys_id

### search_cmdb_ci
Search CMDB configuration items by name or class.

**Parameters**:
- `query` (required) — CI name or search query
- `ci_class` — Filter by CI class (e.g. `cmdb_ci_server`)
- `limit` — Max records (default: 25)

### get_cmdb_ci
Get full details of a CMDB configuration item.

**Parameters**:
- `sys_id` (required) — CI sys_id

### list_relationships
List relationships for a CMDB CI.

**Parameters**:
- `ci_sys_id` (required) — CI sys_id
- `relationship_type` — Filter by relationship type

### list_discovery_schedules
List active Discovery schedules and their status.

**Parameters**:
- `active` — Filter by active status (default: true)
- `limit` — Max records

### list_mid_servers
List MID server status and version information.

**Parameters**:
- `status` — Filter by status (`up`, `down`)

### list_active_events
List active Event Management events and alerts.

**Parameters**:
- `severity` — Filter by severity level
- `limit` — Max records

### cmdb_health_dashboard
Get CMDB health metrics and stale CI counts.

**Parameters**: None

### service_mapping_summary
Get Service Mapping application service summaries.

**Parameters**:
- `limit` — Max services to return

### create_change_request
Create a new change request record. **[Write]**

**Parameters**:
- `short_description` (required)
- `description`
- `type` — `normal`, `standard`, `emergency`
- `assignment_group`
- `risk` — `1` (High) to `4` (Low)

### natural_language_search
Search records using a plain English question.

**Parameters**:
- `query` (required) — Natural language question

### natural_language_update
Update a record using natural language instructions. **[Write]**

**Parameters**:
- `table` (required)
- `sys_id` (required)
- `instruction` (required) — Plain English update instruction

---

## Incident Management (7 tools)

### create_incident
Create a new incident. **[Write]**

**Parameters**:
- `short_description` (required)
- `urgency` — `1` (High), `2` (Medium), `3` (Low)
- `impact` — `1`, `2`, `3`
- `description`
- `assignment_group`
- `caller_id`

### get_incident
Get incident details by number or sys_id.

**Parameters**:
- `identifier` (required) — Incident number (INC0001234) or sys_id

### update_incident
Update an existing incident. **[Write]**

**Parameters**:
- `sys_id` (required)
- `fields` (required) — Object with fields to update

### resolve_incident
Resolve an incident with resolution code and notes. **[Write]**

**Parameters**:
- `sys_id` (required)
- `close_code` (required) — Resolution code
- `close_notes` (required) — Resolution notes

### close_incident
Close a resolved incident. **[Write]**

**Parameters**:
- `sys_id` (required)

### add_work_note
Add a work note (internal) to any task record. **[Write]**

**Parameters**:
- `table` (required) — e.g. `incident`
- `sys_id` (required)
- `note` (required)

### add_comment
Add a customer-visible comment to a task record. **[Write]**

**Parameters**:
- `table` (required)
- `sys_id` (required)
- `comment` (required)

---

## Problem Management (4 tools)

### create_problem
Create a new problem record. **[Write]**

**Parameters**:
- `short_description` (required)
- `description`
- `assignment_group`

### get_problem
Get problem details by number or sys_id.

**Parameters**:
- `identifier` (required)

### update_problem
Update an existing problem. **[Write]**

**Parameters**:
- `sys_id` (required)
- `fields` (required)

### resolve_problem
Mark a problem as resolved with fix notes. **[Write]**

**Parameters**:
- `sys_id` (required)
- `fix_notes` (required)

---

## Change Management (5 tools)

### get_change_request
Get change request details by number or sys_id.

**Parameters**:
- `identifier` (required)

### list_change_requests
List change requests with optional filters.

**Parameters**:
- `state` — Change state filter
- `type` — `normal`, `standard`, `emergency`
- `limit`

### update_change_request
Update an existing change request. **[Write]**

**Parameters**:
- `sys_id` (required)
- `fields` (required)

### submit_change_for_approval
Move a change request to the approval state. **[Write]**

**Parameters**:
- `sys_id` (required)

### close_change_request
Close a change request after implementation. **[Write]**

**Parameters**:
- `sys_id` (required)
- `close_code`
- `close_notes`

---

## Task Management (4 tools)

### get_task
Get task details by number or sys_id.

**Parameters**:
- `identifier` (required)

### list_my_tasks
List tasks assigned to the current user.

**Parameters**:
- `state` — Filter by state
- `limit`

### update_task
Update a task record. **[Write]**

**Parameters**:
- `sys_id` (required)
- `fields` (required)

### complete_task
Mark a task as complete. **[Write]**

**Parameters**:
- `sys_id` (required)
- `close_notes`

---

## Knowledge Base (6 tools)

### list_knowledge_bases
List available knowledge bases.

**Parameters**:
- `active` — Filter by active (default: true)

### search_knowledge
Search knowledge articles across all bases.

**Parameters**:
- `query` (required) — Search text
- `kb_sys_id` — Limit to specific knowledge base
- `limit`

### get_knowledge_article
Get full knowledge article content.

**Parameters**:
- `sys_id` (required)

### create_knowledge_article
Create a new knowledge article. **[Write]**

**Parameters**:
- `short_description` (required) — Article title
- `text` (required) — Article body (HTML)
- `kb_knowledge_base` — Knowledge base sys_id
- `category`

### update_knowledge_article
Update an existing knowledge article. **[Write]**

**Parameters**:
- `sys_id` (required)
- `fields` (required)

### publish_knowledge_article
Publish a draft knowledge article. **[Write]**

**Parameters**:
- `sys_id` (required)

---

## Service Catalog, Approvals & SLA (10 tools)

### list_catalog_items
List service catalog items.

**Parameters**:
- `category` — Filter by category
- `limit`

### search_catalog
Search for catalog items by name or description.

**Parameters**:
- `query` (required)
- `limit`

### get_catalog_item
Get full details of a catalog item including variables.

**Parameters**:
- `sys_id` (required)

### order_catalog_item
Place an order for a catalog item. **[Write]**

**Parameters**:
- `sys_id` (required) — Catalog item sys_id
- `quantity` — Default: 1
- `variables` — Key/value pairs for item variables

### get_my_approvals
List pending approval requests for the current user.

**Parameters**:
- `limit`

### list_approvals
List all approval requests with optional filters.

**Parameters**:
- `state` — `requested`, `approved`, `rejected`
- `limit`

### approve_request
Approve a pending approval request. **[Write]**

**Parameters**:
- `sys_id` (required) — Approval record sys_id
- `comments`

### reject_request
Reject a pending approval request. **[Write]**

**Parameters**:
- `sys_id` (required)
- `comments`

### get_sla_details
Get SLA information for a task record.

**Parameters**:
- `task_sys_id` (required)

### list_active_slas
List active SLA records approaching breach.

**Parameters**:
- `table` — Task table (default: `incident`)
- `limit`

---

## User & Group Management (8 tools)

### list_users
List ServiceNow users with optional filters.

**Parameters**:
- `query` — Encoded query
- `active` — Filter by active (default: true)
- `limit`

### create_user
Create a new user. **[Write]**

**Parameters**:
- `user_name` (required)
- `first_name`, `last_name`, `email`, `title`, `department`

### update_user
Update user record fields. **[Write]**

**Parameters**:
- `sys_id` (required)
- `fields` (required)

### list_groups
List user groups.

**Parameters**:
- `query`
- `limit`

### create_group
Create a new user group. **[Write]**

**Parameters**:
- `name` (required)
- `description`
- `manager`

### update_group
Update a user group. **[Write]**

**Parameters**:
- `sys_id` (required)
- `fields` (required)

### add_user_to_group
Add a user to a group. **[Write]**

**Parameters**:
- `user_sys_id` (required)
- `group_sys_id` (required)

### remove_user_from_group
Remove a user from a group. **[Write]**

**Parameters**:
- `user_sys_id` (required)
- `group_sys_id` (required)

---

## Reporting & Analytics (8 tools)

### list_reports
List saved reports in ServiceNow.

**Parameters**:
- `query` — Filter by name or category
- `limit`

### get_report
Get a report definition by sys_id or name.

**Parameters**:
- `identifier` (required)

### run_aggregate_query
Run an aggregate (GROUP BY + COUNT/SUM) query.

**Parameters**:
- `table` (required)
- `group_by` (required) — Field to group by
- `query` — Filter query
- `aggregate` — `COUNT`, `SUM`, `AVG` (default: `COUNT`)

### trend_query
Query record counts over time periods (monthly buckets).

**Parameters**:
- `table` (required)
- `date_field` (required) — Date field to bucket by
- `group_by` — Secondary grouping field
- `query` — Base filter
- `periods` — Number of months to include (default: 6)

### get_performance_analytics
Get Performance Analytics widget data (ServiceNow PA API).

**Parameters**:
- `widget_sys_id` (required) — PA widget sys_id
- `time_range` — e.g. `last_30_days`

### export_report_data
Export records as structured data for a given query.

**Parameters**:
- `table` (required)
- `query`
- `fields` — Comma-separated list
- `format` — `json` (default)

### get_sys_log
Retrieve system log entries.

**Parameters**:
- `level` — `error`, `warning`, `info`
- `source`
- `limit`

### list_scheduled_jobs
List scheduled jobs (sys_trigger records).

**Parameters**:
- `active` — Filter by active
- `limit`

---

## ATF Testing (9 tools) — Requires `ATF_ENABLED=true`

### list_atf_suites
List Automated Test Framework test suites.

**Parameters**:
- `active` — Filter by active
- `query`
- `limit`

### get_atf_suite
Get ATF test suite details.

**Parameters**:
- `identifier` (required) — sys_id or name

### run_atf_suite
Execute a test suite and return the result sys_id. **[ATF_ENABLED]**

**Parameters**:
- `sys_id` (required) — Suite sys_id

### list_atf_tests
List ATF test cases.

**Parameters**:
- `suite_sys_id` — Filter by suite
- `active`
- `limit`

### get_atf_test
Get ATF test case details.

**Parameters**:
- `sys_id` (required)

### run_atf_test
Execute a single ATF test. **[ATF_ENABLED]**

**Parameters**:
- `sys_id` (required)

### get_atf_suite_result
Get results of an ATF suite run.

**Parameters**:
- `result_sys_id` (required)

### list_atf_test_results
List individual test results within a suite run.

**Parameters**:
- `suite_result_sys_id`
- `limit`

### get_atf_failure_insight
**Latest release**: Get Failure Insight report showing metadata changes between the last successful and failed run — surfaces role changes and field value changes that caused test failures.

**Parameters**:
- `result_sys_id` (required)

---

## Now Assist / AI (10 tools) — Requires `NOW_ASSIST_ENABLED=true`

### nlq_query
Send a natural language question and get structured query results.

**Parameters**:
- `question` (required) — Plain English question
- `table` — Scope to a specific table

### ai_search
Semantic AI search across knowledge, catalog, and records (ServiceNow AI Search API).

**Parameters**:
- `query` (required)
- `sources` — Array: `kb`, `catalog`, `incident`, etc.
- `limit`

### generate_summary
Generate an AI summary of any record using Now Assist. **[NOW_ASSIST_ENABLED]**

**Parameters**:
- `table` (required)
- `sys_id` (required)

### suggest_resolution
Get AI-powered resolution suggestions based on similar past incidents. **[NOW_ASSIST_ENABLED]**

**Parameters**:
- `incident_sys_id` (required)

### categorize_incident
Predict incident category, assignment group, and priority using Predictive Intelligence. **[NOW_ASSIST_ENABLED]**

**Parameters**:
- `short_description` (required)
- `description`

### get_pi_models
List available Predictive Intelligence models.

**Parameters**: None

### get_virtual_agent_topics
List Virtual Agent topics.

**Parameters**:
- `active`
- `category`
- `limit`

### trigger_agentic_playbook
**Latest release**: Invoke a Now Assist Agentic Playbook. **[NOW_ASSIST_ENABLED]**

**Parameters**:
- `playbook_sys_id` (required)
- `context` — Key/value context object

### get_ms_copilot_topics
**Latest release**: List topics exposed to Microsoft Copilot 365.

**Parameters**: None

### get_virtual_agent_stream
**Latest release**: Get streaming Virtual Agent response.

**Parameters**:
- `topic_sys_id` (required)
- `session_id`

---

## Scripting (16 tools) — Requires `SCRIPTING_ENABLED=true`

All scripting tools require `WRITE_ENABLED=true` + `SCRIPTING_ENABLED=true`.

### list_business_rules
List business rule definitions.

**Parameters**:
- `table` — Filter by target table
- `active`
- `limit`

### get_business_rule
Get full business rule record including script body.

**Parameters**:
- `sys_id` (required)

### create_business_rule
Create a new business rule. **[Scripting]**

**Parameters**:
- `name` (required)
- `table` (required)
- `when` (required) — `before`, `after`, `async`, `display`
- `script` (required)
- `condition`
- `active`

### update_business_rule
Update a business rule. **[Scripting]**

**Parameters**:
- `sys_id` (required)
- `fields` (required)

### list_script_includes
List script includes.

**Parameters**:
- `query`
- `active`
- `limit`

### get_script_include
Get full script include record with script body.

**Parameters**:
- `identifier` (required) — sys_id or API name

### create_script_include
Create a new script include. **[Scripting]**

**Parameters**:
- `name` (required)
- `script` (required)
- `api_name`
- `access` — `public` or `package_private`

### update_script_include
Update a script include. **[Scripting]**

**Parameters**:
- `sys_id` (required)
- `fields` (required)

### list_client_scripts
List client scripts.

**Parameters**:
- `table`
- `type` — `onLoad`, `onChange`, `onSubmit`, `onCellEdit`
- `active`
- `limit`

### get_client_script
Get client script details and body.

**Parameters**:
- `sys_id` (required)

### create_client_script
Create a new client script. **[Scripting]**

**Parameters**:
- `name` (required)
- `table` (required)
- `type` (required)
- `script` (required)
- `condition`

### update_client_script
Update a client script. **[Scripting]**

**Parameters**:
- `sys_id` (required)
- `fields` (required)

### list_changesets
List update sets (changesets).

**Parameters**:
- `state` — `in progress`, `complete`, `ignore`
- `limit`

### get_changeset
Get changeset details.

**Parameters**:
- `identifier` (required) — sys_id or name

### commit_changeset
Commit a changeset. **[Scripting]**

**Parameters**:
- `sys_id` (required)

### publish_changeset
Publish a changeset to the target instance. **[Scripting]**

**Parameters**:
- `sys_id` (required)

---

## Agile / Scrum (9 tools)

Table names use the `AGILE_TABLE_PREFIX` env var (default: `rm_`).

### create_story
Create an agile user story. **[Write]**

**Parameters**:
- `short_description` (required)
- `description`
- `story_points`
- `sprint`
- `epic`

### update_story
Update a user story. **[Write]**

**Parameters**:
- `sys_id` (required)
- `fields` (required)

### list_stories
List user stories with optional filters.

**Parameters**:
- `sprint`
- `epic`
- `state`
- `limit`

### create_epic
Create an epic. **[Write]**

**Parameters**:
- `short_description` (required)
- `description`

### update_epic
Update an epic. **[Write]**

**Parameters**:
- `sys_id` (required)
- `fields` (required)

### list_epics
List epics.

**Parameters**:
- `state`
- `limit`

### create_scrum_task
Create a scrum task. **[Write]**

**Parameters**:
- `short_description` (required)
- `story_sys_id`
- `assigned_to`
- `hours_remaining`

### update_scrum_task
Update a scrum task. **[Write]**

**Parameters**:
- `sys_id` (required)
- `fields` (required)

### list_scrum_tasks
List scrum tasks.

**Parameters**:
- `story_sys_id`
- `assigned_to`
- `limit`

---

## See Also

- [TOOL_PACKAGES.md](TOOL_PACKAGES.md) — Role-based packages
- [NOW_ASSIST.md](NOW_ASSIST.md) — Now Assist integration guide
- [ATF.md](ATF.md) — ATF testing guide
- [SCRIPTING.md](SCRIPTING.md) — Scripting management guide
- [REPORTING.md](REPORTING.md) — Reporting and analytics guide
