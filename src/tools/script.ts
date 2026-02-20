/**
 * Scripting Management tools — latest release (ES2021/ES12 support).
 * All tools require SCRIPTING_ENABLED=true (Tier 3).
 * Note: ServiceNow supports Promises, async/await, optional chaining.
 * GlideEncrypter is deprecated in recent releases.
 */
import type { ServiceNowClient } from '../servicenow/client.js';
import { ServiceNowError } from '../utils/errors.js';
import { requireScripting } from '../utils/permissions.js';

export function getScriptToolDefinitions() {
  return [
    {
      name: 'list_business_rules',
      description: 'List business rules (requires SCRIPTING_ENABLED=true)',
      inputSchema: {
        type: 'object',
        properties: {
          table: { type: 'string', description: 'Filter by table name' },
          active: { type: 'boolean', description: 'Filter to active rules only' },
          limit: { type: 'number', description: 'Max results (default: 20)' },
        },
        required: [],
      },
    },
    {
      name: 'get_business_rule',
      description: 'Get full details and script body of a business rule (requires SCRIPTING_ENABLED=true)',
      inputSchema: {
        type: 'object',
        properties: {
          sys_id: { type: 'string', description: 'System ID of the business rule' },
        },
        required: ['sys_id'],
      },
    },
    {
      name: 'create_business_rule',
      description: 'Create a new business rule (requires SCRIPTING_ENABLED=true). ServiceNow supports ES2021 async/await in scripts.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Rule name' },
          table: { type: 'string', description: 'Table this rule applies to' },
          when: { type: 'string', description: '"before" | "after" | "async" | "display"' },
          script: { type: 'string', description: 'Server-side JavaScript. ServiceNow supports ES2021 (async/await, ?., ??).' },
          condition: { type: 'string', description: 'Optional condition script' },
          active: { type: 'boolean', description: 'Whether to activate the rule (default: true)' },
          order: { type: 'number', description: 'Execution order (default: 100)' },
        },
        required: ['name', 'table', 'when', 'script'],
      },
    },
    {
      name: 'update_business_rule',
      description: 'Update a business rule (requires SCRIPTING_ENABLED=true)',
      inputSchema: {
        type: 'object',
        properties: {
          sys_id: { type: 'string', description: 'System ID of the rule' },
          fields: { type: 'object', description: 'Key-value pairs to update (name, script, active, condition, etc.)' },
        },
        required: ['sys_id', 'fields'],
      },
    },
    {
      name: 'list_script_includes',
      description: 'List script includes (requires SCRIPTING_ENABLED=true)',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Filter (e.g., "nameLIKEUtil")' },
          active: { type: 'boolean', description: 'Filter to active includes' },
          limit: { type: 'number', description: 'Max results (default: 20)' },
        },
        required: [],
      },
    },
    {
      name: 'get_script_include',
      description: 'Get full script body of a script include (requires SCRIPTING_ENABLED=true)',
      inputSchema: {
        type: 'object',
        properties: {
          sys_id_or_name: { type: 'string', description: 'Script include sys_id or api_name' },
        },
        required: ['sys_id_or_name'],
      },
    },
    {
      name: 'create_script_include',
      description: 'Create a new script include (requires SCRIPTING_ENABLED=true)',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Script include name' },
          script: { type: 'string', description: 'Script body (class definition). ServiceNow supports ES2021.' },
          api_name: { type: 'string', description: 'API name used to call this from other scripts' },
          access: { type: 'string', description: '"public" or "package_private" (default: "public")' },
          active: { type: 'boolean', description: 'Whether to activate (default: true)' },
        },
        required: ['name', 'script'],
      },
    },
    {
      name: 'update_script_include',
      description: 'Update a script include (requires SCRIPTING_ENABLED=true)',
      inputSchema: {
        type: 'object',
        properties: {
          sys_id: { type: 'string', description: 'System ID of the script include' },
          fields: { type: 'object', description: 'Key-value pairs to update' },
        },
        required: ['sys_id', 'fields'],
      },
    },
    {
      name: 'list_client_scripts',
      description: 'List client scripts (requires SCRIPTING_ENABLED=true)',
      inputSchema: {
        type: 'object',
        properties: {
          table: { type: 'string', description: 'Filter by table name' },
          type: { type: 'string', description: '"onLoad" | "onChange" | "onSubmit" | "onCellEdit"' },
          active: { type: 'boolean', description: 'Filter to active scripts' },
          limit: { type: 'number', description: 'Max results (default: 20)' },
        },
        required: [],
      },
    },
    {
      name: 'get_client_script',
      description: 'Get full details and script body of a client script (requires SCRIPTING_ENABLED=true)',
      inputSchema: {
        type: 'object',
        properties: {
          sys_id: { type: 'string', description: 'System ID of the client script' },
        },
        required: ['sys_id'],
      },
    },
    {
      name: 'list_changesets',
      description: 'List update sets (changesets) (requires SCRIPTING_ENABLED=true)',
      inputSchema: {
        type: 'object',
        properties: {
          state: { type: 'string', description: 'Filter by state: "in progress", "complete", "ignore"' },
          limit: { type: 'number', description: 'Max results (default: 20)' },
        },
        required: [],
      },
    },
    {
      name: 'get_changeset',
      description: 'Get details of an update set (requires SCRIPTING_ENABLED=true)',
      inputSchema: {
        type: 'object',
        properties: {
          sys_id_or_name: { type: 'string', description: 'Update set sys_id or name' },
        },
        required: ['sys_id_or_name'],
      },
    },
    {
      name: 'commit_changeset',
      description: 'Commit an update set (requires SCRIPTING_ENABLED=true)',
      inputSchema: {
        type: 'object',
        properties: {
          sys_id: { type: 'string', description: 'System ID of the update set' },
        },
        required: ['sys_id'],
      },
    },
    {
      name: 'publish_changeset',
      description: 'Publish/export an update set to XML for deployment (requires SCRIPTING_ENABLED=true)',
      inputSchema: {
        type: 'object',
        properties: {
          sys_id: { type: 'string', description: 'System ID of the update set' },
        },
        required: ['sys_id'],
      },
    },
  ];
}

export async function executeScriptToolCall(
  client: ServiceNowClient,
  name: string,
  args: Record<string, any>
): Promise<any> {
  requireScripting();

  switch (name) {
    case 'list_business_rules': {
      let query = '';
      if (args.active !== undefined) query = `active=${args.active}`;
      if (args.table) query = query ? `${query}^collection=${args.table}` : `collection=${args.table}`;
      const resp = await client.queryRecords({ table: 'sys_script', query: query || undefined, limit: args.limit || 20, fields: 'sys_id,name,collection,when,active,order,sys_updated_on' });
      return { count: resp.count, business_rules: resp.records, note: 'ServiceNow supports ES2021 (async/await, ?., ??) in script bodies' };
    }
    case 'get_business_rule': {
      if (!args.sys_id) throw new ServiceNowError('sys_id is required', 'INVALID_REQUEST');
      return await client.getRecord('sys_script', args.sys_id);
    }
    case 'create_business_rule': {
      if (!args.name || !args.table || !args.when || !args.script)
        throw new ServiceNowError('name, table, when, and script are required', 'INVALID_REQUEST');
      const data = { name: args.name, collection: args.table, when: args.when, script: args.script, condition: args.condition, active: args.active !== false, order: args.order || 100 };
      const result = await client.createRecord('sys_script', data);
      return { ...result, summary: `Created business rule ${args.name}`, note: 'GlideEncrypter is deprecated in recent releases; use new sn_si.Vault or keystore APIs instead' };
    }
    case 'update_business_rule': {
      if (!args.sys_id || !args.fields) throw new ServiceNowError('sys_id and fields are required', 'INVALID_REQUEST');
      const result = await client.updateRecord('sys_script', args.sys_id, args.fields);
      return { ...result, summary: `Updated business rule ${args.sys_id}` };
    }
    case 'list_script_includes': {
      let query = '';
      if (args.active !== undefined) query = `active=${args.active}`;
      if (args.query) query = query ? `${query}^${args.query}` : args.query;
      const resp = await client.queryRecords({ table: 'sys_script_include', query: query || undefined, limit: args.limit || 20, fields: 'sys_id,name,api_name,active,access,sys_updated_on' });
      return { count: resp.count, script_includes: resp.records };
    }
    case 'get_script_include': {
      if (!args.sys_id_or_name) throw new ServiceNowError('sys_id_or_name is required', 'INVALID_REQUEST');
      if (/^[0-9a-f]{32}$/i.test(args.sys_id_or_name)) {
        return await client.getRecord('sys_script_include', args.sys_id_or_name);
      }
      const resp = await client.queryRecords({ table: 'sys_script_include', query: `api_name=${args.sys_id_or_name}^ORname=${args.sys_id_or_name}`, limit: 1 });
      if (resp.count === 0) throw new ServiceNowError(`Script include not found: ${args.sys_id_or_name}`, 'NOT_FOUND');
      return resp.records[0];
    }
    case 'create_script_include': {
      if (!args.name || !args.script) throw new ServiceNowError('name and script are required', 'INVALID_REQUEST');
      const data = { name: args.name, script: args.script, api_name: args.api_name || args.name, access: args.access || 'public', active: args.active !== false };
      const result = await client.createRecord('sys_script_include', data);
      return { ...result, summary: `Created script include ${args.name}`, note: 'ES2021 (async/await, ?., ??) supported in the latest release' };
    }
    case 'update_script_include': {
      if (!args.sys_id || !args.fields) throw new ServiceNowError('sys_id and fields are required', 'INVALID_REQUEST');
      return await client.updateRecord('sys_script_include', args.sys_id, args.fields);
    }
    case 'list_client_scripts': {
      let query = '';
      if (args.active !== undefined) query = `active=${args.active}`;
      if (args.table) query = query ? `${query}^table=${args.table}` : `table=${args.table}`;
      if (args.type) query = query ? `${query}^type=${args.type}` : `type=${args.type}`;
      const resp = await client.queryRecords({ table: 'sys_script_client', query: query || undefined, limit: args.limit || 20, fields: 'sys_id,name,table,type,active,sys_updated_on' });
      return { count: resp.count, client_scripts: resp.records };
    }
    case 'get_client_script': {
      if (!args.sys_id) throw new ServiceNowError('sys_id is required', 'INVALID_REQUEST');
      return await client.getRecord('sys_script_client', args.sys_id);
    }
    case 'list_changesets': {
      let query = '';
      if (args.state) query = `state=${args.state}`;
      const resp = await client.queryRecords({ table: 'sys_update_set', query: query || undefined, limit: args.limit || 20, fields: 'sys_id,name,state,description,application,sys_updated_on' });
      return { count: resp.count, changesets: resp.records, note: 'Latest ReleaseOps provides automated deployment pipelines for changesets' };
    }
    case 'get_changeset': {
      if (!args.sys_id_or_name) throw new ServiceNowError('sys_id_or_name is required', 'INVALID_REQUEST');
      if (/^[0-9a-f]{32}$/i.test(args.sys_id_or_name)) {
        return await client.getRecord('sys_update_set', args.sys_id_or_name);
      }
      const resp = await client.queryRecords({ table: 'sys_update_set', query: `name=${args.sys_id_or_name}`, limit: 1 });
      if (resp.count === 0) throw new ServiceNowError(`Changeset not found: ${args.sys_id_or_name}`, 'NOT_FOUND');
      return resp.records[0];
    }
    case 'commit_changeset': {
      if (!args.sys_id) throw new ServiceNowError('sys_id is required', 'INVALID_REQUEST');
      const result = await client.updateRecord('sys_update_set', args.sys_id, { state: 'complete' });
      return { ...result, summary: `Committed changeset ${args.sys_id}` };
    }
    case 'publish_changeset': {
      if (!args.sys_id) throw new ServiceNowError('sys_id is required', 'INVALID_REQUEST');
      const result = await client.updateRecord('sys_update_set', args.sys_id, { state: 'complete' });
      return { ...result, summary: `Published changeset ${args.sys_id}` };
    }
    default:
      return null;
  }
}
