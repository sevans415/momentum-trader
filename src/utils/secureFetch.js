import crypto from "crypto";

// const staticAuthHeaders = {
//   "CB-ACCESS-KEY": process.env.REACT_APP_COINBASE_API_KEY,
//   "CB-ACCESS-PASSPHRASE": process.env.REACT_APP_COINBASE_API_PASSPHRASE
// };

const defaultOptions = {
  mode: "cors"
};

// eslint-disable-next-line
const generateAuthHeaders = (requestPath, method, body) => {
  const timestamp = Date.now() / 1000;
  const stringifiedBody = body === undefined ? "" : JSON.stringify(body);

  const prehashString = timestamp + method.toUpperCase() + stringifiedBody;

  const hmac = crypto.createHmac(
    "sha256",
    process.env.REACT_APP_COINBASE_API_SECRET
  );

  const signedMessage = hmac.update(prehashString).digest("base64");

  return {
    "CB-ACCESS-TIMESTAMP": timestamp,
    "CB-ACCESS-SIGN": signedMessage
  };
};

export const secureFetch = (path, options = {}, body) => {
  // const generatedAuthHeaders = generateAuthHeaders(path, method, body);
  const headers = {
    // ...staticAuthHeaders,
    // ...generatedAuthHeaders,
    ...options.headers
  };

  const finalOptions = {
    ...defaultOptions,
    headers: new Headers(headers),
    method: options.method || "GET",
    body: body ? JSON.stringify(body) : undefined
  };

  return fetch(
    `${process.env.REACT_APP_COINBASE_BASE_URL}${path}`,
    finalOptions
  );
};
