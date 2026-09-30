import { useUIStore } from '../../store/uiStore';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, BasketIcon, PackageIcon, ProfileIcon, ChartBarIcon, CrownIcon, GroupUserIcon, DocumentIcon, BulletListIcon } from '../../assets/data/icons';

const BUYER_NAV = [
  { name: 'Home', path: '/', Icon: HomeIcon },
  { name: 'Cart', path: '/cart', Icon: BasketIcon },
  { name: 'Orders', path: '/orders', Icon: PackageIcon },
  { name: 'Profile', path: '/profile', Icon: ProfileIcon },
];
const SELLER_NAV = [
  { name: 'Dashboard', path: '/seller', Icon: ChartBarIcon },
  { name: 'Products', path: '/seller/products', Icon: PackageIcon },
  { name: 'Orders', path: '/seller/orders', Icon: BulletListIcon },
  { name: 'Analytics', path: '/seller/analytics', Icon: ChartBarIcon },
];
const ADMIN_NAV = [
  { name: 'Dashboard', path: '/admin', Icon: CrownIcon },
  { name: 'Users', path: '/admin/users', Icon: GroupUserIcon },
  { name: 'Products', path: '/admin/products', Icon: PackageIcon },
  { name: 'Orders', path: '/admin/orders', Icon: DocumentIcon },
];

export default function Sidebar() {
  const { userRole } = useUIStore();
  const { pathname } = useLocation();
  const map = { buyer: BUYER_NAV, seller: SELLER_NAV, admin: ADMIN_NAV };
  const nav = map[userRole] || BUYER_NAV;
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-6 shrink-0 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto">
      <nav className="space-y-2">
        {nav.map((item) => (
          <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${pathname===item.path ? 'bg-green-50 text-primary font-semibold border border-green-border' : 'text-gray-700 hover:bg-gray-50'}`}>
            <item.Icon className="size-5 shrink-0" /><span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
