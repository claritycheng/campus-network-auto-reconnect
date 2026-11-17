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
 if(!await chrome.permissions.contains({origins:[pattern]}))return {status:'缺少站点授权，请重新保存并授权 / Site permission missing'};
 const tabs=await chrome.tabs.query({url:pattern});
 const tab=tabs.find(t=>t.url&&PortalConfig.matches(t.url,c.url)&&t.status!=='loading');
 if(!tab)return {status:'找不到匹配的已加载认证页，请核对网址并打开认证页 / No matching loaded portal tab'};
 try {
 await chrome.scripting.executeScript({target:{tabId:tab.id},files:['content.js']});
 } catch(error) {
 if(/Cannot access contents|permission/i.test(error.message))return {status:'Chrome 拒绝读取认证页。请在设置页点击“重置此站点授权”，再点击“保存并授权站点”，允许后刷新认证页。若仍失败，请提供扩展版本和下列错误。/ Chrome denied page access. Reset site permission, save and allow again, then refresh the portal.\n'+error.message};
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
