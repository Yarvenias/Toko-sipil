import { appPromise } from '../dist/server.cjs';

export default async function handler(req: any, res: any) {
  const app = await appPromise;
  return app(req, res);
}
