/**
 * Reporting & Analytics tools — ServiceNow Reporting API.
 * All tools are Tier 0 (read-only) unless noted.
 * ServiceNow API: GET /api/now/reporting, /api/now/stats/{table}, /api/now/pa/widget/{sys_id}
 */
import type { ServiceNowClient } from '../servicenow/client.js';
import { ServiceNowError } from '../utils/errors.js';

export function getReportingToolDefinitions() {
  return [
    {
      name: 'list_reports',
      description: 'List saved reports in the instance (latest release: /api/now/reporting)',
      inputSchema: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Search reports by name (uses sysparm_contains)' },
          category: { type: 'string', description: 'Filter by report category' },
          limit: { type: 'number', description: 'Max results (default: 20)' },
        },
        required: [],
      },
    },
    {
      name: 'get_report',
      description: 'Get the definition and metadata of a saved report',
      inputSchema: {
        type: 'object',
        properties: {
          sys_id_or_name: { type: 'string', description: 'Report sys_id or exact name' },
        },
        required: ['sys_id_or_name'],
      },
    },
    {
      name: 'run_aggregate_query',
      description: 'Run a grouped aggregate (COUNT, SUM, AVG) query on any table (latest release: /api/now/stats/{table})',
      inputSchema: {
        type: 'object',
        properties: {
          table: { type: 'string', description: 'Table to query (e.g., "incident", "task_sla")' },
          group_by: { type: 'string', description: 'Field to group results by (e.g., "priority", "state", "assignment_group")' },
          aggregate: { type: 'string', description: 'Aggregate function: COUNT (default), SUM, AVG, MIN, MAX' },
          query: { type: 'string', description: 'Optional encoded query filter' },
          limit: { type: 'number', description: 'Max groups (default: 20)' },
        },
        required: ['table', 'group_by'],
      },
    },
    {
      name: 'trend_query',
      description: 'Get time-bucketed trend data for a table (useful for monthly/weekly trend charts)',
      inputSchema: {
        type: 'object',
        properties: {
          table: { type: 'string', description: 'Table name (e.g., "incident")' },
          date_field: { type: 'string', description: 'Date field to bucket by (e.g., "opened_at", "sys_created_on")' },
          group_by: { type: 'string', description: 'Secondary grouping field (e.g., "priority", "state")' },
          query: { type: 'string', description: 'Optional encoded query filter' },
          periods: { type: 'number', description: 'Number of months to look back (default: 6)' },
        },
        required: ['table', 'date_field', 'group_by'],
      },
    },
    {
      name: 'get_performance_analytics',
      description: 'Get Performance Analytics widget data (requires PA plugin; latest release: /api/now/pa/widget/{sys_id})',
      inputSchema: {
        type: 'object',
        properties: {
          widget_sys_id: { type: 'string', description: 'sys_id of the PA widget' },
          time_range: { type: 'string', description: 'Time range (e.g., "last_30_days", "last_quarter")' },
        },
        required: ['widget_sys_id'],
      },
    },
    {
      name: 'export_report_data',
      description: 'Export raw table data as structured JSON for use in external reports',
      inputSchema: {
        type: 'object',
        properties: {
          table: { type: 'string', description: 'Table to export from' },
          query: { type: 'string', description: 'Encoded query filter' },
          fields: { type: 'string', description: 'Comma-separated fields to include' },
          limit: { type: 'number', description: 'Max records (default: 100, max: 1000)' },
        },
        required: ['table'],
      },
    },
    {
      name: 'get_sys_log',
      description: 'Retrieve system log entries for debugging or auditing',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Filter (e.g., "level=error^sys_created_onONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()")' },
          limit: { type: 'number', description: 'Max entries (default: 20)' },
        },
        required: [],
      },
    },
    {
      name: 'list_scheduled_jobs',
      description: 'List scheduled jobs and their run schedules',
      inputSchema: {
        type: 'object',
        properties: {
          active: { type: 'boolean', description: 'Filter to active jobs only (default: true)' },
          query: { type: 'string', description: 'Additional filter' },
          limit: { type: 'number', description: 'Max results (default: 20)' },
        },
        required: [],
      },
    },
  ];
}

export async function executeReportingToolCall(
  client: ServiceNowClient,
  name: string,
  args: Record<string, any>
): Promise<any> {
  switch (name) {
    case 'list_reports': {
      // Latest release: /api/now/reporting supports sysparm_contains for name search
      let query = '';
      if (args.search) query = `nameLIKE${args.search}`;
      if (args.category) query = query ? `${query}^categoryLIKE${args.category}` : `categoryLIKE${args.category}`;
      const resp = await client.queryRecords({ table: 'sys_report', query: query || undefined, limit: args.limit || 20, fields: 'sys_id,title,table,type,category,sys_updated_on,user' });
      return { count: resp.count, reports: resp.records };
    }
    case 'get_report': {
      if (!args.sys_id_or_name) throw new ServiceNowError('sys_id_or_name is required', 'INVALID_REQUEST');
      if (/^[0-9a-f]{32}$/i.test(args.sys_id_or_name)) {
        return await client.getRecord('sys_report', args.sys_id_or_name);
      }
      const resp = await client.queryRecords({ table: 'sys_report', query: `title=${args.sys_id_or_name}`, limit: 1 });
      if (resp.count === 0) throw new ServiceNowError(`Report not found: ${args.sys_id_or_name}`, 'NOT_FOUND');
      return resp.records[0];
    }
    case 'run_aggregate_query': {
      if (!args.table || !args.group_by) throw new ServiceNowError('table and group_by are required', 'INVALID_REQUEST');
      const result = await client.runAggregateQuery(args.table, args.group_by, args.aggregate || 'COUNT', args.query);
      return { table: args.table, group_by: args.group_by, aggregate: args.aggregate || 'COUNT', results: result };
    }
    case 'trend_query': {
      if (!args.table || !args.date_field || !args.group_by)
        throw new ServiceNowError('table, date_field, and group_by are required', 'INVALID_REQUEST');
      const periods = args.periods || 6;
      const results = [];
      for (let i = periods - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const q = `${args.date_field}BETWEEN${year}-${month}-01 00:00:00@${year}-${month}-31 23:59:59`;
        const fullQuery = args.query ? `${args.query}^${q}` : q;
        try {
          const result = await client.runAggregateQuery(args.table, args.group_by, 'COUNT', fullQuery);
          results.push({ period: `${year}-${month}`, data: result });
        } catch {
          results.push({ period: `${year}-${month}`, data: [] });
        }
      }
      return { table: args.table, date_field: args.date_field, group_by: args.group_by, periods: results };
    }
    case 'get_performance_analytics': {
      if (!args.widget_sys_id) throw new ServiceNowError('widget_sys_id is required', 'INVALID_REQUEST');
      // ServiceNow PA API: GET /api/now/pa/widget/{sys_id}
      try {
        const result = await client.callNowAssist(`/api/now/pa/widget/${args.widget_sys_id}`, {});
        return { widget_sys_id: args.widget_sys_id, data: result };
      } catch {
        // Fallback: query PA data table
        const resp = await client.queryRecords({ table: 'pa_job_log', query: `sys_id=${args.widget_sys_id}`, limit: 1 });
        return { widget_sys_id: args.widget_sys_id, data: resp.records[0] || {} };
      }
    }
    case 'export_report_data': {
      if (!args.table) throw new ServiceNowError('table is required', 'INVALID_REQUEST');
      const resp = await client.queryRecords({ table: args.table, query: args.query, fields: args.fields, limit: Math.min(args.limit || 100, 1000) });
      return { table: args.table, count: resp.count, records: resp.records, exported_at: new Date().toISOString() };
    }
    case 'get_sys_log': {
      const resp = await client.queryRecords({ table: 'syslog', query: args.query || undefined, limit: args.limit || 20, orderBy: '-sys_created_on' });
      return { count: resp.count, entries: resp.records };
    }
    case 'list_scheduled_jobs': {
      let query = args.active !== false ? 'active=true' : '';
      if (args.query) query = query ? `${query}^${args.query}` : args.query;
      const resp = await client.queryRecords({ table: 'sysauto', query: query || undefined, limit: args.limit || 20, fields: 'sys_id,name,run_type,run_time,next_action,active,last_run_time' });
      return { count: resp.count, jobs: resp.records };
    }
    default:
      return null;
  }
}
