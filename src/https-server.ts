import tls from 'tls';
import fs from 'fs';
import path from 'path';
import shell from 'shelljs';
import parseUrl from 'url-parse';
import { IncomingMessage, ServerResponse, ClientRequest } from 'http';
import https, { RequestOptions } from 'https';

import RequestModel from './mongo/models';
import generateCertificate from './generateCertificate';

const PORT: number = 443;
const DEFAULT_HTTPS_PORT: number = 443;
const HOST_NAME: string = 'localhost';

const httpsServerOptions: https.AgentOptions = {
  SNICallback: async (serverName: string, cb: any): any => {
    console.log(`SNICallback is called, hostname ${serverName}`);
    const request = new RequestModel({
      domain: serverName,
      date: new Date(),
      method: '',
      status: '',
    });

    await request.save();
    console.log(`Request to ${serverName} successfully added to db`);

    const keyPath = path.resolve(__dirname, '../keys', `${serverName}.key`);
    const certPath = path.resolve(__dirname, '../keys', `${serverName}.crt`);

    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
      if (shell.exec(generateCertificate(serverName)).code !== 0) {
        shell.echo('Error: Generating certificate is failed');
        shell.exit(1);
      }
    }

    const ctx = tls.createSecureContext({
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
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
    hostname: clientReq.headers.host,
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
