export async function ADD(envadd = '') {
  let addtext = String(envadd).replace(/[\t"'|\r\n]+/g, '\n').replace(/\n+/g, '\n');
  if (addtext.charAt(0) === '\n') addtext = addtext.slice(1);
  if (addtext.charAt(addtext.length - 1) === '\n') addtext = addtext.slice(0, addtext.length - 1);
  return addtext.split('\n');
}

export function nginx() {
  return `
  <!DOCTYPE html>
  <html>
  <head>
  <title>Welcome to nginx!</title>
  <style>
    body {
      width: 35em;
      margin: 0 auto;
      font-family: Tahoma, Verdana, Arial, sans-serif;
    }
  </style>
  </head>
  <body>
  <h1>Welcome to nginx!</h1>
  <p>If you see this page, the nginx web server is successfully installed and
  working. Further configuration is required.</p>

  <p>For online documentation and support please refer to
  <a href="http://nginx.org/">nginx.org</a>.<br/>
  Commercial support is available at
  <a href="http://nginx.com/">nginx.com</a>.</p>

  <p><em>Thank you for using nginx.</em></p>
  </body>
  </html>
  `;
}

export function normalizeBase64(str = '') {
  const cleanStr = (str || '').trim().replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (!cleanStr) return '';
  return cleanStr + '='.repeat((4 - cleanStr.length % 4) % 4);
}

export function base64Decode(str) {
  const normalized = normalizeBase64(str);
  const bytes = new Uint8Array(atob(normalized).split('').map(char => char.charCodeAt(0)));
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(bytes);
}

export async function MD5MD5(text) {
  const encoder = new TextEncoder();
  const firstPass = await crypto.subtle.digest('MD5', encoder.encode(text));
  const firstPassArray = Array.from(new Uint8Array(firstPass));
  const firstHex = firstPassArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  const secondPass = await crypto.subtle.digest('MD5', encoder.encode(firstHex.slice(7, 27)));
  const secondPassArray = Array.from(new Uint8Array(secondPass));
  const secondHex = secondPassArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  return secondHex.toLowerCase();
}

export function clashFix(content) {
  if (content.includes('wireguard') && !content.includes('remote-dns-resolve')) {
    const lines = content.includes('\r\n') ? content.split('\r\n') : content.split('\n');
    let result = '';
    for (const line of lines) {
      if (line.includes('type: wireguard')) {
        result += line.replace(/, mtu: 1280, udp: true/g, ', mtu: 1280, remote-dns-resolve: true, udp: true') + '\n';
      } else {
        result += line + '\n';
      }
    }
    return result;
  }
  return content;
}

export async function proxyURL(proxyURLValue, url) {
  const URLs = await ADD(proxyURLValue);
  const fullURL = URLs[Math.floor(Math.random() * URLs.length)];
  const parsedURL = new URL(fullURL);
  let URLProtocol = parsedURL.protocol.slice(0, -1) || 'https';
  let URLHostname = parsedURL.hostname;
  let URLPathname = parsedURL.pathname;
  let URLSearch = parsedURL.search;

  if (URLPathname.charAt(URLPathname.length - 1) === '/') {
    URLPathname = URLPathname.slice(0, -1);
  }
  URLPathname += url.pathname;

  const newURL = `${URLProtocol}://${URLHostname}${URLPathname}${URLSearch}`;
  const response = await fetch(newURL);
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
  newResponse.headers.set('X-New-URL', newURL);
  return newResponse;
}

export function safeDecodeURIComponent(value = '') {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function 清理空字段(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => {
      if (value === undefined || value === null || value === '') return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object') return Object.keys(value).length > 0;
      return true;
    }),
  );
}

export function 解析逗号分隔(value = '') {
  return value.split(',').map(item => item.trim()).filter(Boolean);
}
