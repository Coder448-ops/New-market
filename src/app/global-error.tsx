'use client';

export default function GlobalError({reset}:{error:Error;reset:()=>void}){
  return <html lang="uz"><body style={{fontFamily:'Arial, sans-serif',padding:'4rem 1.5rem',textAlign:'center'}}>
    <h1>Xizmat vaqtincha ishlamayapti</h1>
    <p>Saytga ulanishda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko‘ring.</p>
    <button onClick={reset}>Qayta urinish</button>
  </body></html>;
}
