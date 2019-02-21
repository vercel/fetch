import { Agent } from 'http';
import { Request, RequestInit, Response } from 'node-fetch';

type FetchFn = (
	url: string | Request,
	init?: RequestInit & { agent?: Agent, retry: object}) => Promise<Response>;

export * from 'node-fetch';
export default function SetupFetch(client?: FetchFn): FetchFn;
