import
http,
{
  IncomingMessage,
  RequestOptions,
  ServerResponse,
}
  from 'http';
import https from 'https';
import parse from 'parse-url';
import { RequestModel } from './mongo/models';


const normalizeRequests = (rawRequests) => rawRequests.map((req) => ({
  id: req._id,
  hostname: req.hostname,
  port: req.port,
  path: req.path,
  method: req.method,
  date: req.date,
}), []);


const getRequests = async (clientRes: ServerResponse) => {
  const requests = await RequestModel.find({});
  clientRes.writeHead(200, { 'Content-Type': 'text/plain' });
  clientRes.end(JSON.stringify(normalizeRequests(requests)));
};

const doRequest = async (
  id: string,
  clientReq: IncomingMessage,
  clientRes: ServerResponse,
  isHttps: boolean,
) => {
  const request = await RequestModel.findById(id);

  const options: RequestOptions = {
    hostname: request.hostname,
    port: request.port,
    path: request.pathname,
    method: request.method,
    headers: request.headers,
  };

  const proxy: http.ClientRequest = (isHttps ? https : http).request(options, (res: any): any => {
    clientRes.writeHead(res.statusCode, res.headers);

    res.pipe(<NodeJS.WritableStream>clientRes, {
      end: true,
    });
  });

  clientReq.pipe(proxy, {
    end: true,
  });
};

export default async (
  clientReq: IncomingMessage,
  clientRes: ServerResponse,
  isHttps: boolean,
) => {
  const parsedUrl = parse(clientReq.url);

  if (parsedUrl.pathname === '/api/requests') {
    await getRequests(clientRes);
    return;
  }
  if (parsedUrl.pathname.indexOf('/api/request') !== -1) {
    await doRequest(parsedUrl.query.id, clientReq, clientRes, isHttps);
  }
};
