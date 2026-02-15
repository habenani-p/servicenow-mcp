import type { ServiceNowClient } from '../servicenow/client.js';
import type { QueryRecordsParams } from '../servicenow/types.js';
import { ServiceNowError } from '../utils/errors.js';

export function getTools() {
  return [
    {
      name: 'query_records',
      description: 'Query ServiceNow records with filtering, field selection, pagination, and sorting',
      inputSchema: {
        type: 'object',
        properties: {
          table: {
            type: 'string',
            description: 'Table name (e.g., "incident", "change_request", "problem")',
          },
          query: {
            type: 'string',
            description: 'Encoded query string using ServiceNow syntax (e.g., "active=true^priority=1"). Use ^ for AND, ^OR for OR, and dot-walking for related fields (e.g., "assignment_group.name=Database")',
          },
          fields: {
            type: 'string',
            description: 'Comma-separated list of fields to return (e.g., "number,short_description,state,assigned_to"). If omitted, all fields are returned.',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of records to return (default: 10, max: 1000)',
          },
          orderBy: {
            type: 'string',
            description: 'Field to sort by. Prefix with "-" for descending order (e.g., "-sys_updated_on" for newest first)',
          },
        },
        required: ['table'],
      },
    },
  ];
}

export async function executeTool(
  client: ServiceNowClient,
  name: string,
  args: Record<string, any>
): Promise<any> {
  switch (name) {
    case 'query_records':
      return await executeQueryRecords(client, args as QueryRecordsParams);

    default:
      throw new ServiceNowError(`Unknown tool: ${name}`, 'UNKNOWN_TOOL');
  }
}

async function executeQueryRecords(
  client: ServiceNowClient,
  params: QueryRecordsParams
): Promise<any> {
  // Validate required parameters
  if (!params.table) {
    throw new ServiceNowError('Table name is required', 'INVALID_REQUEST');
  }

  // Validate limit if provided
  if (params.limit !== undefined) {
    if (params.limit < 1 || params.limit > 1000) {
      throw new ServiceNowError('Limit must be between 1 and 1000', 'INVALID_REQUEST');
    }
  }

  // Execute the query
  const response = await client.queryRecords(params);

  // Format the response for MCP
  return {
    count: response.count,
    records: response.records,
    summary: `Found ${response.count} record(s) in table "${params.table}"${params.query ? ` matching query: ${params.query}` : ''}`,
  };
}
