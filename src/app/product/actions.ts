'use server';
import {z} from 'zod';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {db} from '@/lib/db';
import {getCurrentUser} from '@/lib/auth/session';
export async function submitReview(form:FormData){const p=z.object({productId:z.string().uuid(),orderId:z.string().uuid(),slug:z.string().max(200),rating:z.coerce.number().int().min(1).max(5),comment:z.string().min(5).max(2000)}).parse(Object.fromEntries(form));const user=await getCurrentUser();if(!user)redirect('/login');const result=await db().query(`insert into reviews(user_id,product_id,order_id,rating,comment,is_verified_purchase,is_approved) select $1,$2,$3,$4,$5,true,false where exists (select 1 from orders o join order_items i on i.order_id=o.id where o.id=$3 and o.user_id=$1 and o.status='delivered' and i.product_id=$2) returning id`,[user.id,p.productId,p.orderId,p.rating,p.comment]);if(!result.rowCount)throw Error('Sharh faqat qabul qilingan mahsulotga yoziladi');revalidatePath('/product/'+p.slug)}
