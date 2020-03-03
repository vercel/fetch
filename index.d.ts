import * as http from 'http';
import * as https from 'http';
import { Options as BaseRetryOptions } from 'async-retry';
import { Request, RequestInit, Response } from 'node-fetch';

export interface RetryOptions extends BaseRetryOptions {
	maxRetryAfter?: number;
}

export type FetchOptions = RequestInit & {
	agent?: https.Agent | http.Agent
	retry?: RetryOptions
}

export type Fetch = (
	url: string | Request,
	options?: FetchOptions
) => Promise<Response>;

export default function SetupFetch(client?: Fetch, agentOptions?: http.AgentOptions | https.AgentOptions): Fetch;
export * from 'node-fetch';
