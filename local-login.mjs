import fs from 'node:fs';
import {startService,close_api,waitForApi,send,delay} from './utils/utils.js';
const keys=JSON.parse(fs.readFileSync('./qrkeys.json','utf8')).keys;
if(keys.length!==1)throw new Error('Expected one login QR');
const api=startService();
try {
  await waitForApi();
  let success=false;
  for(let attempt=0;attempt<60;attempt++){
    const result=await send('/login/qr/check?key='+encodeURIComponent(keys[0])+'&timestrap='+Date.now(),'GET',{});
    if(result?.data?.status===4){
      const {userid,token}=result.data;
      if(!userid || !token)throw new Error('Login response missing credentials');
      fs.writeFileSync('./local-userinfo.json',JSON.stringify([{userid,token}]),{mode:0o600});
      console.log('LOGIN_SUCCESS: credentials saved locally; token not printed.');
      success=true;break;
    }
    if(result?.data?.status===0){console.log('QR_EXPIRED');break;}
    await delay(2000);
  }
  if(!success){console.log('LOGIN_NOT_COMPLETED');process.exitCode=2;}
} catch(error){
  console.error('LOGIN_FAILED: '+error.name);
  process.exitCode=1;
} finally {close_api(api);}
