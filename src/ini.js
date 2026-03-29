function 解析布尔值(value = '') {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return undefined;
}

function 解析规则集(value = '') {
  const separatorIndex = value.indexOf(',');
  if (separatorIndex === -1) return null;
  const policy = value.slice(0, separatorIndex).trim();
  const source = value.slice(separatorIndex + 1).trim();
  if (!policy || !source) return null;
  return { policy, source };
}

function 解析策略组(value = '') {
  const parts = value.split('`').map(part => part.trim());
  if (parts.length < 2) return null;

  const [name, type, ...rawTokens] = parts;
  const groupType = type.toLowerCase();
  const proxyTokens = [];
  let url = '';
  let interval;
  let tolerance;

  if (['url-test', 'fallback', 'load-balance'].includes(groupType)) {
    const urlIndex = rawTokens.findIndex(token => /^https?:\/\//i.test(token));
    const memberTokens = urlIndex === -1 ? rawTokens : rawTokens.slice(0, urlIndex);
    proxyTokens.push(...memberTokens.filter(Boolean));

    if (urlIndex !== -1) {
      url = rawTokens[urlIndex];
      const timingToken = rawTokens[urlIndex + 1] || '';
      const [intervalText = '', , toleranceText = ''] = timingToken.split(',');
      interval = Number(intervalText) || undefined;
      tolerance = Number(toleranceText) || undefined;
    }
  } else {
    proxyTokens.push(...rawTokens.filter(Boolean));
  }

  return {
    name,
    type: groupType,
    proxyTokens,
    url,
    interval,
    tolerance,
  };
}

export function parseSubConfig(source = '') {
  const normalized = source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const result = {
    rulesets: [],
    proxyGroups: [],
    enableRuleGenerator: false,
    overwriteOriginalRules: true,
    clashRuleBase: '',
  };

  let currentSection = '';
  for (const rawLine of normalized.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith(';') || line.startsWith('#')) continue;

    if (line.startsWith('[') && line.endsWith(']')) {
      currentSection = line.slice(1, -1).trim().toLowerCase();
      continue;
    }

    if (currentSection !== 'custom') continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();

    if (key === 'ruleset') {
      const entry = 解析规则集(value);
      if (entry) result.rulesets.push(entry);
      continue;
    }

    if (key === 'custom_proxy_group') {
      const group = 解析策略组(value);
      if (group) result.proxyGroups.push(group);
      continue;
    }

    if (key === 'enable_rule_generator') {
      result.enableRuleGenerator = 解析布尔值(value) ?? result.enableRuleGenerator;
      continue;
    }

    if (key === 'overwrite_original_rules') {
      result.overwriteOriginalRules = 解析布尔值(value) ?? result.overwriteOriginalRules;
      continue;
    }

    if (key === 'clash_rule_base') {
      result.clashRuleBase = value;
    }
  }

  return result;
}
