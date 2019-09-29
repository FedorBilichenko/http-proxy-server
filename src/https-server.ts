import https, { RequestOptions } from 'https';
import tls from 'tls';
import fs from 'fs';
import path from 'path';
import { IncomingMessage, ServerResponse, ClientRequest } from 'http';

import parseUrl from 'url-parse';

const PORT: number = 443;
const DEFAULT_HTTPS_PORT: number = 443;
const HOST_NAME: string = 'localhost';

const httpsServerOptions: https.AgentOptions = {
  SNICallback: (serverName: string, cb: any): any => {
    console.log('SNICallback');
    const ctx = tls.createSecureContext({
      key: fs.readFileSync(path.resolve(__dirname, '..', 'localhost.key')),
      cert: fs.readFileSync(path.resolve(__dirname, '..', 'localhost.crt')),
    });
    cb(null, ctx);
  },
};

const onClientRequest = (
  clientReq: IncomingMessage,
  clientRes: ServerResponse,
) => {
  console.log(`server https request url: ${clientReq.url}`);

  const parsedUrl = parseUrl(clientReq.url!);

  const options: RequestOptions = {
    hostname: parsedUrl.hostname,
    port: DEFAULT_HTTPS_PORT,
    path: parsedUrl.pathname,
    method: clientReq.method!,
    headers: clientReq.headers,
  };

  const proxy: ClientRequest = https.request(options, (res: any): any => {
    clientRes.writeHead(res.statusCode, res.headers);

    res.pipe(<NodeJS.WritableStream>clientRes, {
      end: true,
    });
  });

  clientReq.pipe(proxy, {
    end: true,
  });
};

export default () => {
  const httpsServer = https.createServer(httpsServerOptions, onClientRequest).listen(
    PORT,
    HOST_NAME,
    () => console.log(`Https-server is started on port ${PORT}`),
  );

  httpsServer.on('tlsClientError', (err) => {
    console.log('tlsClientError', err);
  });
};
