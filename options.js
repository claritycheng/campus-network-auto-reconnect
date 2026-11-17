const ids=['url','enabled','refreshOnline','loginSelector','onlineSelector','passwordSelector'];
const el=id=>document.getElementById(id);
el('diagnose').addEventListener('click',async()=>{
 try{const result=await chrome.runtime.sendMessage({type:'diagnose'});el('status').textContent=result?.status||'未返回检查结果 / No result';}
 catch(error){el('status').textContent='请重新加载扩展 / Reload extension: '+error.message;}
});
chrome.storage.local.get('config').then(({config})=>{
 if(!config)return;
 for(const id of ids){if(el(id).type==='checkbox')el(id).checked=!!config[id];else el(id).value=config[id]||'';}
});
el('settings').addEventListener('submit',event=>event.preventDefault());
el('save').addEventListener('click',async()=>{
 el('status').textContent='正在检查网址并申请权限… / Requesting site access…';
 try{
 const raw=Object.fromEntries(ids.map(id=>[id,el(id).type==='checkbox'?el(id).checked:el(id).value]));
 const config=PortalConfig.validate(raw);
 for(const id of ['loginSelector','onlineSelector','passwordSelector'])if(config[id])document.querySelector(config[id]);
 const pattern=PortalConfig.pattern(config.url);
 if(!await chrome.permissions.request({origins:[pattern]}))throw new Error('Chrome 未批准站点授权，请查看浏览器权限提示。/ Chrome did not approve site access.');
 if(!await chrome.permissions.contains({origins:[pattern]}))throw new Error('Chrome 返回已批准，但授权未生效；请点击诊断并提供结果。/ Grant reported successful but is not effective. Run diagnostics.');
 await chrome.storage.local.set({config});
 const result=await chrome.runtime.sendMessage({type:'diagnose'});
 el('status').textContent='已保存，授权已核验 / Saved; permission verified\n'+(result?.status||'未返回诊断 / No diagnostic result');
 }catch(error){el('status').textContent=error.message;}
});
el('open').addEventListener('click',async()=>{
 try{
 const c=PortalConfig.validate({url:el('url').value});
 const tabs=await chrome.tabs.query({url:PortalConfig.pattern(c.url)});
 const existing=tabs.filter(t=>t.url&&PortalConfig.matches(t.url,c.url)).sort((a,b)=>(b.lastAccessed||0)-(a.lastAccessed||0)||b.id-a.id)[0];
 if(existing)await chrome.tabs.update(existing.id,{active:true});
 else await chrome.tabs.create({url:c.url});
 await chrome.runtime.sendMessage({type:'diagnose'});
 }
 catch(error){el('status').textContent=error.message;}
});
