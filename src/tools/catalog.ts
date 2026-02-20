/**
 * Service Catalog and Approval tools.
 * Read tools: Tier 0. Write tools: Tier 1 (WRITE_ENABLED=true).
 */
import type { ServiceNowClient } from '../servicenow/client.js';
import { ServiceNowError } from '../utils/errors.js';
import { requireWrite } from '../utils/permissions.js';

export function getCatalogToolDefinitions() {
  return [
    {
      name: 'list_catalog_items',
      description: 'List available service catalog items',
      inputSchema: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Filter by category name or sys_id' },
          limit: { type: 'number', description: 'Max items (default: 20)' },
        },
        required: [],
      },
    },
    {
      name: 'search_catalog',
      description: 'Search the service catalog for items matching a keyword',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search keywords' },
          limit: { type: 'number', description: 'Max results (default: 10)' },
        },
        required: ['query'],
      },
    },
    {
      name: 'get_catalog_item',
      description: 'Get full details of a catalog item including its variables',
      inputSchema: {
        type: 'object',
        properties: {
          sys_id_or_name: { type: 'string', description: 'Catalog item sys_id or name' },
        },
        required: ['sys_id_or_name'],
      },
    },
    {
      name: 'order_catalog_item',
      description: 'Order a service catalog item (requires WRITE_ENABLED=true)',
      inputSchema: {
        type: 'object',
        properties: {
          sys_id: { type: 'string', description: 'System ID of the catalog item' },
          quantity: { type: 'number', description: 'Quantity to order (default: 1)' },
          variables: { type: 'object', description: 'Catalog item variables as key-value pairs' },
        },
        required: ['sys_id'],
      },
    },
    // Approval tools
    {
      name: 'get_my_approvals',
      description: 'List approvals pending for the currently configured user',
      inputSchema: {
        type: 'object',
        properties: {
          state: { type: 'string', description: 'Filter by state: "requested", "approved", "rejected" (default: "requested")' },
        },
        required: [],
      },
    },
    {
      name: 'list_approvals',
      description: 'List approval requests with optional filters',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Encoded query filter' },
          state: { type: 'string', description: 'Approval state filter' },
          limit: { type: 'number', description: 'Max results (default: 10)' },
        },
        required: [],
      },
    },
    {
      name: 'approve_request',
      description: 'Approve a pending approval request (requires WRITE_ENABLED=true)',
      inputSchema: {
        type: 'object',
        properties: {
          sys_id: { type: 'string', description: 'System ID of the approval record' },
          comments: { type: 'string', description: 'Optional approval comments' },
        },
        required: ['sys_id'],
      },
    },
    {
      name: 'reject_request',
      description: 'Reject a pending approval request (requires WRITE_ENABLED=true)',
      inputSchema: {
        type: 'object',
        properties: {
          sys_id: { type: 'string', description: 'System ID of the approval record' },
          comments: { type: 'string', description: 'Reason for rejection (required)' },
        },
        required: ['sys_id', 'comments'],
      },
    },
    // SLA tools
    {
      name: 'get_sla_details',
      description: 'Get SLA breach status for a specific task or incident',
      inputSchema: {
        type: 'object',
        properties: {
          task_sys_id: { type: 'string', description: 'System ID of the task/incident' },
        },
        required: ['task_sys_id'],
      },
    },
    {
      name: 'list_active_slas',
      description: 'List active SLA records with optional filters',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Encoded query filter' },
          limit: { type: 'number', description: 'Max results (default: 10)' },
        },
        required: [],
      },
    },
  ];
}

export async function executeCatalogToolCall(
  client: ServiceNowClient,
  name: string,
  args: Record<string, any>
): Promise<any> {
  switch (name) {
    case 'list_catalog_items': {
      let query = 'active=true';
      if (args.category) query += `^category.title=${args.category}^ORcategory=${args.category}`;
      const resp = await client.queryRecords({ table: 'sc_cat_item', query, limit: args.limit || 20, fields: 'sys_id,name,short_description,category,price' });
      return { count: resp.count, catalog_items: resp.records };
    }
    case 'search_catalog': {
      if (!args.query) throw new ServiceNowError('query is required', 'INVALID_REQUEST');
      const resp = await client.queryRecords({ table: 'sc_cat_item', query: `nameLIKE${args.query}^ORshort_descriptionLIKE${args.query}^active=true`, limit: args.limit || 10 });
      return { count: resp.count, catalog_items: resp.records };
    }
    case 'get_catalog_item': {
      if (!args.sys_id_or_name) throw new ServiceNowError('sys_id_or_name is required', 'INVALID_REQUEST');
      if (/^[0-9a-f]{32}$/i.test(args.sys_id_or_name)) {
        return await client.getRecord('sc_cat_item', args.sys_id_or_name);
      }
      const resp = await client.queryRecords({ table: 'sc_cat_item', query: `name=${args.sys_id_or_name}`, limit: 1 });
      if (resp.count === 0) throw new ServiceNowError(`Catalog item not found: ${args.sys_id_or_name}`, 'NOT_FOUND');
      return resp.records[0];
    }
    case 'order_catalog_item': {
      requireWrite();
      if (!args.sys_id) throw new ServiceNowError('sys_id is required', 'INVALID_REQUEST');
      // Use Service Catalog API: POST /api/now/v1/servicecatalog/items/{sys_id}/order_now
      const result = await client.callNowAssist(`/api/now/v1/servicecatalog/items/${args.sys_id}/order_now`, {
        sysparm_quantity: args.quantity || 1,
        variables: args.variables || {},
      });
      return { ...result, summary: `Ordered catalog item ${args.sys_id}` };
    }
    case 'get_my_approvals': {
      const username = process.env.SERVICENOW_USERNAME || process.env.SERVICENOW_BASIC_USERNAME || '';
      const state = args.state || 'requested';
      let query = `state=${state}`;
      if (username) query += `^approver.user_name=${username}`;
      const resp = await client.queryRecords({ table: 'sysapproval_approver', query, limit: 20, fields: 'sys_id,state,approver,sysapproval,comments,sys_updated_on' });
      return { count: resp.count, approvals: resp.records };
    }
    case 'list_approvals': {
      let query = args.query || '';
      if (args.state) query = query ? `${query}^state=${args.state}` : `state=${args.state}`;
      const resp = await client.queryRecords({ table: 'sysapproval_approver', query: query || undefined, limit: args.limit || 10 });
      return { count: resp.count, approvals: resp.records };
    }
    case 'approve_request': {
      requireWrite();
      if (!args.sys_id) throw new ServiceNowError('sys_id is required', 'INVALID_REQUEST');
      const data: Record<string, string> = { state: 'approved' };
      if (args.comments) data.comments = args.comments;
      const result = await client.updateRecord('sysapproval_approver', args.sys_id, data);
      return { ...result, summary: `Approved request ${args.sys_id}` };
    }
    case 'reject_request': {
      requireWrite();
      if (!args.sys_id || !args.comments) throw new ServiceNowError('sys_id and comments are required', 'INVALID_REQUEST');
      const result = await client.updateRecord('sysapproval_approver', args.sys_id, { state: 'rejected', comments: args.comments });
      return { ...result, summary: `Rejected request ${args.sys_id}` };
    }
    case 'get_sla_details': {
      if (!args.task_sys_id) throw new ServiceNowError('task_sys_id is required', 'INVALID_REQUEST');
      const resp = await client.queryRecords({ table: 'task_sla', query: `task=${args.task_sys_id}`, fields: 'sys_id,sla,stage,has_breached,percentage,pause_time,business_time_left,sys_updated_on' });
      return { count: resp.count, slas: resp.records };
    }
    case 'list_active_slas': {
      let query = 'stage!=complete^has_breached=false';
      if (args.query) query = `${args.query}^${query}`;
      const resp = await client.queryRecords({ table: 'task_sla', query, limit: args.limit || 10 });
      return { count: resp.count, slas: resp.records };
    }
    default:
      return null;
  }
}
