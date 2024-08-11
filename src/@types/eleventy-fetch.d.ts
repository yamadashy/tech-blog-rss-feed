declare module '@11ty/eleventy-fetch' {
  import { Buffer } from 'buffer';

  export type FetchType = 'json' | 'buffer' | 'text';

  export interface EleventyFetchOptions<TType extends FetchType = 'buffer'> {
    type?: TType;
    directory?: string;
    concurrency?: number;
    fetchOptions?: Node.RequestInit;
    dryRun?: boolean;
    removeUrlQueryParams?: boolean;
    verbose?: boolean;
    hashLength?: number;
    duration?: string;
    formatUrlForDisplay?: (url: string) => string;
  }

  export function EleventyFetch(url: string, options?: EleventyFetchOptions<'buffer'>): Promise<Buffer>;
  export function EleventyFetch<T>(url: string, options: EleventyFetchOptions<'json'>): Promise<T>;
  export function EleventyFetch(url: string, options: EleventyFetchOptions<'text'>): Promise<string>;

  export default EleventyFetch;
}
