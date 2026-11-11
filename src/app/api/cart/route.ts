import {NextResponse} from 'next/server';
import {z} from 'zod';
import {db,isDatabaseConfigured} from '@/lib/db';
const schema=z.array(z.object({id:z.string().uuid(),quantity:z.number().int().min(1).max(100)})).max(100);
export async function POST(request:Request){if(!isDatabaseConfigured())return NextResponse.json({error:'Ma’lumotlar bazasi sozlanmagan'},{status:503});let items:z.infer<typeof schema>;try{const raw=await request.text();if(raw.length>20000)throw Error('too large');items=schema.parse(JSON.parse(raw))}catch{return NextResponse.json({error:'Savat noto‘g‘ri'},{status:400})}if(!items.length)return NextResponse.json({items:[]});try{const {rows}=await db().query('select * from products where is_published and id=any($1::uuid[])',[items.map(i=>i.id)]);return NextResponse.json({items:rows.map(product=>({product,quantity:items.find(i=>i.id===product.id)?.quantity||1}))})}catch{return NextResponse.json({error:'Ma’lumotlarni olishda xatolik'},{status:500})}}
