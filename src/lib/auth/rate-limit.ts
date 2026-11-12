import 'server-only';
import {createHash} from 'node:crypto';
import {db} from '@/lib/db';

// The atomic upsert shares a fixed-window limit across all application instances.
// Failure to access the limiter must fail closed, never bypass it.
export async function checkAuthRateLimit(key:string,limit:number,windowSeconds:number):Promise<boolean> {
  const hash=createHash('sha256').update(key).digest('hex');
  const {rows}=await db().query<{attempts:number}>(`
    insert into auth_rate_limits(key_hash, attempts, expires_at)
    values($1, 1, now() + $2 * interval '1 second')
    on conflict(key_hash) do update set
      attempts=case when auth_rate_limits.expires_at <= now() then 1 else least(auth_rate_limits.attempts + 1, $3 + 1) end,
      expires_at=case when auth_rate_limits.expires_at <= now() then now() + $2 * interval '1 second' else auth_rate_limits.expires_at end
    returning attempts`,[hash,windowSeconds,limit]);
  return rows[0].attempts<=limit;
}
