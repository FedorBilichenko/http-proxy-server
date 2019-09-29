import http, { RequestOptions } from 'http';
import parseUrl from 'url-parse';
import url from 'url';
import net from 'net';

const PORT: number = 3000;
const DEFAULT_HTTP_PORT: number = 80;
const DEFAULT_HTTPS_PORT: number = 443;
const HOST_NAME: string = 'localhost';

const onClientRequest = (
  clientReq: http.IncomingMessage,
  clientRes: http.ServerResponse,
) => {
  console.log(`server http request url: ${clientReq.url}`);
  const parsedUrl = parseUrl(clientReq.url!);

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
      srvSocket.pipe(cltSocket);
      cltSocket.pipe(srvSocket);
    });
  });
};
