import {redirect} from 'next/navigation';
// Old links to the retired SMS challenge return to registration.
export default function Page(){redirect('/register')}
