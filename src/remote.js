const 文本缓存 = new Map();
const 远程缓存版本 = '20260329-1';

function 获取缓存键(url) {
  return `${远程缓存版本}:${url}`;
}

function 获取边缘缓存请求(url) {
  const cacheKeyUrl = new URL(url);
  cacheKeyUrl.searchParams.set('__cfwsub_cache_v', 远程缓存版本);
  return new Request(cacheKeyUrl.toString(), { method: 'GET' });
}

function 获取缓存(url) {
  const cached = 文本缓存.get(获取缓存键(url));
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    文本缓存.delete(获取缓存键(url));
    return null;
  }
  return cached.text;
}

function 写入缓存(url, text, cacheTtlSeconds) {
  文本缓存.set(获取缓存键(url), {
    text,
    expiresAt: Date.now() + cacheTtlSeconds * 1000,
  });
}

export async function fetchTextWithCache(url, options = {}) {
  const {
    cacheTtlSeconds = 300,
    timeoutMs = 8000,
    headers,
  } = options;

  const memoryCached = 获取缓存(url);
  if (memoryCached !== null) return memoryCached;

  const cache = globalThis.caches?.default;
  const cacheKey = 获取边缘缓存请求(url);
  if (cache) {
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      const text = await cachedResponse.text();
      写入缓存(url, text, cacheTtlSeconds);
      return text;
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`获取远程配置失败: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    写入缓存(url, text, cacheTtlSeconds);

    if (cache) {
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Cache-Control', `public, max-age=${cacheTtlSeconds}`);
      await cache.put(cacheKey, new Response(text, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      }));
    }

    return text;
  } finally {
    clearTimeout(timer);
  }
}
