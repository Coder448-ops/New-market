'use server';
import {z} from 'zod';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {createServerSupabase} from '@/lib/supabase/server';
export async function submitReview(form:FormData){const input=z.object({productId:z.string().uuid(),orderId:z.string().uuid(),slug:z.string().max(200),rating:z.coerce.number().int().min(1).max(5),comment:z.string().min(5).max(2000)}).parse(Object.fromEntries(form));const s=await createServerSupabase();const {data:{user}}=await s.auth.getUser();if(!user)redirect('/login');const {error}=await s.from('reviews').insert({user_id:user.id,product_id:input.productId,order_id:input.orderId,rating:input.rating,comment:input.comment,is_verified_purchase:true,is_approved:false});if(error)throw Error('Sharh yuborilmadi: faqat ushbu mahsulotni qabul qilgan xaridor sharh qoldira oladi.');revalidatePath('/product/'+input.slug)}
