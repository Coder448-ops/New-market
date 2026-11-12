import {db,isDatabaseConfigured} from '@/lib/db';
import type {Banner,Brand,Category} from '@/types';
export async function getCategories():Promise<Category[]>{if(!isDatabaseConfigured())return [];return (await db().query('select * from categories where is_active order by sort_order')).rows}
export async function getCategoryBySlug(slug:string):Promise<Category|null>{if(!isDatabaseConfigured())return null;return (await db().query('select * from categories where slug=$1 and is_active',[slug])).rows[0]||null}
export async function getBrands():Promise<Brand[]>{if(!isDatabaseConfigured())return [];return (await db().query('select * from brands where is_active order by name')).rows}
export async function getBanners(position='hero'):Promise<Banner[]>{if(!isDatabaseConfigured())return [];return (await db().query('select * from banners where position=$1 and is_active and (starts_at is null or starts_at<=now()) and (ends_at is null or ends_at>now()) order by sort_order',[position])).rows}
export async function getSiteSettings():Promise<Record<string,unknown>>{if(!isDatabaseConfigured())return {};const rows=(await db().query('select key,value from site_settings')).rows;return Object.fromEntries(rows.map(r=>[r.key,r.value]))}
