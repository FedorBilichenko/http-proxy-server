import tls from 'tls';
import fs from 'fs';
import path from 'path';
import shell from 'shelljs';
import parseUrl from 'url-parse';
import { IncomingMessage, ServerResponse, ClientRequest } from 'http';
import https, { RequestOptions } from 'https';

import generateCertificate from './generateCertificate';
import {
  localHosts,
  DEFAULT_HTTPS_PORT,
  HOST_NAME,
} from './config';
import onApiRequest from './api';
import saveRequest from './mongo/models';

const httpsServerOptions: https.AgentOptions = {
  SNICallback: async (serverName: string, cb: any): any => {
    console.log(`SNICallback is called, hostname ${serverName}`);

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

const onClientRequest = async (
  clientReq: IncomingMessage,
  clientRes: ServerResponse,
) => {
  console.log(`server https request url: ${clientReq.url}`);

  const parsedUrl = parseUrl(clientReq.url!);
  const requestHostname = clientReq.headers.host!.split(':')[0];

  await saveRequest({
    hostname: requestHostname,
    port: DEFAULT_HTTPS_PORT,
    path: parsedUrl.pathname,
    method: clientReq.method!,
    headers: clientReq.headers,
    date: new Date(),
  });

  if (localHosts.includes(parsedUrl.hostname)
    && parsedUrl.pathname.startsWith('/api')
    || !parsedUrl.hostname
    && parsedUrl.pathname.startsWith('/api')) {
    onApiRequest(clientReq, clientRes, true);
    return;
  }

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
    DEFAULT_HTTPS_PORT,
    HOST_NAME,
    () => console.log(`Https-server is started on port ${DEFAULT_HTTPS_PORT}`),
  );

  httpsServer.on('tlsClientError', (err) => {
    console.log('tlsClientError', err);
  });
};
