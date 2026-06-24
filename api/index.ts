import { appPromise } from './server.cjs';

export default async function handler(req: any, res: any) {
  console.log(`[Vercel Serverless] Incoming raw request: ${req.method} ${req.url}`);
  const app = await appPromise;
  return app(req, res);
}
