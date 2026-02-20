/**
 * Change Request Management tools.
 * Read tools: Tier 0. Write tools: Tier 1 (WRITE_ENABLED=true).
 */
import type { ServiceNowClient } from '../servicenow/client.js';
import { ServiceNowError } from '../utils/errors.js';
import { requireWrite } from '../utils/permissions.js';

export function getChangeToolDefinitions() {
  return [
    {
      name: 'get_change_request',
      description: 'Get full details of a change request by number (CHG...) or sys_id',
      inputSchema: {
        type: 'object',
        properties: {
          number_or_sysid: { type: 'string', description: 'Change number (CHG...) or sys_id' },
        },
        required: ['number_or_sysid'],
      },
    },
    {
      name: 'update_change_request',
      description: 'Update fields on a change request (requires WRITE_ENABLED=true)',
      inputSchema: {
        type: 'object',
        properties: {
          sys_id: { type: 'string', description: 'System ID of the change request' },
          fields: { type: 'object', description: 'Key-value pairs to update' },
        },
        required: ['sys_id', 'fields'],
      },
    },
    {
      name: 'list_change_requests',
      description: 'List change requests with optional filtering by state or query',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Encoded query filter' },
          state: { type: 'string', description: 'Change state (e.g., "-5"=Requested, "-4"=Draft, "0"=Open)' },
          limit: { type: 'number', description: 'Max records (default: 10)' },
        },
        required: [],
      },
    },
    {
      name: 'submit_change_for_approval',
      description: 'Move a change request to "Requested" state for approval (requires WRITE_ENABLED=true)',
      inputSchema: {
        type: 'object',
        properties: {
          sys_id: { type: 'string', description: 'System ID of the change request' },
        },
        required: ['sys_id'],
      },
    },
    {
      name: 'close_change_request',
      description: 'Close a change request with close code and notes (requires WRITE_ENABLED=true)',
      inputSchema: {
        type: 'object',
        properties: {
          sys_id: { type: 'string', description: 'System ID of the change request' },
          close_code: { type: 'string', description: 'Close code (e.g., "successful", "unsuccessful")' },
          close_notes: { type: 'string', description: 'Closure notes' },
        },
        required: ['sys_id', 'close_code', 'close_notes'],
      },
    },
  ];
}

export async function executeChangeToolCall(
  client: ServiceNowClient,
  name: string,
  args: Record<string, any>
): Promise<any> {
  switch (name) {
    case 'get_change_request': {
      if (!args.number_or_sysid) throw new ServiceNowError('number_or_sysid is required', 'INVALID_REQUEST');
      if (/^[0-9a-f]{32}$/i.test(args.number_or_sysid)) {
        return await client.getRecord('change_request', args.number_or_sysid);
      }
      const resp = await client.queryRecords({ table: 'change_request', query: `number=${args.number_or_sysid}`, limit: 1 });
      if (resp.count === 0) throw new ServiceNowError(`Change request not found: ${args.number_or_sysid}`, 'NOT_FOUND');
      return resp.records[0];
    }
    case 'update_change_request': {
      requireWrite();
      if (!args.sys_id || !args.fields) throw new ServiceNowError('sys_id and fields are required', 'INVALID_REQUEST');
      const result = await client.updateRecord('change_request', args.sys_id, args.fields);
      return { ...result, summary: `Updated change request ${args.sys_id}` };
    }
    case 'list_change_requests': {
      let query = args.query || '';
      if (args.state) query = query ? `${query}^state=${args.state}` : `state=${args.state}`;
      const resp = await client.queryRecords({ table: 'change_request', query: query || undefined, limit: args.limit || 10 });
      return { count: resp.count, records: resp.records };
    }
    case 'submit_change_for_approval': {
      requireWrite();
      if (!args.sys_id) throw new ServiceNowError('sys_id is required', 'INVALID_REQUEST');
      const result = await client.updateRecord('change_request', args.sys_id, { state: '-5' });
      return { ...result, summary: `Submitted change request ${args.sys_id} for approval` };
    }
    case 'close_change_request': {
      requireWrite();
      if (!args.sys_id || !args.close_code || !args.close_notes)
        throw new ServiceNowError('sys_id, close_code, and close_notes are required', 'INVALID_REQUEST');
      const result = await client.updateRecord('change_request', args.sys_id, {
        state: '3',
        close_code: args.close_code,
        close_notes: args.close_notes,
      });
      return { ...result, summary: `Closed change request ${args.sys_id}` };
    }
    default:
      return null;
  }
}
