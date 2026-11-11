'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {z} from 'zod';
import {createServerSupabase} from '@/lib/supabase/server';
export async function toggleFavorite(form:FormData){const id=z.string().uuid().safeParse(form.get('productId'));if(!id.success)return;const s=await createServerSupabase();const {data:{user}}=await s.auth.getUser();if(!user)redirect('/login');const {data:existing}=await s.from('favorites').select('id').eq('user_id',user.id).eq('product_id',id.data).maybeSingle();if(existing)await s.from('favorites').delete().eq('id',existing.id);else await s.from('favorites').insert({user_id:user.id,product_id:id.data});revalidatePath('/favorites');revalidatePath('/product/'+String(form.get('slug')||''))}
