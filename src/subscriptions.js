import { ADD, base64Decode } from './utils.js';
import { 提取Clash代理块, 收集URI节点 } from './clash.js';

export async function getSUB(api, request, 追加UA, userAgentHeader) {
  if (!api || api.length === 0) {
    return [[], []];
  }
  api = [...new Set(api)];

  let newapi = '';
  let clash代理集合 = [];
  let 异常订阅 = '';
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 2000);

  try {
    const responses = await Promise.allSettled(
      api.map(apiUrl =>
        getUrl(request, apiUrl, 追加UA, userAgentHeader, controller.signal).then(response => (response.ok ? response.text() : Promise.reject(response))),
      ),
    );

    const modifiedResponses = responses.map((response, index) => {
      if (response.status === 'rejected') {
        const reason = response.reason;
        if (reason && reason.name === 'AbortError') {
          return { status: '超时', value: null, apiUrl: api[index] };
        }
        console.error(`请求失败: ${api[index]}, 错误信息: ${reason.status} ${reason.statusText}`);
        return { status: '请求失败', value: null, apiUrl: api[index] };
      }
      return { status: response.status, value: response.value, apiUrl: api[index] };
    });

    console.log(modifiedResponses);

    for (const response of modifiedResponses) {
      if (response.status !== 'fulfilled') continue;
      const content = await response.value || 'null';
      if (content.includes('proxies:')) {
        clash代理集合.push(...提取Clash代理块(content));
      } else if (content.includes('outbounds"') && content.includes('inbounds"')) {
        console.log(`暂不解析 sing-box 订阅: ${response.apiUrl}`);
      } else if (content.includes('://')) {
        newapi += content + '\n';
        clash代理集合.push(...收集URI节点(await ADD(content)));
      } else if (isValidBase64(content)) {
        const decodedContent = base64Decode(content);
        newapi += decodedContent + '\n';
        clash代理集合.push(...收集URI节点(await ADD(decodedContent)));
      } else {
        const 异常订阅LINK = `trojan://CMLiussss@127.0.0.1:8888?security=tls&allowInsecure=1&type=tcp&headerType=none#%E5%BC%82%E5%B8%B8%E8%AE%A2%E9%98%85%20${response.apiUrl.split('://')[1].split('/')[0]}`;
        console.log(`异常订阅: ${异常订阅LINK}`);
        异常订阅 += `${异常订阅LINK}\n`;
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    clearTimeout(timeout);
  }

  const 订阅内容 = await ADD(newapi + 异常订阅);
  return [订阅内容, clash代理集合];
}

export async function getUrl(request, targetUrl, 追加UA, userAgentHeader, signal) {
  const newHeaders = new Headers(request.headers);
  newHeaders.set('User-Agent', `${atob('djJyYXlOLzYuNDU=')} cmliu/CF-Workers-SUB ${追加UA}(${userAgentHeader})`);

  const modifiedRequest = new Request(targetUrl, {
    method: request.method,
    headers: newHeaders,
    body: request.method === 'GET' ? null : request.body,
    signal,
    redirect: 'follow',
    cf: {
      insecureSkipVerify: true,
      allowUntrusted: true,
      validateCertificate: false,
    },
  });

  console.log(`请求URL: ${targetUrl}`);
  console.log(`请求头: ${JSON.stringify([...newHeaders])}`);
  console.log(`请求方法: ${request.method}`);
  console.log(`请求体: ${request.method === 'GET' ? null : request.body}`);

  return fetch(modifiedRequest);
}

export function isValidBase64(str) {
  const cleanStr = str.replace(/\s/g, '');
  const base64Regex = /^[A-Za-z0-9+/_=-]+$/;
  return cleanStr.length > 0 && base64Regex.test(cleanStr);
}
