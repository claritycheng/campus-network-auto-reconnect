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
 if(!config?.enabled)return;
 const c=PortalConfig.validate(config),pattern=PortalConfig.pattern(c.url);
 if(!await chrome.permissions.contains({origins:[pattern]}))return;
 const tabs=await chrome.tabs.query({url:pattern});
 const tab=tabs.find(t=>t.url&&PortalConfig.matches(t.url,c.url)&&t.status!=='loading');
 if(!tab)return;
 await chrome.scripting.executeScript({target:{tabId:tab.id},files:['content.js']});
 const result=await chrome.tabs.sendMessage(tab.id,{type:'check',config:c});
 // Only the minute alarm may refresh. A completed load restores the badge
 // without refreshing again, preventing an endless reload loop.
 if(result?.online&&c.refreshOnline&&refresh)await chrome.tabs.reload(tab.id);
}
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
