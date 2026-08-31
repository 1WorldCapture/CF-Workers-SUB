export const DEFAULT_MAIN_DATA = `
https://cfxr.eu.org/getSub
`;

export const DEFAULT_STATE = Object.freeze({
  mytoken: "auto",
  guestToken: "",
  BotToken: "",
  ChatID: "",
  TG: 0,
  FileName: "CF-Workers-SUB",
  SUBUpdateTime: 6,
  totalTB: 99,
  timestamp: 4102329600000,
  MainData: DEFAULT_MAIN_DATA,
  subConverter: "SUBAPI.cmliussss.net",
  subConfig: "",
  subProtocol: "https",
});

export const 内置Clash地域关键词 = [
  "美国",
  "香港",
  "日本",
  "台湾",
  "新加坡",
  "英国",
  "德国",
  "尼日利亚",
];
export const 内置Clash地区分组关键词 = [];
export const 内置Clash模板头 = `mixed-port: 7890
allow-lan: true
bind-address: '*'
mode: rule
log-level: info
external-controller: '127.0.0.1:9090'
sniffer:
    enable: true
    sniff: { TLS: { ports: [443, 8443] }, HTTP: { ports: [80, 8080-8880], override-destination: true } }
dns:
    enable: true
    ipv6: false
    use-hosts: true
    enhanced-mode: fake-ip
    fake-ip-range: 198.18.0.1/16
    default-nameserver: [223.5.5.5, 119.29.29.29]
    proxy-server-nameserver: ['https://doh.pub/dns-query', 'https://dns.alidns.com/dns-query']
    nameserver: ['https://doh.pub/dns-query', 'https://dns.alidns.com/dns-query']
    fallback: []
proxies:`;
export const 内置Clash规则 = `rules:
  - 'DOMAIN-SUFFIX,whoer.com,美国家宽'
	- 'IP-CIDR,160.79.104.0/22,美国家宽,no-resolve'
	- 'IP-CIDR,34.160.0.0/12,美国家宽,no-resolve'
	- 'IP-CIDR,34.96.0.0/14,美国家宽,no-resolve'
	- 'IP-CIDR,35.190.0.0/17,美国家宽,no-resolve'
	- 'DOMAIN-SUFFIX,services.googleapis.cn,美国家宽'
	- 'DOMAIN-SUFFIX,xn--ngstr-lra8j.com,美国家宽'
	- 'DOMAIN,developer.apple.com,美国家宽'
	- 'DOMAIN-SUFFIX,digicert.com,美国家宽'
	- 'DOMAIN,ocsp.apple.com,美国家宽'
	- 'DOMAIN,ocsp.comodoca.com,美国家宽'
	- 'DOMAIN,ocsp.usertrust.com,美国家宽'
	- 'DOMAIN,ocsp.sectigo.com,美国家宽'
	- 'DOMAIN,ocsp.verisign.net,美国家宽'
	- 'DOMAIN-SUFFIX,apple-dns.net,美国家宽'
	- 'DOMAIN,testflight.apple.com,美国家宽'
	- 'DOMAIN,sandbox.itunes.apple.com,美国家宽'
	- 'DOMAIN,itunes.apple.com,美国家宽'
	- 'DOMAIN-SUFFIX,apps.apple.com,美国家宽'
	- 'DOMAIN-SUFFIX,blobstore.apple.com,美国家宽'
	- 'DOMAIN,cvws.icloud-content.com,美国家宽'
	- 'DOMAIN-SUFFIX,mzstatic.com,DIRECT'
	- 'DOMAIN-SUFFIX,itunes.apple.com,DIRECT'
	- 'DOMAIN-SUFFIX,icloud-content.com,DIRECT'
	- 'DOMAIN-SUFFIX,aaplimg.com,DIRECT'
	- 'DOMAIN-SUFFIX,cdn20.com,DIRECT'
	- 'DOMAIN-SUFFIX,cdn-apple.com,DIRECT'
	- 'DOMAIN-SUFFIX,akadns.net,DIRECT'
	- 'DOMAIN-SUFFIX,akamaiedge.net,DIRECT'
	- 'DOMAIN-SUFFIX,edgekey.net,DIRECT'
	- 'DOMAIN-SUFFIX,mwcloudcdn.com,DIRECT'
	- 'DOMAIN-SUFFIX,mwcname.com,DIRECT'
	- 'DOMAIN-SUFFIX,apple.com,DIRECT'
	- 'DOMAIN-SUFFIX,apple-cloudkit.com,DIRECT'
	- 'DOMAIN-SUFFIX,apple-mapkit.com,DIRECT'
	- 'DOMAIN-SUFFIX,126.com,DIRECT'
	- 'DOMAIN-SUFFIX,126.net,DIRECT'
	- 'DOMAIN-SUFFIX,127.net,DIRECT'
	- 'DOMAIN-SUFFIX,163.com,DIRECT'
	- 'DOMAIN-SUFFIX,360buyimg.com,DIRECT'
	- 'DOMAIN-SUFFIX,36kr.com,DIRECT'
	- 'DOMAIN-SUFFIX,acfun.tv,DIRECT'
	- 'DOMAIN-SUFFIX,air-matters.com,DIRECT'
	- 'DOMAIN-SUFFIX,aixifan.com,DIRECT'
	- 'DOMAIN-KEYWORD,alicdn,DIRECT'
	- 'DOMAIN-KEYWORD,alipay,DIRECT'
	- 'DOMAIN-KEYWORD,taobao,DIRECT'
	- 'DOMAIN-SUFFIX,amap.com,DIRECT'
	- 'DOMAIN-SUFFIX,autonavi.com,DIRECT'
	- 'DOMAIN-KEYWORD,baidu,DIRECT'
	- 'DOMAIN-SUFFIX,bdimg.com,DIRECT'
	- 'DOMAIN-SUFFIX,bdstatic.com,DIRECT'
	- 'DOMAIN-SUFFIX,caiyunapp.com,DIRECT'
	- 'DOMAIN-SUFFIX,clouddn.com,DIRECT'
	- 'DOMAIN-SUFFIX,cnbeta.com,DIRECT'
	- 'DOMAIN-SUFFIX,cnbetacdn.com,DIRECT'
	- 'DOMAIN-SUFFIX,cootekservice.com,DIRECT'
	- 'DOMAIN-SUFFIX,csdn.net,DIRECT'
	- 'DOMAIN-SUFFIX,ctrip.com,DIRECT'
	- 'DOMAIN-SUFFIX,dgtle.com,DIRECT'
	- 'DOMAIN-SUFFIX,dianping.com,DIRECT'
	- 'DOMAIN-SUFFIX,douban.com,DIRECT'
	- 'DOMAIN-SUFFIX,doubanio.com,DIRECT'
	- 'DOMAIN-SUFFIX,duokan.com,DIRECT'
	- 'DOMAIN-SUFFIX,easou.com,DIRECT'
	- 'DOMAIN-SUFFIX,ele.me,DIRECT'
	- 'DOMAIN-SUFFIX,feng.com,DIRECT'
	- 'DOMAIN-SUFFIX,fir.im,DIRECT'
	- 'DOMAIN-SUFFIX,frdic.com,DIRECT'
	- 'DOMAIN-SUFFIX,g-cores.com,DIRECT'
	- 'DOMAIN-SUFFIX,godic.net,DIRECT'
	- 'DOMAIN-SUFFIX,gtimg.com,DIRECT'
	- 'DOMAIN,cdn.hockeyapp.net,DIRECT'
	- 'DOMAIN-SUFFIX,hongxiu.com,DIRECT'
	- 'DOMAIN-SUFFIX,hxcdn.net,DIRECT'
	- 'DOMAIN-SUFFIX,iciba.com,DIRECT'
	- 'DOMAIN-SUFFIX,ifeng.com,DIRECT'
	- 'DOMAIN-SUFFIX,ifengimg.com,DIRECT'
	- 'DOMAIN-SUFFIX,ipip.net,DIRECT'
	- 'DOMAIN-SUFFIX,iqiyi.com,DIRECT'
	- 'DOMAIN-SUFFIX,jd.com,DIRECT'
	- 'DOMAIN-SUFFIX,jianshu.com,DIRECT'
	- 'DOMAIN-SUFFIX,knewone.com,DIRECT'
	- 'DOMAIN-SUFFIX,le.com,DIRECT'
	- 'DOMAIN-SUFFIX,lecloud.com,DIRECT'
	- 'DOMAIN-SUFFIX,lemicp.com,DIRECT'
	- 'DOMAIN-SUFFIX,licdn.com,DIRECT'
	- 'DOMAIN-SUFFIX,luoo.net,DIRECT'
	- 'DOMAIN-SUFFIX,meituan.com,DIRECT'
	- 'DOMAIN-SUFFIX,meituan.net,DIRECT'
	- 'DOMAIN-SUFFIX,mi.com,DIRECT'
	- 'DOMAIN-SUFFIX,miaopai.com,DIRECT'
	- 'DOMAIN-SUFFIX,microsoft.com,DIRECT'
	- 'DOMAIN-SUFFIX,microsoftonline.com,DIRECT'
	- 'DOMAIN-SUFFIX,miui.com,DIRECT'
	- 'DOMAIN-SUFFIX,miwifi.com,DIRECT'
	- 'DOMAIN-SUFFIX,mob.com,DIRECT'
	- 'DOMAIN-SUFFIX,netease.com,DIRECT'
	- 'DOMAIN-SUFFIX,office.com,DIRECT'
	- 'DOMAIN-SUFFIX,office365.com,DIRECT'
	- 'DOMAIN-KEYWORD,officecdn,DIRECT'
	- 'DOMAIN-SUFFIX,oschina.net,DIRECT'
	- 'DOMAIN-SUFFIX,ppsimg.com,DIRECT'
	- 'DOMAIN-SUFFIX,pstatp.com,DIRECT'
	- 'DOMAIN-SUFFIX,qcloud.com,DIRECT'
	- 'DOMAIN-SUFFIX,qdaily.com,DIRECT'
	- 'DOMAIN-SUFFIX,qdmm.com,DIRECT'
	- 'DOMAIN-SUFFIX,qhimg.com,DIRECT'
	- 'DOMAIN-SUFFIX,qhres.com,DIRECT'
	- 'DOMAIN-SUFFIX,qidian.com,DIRECT'
	- 'DOMAIN-SUFFIX,qihucdn.com,DIRECT'
	- 'DOMAIN-SUFFIX,qiniu.com,DIRECT'
	- 'DOMAIN-SUFFIX,qiniucdn.com,DIRECT'
	- 'DOMAIN-SUFFIX,qiyipic.com,DIRECT'
	- 'DOMAIN-SUFFIX,qq.com,DIRECT'
	- 'DOMAIN-SUFFIX,qqurl.com,DIRECT'
	- 'DOMAIN-SUFFIX,rarbg.to,DIRECT'
	- 'DOMAIN-SUFFIX,ruguoapp.com,DIRECT'
	- 'DOMAIN-SUFFIX,segmentfault.com,DIRECT'
	- 'DOMAIN-SUFFIX,sinaapp.com,DIRECT'
	- 'DOMAIN-SUFFIX,smzdm.com,DIRECT'
	- 'DOMAIN-SUFFIX,snapdrop.net,DIRECT'
	- 'DOMAIN-SUFFIX,sogou.com,DIRECT'
	- 'DOMAIN-SUFFIX,sogoucdn.com,DIRECT'
	- 'DOMAIN-SUFFIX,sohu.com,DIRECT'
	- 'DOMAIN-SUFFIX,soku.com,DIRECT'
	- 'DOMAIN-SUFFIX,speedtest.net,DIRECT'
	- 'DOMAIN-SUFFIX,sspai.com,DIRECT'
	- 'DOMAIN-SUFFIX,suning.com,DIRECT'
	- 'DOMAIN-SUFFIX,taobao.com,DIRECT'
	- 'DOMAIN-SUFFIX,tencent.com,DIRECT'
	- 'DOMAIN-SUFFIX,tenpay.com,DIRECT'
	- 'DOMAIN-SUFFIX,tianyancha.com,DIRECT'
	- 'DOMAIN-SUFFIX,tmall.com,DIRECT'
	- 'DOMAIN-SUFFIX,tudou.com,DIRECT'
	- 'DOMAIN-SUFFIX,umetrip.com,DIRECT'
	- 'DOMAIN-SUFFIX,upaiyun.com,DIRECT'
	- 'DOMAIN-SUFFIX,upyun.com,DIRECT'
	- 'DOMAIN-SUFFIX,veryzhun.com,DIRECT'
	- 'DOMAIN-SUFFIX,weather.com,DIRECT'
	- 'DOMAIN-SUFFIX,weibo.com,DIRECT'
	- 'DOMAIN-SUFFIX,xiami.com,DIRECT'
	- 'DOMAIN-SUFFIX,xiami.net,DIRECT'
	- 'DOMAIN-SUFFIX,xiaomicp.com,DIRECT'
	- 'DOMAIN-SUFFIX,ximalaya.com,DIRECT'
	- 'DOMAIN-SUFFIX,xmcdn.com,DIRECT'
	- 'DOMAIN-SUFFIX,xunlei.com,DIRECT'
	- 'DOMAIN-SUFFIX,yhd.com,DIRECT'
	- 'DOMAIN-SUFFIX,yihaodianimg.com,DIRECT'
	- 'DOMAIN-SUFFIX,yinxiang.com,DIRECT'
	- 'DOMAIN-SUFFIX,ykimg.com,DIRECT'
	- 'DOMAIN-SUFFIX,youdao.com,DIRECT'
	- 'DOMAIN-SUFFIX,youku.com,DIRECT'
	- 'DOMAIN-SUFFIX,zealer.com,DIRECT'
	- 'DOMAIN-SUFFIX,zhihu.com,DIRECT'
	- 'DOMAIN-SUFFIX,zhimg.com,DIRECT'
	- 'DOMAIN-SUFFIX,zimuzu.tv,DIRECT'
	- 'DOMAIN-SUFFIX,zoho.com,DIRECT'
	- 'DOMAIN-KEYWORD,amazon,美国高速'
	- 'DOMAIN-KEYWORD,google,美国高速'
	- 'DOMAIN-KEYWORD,gmail,美国高速'
	- 'DOMAIN-KEYWORD,facebook,美国高速'
	- 'DOMAIN-SUFFIX,fb.me,美国高速'
	- 'DOMAIN-SUFFIX,fbcdn.net,美国高速'
	- 'DOMAIN-KEYWORD,twitter,美国高速'
	- 'DOMAIN-KEYWORD,instagram,美国高速'
	- 'DOMAIN-KEYWORD,dropbox,美国高速'
	- 'DOMAIN-SUFFIX,twimg.com,美国高速'
	- 'DOMAIN-KEYWORD,blogspot,美国高速'
	- 'DOMAIN-KEYWORD,whatsapp,美国高速'
	- 'DOMAIN-KEYWORD,admarvel,REJECT'
	- 'DOMAIN-KEYWORD,admaster,REJECT'
	- 'DOMAIN-KEYWORD,adsage,REJECT'
	- 'DOMAIN-KEYWORD,adsmogo,REJECT'
	- 'DOMAIN-KEYWORD,adsrvmedia,REJECT'
	- 'DOMAIN-KEYWORD,adwords,REJECT'
	- 'DOMAIN-KEYWORD,adservice,REJECT'
	- 'DOMAIN-SUFFIX,appsflyer.com,REJECT'
	- 'DOMAIN-KEYWORD,domob,REJECT'
	- 'DOMAIN-SUFFIX,doubleclick.net,REJECT'
	- 'DOMAIN-KEYWORD,duomeng,REJECT'
	- 'DOMAIN-KEYWORD,dwtrack,REJECT'
	- 'DOMAIN-KEYWORD,guanggao,REJECT'
	- 'DOMAIN-KEYWORD,lianmeng,REJECT'
	- 'DOMAIN-SUFFIX,mmstat.com,REJECT'
	- 'DOMAIN-KEYWORD,mopub,REJECT'
	- 'DOMAIN-KEYWORD,omgmta,REJECT'
	- 'DOMAIN-KEYWORD,openx,REJECT'
	- 'DOMAIN-KEYWORD,partnerad,REJECT'
	- 'DOMAIN-KEYWORD,pingfore,REJECT'
	- 'DOMAIN-KEYWORD,supersonicads,REJECT'
	- 'DOMAIN-KEYWORD,uedas,REJECT'
	- 'DOMAIN-KEYWORD,umeng,REJECT'
	- 'DOMAIN-KEYWORD,usage,REJECT'
	- 'DOMAIN-SUFFIX,vungle.com,REJECT'
	- 'DOMAIN-KEYWORD,wlmonitor,REJECT'
	- 'DOMAIN-KEYWORD,zjtoolbar,REJECT'
	- 'IP-CIDR,91.108.4.0/22,美国高速,no-resolve'
	- 'IP-CIDR,91.108.8.0/21,美国高速,no-resolve'
	- 'IP-CIDR,91.108.16.0/22,美国高速,no-resolve'
	- 'IP-CIDR,91.108.56.0/22,美国高速,no-resolve'
	- 'IP-CIDR,149.154.160.0/20,美国高速,no-resolve'
	- 'IP-CIDR6,2001:67c:4e8::/48,美国高速,no-resolve'
	- 'IP-CIDR6,2001:b28:f23d::/48,美国高速,no-resolve'
	- 'IP-CIDR6,2001:b28:f23f::/48,美国高速,no-resolve'
	- 'IP-CIDR,120.232.181.162/32,美国高速,no-resolve'
	- 'IP-CIDR,120.241.147.226/32,美国高速,no-resolve'
	- 'IP-CIDR,120.253.253.226/32,美国高速,no-resolve'
	- 'IP-CIDR,120.253.255.162/32,美国高速,no-resolve'
	- 'IP-CIDR,120.253.255.34/32,美国高速,no-resolve'
	- 'IP-CIDR,120.253.255.98/32,美国高速,no-resolve'
	- 'IP-CIDR,180.163.150.162/32,美国高速,no-resolve'
	- 'IP-CIDR,180.163.150.34/32,美国高速,no-resolve'
	- 'IP-CIDR,180.163.151.162/32,美国高速,no-resolve'
	- 'IP-CIDR,180.163.151.34/32,美国高速,no-resolve'
	- 'IP-CIDR,203.208.39.0/24,美国高速,no-resolve'
	- 'IP-CIDR,203.208.40.0/24,美国高速,no-resolve'
	- 'IP-CIDR,203.208.41.0/24,美国高速,no-resolve'
	- 'IP-CIDR,203.208.43.0/24,美国高速,no-resolve'
	- 'IP-CIDR,203.208.50.0/24,美国高速,no-resolve'
	- 'IP-CIDR,220.181.174.162/32,美国高速,no-resolve'
	- 'IP-CIDR,220.181.174.226/32,美国高速,no-resolve'
	- 'IP-CIDR,220.181.174.34/32,美国高速,no-resolve'
	- 'DOMAIN,injections.adguard.org,DIRECT'
	- 'DOMAIN,local.adguard.org,DIRECT'
	- 'DOMAIN-SUFFIX,local,DIRECT'
	- 'IP-CIDR,127.0.0.0/8,DIRECT'
	- 'IP-CIDR,172.16.0.0/12,DIRECT'
	- 'IP-CIDR,192.168.0.0/16,DIRECT'
	- 'IP-CIDR,10.0.0.0/8,DIRECT'
	- 'IP-CIDR,17.0.0.0/8,DIRECT'
	- 'IP-CIDR,224.0.0.0/4,DIRECT'
	- 'IP-CIDR6,fe80::/10,DIRECT'
	- 'DOMAIN-SUFFIX,cn,DIRECT'
	- 'DOMAIN-KEYWORD,-cn,DIRECT'
	- 'GEOIP,CN,DIRECT'
	- 'MATCH,美国高速'`;

export function buildRuntimeState(env = {}) {
  let subConverter = env.SUBAPI || DEFAULT_STATE.subConverter;
  let subProtocol = "https";

  if (subConverter.includes("http://")) {
    subConverter = subConverter.split("//")[1];
    subProtocol = "http";
  } else {
    subConverter = subConverter.split("//")[1] || subConverter;
  }

  return {
    ...DEFAULT_STATE,
    mytoken: env.TOKEN || DEFAULT_STATE.mytoken,
    guestToken: env.GUESTTOKEN || env.GUEST || DEFAULT_STATE.guestToken,
    BotToken: env.TGTOKEN || DEFAULT_STATE.BotToken,
    ChatID: env.TGID || DEFAULT_STATE.ChatID,
    TG: env.TG || DEFAULT_STATE.TG,
    FileName: env.SUBNAME || DEFAULT_STATE.FileName,
    SUBUpdateTime: env.SUBUPTIME || DEFAULT_STATE.SUBUpdateTime,
    subConverter,
    subConfig: env.SUBCONFIG || DEFAULT_STATE.subConfig,
    hasCustomSubConfig: Boolean(env.SUBCONFIG),
    subProtocol,
  };
}
