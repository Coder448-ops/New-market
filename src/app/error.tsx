'use client';
export default function ErrorPage({reset}:{error:Error;reset:()=>void}){return <div className="wrap py-24 text-center"><h1 className="text-2xl font-bold">Xatolik yuz berdi</h1><p className="my-4 text-gray-500">Iltimos, qayta urinib ko‘ring.</p><button className="primary" onClick={reset}>Qayta urinish</button></div>}
