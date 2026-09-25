// @ts-ignore OpenNext generates this module during the build.
import nextWorker from './.open-next/worker.js';
import { homepagePostResponse, probeResponse } from './src/lib/edge-request-policy';

export default {
  fetch(request, env, ctx) {
    return probeResponse(request) ?? homepagePostResponse(request) ?? nextWorker.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<CloudflareEnv>;
