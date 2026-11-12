// @vitest-environment node
import {afterEach,describe,expect,it,vi} from 'vitest';
vi.mock('server-only',()=>({}));
import {isSmsConfigured,startSmsVerification,checkSmsVerification} from '@/lib/sms';
const sid='VE'+'a'.repeat(32),phone='+998901234567';
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals()});
describe('Twilio Verify adapter',()=>{
 it('fails closed when unconfigured and checks the provider response',async()=>{
  vi.stubEnv('TWILIO_ACCOUNT_SID','');vi.stubEnv('TWILIO_AUTH_TOKEN','');vi.stubEnv('TWILIO_VERIFY_SERVICE_SID','');
  expect(isSmsConfigured()).toBe(false);await expect(startSmsVerification(phone)).rejects.toThrow();
  vi.stubEnv('TWILIO_ACCOUNT_SID','AC'+'a'.repeat(32));vi.stubEnv('TWILIO_AUTH_TOKEN','not-a-real-secret');vi.stubEnv('TWILIO_VERIFY_SERVICE_SID','VA'+'a'.repeat(32));
  const fetchMock=vi.fn().mockResolvedValueOnce({ok:true,json:async()=>({sid,to:phone,status:'pending'})}).mockResolvedValueOnce({ok:true,json:async()=>({sid,to:phone,status:'approved'})}).mockResolvedValueOnce({ok:true,json:async()=>({sid,to:'+998901111111',status:'approved'})});
  vi.stubGlobal('fetch',fetchMock);
  expect(await startSmsVerification(phone)).toBe(sid);expect(await checkSmsVerification(sid,phone,'123456')).toBe(true);expect(await checkSmsVerification(sid,phone,'123456')).toBe(false);
  const [url,opts]=fetchMock.mock.calls[1];expect(url).toMatch(/\/VerificationCheck$/);expect(String(opts.body)).toContain('VerificationSid='+sid);expect(opts.cache).toBe('no-store');
 });
});
