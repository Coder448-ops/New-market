'use server';
import {revalidatePath} from 'next/cache';
import {requireAdmin} from '@/lib/auth/session';
import {db} from '@/lib/db';
import {z} from 'zod';

async function assertAdmin(){const auth=await requireAdmin();if('error' in auth)throw Error('Forbidden')}
const id=z.string().uuid();
const slug=z.string().trim().regex(/^[a-z0-9-]{3,200}$/);
const optionalId=z.union([z.literal(''),id]).transform(v=>v||null);
const imageUrl=z.union([z.literal(''),z.string().url().max(2000).refine(v=>new URL(v).protocol==='https:', 'Faqat HTTPS manzil')]).transform(v=>v||null);
export async function updateAdminRecord(form:FormData){
 await assertAdmin();const recordId=id.parse(form.get('id')),type=String(form.get('type')),value=String(form.get('value'));
 if(type==='orders'){
  const status=z.enum(['pending','confirmed','processing','shipped','delivered']).parse(value);
  // Cancellation is deliberately excluded: returning reserved stock needs its own transaction.
  await db().query("update orders set status=$1 where id=$2 and status <> 'cancelled'",[status,recordId]);
 }else if(type==='inventory'){
  const stock=z.coerce.number().int().min(0).max(1000000).parse(value);await db().query('update products set stock=$1 where id=$2',[stock,recordId]);
 }else if(type==='reviews'){
  if(value==='approve')await db().query('update reviews set is_approved=true where id=$1',[recordId]);
  else if(value==='delete')await db().query('delete from reviews where id=$1',[recordId]);else throw Error('Invalid action');
 }else throw Error('Invalid type');
 revalidatePath('/admin/'+type);revalidatePath('/catalog');
}
export async function saveProduct(form:FormData){
 await assertAdmin();
 const schema=z.object({id:z.union([z.literal(''),id]),name:z.string().trim().min(3).max(200),slug,sku:z.string().trim().max(100),description:z.string().max(10000),price:z.coerce.number().int().min(0).max(1000000000),discount_price:z.union([z.literal(''),z.coerce.number().int().min(0).max(1000000000)]),stock:z.coerce.number().int().min(0).max(1000000),main_image:imageUrl,category_id:optionalId,brand_id:optionalId}).refine(p=>p.discount_price===''||p.discount_price<p.price,{message:'Chegirma narxi asosiy narxdan past bo‘lishi kerak',path:['discount_price']});
 const p=schema.parse(Object.fromEntries(form));
 const params=[p.name,p.slug,p.sku||null,p.description||null,p.price,p.stock,form.get('is_published')==='on',form.get('is_featured')==='on',p.main_image,p.category_id,p.brand_id,p.discount_price===''?null:p.discount_price];
 if(p.id)await db().query('update products set name=$1,slug=$2,sku=$3,description=$4,price=$5,stock=$6,is_published=$7,is_featured=$8,main_image=$9,category_id=$10,brand_id=$11,discount_price=$12 where id=$13',[...params,p.id]);
 else await db().query('insert into products(name,slug,sku,description,price,stock,is_published,is_featured,main_image,category_id,brand_id,discount_price) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',params);
 revalidatePath('/admin/products');revalidatePath('/catalog');revalidatePath('/');
}
export async function deleteProduct(form:FormData){await assertAdmin();await db().query('delete from products where id=$1',[id.parse(form.get('id'))]);revalidatePath('/admin/products');revalidatePath('/catalog');revalidatePath('/')}
export async function saveTaxonomy(form:FormData){
 await assertAdmin();const p=z.object({type:z.enum(['categories','brands']),id:z.union([z.literal(''),id]),name:z.string().trim().min(2).max(100),slug}).parse(Object.fromEntries(form));
 // Table name is selected from an enum, never from unrestricted input.
 const active=form.get('is_active')==='on';
 if(p.id)await db().query(`update ${p.type} set name=$1,slug=$2,is_active=$3 where id=$4`,[p.name,p.slug,active,p.id]);
 else await db().query(`insert into ${p.type}(name,slug,is_active) values($1,$2,$3)`,[p.name,p.slug,active]);
 revalidatePath('/admin/'+p.type);revalidatePath('/catalog');revalidatePath('/');
}
