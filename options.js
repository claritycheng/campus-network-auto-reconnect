const ids=['url','enabled','refreshOnline','loginSelector','onlineSelector','passwordSelector'];
const el=id=>document.getElementById(id);
chrome.storage.local.get('config').then(({config})=>{
 if(!config)return;
 for(const id of ids){if(el(id).type==='checkbox')el(id).checked=!!config[id];else el(id).value=config[id]||'';}
});
el('settings').addEventListener('submit',async event=>{
 event.preventDefault();
 try{
 const raw=Object.fromEntries(ids.map(id=>[id,el(id).type==='checkbox'?el(id).checked:el(id).value]));
 const config=PortalConfig.validate(raw);
 for(const id of ['loginSelector','onlineSelector','passwordSelector'])if(config[id])document.querySelector(config[id]);
 if(!await chrome.permissions.request({origins:[PortalConfig.pattern(config.url)]}))throw new Error('未授予站点权限 / Site permission was not granted');
 await chrome.storage.local.set({config});
 el('status').textContent='已保存。打开认证页，一分钟内开始检查。/ Saved. Open the portal; checks start within a minute.';
 }catch(error){el('status').textContent=error.message;}
});
el('open').addEventListener('click',()=>{
 try{const c=PortalConfig.validate({url:el('url').value});chrome.tabs.create({url:c.url});}
 catch(error){el('status').textContent=error.message;}
});
