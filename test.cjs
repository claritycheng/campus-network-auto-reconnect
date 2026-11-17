const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const C=require('./config.js');
assert.equal(C.pattern('https://portal.example:8443/login/index.html'),'https://portal.example/*');
assert(C.matches('https://portal.example:8443/login/status?x=1','https://portal.example:8443/login/index.html'));
assert(!C.matches('https://portal.example/login/status','https://portal.example:8443/login/index.html'));
assert(!C.matches('https://evil.example/login/','https://portal.example/login/'));
assert(!C.matches('https://portal.example/private/','https://portal.example/login/index.html'));
assert.throws(()=>C.validate({url:'javascript:alert(1)'}));
assert.throws(()=>C.validate({url:'https://user:secret@portal.example/'}));
const source=fs.readFileSync('content.js','utf8');
async function scenario({online=false,captcha=false,error=false,password='filled',attempts=[],enabled=true,custom=false}={}){
 let listener,clicks=0;
 const button={innerText:online?'Sign out':'Sign in',getClientRects:()=>[{}],click:()=>clicks++};
 const pass={type:'password',value:password,getClientRects:()=>[{}]};
 const cap={type:'text',name:'captcha',getClientRects:()=>[{}]};
 const c=C.validate({url:'https://portal.example/login/index.html',enabled,loginSelector:custom?'#custom':''});
 const data={config:c,attemptsByPortal:{'https://portal.example/login/index.html':attempts}};
 const doc={body:{innerText:error?'Authentication failed':''},getElementById:()=>null,createElement:()=>({style:{}}),documentElement:{append(){}},querySelectorAll:s=>s==='input'?(captcha?[pass,cap]:[pass]):s.startsWith('button')?[button]:s==='#custom'?[button]:[]};
 const context=vm.createContext({URL,Date,console,document:doc,location:{origin:'https://portal.example',pathname:'/login/index.html'},chrome:{storage:{local:{get:async()=>data,set:async value=>Object.assign(data,value)}},runtime:{onMessage:{addListener:fn=>listener=fn}}}});
 vm.runInContext(source,context);
 const result=await new Promise(resolve=>listener({type:'check',config:c},{},resolve));
 return {clicks,result,data};
}
(async()=>{
 assert.equal((await scenario()).clicks,1);
 assert.equal((await scenario({custom:true})).clicks,1);
 assert.equal((await scenario({online:true})).result.online,true);
 for(const input of [{captcha:true},{error:true},{password:''},{enabled:false},{attempts:[Date.now()]},{attempts:[Date.now()-900000,Date.now()-600000,Date.now()-300000]}]) assert.equal((await scenario(input)).clicks,0);
 assert.equal((await scenario({attempts:[Date.now()-3600001]})).clicks,1);
 console.log('Passed: URL scope, scheme/credential rejection, English labels, custom selector, CAPTCHA/errors, empty password, disabled state, cooldown and rolling limit.');
})().catch(error=>{console.error(error);process.exitCode=1;});
