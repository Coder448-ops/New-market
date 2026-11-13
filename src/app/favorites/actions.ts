'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {z} from 'zod';
import {db} from '@/lib/db';
import {getCurrentUser} from '@/lib/auth/session';

export async function toggleFavorite(form:FormData) {
  const id=z.string().uuid().safeParse(form.get('productId'));
  const intent=z.enum(['add','remove']).safeParse(form.get('intent'));
  if (!id.success || !intent.success) return;
  const user=await getCurrentUser();
  if (!user) redirect('/login');
  if (intent.data==='remove') {
    await db().query('delete from favorites where user_id=$1 and product_id=$2',[user.id,id.data]);
  } else {
    await db().query('insert into favorites(user_id,product_id) select $1,id from products where id=$2 and is_published on conflict (user_id,product_id) do nothing',[user.id,id.data]);
  }
  revalidatePath('/favorites');
  const slug=z.string().regex(/^[a-zA-Z0-9-]+$/).max(200).safeParse(form.get('slug'));
  if (slug.success) revalidatePath('/product/'+slug.data);
}
