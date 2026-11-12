import 'server-only';
// Twilio Verify is an optional adapter. Nothing is sent unless the operator configures it.
export function isSmsConfigured(){return Boolean(process.env.TWILIO_ACCOUNT_SID&&process.env.TWILIO_AUTH_TOKEN&&process.env.TWILIO_VERIFY_SERVICE_SID)}
async function request(path:'Verifications'|'VerificationCheck',data:URLSearchParams){
 if(!isSmsConfigured())throw new Error('SMS provider not configured');
 const service=process.env.TWILIO_VERIFY_SERVICE_SID!;
 if(!/^VA[0-9a-fA-F]{32}$/.test(service))throw new Error('Invalid SMS configuration');
 const auth=Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
 const res=await fetch(`https://verify.twilio.com/v2/Services/${service}/${path}`,{method:'POST',headers:{Authorization:`Basic ${auth}`,'Content-Type':'application/x-www-form-urlencoded'},body:data,signal:AbortSignal.timeout(10000),cache:'no-store'});
 if(!res.ok)throw new Error('SMS verification service error');
 return await res.json() as {sid?:string;status?:string;to?:string};
}
export async function startSmsVerification(phone:string){
 const data=await request('Verifications',new URLSearchParams({To:phone,Channel:'sms'}));
 if(data.status!=='pending'||!/^VE[0-9a-fA-F]{32}$/.test(data.sid||'')||data.to!==phone)throw new Error('SMS verification not started');
 return data.sid!;
}
export async function checkSmsVerification(sid:string,phone:string,code:string){
 if(!/^VE[0-9a-fA-F]{32}$/.test(sid))return false;
 const data=await request('VerificationCheck',new URLSearchParams({VerificationSid:sid,Code:code}));
 return data.status==='approved'&&data.to===phone&&data.sid===sid;
}
