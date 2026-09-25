// @ts-ignore OpenNext generates this module during the build.
import nextWorker from './.open-next/worker.js';
import { probeResponse } from './src/lib/edge-request-policy';

export default {
  fetch(request, env, ctx) {
    return probeResponse(request) ?? nextWorker.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<CloudflareEnv>;
