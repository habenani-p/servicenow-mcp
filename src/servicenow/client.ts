import type {
  ServiceNowConfig,
  QueryRecordsParams,
  QueryRecordsResponse,
  OAuthTokenResponse,
  ServiceNowApiResponse,
  ServiceNowRecord,
} from './types.js';
import { ServiceNowError } from '../utils/errors.js';
import { logger } from '../utils/logging.js';

export class ServiceNowClient {
  private baseUrl: string;
  private authMethod: 'oauth' | 'basic';
  private oauthConfig?: ServiceNowConfig['oauth'];
  private basicConfig?: ServiceNowConfig['basic'];
  private maxRetries: number;
  private retryDelayMs: number;
  private requestTimeoutMs: number;

  private accessToken?: string;
  private tokenExpiry?: number;

  constructor(config: ServiceNowConfig) {
    this.baseUrl = config.instanceUrl.replace(/\/$/, ''); // Remove trailing slash
    this.authMethod = config.authMethod;
    this.oauthConfig = config.oauth;
    this.basicConfig = config.basic;
    this.maxRetries = config.maxRetries || 3;
    this.retryDelayMs = config.retryDelayMs || 1000;
    this.requestTimeoutMs = config.requestTimeoutMs || 30000;
  }

  /**
   * Authenticate with ServiceNow using OAuth or Basic Auth
   */
  private async authenticate(): Promise<void> {
    if (this.authMethod === 'basic') {
      // Basic auth doesn't require token acquisition
      return;
    }

    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return; // Token still valid
    }

    // Acquire OAuth token
    if (!this.oauthConfig?.clientId || !this.oauthConfig?.clientSecret) {
      throw new ServiceNowError(
        'OAuth client ID and secret are required for OAuth authentication',
        'AUTHENTICATION_FAILED'
      );
    }

    if (!this.oauthConfig?.username || !this.oauthConfig?.password) {
      throw new ServiceNowError(
        'Username and password are required for OAuth password grant',
        'AUTHENTICATION_FAILED'
      );
    }

    const tokenUrl = `${this.baseUrl}/oauth_token.do`;
    const body = new URLSearchParams({
      grant_type: 'password',
      client_id: this.oauthConfig.clientId,
      client_secret: this.oauthConfig.clientSecret,
      username: this.oauthConfig.username,
      password: this.oauthConfig.password,
    });

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        throw new ServiceNowError(
          `OAuth authentication failed: ${response.status} ${response.statusText}`,
          'AUTHENTICATION_FAILED'
        );
      }

      const tokenData = await response.json() as OAuthTokenResponse;
      this.accessToken = tokenData.access_token;
      // Set expiry to 90% of actual expiry time for safety margin
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000 * 0.9);

      logger.debug('OAuth token acquired successfully');
    } catch (error) {
      if (error instanceof ServiceNowError) {
        throw error;
      }
      throw new ServiceNowError(
        `OAuth authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'AUTHENTICATION_FAILED'
      );
    }
  }

  /**
   * Get authorization header for requests
   */
  private getAuthHeader(): string {
    if (this.authMethod === 'basic') {
      if (!this.basicConfig?.username || !this.basicConfig?.password) {
        throw new ServiceNowError(
          'Username and password are required for Basic authentication',
          'AUTHENTICATION_FAILED'
        );
      }
      const credentials = Buffer.from(
        `${this.basicConfig.username}:${this.basicConfig.password}`
      ).toString('base64');
      return `Basic ${credentials}`;
    } else {
      if (!this.accessToken) {
        throw new ServiceNowError(
          'OAuth token not available. Call authenticate() first.',
          'AUTHENTICATION_FAILED'
        );
      }
      return `Bearer ${this.accessToken}`;
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': this.getAuthHeader(),
            ...options.headers,
          },
        });

        clearTimeout(timeout);

        // Handle HTTP errors
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error?.message) {
              errorMessage = errorJson.error.message;
            }
          } catch {
            // Error response wasn't JSON, use status text
          }

          // Map HTTP status to error codes
          let errorCode = 'API_ERROR';
          if (response.status === 401) {
            errorCode = 'AUTHENTICATION_FAILED';
          } else if (response.status === 403) {
            errorCode = 'INSUFFICIENT_PRIVILEGES';
          } else if (response.status === 404) {
            errorCode = 'NOT_FOUND';
          } else if (response.status === 400) {
            errorCode = 'INVALID_REQUEST';
          }

          throw new ServiceNowError(errorMessage, errorCode);
        }

        const data = await response.json();
        return data as T;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        // Don't retry on auth errors or invalid requests
        if (error instanceof ServiceNowError) {
          if (['AUTHENTICATION_FAILED', 'INVALID_REQUEST', 'NOT_FOUND'].includes(error.code)) {
            throw error;
          }
        }

        // Retry on network errors or server errors
        if (attempt < this.maxRetries) {
          const delay = this.retryDelayMs * Math.pow(2, attempt); // Exponential backoff
          logger.warn(`Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${this.maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Query records from a ServiceNow table
   */
  async queryRecords(params: QueryRecordsParams): Promise<QueryRecordsResponse> {
    // Authenticate before making API calls
    await this.authenticate();

    // Build query parameters
    const queryParams = new URLSearchParams();

    if (params.query) {
      queryParams.set('sysparm_query', params.query);
    }

    if (params.fields) {
      queryParams.set('sysparm_fields', params.fields);
    }

    if (params.limit !== undefined) {
      queryParams.set('sysparm_limit', Math.min(params.limit, 1000).toString());
    } else {
      queryParams.set('sysparm_limit', '10'); // Default limit
    }

    if (params.offset !== undefined) {
      queryParams.set('sysparm_offset', params.offset.toString());
    }

    if (params.orderBy) {
      // Handle descending sort (prefix with "-")
      if (params.orderBy.startsWith('-')) {
        const field = params.orderBy.substring(1);
        queryParams.set('sysparm_query',
          params.query
            ? `${params.query}^ORDERBY${field}^ORDERBYDESC`
            : `ORDERBY${field}^ORDERBYDESC`
        );
      } else {
        queryParams.set('sysparm_query',
          params.query
            ? `${params.query}^ORDERBY${params.orderBy}`
            : `ORDERBY${params.orderBy}`
        );
      }
    }

    const url = `${this.baseUrl}/api/now/table/${params.table}?${queryParams.toString()}`;

    logger.info(`Querying ServiceNow table: ${params.table}`);
    logger.debug(`Query: ${params.query || 'none'}`);

    try {
      const response = await this.request<ServiceNowApiResponse<ServiceNowRecord[]>>(url);

      return {
        count: response.result.length,
        records: response.result,
      };
    } catch (error) {
      if (error instanceof ServiceNowError) {
        throw error;
      }
      throw new ServiceNowError(
        `Failed to query records: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'QUERY_FAILED'
      );
    }
  }
}
