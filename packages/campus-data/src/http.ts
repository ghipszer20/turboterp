// Every request to a UMD site goes through here, so we identify ourselves
// honestly and fail loudly instead of silently caching an error page.

export const USER_AGENT =
  "TurboTerp/0.1 (unofficial UMD student project; +https://github.com/ghipszer20/turboterp)";

export class SourceError extends Error {
  readonly source: string;

  constructor(source: string, message: string) {
    super(`[${source}] ${message}`);
    this.name = "SourceError";
    this.source = source;
  }
}

type FetchInit = {
  method?: "GET" | "POST";
  body?: string;
  headers?: Record<string, string>;
};

async function request(source: string, url: string, init: FetchInit = {}): Promise<Response> {
  const res = await fetch(url, {
    method: init.method ?? "GET",
    body: init.body,
    headers: { "User-Agent": USER_AGENT, ...init.headers },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new SourceError(source, `HTTP ${res.status} for ${url}`);
  return res;
}

export async function fetchText(source: string, url: string, init?: FetchInit): Promise<string> {
  return (await request(source, url, init)).text();
}

export async function fetchJson<T>(source: string, url: string, init?: FetchInit): Promise<T> {
  return (await request(source, url, init)).json() as Promise<T>;
}

export async function fetchBytes(source: string, url: string): Promise<Uint8Array> {
  return new Uint8Array(await (await request(source, url)).arrayBuffer());
}
