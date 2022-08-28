import http from 'k6/http';

// This will export to HTML as filename "result.html" AND also stdout using the text summary
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";
import { sleep } from 'k6';

function post(url, body = {}) {
  http.post(url, JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function deleteFn(url, body = {}) {
  http.del(url, JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export const options = {
  insecureSkipLSVerify: false,
  noConnectionRefuse: false,
  stages: [
    { duration: '2m', target: 100 }, // below normal load
    { duration: '2m', target: 200 }, // normal load
    { duration: '2m', target: 300 }, // high load
    { duration: '2m', target: 400 }, // breaking point
    { duration: '2m', target: 10 }, // Scale down
    { duration: '2m', target: 0 },
  ]
};

export default function () {
  // const baseUrl = 'http://localhost:3000';
  const baseUrl = 'https://86bf-160-202-38-228.in.ngrok.io';

  /******************************************************** USERS ********************************************************/
  post(baseUrl + '/users/login', { username: 'testuser1', password: 'testpassword1', });
  post(baseUrl + '/users/logout', { userId: 1 });

  /******************************************************** CARTS ********************************************************/
  post(baseUrl + '/carts/', { userId: 1 });
  http.get(baseUrl + '/carts/1');
  post(baseUrl + '/carts/add', { cartId: 1, itemId: 1, });
  deleteFn(baseUrl + '/carts/remove', { cartId: 1, productId: 1, });  
  post(baseUrl + '/carts/checkout/1');

  /****************************************************** PAYMENTS *******************************************************/
  post(baseUrl + '/payments/', { cartId: 1, paymentInfo: {} });
  http.get(baseUrl + '/payments/status', { cartId: 1 });

  /****************************************************** PRODUCTS *******************************************************/
  http.get(baseUrl + '/products/?productId=1');
  http.get(baseUrl + '/products/');
  post(baseUrl + '/products/', { productInfo: { name: 'Test', price: 2.99 } });
  deleteFn(baseUrl + '/products/', { productId: 4 });
  http.patch(baseUrl + '/products/', { productInfo: { name: 'Test', price: 3.99 } });

  sleep(1);
}

export function handleSummary(data) {
  return {
    "result.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}
