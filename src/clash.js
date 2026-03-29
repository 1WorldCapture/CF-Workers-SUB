import {
  内置Clash地域关键词,
  内置Clash地区分组关键词,
  内置Clash模板头,
  内置Clash规则,
} from './config.js';
import {
  base64Decode,
  safeDecodeURIComponent,
  清理空字段,
  解析逗号分隔,
} from './utils.js';

function 解析节点名称(hash, fallback = '未命名节点') {
  if (!hash) return fallback;
  const rawName = hash.startsWith('#') ? hash.slice(1) : hash;
  return safeDecodeURIComponent(rawName) || fallback;
}

function 构建WS配置(pathValue, hostValue) {
  const wsOpts = {
    path: safeDecodeURIComponent(pathValue || '/'),
    headers: hostValue ? { Host: hostValue } : undefined,
  };
  return 清理空字段(wsOpts);
}

function 构建HTTP配置(pathValue, hostValue) {
  const httpOpts = {
    method: 'GET',
    path: [safeDecodeURIComponent(pathValue || '/')],
    headers: hostValue ? { Host: 解析逗号分隔(hostValue) } : undefined,
  };
  return 清理空字段(httpOpts);
}

function 解析主机端口(value = '') {
  const normalized = value.replace(/\/$/, '');
  if (!normalized) return {};
  if (normalized.startsWith('[')) {
    const end = normalized.indexOf(']');
    if (end === -1) return {};
    const host = normalized.slice(1, end);
    const port = Number(normalized.slice(end + 2));
    return { host, port };
  }
  const lastColon = normalized.lastIndexOf(':');
  if (lastColon === -1) return {};
  return {
    host: normalized.slice(0, lastColon),
    port: Number(normalized.slice(lastColon + 1)),
  };
}

function 创建Clash节点(name, proxyObject) {
  const 节点名称 = (name || '未命名节点').trim() || '未命名节点';
  const proxy = 清理空字段({ ...proxyObject, name: 节点名称 });
  return {
    name: 节点名称,
    proxyObject: proxy,
    yamlBlock: `  - ${JSON.stringify(proxy)}`,
  };
}

function 解析Vmess节点(line) {
  try {
    const config = JSON.parse(base64Decode(line.slice('vmess://'.length)));
    const network = (config.net || '').toLowerCase();
    const security = (config.tls || config.security || '').toLowerCase();
    const proxy = {
      type: 'vmess',
      server: config.add,
      port: Number(config.port || 443),
      uuid: config.id,
      alterId: Number(config.aid || 0),
      cipher: config.scy || 'auto',
      udp: true,
    };
    if (security && security !== 'none') proxy.tls = true;
    if (config.sni) proxy.servername = config.sni;
    if (config.alpn) proxy.alpn = 解析逗号分隔(config.alpn);
    if (config.fp) proxy['client-fingerprint'] = config.fp;
    if (config.allowInsecure === '1') proxy['skip-cert-verify'] = true;
    if (network === 'ws') {
      proxy.network = 'ws';
      proxy['ws-opts'] = 构建WS配置(config.path, config.host);
    } else if (network === 'grpc') {
      proxy.network = 'grpc';
      proxy['grpc-opts'] = 清理空字段({ 'grpc-service-name': config.path || config.serviceName || '' });
    } else if (network === 'http' || network === 'h2') {
      proxy.network = 'http';
      proxy['http-opts'] = 构建HTTP配置(config.path, config.host);
    }
    return 创建Clash节点(config.ps || `${config.add}:${config.port}`, proxy);
  } catch (error) {
    console.log('解析 vmess 节点失败', error);
    return null;
  }
}

function 解析Vless节点(line) {
  try {
    const parsed = new URL(line);
    const params = parsed.searchParams;
    const security = (params.get('security') || '').toLowerCase();
    const network = (params.get('type') || 'tcp').toLowerCase();
    const proxy = {
      type: 'vless',
      server: parsed.hostname,
      port: Number(parsed.port || 443),
      uuid: safeDecodeURIComponent(parsed.username),
      udp: true,
      flow: params.get('flow') || undefined,
    };
    if (security && security !== 'none') proxy.tls = true;
    if (params.get('sni')) proxy.servername = params.get('sni');
    if (params.get('alpn')) proxy.alpn = 解析逗号分隔(params.get('alpn'));
    if (params.get('fp')) proxy['client-fingerprint'] = params.get('fp');
    if (params.get('allowInsecure') === '1' || params.get('insecure') === '1') proxy['skip-cert-verify'] = true;
    if (network === 'ws') {
      proxy.network = 'ws';
      proxy['ws-opts'] = 构建WS配置(params.get('path'), params.get('host'));
    } else if (network === 'grpc') {
      proxy.network = 'grpc';
      proxy['grpc-opts'] = 清理空字段({ 'grpc-service-name': safeDecodeURIComponent(params.get('serviceName') || params.get('path') || '') });
    } else if (network === 'http' || network === 'h2') {
      proxy.network = 'http';
      proxy['http-opts'] = 构建HTTP配置(params.get('path'), params.get('host'));
    }
    if (security === 'reality') {
      proxy['reality-opts'] = 清理空字段({
        'public-key': params.get('pbk') || params.get('public-key'),
        'short-id': params.get('sid') || params.get('short-id'),
      });
    }
    return 创建Clash节点(解析节点名称(parsed.hash), proxy);
  } catch (error) {
    console.log('解析 vless 节点失败', error);
    return null;
  }
}

function 解析Trojan节点(line) {
  try {
    const parsed = new URL(line);
    const params = parsed.searchParams;
    const network = (params.get('type') || 'tcp').toLowerCase();
    const proxy = {
      type: 'trojan',
      server: parsed.hostname,
      port: Number(parsed.port || 443),
      password: safeDecodeURIComponent(parsed.username),
      udp: true,
    };
    if (params.get('sni')) proxy.sni = params.get('sni');
    if (params.get('alpn')) proxy.alpn = 解析逗号分隔(params.get('alpn'));
    if (params.get('fp')) proxy['client-fingerprint'] = params.get('fp');
    if (params.get('allowInsecure') === '1' || params.get('insecure') === '1') proxy['skip-cert-verify'] = true;
    if (network === 'ws') {
      proxy.network = 'ws';
      proxy['ws-opts'] = 构建WS配置(params.get('path'), params.get('host'));
    } else if (network === 'grpc') {
      proxy.network = 'grpc';
      proxy['grpc-opts'] = 清理空字段({ 'grpc-service-name': safeDecodeURIComponent(params.get('serviceName') || params.get('path') || '') });
    }
    return 创建Clash节点(解析节点名称(parsed.hash), proxy);
  } catch (error) {
    console.log('解析 trojan 节点失败', error);
    return null;
  }
}

function 解析SS节点(line) {
  try {
    const payload = line.slice('ss://'.length);
    const [withQuery = '', hash = ''] = payload.split('#', 2);
    const [mainPart = '', queryString = ''] = withQuery.split('?', 2);
    let authPart = '';
    let hostPortPart = '';
    if (mainPart.includes('@')) {
      const atIndex = mainPart.lastIndexOf('@');
      authPart = mainPart.slice(0, atIndex);
      hostPortPart = mainPart.slice(atIndex + 1);
      if (!authPart.includes(':')) authPart = base64Decode(authPart);
    } else {
      const decoded = base64Decode(mainPart);
      const atIndex = decoded.lastIndexOf('@');
      if (atIndex === -1) return null;
      authPart = decoded.slice(0, atIndex);
      hostPortPart = decoded.slice(atIndex + 1);
    }
    const methodSeparator = authPart.indexOf(':');
    if (methodSeparator === -1) return null;
    const { host, port } = 解析主机端口(hostPortPart);
    const proxy = {
      type: 'ss',
      server: host,
      port,
      cipher: authPart.slice(0, methodSeparator),
      password: authPart.slice(methodSeparator + 1),
      udp: true,
    };
    const params = new URLSearchParams(queryString);
    const pluginParam = params.get('plugin');
    if (pluginParam) {
      const [pluginName, ...pluginArgs] = safeDecodeURIComponent(pluginParam).split(';');
      const pluginOpts = {};
      for (const pluginArg of pluginArgs) {
        if (!pluginArg) continue;
        if (pluginArg.includes('=')) {
          const [key, value] = pluginArg.split(/=(.*)/s, 2);
          pluginOpts[key] = safeDecodeURIComponent(value);
        } else {
          pluginOpts[pluginArg] = true;
        }
      }
      proxy.plugin = pluginName;
      proxy['plugin-opts'] = pluginOpts;
    }
    return 创建Clash节点(解析节点名称(hash), proxy);
  } catch (error) {
    console.log('解析 ss 节点失败', error);
    return null;
  }
}

function 解析Hy2节点(line) {
  try {
    const normalizedLine = line.startsWith('hy2://') ? `hysteria2://${line.slice('hy2://'.length)}` : line;
    const parsed = new URL(normalizedLine);
    const params = parsed.searchParams;
    const proxy = {
      type: 'hysteria2',
      server: parsed.hostname,
      port: Number(parsed.port || 443),
      password: safeDecodeURIComponent(parsed.username || parsed.password || params.get('password') || ''),
      sni: params.get('sni') || undefined,
      alpn: params.get('alpn') ? 解析逗号分隔(params.get('alpn')) : undefined,
      obfs: params.get('obfs') || undefined,
      'obfs-password': params.get('obfs-password') || params.get('obfsPassword') || undefined,
      'skip-cert-verify': params.get('insecure') === '1' || params.get('allowInsecure') === '1' ? true : undefined,
      up: params.get('up') || undefined,
      down: params.get('down') || undefined,
    };
    return 创建Clash节点(解析节点名称(parsed.hash), proxy);
  } catch (error) {
    console.log('解析 hy2 节点失败', error);
    return null;
  }
}

export function 收集URI节点(lines = []) {
  const results = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || !line.includes('://')) continue;
    let proxy = null;
    if (line.startsWith('vmess://')) proxy = 解析Vmess节点(line);
    else if (line.startsWith('vless://')) proxy = 解析Vless节点(line);
    else if (line.startsWith('trojan://')) proxy = 解析Trojan节点(line);
    else if (line.startsWith('ss://')) proxy = 解析SS节点(line);
    else if (line.startsWith('hy2://') || line.startsWith('hysteria2://')) proxy = 解析Hy2节点(line);
    if (proxy) results.push(proxy);
  }
  return results;
}

function 获取缩进(line = '') {
  const match = line.match(/^\s*/);
  return match ? match[0].length : 0;
}

function 解析YAML标量(value = '') {
  const trimmed = value.trim().replace(/\s+#.*$/, '');
  if (!trimmed) return '';
  if (trimmed.startsWith("''") && trimmed.endsWith("''") && trimmed.length > 3) {
    return trimmed.slice(2, -2).trim();
  }
  if (trimmed.startsWith('""') && trimmed.endsWith('""') && trimmed.length > 3) {
    return trimmed.slice(2, -2).trim();
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1).replace(/\\"/g, '"');
    }
  }
  return trimmed;
}

function 提取代理名(block = '') {
  const inlineMatch = block.match(/(?:\{|,)\s*name\s*:\s*([^,\n}]+)/);
  if (inlineMatch) return 解析YAML标量(inlineMatch[1]);
  for (const line of block.split('\n')) {
    const trimmed = line.trimStart();
    const normalized = trimmed.startsWith('- ') ? trimmed.slice(2).trimStart() : trimmed;
    if (!normalized.startsWith('name:')) continue;
    return 解析YAML标量(normalized.slice('name:'.length));
  }
  return '';
}

function 提取代理类型(block = '') {
  const inlineMatch = block.match(/(?:\{|,)\s*type\s*:\s*([^,\n}]+)/);
  if (inlineMatch) return 解析YAML标量(inlineMatch[1]).toLowerCase();
  for (const line of block.split('\n')) {
    const trimmed = line.trimStart();
    const normalized = trimmed.startsWith('- ') ? trimmed.slice(2).trimStart() : trimmed;
    if (!normalized.startsWith('type:')) continue;
    return 解析YAML标量(normalized.slice('type:'.length)).toLowerCase();
  }
  return '';
}

function 重新缩进代理块(block = '', targetIndent = 2) {
  const rawLines = block.split('\n');
  while (rawLines.length && !rawLines[0].trim()) rawLines.shift();
  while (rawLines.length && !rawLines[rawLines.length - 1].trim()) rawLines.pop();
  const minIndent = rawLines.reduce((min, line) => {
    if (!line.trim()) return min;
    const indent = 获取缩进(line);
    return min === null ? indent : Math.min(min, indent);
  }, null) ?? 0;
  return rawLines.map(line => `${' '.repeat(targetIndent)}${line.slice(minIndent)}`).join('\n');
}

function 重命名代理块(block = '', newName) {
  const quotedName = JSON.stringify(newName);
  if (block.includes('{')) {
    const replaced = block.replace(/(\{\s*|,\s*)name\s*:\s*(?:"[^"]*"|'[^']*'|[^,\n}]+)/, `$1name: ${quotedName}`);
    if (replaced !== block) return replaced;
  }
  const lines = block.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trimStart();
    const normalized = trimmed.startsWith('- ') ? trimmed.slice(2).trimStart() : trimmed;
    if (!normalized.startsWith('name:')) continue;
    const prefix = lines[i].slice(0, lines[i].indexOf('name:'));
    lines[i] = `${prefix}name: ${quotedName}`;
    return lines.join('\n');
  }
  return block;
}

function 追加DialerProxy到代理块(block = '') {
  if (/dialer-proxy\s*:/.test(block)) return block;
  if (block.includes('{')) {
    return block.replace(/\}\s*$/, ', dialer-proxy: dialer}');
  }
  const lines = block.split('\n');
  let propertyIndent = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const trimmed = line.trimStart();
    if (i === 0 && trimmed.startsWith('- ')) {
      propertyIndent = ' '.repeat(获取缩进(line) + 2);
      continue;
    }
    propertyIndent = ' '.repeat(获取缩进(line));
    break;
  }
  lines.push(`${propertyIndent || '  '}dialer-proxy: dialer`);
  return lines.join('\n');
}

export function 提取Clash代理块(content = '') {
  const lines = content.replace(/\r\n?/g, '\n').split('\n');
  let start = -1;
  let baseIndent = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === 'proxies:') {
      start = i;
      baseIndent = 获取缩进(lines[i]);
      break;
    }
  }
  if (start === -1) return [];
  const sectionLines = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed && 获取缩进(line) <= baseIndent && /^[A-Za-z0-9_-]+\s*:/.test(trimmed)) break;
    sectionLines.push(line);
  }
  const rawBlocks = [];
  let currentBlock = [];
  for (const line of sectionLines) {
    if (!line.trim()) {
      if (currentBlock.length) currentBlock.push(line);
      continue;
    }
    if (line.trimStart().startsWith('- ')) {
      if (currentBlock.length) rawBlocks.push(currentBlock.join('\n'));
      currentBlock = [line];
    } else if (currentBlock.length) {
      currentBlock.push(line);
    }
  }
  if (currentBlock.length) rawBlocks.push(currentBlock.join('\n'));
  return rawBlocks.map(block => {
    const name = 提取代理名(block);
    if (!name) return null;
    return {
      name,
      rawBlock: block,
      yamlBlock: 重新缩进代理块(block, 2),
    };
  }).filter(Boolean);
}

function 允许内置Clash节点(name = '') {
  return 内置Clash地域关键词.some(keyword => name.includes(keyword));
}

export function 规范化Clash规则(rulesText = '') {
  return rulesText
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(line => line.replace(/^\t+/g, match => '    '.repeat(match.length)).replace(/\t/g, '    '))
    .join('\n')
    .trim();
}

function 提取规则目标组(rulesText = '') {
  const targets = new Set();
  const normalizedRules = 规范化Clash规则(rulesText);
  for (const line of normalizedRules.split('\n')) {
    const match = line.match(/-\s*'([^']+)'/);
    if (!match) continue;
    const parts = match[1].split(',').map(item => item.trim()).filter(Boolean);
    if (parts.length < 3) continue;
    let target = parts[parts.length - 1];
    if (target === 'no-resolve' && parts.length >= 4) target = parts[parts.length - 2];
    if (!target || target === 'DIRECT' || target === 'REJECT') continue;
    targets.add(target);
  }
  return [...targets];
}

export function 提取规则条目(rulesText = '') {
  const entries = [];
  const normalizedRules = 规范化Clash规则(rulesText);
  for (const line of normalizedRules.split('\n')) {
    const match = line.match(/-\s*'([^']+)'/);
    if (!match) continue;
    entries.push(match[1]);
  }
  return entries;
}

function 应用美国SSDialer补丁(nodes = []) {
  return nodes.map(node => {
    if (!node?.name || !node.name.includes('美国')) return node;
    if (node.proxyObject) {
      if ((node.proxyObject.type || '').toLowerCase() !== 'ss') return node;
      if (node.proxyObject['dialer-proxy'] === 'dialer') return node;
      return 创建Clash节点(node.name, { ...node.proxyObject, name: undefined, 'dialer-proxy': 'dialer' });
    }
    const sourceBlock = node.rawBlock || node.yamlBlock || '';
    if (提取代理类型(sourceBlock) !== 'ss') return node;
    const updatedBlock = 追加DialerProxy到代理块(sourceBlock);
    return {
      ...node,
      rawBlock: updatedBlock,
      yamlBlock: 重新缩进代理块(updatedBlock, 2),
    };
  });
}

function 唯一化Clash节点(nodes = []) {
  const seen = new Map();
  return nodes.map(node => {
    const originalName = (node.name || '未命名节点').trim() || '未命名节点';
    const count = (seen.get(originalName) || 0) + 1;
    seen.set(originalName, count);
    if (count === 1) return { ...node, name: originalName };
    const newName = `${originalName} ${count}`;
    if (node.proxyObject) return 创建Clash节点(newName, { ...node.proxyObject, name: undefined });
    const renamedBlock = 重命名代理块(node.rawBlock || node.yamlBlock, newName);
    return {
      name: newName,
      rawBlock: renamedBlock,
      yamlBlock: 重新缩进代理块(renamedBlock, 2),
    };
  });
}

export function 标准化Clash节点(nodes = [], options = {}) {
  const { filterNode } = options;
  return 唯一化Clash节点(
    应用美国SSDialer补丁(nodes).filter(node => {
      if (!node?.name) return false;
      return typeof filterNode === 'function' ? filterNode(node) : true;
    }),
  );
}

function 标准化模板头(templateHeader = '') {
  const normalized = (templateHeader || '').replace(/\r\n?/g, '\n').trim();
  if (!normalized) return 内置Clash模板头;
  if (normalized.split('\n').some(line => line.trim() === 'proxies:')) {
    const lines = normalized.split('\n');
    const proxiesIndex = lines.findIndex(line => line.trim() === 'proxies:');
    return lines.slice(0, proxiesIndex + 1).join('\n');
  }
  return `${normalized}\nproxies:`;
}

function 节点包含DialerProxy(node) {
  if (node?.proxyObject?.['dialer-proxy'] === 'dialer') return true;
  const source = node?.rawBlock || node?.yamlBlock || '';
  return /dialer-proxy\s*:\s*dialer/.test(source);
}

export function 生成Clash配置(nodes = [], options = {}) {
  const {
    templateHeader = 内置Clash模板头,
    rulesText = 内置Clash规则,
    groupDefinitions = [],
    filterNode,
    skipNormalize = false,
  } = options;

  const normalizedNodes = skipNormalize ? nodes.filter(node => node?.name) : 标准化Clash节点(nodes, { filterNode });

  if (normalizedNodes.length === 0) return '';

  const 所有节点名 = normalizedNodes.map(node => node.name);
  const 规范化规则 = 规范化Clash规则(rulesText);
  const 最终分组 = groupDefinitions.map(group => ({
    ...group,
    proxies: Array.isArray(group.proxies) && group.proxies.length ? group.proxies : ['DIRECT'],
  }));

  const existingGroupNames = new Set(最终分组.map(group => group.name));
  if (normalizedNodes.some(节点包含DialerProxy) && !existingGroupNames.has('dialer')) {
    最终分组.push({
      name: 'dialer',
      type: 'select',
      proxies: 所有节点名.filter(name => name.includes('美国') && !name.includes('家宽')),
    });
    existingGroupNames.add('dialer');
  }

  for (const target of 提取规则目标组(规范化规则)) {
    if (existingGroupNames.has(target)) continue;
    最终分组.push({
      name: target,
      type: 'select',
      proxies: 所有节点名.filter(name => name.includes(target)),
    });
    existingGroupNames.add(target);
  }

  const proxyBlocks = normalizedNodes.map(node => node.yamlBlock).join('\n');
  const groupBlocks = 最终分组
    .map(group => `  - ${JSON.stringify({ ...group, proxies: group.proxies.length ? group.proxies : ['DIRECT'] })}`)
    .join('\n');

  return `${标准化模板头(templateHeader)}
${proxyBlocks}
proxy-groups:
${groupBlocks}

${规范化规则}
`;
}

export function 生成内置Clash配置(nodes = []) {
  const normalizedNodes = 标准化Clash节点(nodes, {
    filterNode: node => 允许内置Clash节点(node.name),
  });
  const 所有节点名 = normalizedNodes.map(node => node.name);
  const 额外地区组 = 内置Clash地区分组关键词.map(groupName => ({
    name: groupName,
    type: 'select',
    proxies: 所有节点名.filter(name => name.includes(groupName)),
  }));
  const groupDefinitions = [
    { name: '苏菲家宽', type: 'select', proxies: 所有节点名 },
    { name: '美国家宽', type: 'select', proxies: 所有节点名.filter(name => name.includes('美国') && name.includes('家宽')) },
    { name: '美国高速', type: 'select', proxies: 所有节点名.filter(name => name.includes('美国') && !name.includes('家宽')) },
    { name: 'dialer', type: 'select', proxies: 所有节点名.filter(name => name.includes('美国') && !name.includes('家宽')) },
    { name: '家宽', type: 'select', proxies: 所有节点名.filter(name => name.includes('家宽')) },
    ...额外地区组,
  ];

  return 生成Clash配置(normalizedNodes, {
    templateHeader: 内置Clash模板头,
    rulesText: 内置Clash规则,
    groupDefinitions,
    skipNormalize: true,
  });
}
