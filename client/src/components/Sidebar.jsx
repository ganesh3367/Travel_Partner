import { NavLink } from 'react-router-dom';
const links=['dashboard','profile','create-trip','explore','chat','groups','notifications'];
export default function Sidebar(){ return <aside className='card p-4 h-fit'>{links.map((x)=><NavLink key={x} to={`/${x}`} className='block px-3 py-2 rounded-xl hover:bg-orange-50 capitalize'>{x.replace('-',' ')}</NavLink>)}</aside>; }
