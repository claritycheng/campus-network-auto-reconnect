const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const config=require('./config.js').validate({url:'https://portal.example/login/index.html',enabled:true,refreshOnline:true});
const events={};let injections=0,reloads=0;
const event=name=>({addListener:fn=>events[name]=fn});
const chrome={alarms:{create:async()=>{},onAlarm:event('alarm')},runtime:{onInstalled:event('installed'),onStartup:event('startup'),openOptionsPage(){ }},action:{onClicked:event('action')},permissions:{contains:async()=>true},storage:{local:{get:async()=>({config})},onChanged:event('storage')},scripting:{executeScript:async()=>injections++},tabs:{query:async()=>[{id:1,url:config.url,status:'complete'}],sendMessage:async()=>({online:true}),reload:async()=>{reloads++;events.load(1,{status:'complete'},{url:config.url});},onUpdated:event('load')}};
const ctx=vm.createContext({chrome,console,importScripts(){},PortalConfig:require('./config.js')});
vm.runInContext(fs.readFileSync('background.js','utf8'),ctx);
async function flush(){for(let i=0;i<30;i++)await Promise.resolve();}
(async()=>{
 events.alarm({name:'check'});await flush();
 assert.equal(reloads,1,'one refresh on alarm');assert.equal(injections,2,'badge restored after refreshed page loads');
 events.storage({config:{newValue:config}},'local');await flush();assert.equal(injections,3);assert.equal(reloads,1);
 events.load(1,{status:'complete'},{url:'https://unrelated.example/'});await flush();assert.equal(injections,3);
 events.startup();await flush();assert.equal(injections,4);assert.equal(reloads,1);
 console.log('Passed: refresh restores badge without reload loop; config save/startup check immediately; unrelated page ignored.');
})().catch(error=>{console.error(error);process.exitCode=1;});
