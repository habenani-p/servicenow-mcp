/**
 * Tool Router — aggregates all domain tool modules and implements the
 * MCP_TOOL_PACKAGE role-based packaging system.
 *
 * Tool packages (set via MCP_TOOL_PACKAGE env var):
 *   full (default), service_desk, change_coordinator, knowledge_author,
 *   catalog_builder, system_administrator, platform_developer, itom_engineer,
 *   agile_manager, ai_developer
 */
import type { ServiceNowClient } from '../servicenow/client.js';
import { ServiceNowError } from '../utils/errors.js';

// Core (existing 15 tools)
import { getCoreToolDefinitions, executeCoreToolCall } from './core.js';
// ITSM
import { getIncidentToolDefinitions, executeIncidentToolCall } from './incident.js';
import { getProblemToolDefinitions, executeProblemToolCall } from './problem.js';
import { getChangeToolDefinitions, executeChangeToolCall } from './change.js';
import { getTaskToolDefinitions, executeTaskToolCall } from './task.js';
// Service Management
import { getKnowledgeToolDefinitions, executeKnowledgeToolCall } from './knowledge.js';
import { getCatalogToolDefinitions, executeCatalogToolCall } from './catalog.js';
// User / Group
import { getUserToolDefinitions, executeUserToolCall } from './user.js';
// Reporting & Analytics
import { getReportingToolDefinitions, executeReportingToolCall } from './reporting.js';
// ATF
import { getAtfToolDefinitions, executeAtfToolCall } from './atf.js';
// Now Assist / AI
import { getNowAssistToolDefinitions, executeNowAssistToolCall } from './now-assist.js';
// Scripting
import { getScriptToolDefinitions, executeScriptToolCall } from './script.js';
// Agile
import { getAgileToolDefinitions, executeAgileToolCall } from './agile.js';

// ─── Package Definitions ──────────────────────────────────────────────────────

const PACKAGE_TOOL_NAMES: Record<string, string[]> = {
  service_desk: [
    // Core read
    'query_records', 'get_record', 'get_user', 'get_group',
    // Incident full lifecycle
    'create_incident', 'get_incident', 'update_incident', 'resolve_incident', 'close_incident', 'add_work_note', 'add_comment',
    // Approvals
    'get_my_approvals', 'approve_request', 'reject_request',
    // Knowledge read
    'search_knowledge', 'get_knowledge_article', 'list_knowledge_bases',
    // SLA
    'get_sla_details', 'list_active_slas',
    // Tasks
    'get_task', 'list_my_tasks', 'complete_task',
    // Natural language
    'natural_language_search',
  ],
  change_coordinator: [
    'query_records', 'get_record', 'get_user', 'get_group',
    'create_change_request', 'get_change_request', 'update_change_request', 'list_change_requests', 'submit_change_for_approval', 'close_change_request',
    'get_my_approvals', 'approve_request', 'reject_request',
    'get_problem', 'list_change_requests',
    'search_cmdb_ci', 'get_cmdb_ci', 'list_relationships',
  ],
  knowledge_author: [
    'query_records', 'get_record', 'get_user',
    'list_knowledge_bases', 'search_knowledge', 'get_knowledge_article', 'create_knowledge_article', 'update_knowledge_article', 'publish_knowledge_article',
    'list_catalog_items', 'search_catalog', 'get_catalog_item',
  ],
  catalog_builder: [
    'query_records', 'get_record', 'get_user',
    'list_catalog_items', 'search_catalog', 'get_catalog_item', 'order_catalog_item',
    'list_users', 'list_groups',
  ],
  system_administrator: [
    'query_records', 'get_record', 'get_user', 'get_group', 'get_table_schema',
    'list_users', 'create_user', 'update_user', 'list_groups', 'create_group', 'update_group', 'add_user_to_group', 'remove_user_from_group',
    'list_reports', 'get_report', 'run_aggregate_query', 'trend_query', 'export_report_data', 'get_sys_log', 'list_scheduled_jobs',
  ],
  platform_developer: [
    'query_records', 'get_record', 'get_table_schema',
    'list_business_rules', 'get_business_rule', 'create_business_rule', 'update_business_rule',
    'list_script_includes', 'get_script_include', 'create_script_include', 'update_script_include',
    'list_client_scripts', 'get_client_script',
    'list_changesets', 'get_changeset', 'commit_changeset', 'publish_changeset',
    'list_atf_suites', 'get_atf_suite', 'run_atf_suite', 'list_atf_tests', 'get_atf_test', 'run_atf_test', 'get_atf_suite_result', 'list_atf_test_results', 'get_atf_failure_insight',
  ],
  itom_engineer: [
    'query_records', 'get_record', 'get_table_schema',
    'search_cmdb_ci', 'get_cmdb_ci', 'list_relationships', 'cmdb_health_dashboard', 'service_mapping_summary',
    'list_discovery_schedules', 'list_mid_servers', 'list_active_events',
    'run_aggregate_query', 'trend_query',
  ],
  agile_manager: [
    'query_records', 'get_record', 'get_user',
    'create_story', 'update_story', 'list_stories',
    'create_epic', 'update_epic', 'list_epics',
    'create_scrum_task', 'update_scrum_task', 'list_scrum_tasks',
    'list_users',
  ],
  ai_developer: [
    'query_records', 'get_record', 'natural_language_search',
    'nlq_query', 'ai_search', 'generate_summary', 'suggest_resolution', 'categorize_incident',
    'get_virtual_agent_topics', 'trigger_agentic_playbook', 'get_ms_copilot_topics', 'generate_work_notes', 'get_pi_models',
    'search_knowledge', 'get_knowledge_article',
  ],
};

// ─── All Tool Definitions ─────────────────────────────────────────────────────

const ALL_TOOLS = [
  ...getCoreToolDefinitions(),
  ...getIncidentToolDefinitions(),
  ...getProblemToolDefinitions(),
  ...getChangeToolDefinitions(),
  ...getTaskToolDefinitions(),
  ...getKnowledgeToolDefinitions(),
  ...getCatalogToolDefinitions(),
  ...getUserToolDefinitions(),
  ...getReportingToolDefinitions(),
  ...getAtfToolDefinitions(),
  ...getNowAssistToolDefinitions(),
  ...getScriptToolDefinitions(),
  ...getAgileToolDefinitions(),
];

// ─── Public API ───────────────────────────────────────────────────────────────

export function getTools() {
  const packageName = (process.env.MCP_TOOL_PACKAGE || 'full').toLowerCase();

  if (packageName === 'full') {
    return ALL_TOOLS;
  }

  const allowed = PACKAGE_TOOL_NAMES[packageName];
  if (!allowed) {
    console.error(`[WARN] Unknown MCP_TOOL_PACKAGE "${packageName}". Using "full".`);
    return ALL_TOOLS;
  }

  const allowedSet = new Set(allowed);
  return ALL_TOOLS.filter(t => allowedSet.has(t.name));
}

export async function executeTool(
  client: ServiceNowClient,
  name: string,
  args: Record<string, any>
): Promise<any> {
  // Try each domain handler in order; first non-null result wins
  const handlers = [
    () => executeCoreToolCall(client, name, args),
    () => executeIncidentToolCall(client, name, args),
    () => executeProblemToolCall(client, name, args),
    () => executeChangeToolCall(client, name, args),
    () => executeTaskToolCall(client, name, args),
    () => executeKnowledgeToolCall(client, name, args),
    () => executeCatalogToolCall(client, name, args),
    () => executeUserToolCall(client, name, args),
    () => executeReportingToolCall(client, name, args),
    () => executeAtfToolCall(client, name, args),
    () => executeNowAssistToolCall(client, name, args),
    () => executeScriptToolCall(client, name, args),
    () => executeAgileToolCall(client, name, args),
  ];

  for (const handler of handlers) {
    const result = await handler();
    if (result !== null) return result;
  }

  throw new ServiceNowError(`Unknown tool: ${name}`, 'UNKNOWN_TOOL');
}
