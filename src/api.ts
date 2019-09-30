import http, { ServerResponse } from 'http';
import RequestModel from './mongo/models';

const normalizeRequests = (rawRequests) => rawRequests.map((req) => ({
  id: req._id,
  domain: req.domain,
}), []);


const getRequests = async (clientRes: ServerResponse) => {
  const requests = await RequestModel.find({});
  clientRes.writeHead(200, { 'Content-Type': 'text/plain' });
  clientRes.end(JSON.stringify(normalizeRequests(requests)));
};

export default async (
  clientReq: http.IncomingMessage,
  clientRes: http.ServerResponse,
) => {
  if (clientReq.url === '/api/requests') {
    await getRequests(clientRes);
  }
};
