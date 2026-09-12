declare module '@11ty/eleventy' {
  export interface EleventyOptions {
    configPath?: string;
    quietMode?: boolean;
    source?: 'cli' | 'script';
    runMode?: 'build' | 'watch' | 'serve';
    dryRun?: boolean;
  }

  export default class Eleventy {
    constructor(input?: string, output?: string, options?: EleventyOptions);
    write(): Promise<unknown>;
  }
}
