const assert=require('node:assert/strict');
const vm=require('node:vm');const fs=require('node:fs');
async function run(grant,effective){
 const elements={};let saved=false,requested=0;
 const ids=['url','enabled','refreshOnline','loginSelector','onlineSelector','passwordSelector','settings','save','diagnose','open','status'];
 for(const id of ids)elements[id]={value:'',type:['enabled','refreshOnline'].includes(id)?'checkbox':'text',checked:id==='enabled',handlers:{},addEventListener(name,fn){this.handlers[name]=fn;}};
 elements.url.value='https://portal.example:8002/login/index.html';
 const chrome={storage:{local:{get:async()=>({}),set:async()=>{saved=true;}}},permissions:{request:async()=>{requested++;return grant;},contains:async()=>effective},runtime:{sendMessage:async()=>({status:'checked'})},tabs:{create(){}}};
 const document={getElementById:id=>elements[id],querySelector(){}};
 vm.runInContext(fs.readFileSync('options.js','utf8'),vm.createContext({chrome,document,PortalConfig:require('./config.js')}));
 await elements.save.handlers.click();return {saved,requested,status:elements.status.textContent};
}
(async()=>{
 let r=await run(true,true);assert(r.saved);assert.match(r.status,/permission verified/);
 r=await run(false,false);assert(!r.saved);assert.match(r.status,/did not approve/);
 r=await run(true,false);assert(!r.saved);assert.match(r.status,/not effective/);
 console.log('Passed: direct save click, grant verification, denied grant, ineffective grant, immediate diagnostic result.');
})().catch(e=>{console.error(e);process.exitCode=1;});
