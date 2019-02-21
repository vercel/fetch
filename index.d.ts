import { Request, RequestInit, Response } from 'node-fetch';

type FetchFn = (
	url: string | Request,
	init?: RequestInit & { retry: object}) => Promise<Response>;

export * from 'node-fetch';
export default function SetupFetch(client?: FetchFn): FetchFn;
