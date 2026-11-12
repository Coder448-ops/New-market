// @vitest-environment node
import {beforeEach,describe,expect,it,vi} from 'vitest';

vi.mock('server-only',()=>({}));
const mocks=vi.hoisted(()=>({
  query:vi.fn(),
  configured:vi.fn(()=>true),
  cookieGet:vi.fn(),
  cookieSet:vi.fn(),
  cookieDelete:vi.fn(),
  sendMail:vi.fn(),
  createTransport:vi.fn(),
}));
vi.mock('next/headers',()=>({cookies:async()=>({get:mocks.cookieGet,set:mocks.cookieSet,delete:mocks.cookieDelete})}));
vi.mock('@/lib/db',()=>({db:()=>({query:mocks.query}),isDatabaseConfigured:mocks.configured}));
vi.mock('nodemailer',()=>({default:{createTransport:mocks.createTransport}}));
import {createSession,destroySession,getCurrentUser,hashPassword,hashToken,makeToken,verifyPassword} from '@/lib/auth/session';
import {sendAuthMail,sendTwoFactorCode} from '@/lib/mail';

beforeEach(()=>{vi.clearAllMocks();mocks.configured.mockReturnValue(true);mocks.query.mockResolvedValue({rows:[]});mocks.createTransport.mockReturnValue({sendMail:mocks.sendMail});mocks.sendMail.mockResolvedValue({});});

describe('authentication primitives',()=>{
  it('salts password hashes and rejects incorrect passwords or malformed hashes',async()=>{
    const a=await hashPassword('example-password-123');const b=await hashPassword('example-password-123');
    expect(a).not.toBe(b);expect(a).not.toContain('example-password-123');
    expect(await verifyPassword('example-password-123',a)).toBe(true);
    expect(await verifyPassword('incorrect',a)).toBe(false);
    expect(await verifyPassword('incorrect','invalid')).toBe(false);
  });
  it('generates random tokens and stores only a hash in the session database',async()=>{
    expect(makeToken()).not.toBe(makeToken());
    await createSession('test-user-id');
    const token=mocks.cookieSet.mock.calls[0][1];
    expect(mocks.query.mock.calls[0][1]).toEqual([hashToken(token),'test-user-id',expect.any(Date)]);
    expect(mocks.cookieSet).toHaveBeenCalledWith('nex_session',token,expect.objectContaining({httpOnly:true,sameSite:'lax',path:'/'}));
  });
  it('rejects missing tokens and invalidates a logged out session',async()=>{
    mocks.cookieGet.mockReturnValue(undefined);expect(await getCurrentUser()).toBeNull();expect(mocks.query).not.toHaveBeenCalled();
    mocks.cookieGet.mockReturnValue({value:'test-session-token'});await destroySession();
    expect(mocks.query).toHaveBeenCalledWith('delete from sessions where token_hash=$1',[hashToken('test-session-token')]);
    expect(mocks.cookieDelete).toHaveBeenCalledWith('nex_session');
  });
});

describe('verification email',()=>{
  it('sends the email code without exposing it in the subject',async()=>{
    vi.stubEnv('SMTP_HOST','smtp.example.invalid');vi.stubEnv('SMTP_USER','test');vi.stubEnv('SMTP_PASSWORD','test');vi.stubEnv('MAIL_FROM','test@example.invalid');vi.stubEnv('NEXT_PUBLIC_APP_URL','https://shop.example.invalid');
    try{
      await sendTwoFactorCode('buyer@example.invalid','012345','login');
      const mail=mocks.sendMail.mock.calls[0][0];expect(mail.text).toContain('012345');expect(mail.text).toContain('10 daqiqa');expect(mail.subject).not.toContain('012345');
    }finally{vi.unstubAllEnvs()}
  });
  it('uses the configured https origin and creates a usable verification link',async()=>{
    vi.stubEnv('SMTP_HOST','smtp.example.invalid');vi.stubEnv('SMTP_PORT','587');vi.stubEnv('SMTP_USER','test');vi.stubEnv('SMTP_PASSWORD','test');vi.stubEnv('MAIL_FROM','test@example.invalid');vi.stubEnv('NEXT_PUBLIC_APP_URL','https://shop.example.invalid');
    try{
      await sendAuthMail('buyer@example.invalid','sample-token','verify');
      const mail=mocks.sendMail.mock.calls[0][0];
      expect(mail.text).toContain('https://shop.example.invalid/auth/callback?token=sample-token&purpose=verify');
      expect(mail.text).toContain('\nAgar');
      expect(mocks.createTransport).toHaveBeenCalledWith(expect.objectContaining({host:'smtp.example.invalid',port:587,secure:false}));
    }finally{vi.unstubAllEnvs()}
  });
});
