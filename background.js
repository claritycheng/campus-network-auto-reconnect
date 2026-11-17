importScripts('config.js');
let running=false;
const setup=()=>chrome.alarms.create('check',{periodInMinutes:1});
chrome.runtime.onInstalled.addListener(()=>{setup();chrome.runtime.openOptionsPage();});
chrome.runtime.onStartup.addListener(setup);
chrome.action.onClicked.addListener(()=>chrome.runtime.openOptionsPage());
setup();
chrome.alarms.onAlarm.addListener(async alarm=>{
 if(alarm.name!=='check'||running)return;
 running=true;
 try {
 const {config}=await chrome.storage.local.get('config');
 if(!config?.enabled)return;
 const c=PortalConfig.validate(config),pattern=PortalConfig.pattern(c.url);
 if(!await chrome.permissions.contains({origins:[pattern]}))return;
 const tabs=await chrome.tabs.query({url:pattern});
 const tab=tabs.find(t=>t.url&&PortalConfig.matches(t.url,c.url)&&t.status!=='loading');
 if(!tab)return;
 await chrome.scripting.executeScript({target:{tabId:tab.id},files:['content.js']});
 const result=await chrome.tabs.sendMessage(tab.id,{type:'check',config:c});
 if(result?.online&&c.refreshOnline)await chrome.tabs.reload(tab.id);
 }catch(error){console.warn('Portal check:',error.message);}
 finally{running=false;}
});
