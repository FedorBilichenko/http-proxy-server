const https = require('https');
const fs = require('fs');
const parseUrl = require('url-parse');

const PORT = 443;

const SNICallBack = (servername, cb) => {
  console.log('here');
};

const options = {
  SNICallBack,
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
  passphrase: 'Klass575428'
};

https.createServer(options, onRequest).listen(PORT);
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

  const proxy = https.request(options, res => {
    client_res.writeHead(res.statusCode, res.headers);
    res.pipe(client_res, {
      end: true
    });
  });

  client_req.pipe(proxy, {
    end: true
  })
}
