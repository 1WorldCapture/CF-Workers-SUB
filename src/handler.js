import { buildRuntimeState } from './config.js';
import { 标准化Clash节点, 构建默认代理组, 生成Clash配置, 生成内置Clash配置, 收集URI节点, 规范化URI节点 } from './clash.js';
import { handleKVEditor, 读取订阅缓存, 写入订阅缓存, 迁移地址列表 } from './kv.js';
import { sendMessage } from './notifications.js';
import { compileSubConfigToClashOptions } from './subconfig.js';
import { getSUB } from './subscriptions.js';
import { ADD, MD5MD5, nginx, proxyURL } from './utils.js';

function encodeBase64Fallback(data) {
  const binary = new TextEncoder().encode(data);
  let base64 = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  for (let i = 0; i < binary.length; i += 3) {
    const byte1 = binary[i];
    const byte2 = binary[i + 1] || 0;
    const byte3 = binary[i + 2] || 0;

    base64 += chars[byte1 >> 2];
    base64 += chars[((byte1 & 3) << 4) | (byte2 >> 4)];
    base64 += chars[((byte2 & 15) << 2) | (byte3 >> 6)];
    base64 += chars[byte3 & 63];
  }

  const padding = 3 - (binary.length % 3 || 3);
  return base64.slice(0, base64.length - padding) + '=='.slice(0, padding);
}

function 编码订阅内容(result = '') {
  try {
    return btoa(result);
  } catch {
    return encodeBase64Fallback(result);
  }
}

function 规范化订阅内容(reqData = '') {
  const utf8Encoder = new TextEncoder();
  const encodedData = utf8Encoder.encode(reqData);
  const utf8Decoder = new TextDecoder();
  const text = utf8Decoder.decode(encodedData);
  const uniqueLines = new Set(text.split('\n'));
  return [...uniqueLines].join('\n');
}

async function 生成Clash订阅配置(state, clash代理集合) {
  let 自定义Clash配置 = '';
  if (state.hasCustomSubConfig && state.subConfig) {
    try {
      const normalizedNodes = 标准化Clash节点(clash代理集合);
      const compiledSubConfig = await compileSubConfigToClashOptions(state.subConfig, normalizedNodes.map(node => node.name));
      if (compiledSubConfig) {
        const 默认分组 = 构建默认代理组(normalizedNodes.map(node => node.name));
        const 自定义分组名 = new Set(compiledSubConfig.groupDefinitions.map(group => group.name));
        自定义Clash配置 = 生成Clash配置(normalizedNodes, {
          ...compiledSubConfig,
          groupDefinitions: [
            ...默认分组.filter(group => !自定义分组名.has(group.name)),
            ...compiledSubConfig.groupDefinitions,
          ],
          skipNormalize: true,
        });
      }
    } catch (error) {
      console.error('编译 SUBCONFIG 失败，回退内置 Clash 配置', error);
    }
  }

  return 自定义Clash配置 || 生成内置Clash配置(clash代理集合) || '';
}

function 创建订阅缓存快照(result, clashConfig = '') {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    result,
    clashConfig,
  };
}

function 构建响应头(state, request) {
  return {
    'content-type': 'text/plain; charset=utf-8',
    'Profile-Update-Interval': `${state.SUBUpdateTime}`,
    'Profile-web-page-url': request.url.includes('?') ? request.url.split('?')[0] : request.url,
    // 'Subscription-Userinfo': `upload=${UD}; download=${UD}; total=${total}; expire=${expire}`,
  };
}

function 从缓存快照构建响应(snapshot, options) {
  const {
    responseHeaders,
    订阅格式,
    token,
    fakeToken,
    userAgent,
    state,
  } = options;
  const headers = { ...responseHeaders };
  const base64Data = 编码订阅内容(snapshot?.result || '');

  if (订阅格式 === 'base64' || token === fakeToken || !snapshot?.clashConfig) {
    return new Response(base64Data, { headers });
  }

  if (!userAgent.includes('mozilla')) {
    headers['Content-Disposition'] = `attachment; filename*=utf-8''${encodeURIComponent(state.FileName)}`;
  }

  return new Response(snapshot.clashConfig, { headers });
}

export async function handleRequest(request, env) {
  const userAgentHeader = request.headers.get('User-Agent');
  const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : 'null';
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const state = buildRuntimeState(env);

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const timeTemp = Math.ceil(currentDate.getTime() / 1000);
  const fakeToken = await MD5MD5(`${state.mytoken}${timeTemp}`);
  const 访客订阅 = state.guestToken || await MD5MD5(state.mytoken);

  const UD = Math.floor(((state.timestamp - Date.now()) / state.timestamp * state.totalTB * 1099511627776) / 2);
  const total = state.totalTB * 1099511627776;
  const expire = Math.floor(state.timestamp / 1000);
  const responseHeaders = 构建响应头(state, request);

  if (!([state.mytoken, fakeToken, 访客订阅].includes(token) || url.pathname === `/${state.mytoken}` || url.pathname.includes(`/${state.mytoken}?`))) {
    if (state.TG == 1 && url.pathname !== '/' && url.pathname !== '/favicon.ico') {
      await sendMessage(state, `#异常访问 ${state.FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgent}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
    }
    if (env.URL302) return Response.redirect(env.URL302, 302);
    if (env.URL) return proxyURL(env.URL, url);
    return new Response(nginx(), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
      },
    });
  }

  let mainData = state.MainData;
  let urls = [];

  if (env.KV) {
    await 迁移地址列表(env, 'LINK.txt');
    if (userAgent.includes('mozilla') && !url.search) {
      await sendMessage(state, `#编辑订阅 ${state.FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
      return handleKVEditor(request, env, state, 'LINK.txt', 访客订阅);
    }
    mainData = await env.KV.get('LINK.txt') || mainData;
  } else {
    mainData = env.LINK || mainData;
    if (env.LINKSUB) urls = await ADD(env.LINKSUB);
  }

  const 重新汇总所有链接 = await ADD(`${mainData}\n${urls.join('\n')}`);
  const 自建节点数组 = [];
  let 订阅链接 = '';
  for (const item of 重新汇总所有链接) {
    if (item.toLowerCase().startsWith('http')) {
      订阅链接 += item + '\n';
    } else {
      自建节点数组.push(规范化URI节点(item));
    }
  }

  mainData = 自建节点数组.filter(item => item?.trim?.()).join('\n');
  urls = await ADD(订阅链接);
  await sendMessage(state, `#获取订阅 ${state.FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);

  let 订阅格式 = 'base64';
  if (!(userAgent.includes('null') || userAgent.includes('nekobox') || userAgent.includes('cf-workers-sub'))) {
    if (userAgent.includes('clash') || userAgent.includes('meta') || userAgent.includes('mihomo') || url.searchParams.has('clash')) {
      订阅格式 = 'clash';
    }
  }

  let req_data = mainData;
  const clash代理集合 = 收集URI节点(await ADD(mainData));

  let 追加UA = 'v2rayn';
  if (url.searchParams.has('b64') || url.searchParams.has('base64')) {
    订阅格式 = 'base64';
  } else if (url.searchParams.has('clash')) {
    订阅格式 = 'clash';
    追加UA = 'clash';
  }

  const 订阅链接数组 = [...new Set(urls)].filter(item => item?.trim?.());
  if (订阅链接数组.length > 0) {
    const 请求订阅响应内容 = await getSUB(订阅链接数组, request, 追加UA, userAgentHeader);
    console.log(请求订阅响应内容);
    if (!请求订阅响应内容.全部成功) {
      console.error('订阅拉取失败，停止本次合并并回退缓存:', 请求订阅响应内容.失败订阅);
      const 缓存快照 = await 读取订阅缓存(env);
      if (缓存快照) {
        return 从缓存快照构建响应(缓存快照, {
          responseHeaders,
          订阅格式,
          token,
          fakeToken,
          userAgent,
          state,
        });
      }
      return new Response('订阅拉取失败，且暂无可用缓存。', {
        status: 503,
        headers: responseHeaders,
      });
    }
    req_data += 请求订阅响应内容.订阅内容.join('\n');
    clash代理集合.push(...请求订阅响应内容.clash代理集合);
  }

  const result = 规范化订阅内容(req_data);
  const 需要生成Clash配置 = !!env.KV || !(订阅格式 === 'base64' || token === fakeToken);
  const clashConfig = 需要生成Clash配置 ? await 生成Clash订阅配置(state, clash代理集合) : '';
  const 缓存快照 = 创建订阅缓存快照(result, clashConfig);

  if (env.KV) {
    await 写入订阅缓存(env, 缓存快照);
  }

  void UD;
  void total;
  void expire;

  return 从缓存快照构建响应(缓存快照, {
    responseHeaders,
    订阅格式,
    token,
    fakeToken,
    userAgent,
    state,
  });
}
