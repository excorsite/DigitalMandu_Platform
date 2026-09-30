import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton, SecondaryButton } from '../common/Button';
import { assets } from '../../assets/assets';
import { BasketIcon, MenuIcon } from '../../assets/data/icons';
import { useCart } from '../../api/hooks';
import UserMenu from './UserMenu';

export default function Header() {
  const { isAuthenticated } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const { data: cartData } = useCart();
  const cartCount = (cartData?.data || cartData?.items || []).reduce((s, i) => s + (i.quantity || 1), 0);
  return (
    <header className="bg-white border-b-4 border-primary px-6 py-3 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <button onClick={toggleSidebar} className="p-2 hover:bg-green-footer rounded-lg border border-transparent hover:border-green-border transition" aria-label="Toggle menu"><MenuIcon className="size-6 text-primary" /></button>
          )}
          <img src={assets.logo} alt="Vintage Bite" className="h-9 w-auto cursor-pointer" onClick={()=>navigate('/')} />
          <h1 className="hidden sm:block text-xl font-bold text-primary font-serif cursor-pointer" onClick={()=>navigate('/')}>Vintage Bite</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={()=>navigate('/cart')} className="relative p-2 hover:bg-green-footer rounded-lg transition" aria-label="Cart">
            <BasketIcon className="size-6 text-primary" />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
          </button>

          {isAuthenticated ? <UserMenu /> : (
            <>
              <PrimaryButton label="Login" onClick={()=>navigate('/login')} />
              <SecondaryButton label="Register" onClick={()=>navigate('/register')} />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
