'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {z} from 'zod';
import {db} from '@/lib/db';
import {getCurrentUser} from '@/lib/auth/session';
export async function toggleFavorite(form:FormData){const id=z.string().uuid().safeParse(form.get('productId'));if(!id.success)return;const user=await getCurrentUser();if(!user)redirect('/login');const result=await db().query('delete from favorites where user_id=$1 and product_id=$2 returning id',[user.id,id.data]);if(!result.rowCount)await db().query('insert into favorites(user_id,product_id) select $1,id from products where id=$2 and is_published on conflict (user_id,product_id) do nothing',[user.id,id.data]);revalidatePath('/favorites');revalidatePath('/product/'+String(form.get('slug')||''))}
