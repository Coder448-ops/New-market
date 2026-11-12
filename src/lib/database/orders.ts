import {db,isDatabaseConfigured} from '@/lib/db';
import type {Order,OrderItem} from '@/types';
export async function getUserOrders(id:string):Promise<Order[]>{if(!isDatabaseConfigured())return [];return (await db().query('select * from orders where user_id=$1 order by created_at desc',[id])).rows}
export async function getOrderWithItems(id:string,userId:string):Promise<{order:Order;items:OrderItem[]}|null>{if(!isDatabaseConfigured())return null;const order=(await db().query('select * from orders where id=$1 and user_id=$2',[id,userId])).rows[0];if(!order)return null;const items=(await db().query('select * from order_items where order_id=$1 order by created_at',[id])).rows;return {order,items}}
