import NodeFetch, { Request, RequestInit, Response } from 'node-fetch';

export default function createFetch(fetch?: typeof NodeFetch): (
  url: string | Request,
  init?: RequestInit,
) => Promise<Response>;
