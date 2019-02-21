import { Agent } from 'http';
import { Options as RetryOptions } from 'async-retry';
import { Request, RequestInit, Response } from 'node-fetch';

export type FetchOptions = RequestInit & {
	agent?: Agent
	retry?: RetryOptions
}

export type Fetch = (
	url: string | Request,
	options?: FetchOptions
) => Promise<Response>;

export default function SetupFetch(client?: Fetch): Fetch;
export * from 'node-fetch';
