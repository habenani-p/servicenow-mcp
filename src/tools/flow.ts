/**
 * Flow Designer tools — list, inspect, trigger, and monitor flows and subflows.
 * Read tools: Tier 0. Trigger/create tools: Tier 1 (WRITE_ENABLED=true).
 */
import type { ServiceNowClient } from '../servicenow/client.js';
import { ServiceNowError } from '../utils/errors.js';
import { requireWrite } from '../utils/permissions.js';

export function getFlowToolDefinitions() {
  return [
    {
      name: 'list_flows',
      description: 'List Flow Designer flows with optional filter by name, category, or active status',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search flows by name or description' },
          active: { type: 'boolean', description: 'Filter to active flows only (default true)' },
          category: { type: 'string', description: 'Filter by category (e.g., "ITSM", "HR", "Security")' },
          limit: { type: 'number', description: 'Max records to return (default 50)' },
        },
        required: [],
      },
    },
    {
      name: 'get_flow',
      description: 'Get full details of a Flow Designer flow including its actions and trigger',
      inputSchema: {
        type: 'object',
        properties: {
          name_or_sysid: { type: 'string', description: 'Flow name or sys_id' },
        },
        required: ['name_or_sysid'],
      },
    },
    {
      name: 'trigger_flow',
      description: 'Trigger a Flow Designer flow with optional input parameters (requires WRITE_ENABLED=true)',
      inputSchema: {
        type: 'object',
        properties: {
          flow_sys_id: { type: 'string', description: 'sys_id of the flow to trigger' },
          inputs: { type: 'object', description: 'Key-value pairs for flow input variables' },
        },
        required: ['flow_sys_id'],
      },
    },
    {
      name: 'get_flow_execution',
      description: 'Get the status and details of a specific flow execution',
      inputSchema: {
        type: 'object',
        properties: {
          execution_sysid: { type: 'string', description: 'sys_id of the flow execution to inspect' },
        },
        required: ['execution_sysid'],
      },
    },
    {
      name: 'list_flow_executions',
      description: 'List recent executions of a flow with status (completed, error, running)',
      inputSchema: {
        type: 'object',
        properties: {
          flow_sys_id: { type: 'string', description: 'sys_id of the parent flow' },
          status: { type: 'string', description: 'Filter by status: running, complete, error, cancelled' },
          limit: { type: 'number', description: 'Max records to return (default 25)' },
        },
        required: ['flow_sys_id'],
      },
    },
    {
      name: 'list_subflows',
      description: 'List available subflows that can be reused across flows',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search subflows by name' },
          active: { type: 'boolean', description: 'Filter to active subflows only (default true)' },
          limit: { type: 'number', description: 'Max records to return (default 50)' },
        },
        required: [],
      },
    },
    {
      name: 'get_subflow',
      description: 'Get full details of a subflow including its inputs, outputs, and actions',
      inputSchema: {
        type: 'object',
        properties: {
          name_or_sysid: { type: 'string', description: 'Subflow name or sys_id' },
        },
        required: ['name_or_sysid'],
      },
    },
    {
      name: 'list_action_instances',
      description: 'List reusable Flow Designer action instances available in the environment',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search actions by name or category' },
          category: { type: 'string', description: 'Filter by action category (e.g., "ServiceNow Core", "Integrations")' },
          limit: { type: 'number', description: 'Max records to return (default 50)' },
        },
        required: [],
      },
    },
    {
      name: 'get_process_automation',
      description: 'Get details of a Process Automation Designer playbook or process',
      inputSchema: {
        type: 'object',
        properties: {
          name_or_sysid: { type: 'string', description: 'Playbook or process name or sys_id' },
        },
        required: ['name_or_sysid'],
      },
    },
    {
      name: 'list_process_automations',
      description: 'List Process Automation Designer playbooks and processes',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search by name or description' },
          active: { type: 'boolean', description: 'Filter to active processes only (default true)' },
          limit: { type: 'number', description: 'Max records to return (default 50)' },
        },
        required: [],
      },
    },
  ];
}

export async function executeFlowToolCall(
  client: ServiceNowClient,
  name: string,
  args: Record<string, any>
): Promise<any> {
  switch (name) {
    case 'list_flows': {
      const parts: string[] = [];
      if (args.active !== false) parts.push('active=true');
      if (args.category) parts.push(`category=${args.category}`);
      if (args.query) parts.push(`nameCONTAINS${args.query}^ORdescriptionCONTAINS${args.query}`);
      return await client.queryRecords({ table: 'sys_hub_flow', query: parts.join('^') || '', limit: args.limit ?? 50 });
    }
    case 'get_flow': {
      if (!args.name_or_sysid) throw new ServiceNowError('name_or_sysid is required', 'INVALID_REQUEST');
      if (/^[0-9a-f]{32}$/i.test(args.name_or_sysid)) {
        return await client.getRecord('sys_hub_flow', args.name_or_sysid);
      }
      const resp = await client.queryRecords({ table: 'sys_hub_flow', query: `nameCONTAINS${args.name_or_sysid}`, limit: 1 });
      if (resp.count === 0) throw new ServiceNowError(`Flow not found: ${args.name_or_sysid}`, 'NOT_FOUND');
      return resp.records[0];
    }
    case 'trigger_flow': {
      requireWrite();
      if (!args.flow_sys_id) throw new ServiceNowError('flow_sys_id is required', 'INVALID_REQUEST');
      const payload = { sys_id: args.flow_sys_id, inputs: args.inputs ?? {} };
      const result = await client.createRecord('sys_hub_flow_trigger', payload);
      return { ...result, summary: `Triggered flow ${args.flow_sys_id}` };
    }
    case 'get_flow_execution': {
      if (!args.execution_sysid) throw new ServiceNowError('execution_sysid is required', 'INVALID_REQUEST');
      return await client.getRecord('sys_flow_context', args.execution_sysid);
    }
    case 'list_flow_executions': {
      if (!args.flow_sys_id) throw new ServiceNowError('flow_sys_id is required', 'INVALID_REQUEST');
      const parts = [`flow=${args.flow_sys_id}`];
      if (args.status) parts.push(`status=${args.status}`);
      return await client.queryRecords({ table: 'sys_flow_context', query: parts.join('^'), limit: args.limit ?? 25 });
    }
    case 'list_subflows': {
      const parts: string[] = [];
      if (args.active !== false) parts.push('active=true');
      if (args.query) parts.push(`nameCONTAINS${args.query}`);
      return await client.queryRecords({ table: 'sys_hub_subflow', query: parts.join('^') || '', limit: args.limit ?? 50 });
    }
    case 'get_subflow': {
      if (!args.name_or_sysid) throw new ServiceNowError('name_or_sysid is required', 'INVALID_REQUEST');
      if (/^[0-9a-f]{32}$/i.test(args.name_or_sysid)) {
        return await client.getRecord('sys_hub_subflow', args.name_or_sysid);
      }
      const resp = await client.queryRecords({ table: 'sys_hub_subflow', query: `nameCONTAINS${args.name_or_sysid}`, limit: 1 });
      if (resp.count === 0) throw new ServiceNowError(`Subflow not found: ${args.name_or_sysid}`, 'NOT_FOUND');
      return resp.records[0];
    }
    case 'list_action_instances': {
      const parts: string[] = [];
      if (args.category) parts.push(`category=${args.category}`);
      if (args.query) parts.push(`nameCONTAINS${args.query}`);
      return await client.queryRecords({ table: 'sys_hub_action_instance', query: parts.join('^') || '', limit: args.limit ?? 50 });
    }
    case 'get_process_automation': {
      if (!args.name_or_sysid) throw new ServiceNowError('name_or_sysid is required', 'INVALID_REQUEST');
      if (/^[0-9a-f]{32}$/i.test(args.name_or_sysid)) {
        return await client.getRecord('pa_process', args.name_or_sysid);
      }
      const resp = await client.queryRecords({ table: 'pa_process', query: `nameCONTAINS${args.name_or_sysid}`, limit: 1 });
      if (resp.count === 0) throw new ServiceNowError(`Process automation not found: ${args.name_or_sysid}`, 'NOT_FOUND');
      return resp.records[0];
    }
    case 'list_process_automations': {
      const parts: string[] = [];
      if (args.active !== false) parts.push('active=true');
      if (args.query) parts.push(`nameCONTAINS${args.query}^ORdescriptionCONTAINS${args.query}`);
      return await client.queryRecords({ table: 'pa_process', query: parts.join('^') || '', limit: args.limit ?? 50 });
    }
    default:
      return null;
  }
}
