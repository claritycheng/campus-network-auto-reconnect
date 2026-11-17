(() => {
 if(globalThis.__portalReconnectInstalled)return;
 globalThis.__portalReconnectInstalled=true;
 let busy=false;
 const visible=e=>!!(e&&e.getClientRects().length);
 const label=e=>(e.innerText||e.value||'').replace(/\s/g,'').toLowerCase();
 const buttons=()=>[...document.querySelectorAll('button,input[type=submit],input[type=button],a')].filter(visible);
 const select=s=>[...document.querySelectorAll(s)].find(visible);
 function show(message){
 let badge=document.getElementById('__portal_reconnect_badge');
 if(!badge){badge=document.createElement('div');badge.id='__portal_reconnect_badge';badge.style.cssText='position:fixed;bottom:12px;left:12px;z-index:2147483647;padding:9px 14px;background:#173a51;color:white;border-radius:8px;font:14px sans-serif;max-width:520px;pointer-events:none';document.documentElement.append(badge);}
 badge.textContent='网络助手 / Portal: '+message;
 }
 async function check(c){
 if(busy)return {online:false};
 busy=true;
 try{
 const {config}=await chrome.storage.local.get('config');
 if(!config?.enabled)return {online:false,reason:'disabled'};
 // Compare values, not serialization order: storage can reorder object keys.
 if(['enabled','url','refreshOnline','loginSelector','onlineSelector','passwordSelector'].some(key=>config[key]!==c[key]))return {online:false,reason:'stale-config'};
 const u=new URL(c.url);
 if(location.origin!==u.origin||!location.pathname.startsWith(u.pathname.slice(0,u.pathname.lastIndexOf('/')+1)))return {online:false};
 const online=c.onlineSelector?select(c.onlineSelector):buttons().find(e=>/^(注销|退出登录|登出|logout|signout|logoff)$/.test(label(e)));
 if(online){show('已登录 / Signed in');return {online:true};}
 const text=document.body.innerText;
 if(/密码错误|密码不正确|账号或密码|账户被锁|帐号被锁|认证失败|incorrect password|invalid (?:username|password|credentials)|authentication failed|account locked/i.test(text)){show('认证异常，请手动处理 / Authentication error: sign in manually');return {online:false};}
 const inputs=[...document.querySelectorAll('input')].filter(visible);
 if(inputs.some(e=>/captcha|verify|验证码/i.test([e.name,e.id,e.placeholder].join(' ')))||select('iframe[src*="recaptcha"],iframe[src*="hcaptcha"],[class*="cf-turnstile"]')){show('验证码需手动处理 / Complete CAPTCHA manually');return {online:false};}
 const password=c.passwordSelector?select(c.passwordSelector):inputs.find(e=>e.type==='password');
 const login=c.loginSelector?select(c.loginSelector):buttons().find(e=>/^(登录|登陆|立即登录|连接|login|signin|logon|connect)$/.test(label(e)));
 if(!password?.value||!login||login.disabled){show('等待填入信息或配置选择器 / Waiting for autofill or portal configuration');return {online:false};}
 const {attemptsByPortal={}}=await chrome.storage.local.get('attemptsByPortal');
 const key=u.origin+u.pathname;
 const attempts=(attemptsByPortal[key]||[]).filter(t=>Date.now()-t<3600000);
 if(attempts.length>=3||(attempts.length&&Date.now()-attempts.at(-1)<120000)){show('等待重试冷却 / Waiting for retry cooldown');return {online:false};}
 attemptsByPortal[key]=[...attempts,Date.now()];
 await chrome.storage.local.set({attemptsByPortal});
 show('正在登录 / Signing in');login.click();return {online:false};
 }catch(error){show('检查配置 / Check configuration: '+error.message);return {online:false};}
 finally{busy=false;}
 }
 chrome.runtime.onMessage.addListener((m,s,reply)=>{if(m.type!=='check')return;check(m.config).then(reply).catch(()=>reply({online:false}));return true;});
})();
