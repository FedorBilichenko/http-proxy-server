import http from 'http';
import parseUrl from 'url-parse';

const PORT = 80;

const onClientRequest = (clientReq, clientRes) =>  {

};

http.createServer(onClientRequest).listen(PORT, () => console.log(`Server id started on port ${PORT}`));

