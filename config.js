(function(root) {
 const api = {
 pattern(value) { const u=new URL(value); return u.protocol+'//'+u.hostname+'/*'; },
 matches(value,portal) { try {const a=new URL(value),b=new URL(portal);return a.origin===b.origin && a.pathname.startsWith(b.pathname.slice(0,b.pathname.lastIndexOf('/')+1));}catch{return false;} },
 validate(input) {
 const u=new URL(input.url);
 if(!['http:','https:'].includes(u.protocol)||u.username||u.password) throw new Error('请输入不含账号密码的 HTTP(S) 地址 / Enter an HTTP(S) URL without credentials');
 return {enabled:!!input.enabled,url:u.href,refreshOnline:!!input.refreshOnline,loginSelector:(input.loginSelector||'').trim(),onlineSelector:(input.onlineSelector||'').trim(),passwordSelector:(input.passwordSelector||'').trim()};
 }};
 root.PortalConfig=api;
 if(typeof module!=='undefined')module.exports=api;
})(globalThis);
