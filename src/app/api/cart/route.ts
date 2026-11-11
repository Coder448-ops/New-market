import {NextResponse} from 'next/server';
import {z} from 'zod';
import {isSupabaseConfigured} from '@/config/site';
import {createServerSupabase} from '@/lib/supabase/server';
const schema=z.array(z.object({id:z.string().uuid(),quantity:z.number().int().min(1).max(100)})).max(100);
export async function POST(request:Request){if(!isSupabaseConfigured())return NextResponse.json({error:'Ma’lumotlar bazasi sozlanmagan'}, {status:503});let data;try{data=schema.parse(await request.json())}catch{return NextResponse.json({error:'Savat noto‘g‘ri'}, {status:400})}if(!data.length)return NextResponse.json({items:[]});const s=await createServerSupabase();const {data:products,error}=await s.from('products').select('*').eq('is_published',true).in('id',data.map(x=>x.id));if(error)return NextResponse.json({error:'Ma’lumotlarni olishda xatolik'}, {status:500});return NextResponse.json({items:(products||[]).map(p=>({product:p,quantity:data.find(x=>x.id===p.id)?.quantity||1}))})}
