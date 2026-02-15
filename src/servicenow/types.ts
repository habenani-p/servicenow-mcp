export interface ServiceNowConfig {
  instanceUrl: string;
  authMethod: 'oauth' | 'basic';
  oauth?: {
    clientId?: string;
    clientSecret?: string;
    username?: string;
    password?: string;
  };
  basic?: {
    username?: string;
    password?: string;
  };
  maxRetries?: number;
  retryDelayMs?: number;
  requestTimeoutMs?: number;
}

export interface QueryRecordsParams {
  table: string;
  query?: string;
  fields?: string;
  limit?: number;
  orderBy?: string;
  offset?: number;
}

export interface QueryRecordsResponse {
  count: number;
  records: ServiceNowRecord[];
}

export interface ServiceNowRecord {
  [key: string]: string | number | boolean | ServiceNowReference | null | undefined;
}

export interface ServiceNowReference {
  value: string;
  display_value: string;
}

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface ServiceNowApiResponse<T = any> {
  result: T;
}

export interface ServiceNowApiError {
  error: {
    message: string;
    detail?: string;
  };
  status: string;
}
