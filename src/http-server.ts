import http, { RequestOptions } from 'http';
import parseUrl from 'url-parse';
import net from 'net';
import onApiRequest from './api';
import {
  localHosts,
  DEFAULT_HTTPS_PORT,
  HOST_NAME,
  DEFAULT_HTTP_PORT,
  PORT,
} from './config';
import saveRequest from './mongo/models';

const onClientRequest = async (
  clientReq: http.IncomingMessage,
  clientRes: http.ServerResponse,
) => {
  console.log(`server http request url: ${clientReq.url}`);

  const parsedUrl = parseUrl(clientReq.url!);

  const requestHostname = clientReq.headers.host!.split(':')[0];

  await saveRequest({
    hostname: requestHostname,
    port: DEFAULT_HTTP_PORT,
    path: parsedUrl.pathname,
    method: clientReq.method!,
    headers: clientReq.headers,
    date: new Date(),
  });

  if (localHosts.includes(parsedUrl.hostname)
    && parsedUrl.pathname.startsWith('/api')
    || !parsedUrl.hostname
    && parsedUrl.pathname.startsWith('/api')) {
    onApiRequest(clientReq, clientRes, false);
    return;
  }

  const options: RequestOptions = {
    hostname: parsedUrl.hostname,
    port: DEFAULT_HTTP_PORT,
    path: parsedUrl.pathname,
    method: clientReq.method!,
    headers: clientReq.headers,
  };
  const proxy: http.ClientRequest = http.request(options, (res: any): any => {
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
  const proxy = http.createServer(onClientRequest);
  proxy.listen(
    PORT,
    HOST_NAME,
    () => console.log(`Http-server is started on port ${PORT}`),
  );
  proxy.on('connect', (req, cltSocket, head) => {
    console.log(`http proxy connect emitted ${req.url}`);
    const srvSocket = net.connect(DEFAULT_HTTPS_PORT, HOST_NAME, () => {
      cltSocket.write('HTTP/1.1 200 Connection Established\r\n'
        + 'Proxy-agent: Node.js-Proxy\r\n'
        + '\r\n');
      srvSocket.write(head);
      srvSocket
        .on('error', () => console.log('srvSocket'))
        .pipe(cltSocket)
        .on('error', () => console.log('cltSocket'))
        .pipe(srvSocket);
    });
  });
};
