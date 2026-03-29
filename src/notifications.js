export async function sendMessage(state, type, ip, addData = '') {
  if (state.BotToken !== '' && state.ChatID !== '') {
    let msg = '';
    const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`);
    if (response.status === 200) {
      const ipInfo = await response.json();
      msg = `${type}\nIP: ${ip}\n国家: ${ipInfo.country}\n<tg-spoiler>城市: ${ipInfo.city}\n组织: ${ipInfo.org}\nASN: ${ipInfo.as}\n${addData}`;
    } else {
      msg = `${type}\nIP: ${ip}\n<tg-spoiler>${addData}`;
    }

    const url = `https://api.telegram.org/bot${state.BotToken}/sendMessage?chat_id=${state.ChatID}&parse_mode=HTML&text=${encodeURIComponent(msg)}`;
    return fetch(url, {
      method: 'get',
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 Chrome/90.0.4430.72',
      },
    });
  }
}
