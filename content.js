(() => {
  if (location.origin !== 'https://192.168.0.9:8002') return;
  let busy = false;
  const visible = e => !!(e && e.getClientRects().length);
  const label = e => (e.innerText || e.value || '').replace(/\s/g, '');
  const buttons = () => [...document.querySelectorAll('button,input[type=submit],input[type=button],a[role=button]')].filter(visible);
  const online = () => buttons().some(e => label(e) === '注销');
  const badge = document.createElement('div');
  badge.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:2147483647;padding:9px 14px;background:#173a51;color:white;border-radius:8px;font:14px sans-serif;max-width:420px;pointer-events:none';
  document.documentElement.append(badge);
  function show(s) { badge.textContent = '校园网助手：' + s; }
  async function check() {
    if (online()) { show('已登录，每分钟检查（请保留此标签页）'); return {online:true}; }
    if (busy) return {online:false};
    busy = true;
    try {
      const text = document.body.innerText;
      if (/密码错误|密码不正确|账号或密码|账户被锁|帐号被锁|认证失败/.test(text)) {
        show('页面提示认证异常，已暂停自动提交，请手动处理'); return {online:false};
      }
      const inputs = [...document.querySelectorAll('input')].filter(visible);
      if (inputs.some(e => /captcha|verify|验证码/i.test([e.name,e.id,e.placeholder].join(' ')))) {
        show('需要验证码，请手动登录'); return {online:false};
      }
      const password = inputs.find(e => e.type === 'password');
      const login = buttons().find(e => /^(登录|登陆|Login|Sign in)$/i.test(label(e)));
      if (!password || !password.value || !login || login.disabled) {
        show('等待浏览器填入账号密码；必要时手动点一次登录'); return {online:false};
      }
      const state = await chrome.storage.local.get('attempts');
      const attempts = (state.attempts || []).filter(t => Date.now()-t < 3600000);
      if (attempts.length >= 3) { show('一小时已尝试3次，暂停重试'); return {online:false}; }
      if (attempts.length && Date.now()-attempts.at(-1) < 120000) return {online:false};
      await chrome.storage.local.set({attempts:[...attempts,Date.now()]});
      show('正在点击登录');
      login.click();
      return {online:false};
    } finally { busy = false; }
  }
  chrome.runtime.onMessage.addListener((m,s,reply) => {
    if (m.type !== 'check') return;
    check().then(reply).catch(() => reply({online:false})); return true;
  });
  setTimeout(() => check(), 5000);
})();
