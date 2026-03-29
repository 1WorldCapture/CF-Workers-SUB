import { 规范化Clash规则, 提取规则条目 } from './clash.js';
import { 内置Clash模板头, 内置Clash规则 } from './config.js';
import { parseSubConfig } from './ini.js';
import { fetchTextWithCache } from './remote.js';

function 去重保序(items = []) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    if (!item || seen.has(item)) continue;
    seen.add(item);
    result.push(item);
  }
  return result;
}

function 规范化规则源行(line = '') {
  return line.trim().replace(/\s+#.*$/, '');
}

function 拼接规则策略(ruleText = '', policy = '') {
  const normalizedRule = 规范化规则源行(ruleText);
  if (!normalizedRule) return null;

  const parts = normalizedRule.split(',').map(item => item.trim()).filter(Boolean);
  if (parts.length === 0) return null;

  const ruleType = parts[0].toUpperCase();
  if (ruleType === 'FINAL' || ruleType === 'MATCH') {
    return `MATCH,${policy}`;
  }

  if (parts[parts.length - 1]?.toLowerCase() === 'no-resolve') {
    return [...parts.slice(0, -1), policy, 'no-resolve'].join(',');
  }

  return [...parts, policy].join(',');
}

async function 编译规则集条目(entry) {
  if (entry.source.startsWith('[]')) {
    const inlineRule = entry.source.slice(2).trim();
    const compiledRule = 拼接规则策略(inlineRule, entry.policy);
    return compiledRule ? [compiledRule] : [];
  }

  const remoteText = await fetchTextWithCache(entry.source, { cacheTtlSeconds: 3600, timeoutMs: 8000 });
  return remoteText
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(规范化规则源行)
    .filter(line => line && !line.startsWith('#') && !line.startsWith(';'))
    .map(line => 拼接规则策略(line, entry.policy))
    .filter(Boolean);
}

function 构建规则文本(ruleEntries = []) {
  return `rules:\n${ruleEntries.map(rule => `    - '${rule}'`).join('\n')}`;
}

function 解析成员令牌(token = '', proxyNames = []) {
  if (!token) return [];
  if (token.startsWith('[]')) return [token.slice(2)];
  try {
    const matcher = new RegExp(token);
    return proxyNames.filter(name => matcher.test(name));
  } catch {
    return proxyNames.filter(name => name.includes(token));
  }
}

function 编译策略组(groupDefinitions = [], proxyNames = []) {
  return groupDefinitions.map(group => {
    const proxies = 去重保序(group.proxyTokens.flatMap(token => 解析成员令牌(token, proxyNames)));
    const compiled = {
      name: group.name,
      type: group.type,
      proxies: proxies.length ? proxies : ['DIRECT'],
    };

    if (group.url) compiled.url = group.url;
    if (group.interval) compiled.interval = group.interval;
    if (group.tolerance) compiled.tolerance = group.tolerance;

    return compiled;
  });
}

function 提取模板头(baseText = '') {
  const normalized = baseText.replace(/\r\n?/g, '\n').trim();
  if (!normalized) return 内置Clash模板头;

  const lines = normalized.split('\n');
  const proxiesIndex = lines.findIndex(line => line.trim() === 'proxies:');
  if (proxiesIndex !== -1) {
    return lines.slice(0, proxiesIndex + 1).join('\n');
  }

  return `${normalized}\nproxies:`;
}

export async function compileSubConfigToClashOptions(subConfigSource = '', proxyNames = []) {
  if (!subConfigSource) return null;

  const isInlineSubConfig = /(^|\n)\s*\[custom\]\s*$/m.test(subConfigSource);
  const iniText = isInlineSubConfig
    ? subConfigSource
    : await fetchTextWithCache(subConfigSource, { cacheTtlSeconds: 3600, timeoutMs: 8000 });

  const parsedConfig = parseSubConfig(iniText);
  if (!parsedConfig.enableRuleGenerator) return null;

  const compiledRules = (await Promise.all(parsedConfig.rulesets.map(编译规则集条目))).flat();
  const defaultRuleEntries = parsedConfig.overwriteOriginalRules
    ? []
    : 提取规则条目(规范化Clash规则(内置Clash规则));
  const allRuleEntries = 去重保序([...compiledRules, ...defaultRuleEntries]);
  const rulesText = 构建规则文本(allRuleEntries);

  let templateHeader = 内置Clash模板头;
  if (parsedConfig.clashRuleBase) {
    const baseText = await fetchTextWithCache(parsedConfig.clashRuleBase, { cacheTtlSeconds: 3600, timeoutMs: 8000 });
    templateHeader = 提取模板头(baseText);
  }

  return {
    templateHeader,
    rulesText,
    groupDefinitions: 编译策略组(parsedConfig.proxyGroups, proxyNames),
    parsedConfig,
  };
}
