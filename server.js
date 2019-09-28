const http = require('http');
const fs = require('fs');
const parseUrl = require('url-parse');

const PORT = 3001;

const options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
  passphrase: 'Klass575428'
};

http.createServer(onRequest).listen(PORT);
console.log(`Server is listening ${PORT} port`);

function onRequest(client_req, client_res) {
  console.log('serve: ' + client_req.url);
  const parsedUrl = parseUrl(client_req.url);
  console.log(parsedUrl);

  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || 80,
    path: parsedUrl.pathname,
    method: client_req.method,
    headers: client_req.headers
  };

  const proxy = http.request(options, res => {
    client_res.writeHead(res.statusCode, res.headers);
    res.pipe(client_res, {
      end: true
    });
  });

  client_req.pipe(proxy, {
    end: true
  })
};
