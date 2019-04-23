import { Request, RequestInit, Response } from 'node-fetch';

export default function createFetch(): (
    url: string | Request,
    init?: RequestInit
) => Promise<Response>;
