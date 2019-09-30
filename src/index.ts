import httpServer from './http-server';
import httpsServer from './https-server';
import mongo from './mongo';

async function startProxy() {
  httpServer();
  httpsServer();
  await mongo();
}

startProxy();
