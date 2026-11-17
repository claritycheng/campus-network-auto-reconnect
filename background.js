importScripts('config.js');
// Serialize checks: page-load events during a refresh run after the current check.
let pending=Promise.resolve();
const setup=()=>chrome.alarms.create('check',{periodInMinutes:1});
function schedule(refresh=false){
 pending=pending.then(()=>checkPortal(refresh)).catch(error=>console.warn('Portal check:',error.message));
 return pending;
}
async function checkPortal(refresh){
 const {config}=await chrome.storage.local.get('config');
 if(!config?.enabled)return {status:'未启用或尚未保存配置 / Disabled or not configured'};
 const c=PortalConfig.validate(config),pattern=PortalConfig.pattern(c.url);
 if(!await chrome.permissions.contains({origins:[pattern]})) {
 const granted=await chrome.permissions.getAll();
 return {status:'站点授权未生效 / Site permission not effective\n版本 / Version: '+chrome.runtime.getManifest().version+'\n所需规则 / Required: '+pattern+'\nChrome 已授予 / Granted: '+JSON.stringify(granted.origins||[])+'\n请保留此结果用于排查，不要重复重置权限。/ Keep this result; do not repeatedly reset permissions.'};
 }
 const tabs=await chrome.tabs.query({url:pattern});
 const tab=tabs.filter(t=>t.url&&PortalConfig.matches(t.url,c.url)&&t.status!=='loading')
 .sort((a,b)=>Number(b.active)-Number(a.active)||(b.lastAccessed||0)-(a.lastAccessed||0)||b.id-a.id)[0];
 if(!tab)return {status:'找不到匹配的已加载认证页，请核对网址并打开认证页 / No matching loaded portal tab'};
 try {
 await chrome.scripting.executeScript({target:{tabId:tab.id},files:['content.js']});
 } catch(error) {
 if(/Cannot access contents|permission/i.test(error.message)){
 const granted=await chrome.permissions.getAll();
 return {status:'Chrome 已报告授权，但拒绝读取页面 / Permission reported granted, but page access denied\n版本 / Version: '+chrome.runtime.getManifest().version+'\n所需规则 / Required: '+pattern+'\nChrome 已授予 / Granted: '+JSON.stringify(granted.origins||[])+'\n目标页面 / Target: '+new URL(tab.url).origin+'\n'+error.message};
 }
 throw error;
 }
 const result=await chrome.tabs.sendMessage(tab.id,{type:'check',config:c});
 // Only the minute alarm may refresh. A completed load restores the badge
 // without refreshing again, preventing an endless reload loop.
 if(result?.online&&c.refreshOnline&&refresh)await chrome.tabs.reload(tab.id);
 return {status:result?.reason ? '配置状态 / Configuration: '+result.reason : result?.online ? '已识别登录状态，提示已显示 / Signed in; badge displayed' : '已检查认证页，请查看左下角提示 / Portal checked; see badge'};
}
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
 if(message.type!=='diagnose')return;
 pending=pending.then(()=>checkPortal(false));
 pending.then(reply,error=>reply({status:'检查失败 / Check failed: '+error.message}));
 pending=pending.catch(()=>{});
 return true;
});
chrome.runtime.onInstalled.addListener(()=>{setup();chrome.runtime.openOptionsPage();schedule();});
chrome.runtime.onStartup.addListener(()=>{setup();schedule();});
chrome.action.onClicked.addListener(()=>chrome.runtime.openOptionsPage());
chrome.alarms.onAlarm.addListener(alarm=>{if(alarm.name==='check')schedule(true);});
chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.config)schedule();});
chrome.tabs.onUpdated.addListener((id,change,tab)=>{
 if(change.status!=='complete'||!tab.url)return;
 chrome.storage.local.get('config').then(({config})=>{
 if(config?.enabled&&PortalConfig.matches(tab.url,config.url))schedule();
 }).catch(error=>console.warn('Portal load:',error.message));
});
setup();
