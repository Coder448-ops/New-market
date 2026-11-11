import 'server-only';
import {Pool, types} from 'pg';
// UZS amounts are stored as bigint and constrained to the JavaScript safe range.
types.setTypeParser(20, value => { const n=Number(value); if(!Number.isSafeInteger(n)) throw new Error('Unsafe bigint'); return n; });
types.setTypeParser(1700, Number);
let pool:Pool|undefined;
export function db(){if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is not configured');return pool ??= new Pool({connectionString:process.env.DATABASE_URL,max:3,idleTimeoutMillis:10000,connectionTimeoutMillis:10000});}
export function isDatabaseConfigured(){return Boolean(process.env.DATABASE_URL)}
