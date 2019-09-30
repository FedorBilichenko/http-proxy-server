export default (domain: string) => `
  cd keys;
  openssl genrsa -out ${domain}.key 2048;
  openssl req -new -sha256 -key ${domain}.key -subj "/C=RU/ST=Moscow/O=BMSTU, Inc./CN=${domain}" -out ${domain}.csr;
  openssl req -in ${domain}.csr -noout -text;
  openssl x509 -req -in ${domain}.csr -CA rootCA.crt -CAkey rootCA.key -CAcreateserial -out ${domain}.crt -days 500 -sha256;
  openssl x509 -in ${domain}.crt -text -noout;
`;
