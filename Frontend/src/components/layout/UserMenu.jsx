import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { ProfileIcon, LogoutIcon } from '../../assets/data/icons';

export default function UserMenu() {
  const { user, logout } = useAuthStore();
  const { userRole } = useUIStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const email = user?.email || user?.userEmail || '—';
  const name = user?.name || user?.userName || email.split('@')[0] || 'User';

  useEffect(()=>{
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return ()=> document.removeEventListener('mousedown', h);
  },[]);

  return (
    <div className="relative" ref={ref}>
      <button onClick={()=>setOpen(v=>!v)} className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition">
        <span className="w-9 h-9 rounded-full bg-green-footer border border-green-border flex items-center justify-center text-primary"><ProfileIcon size={20} /></span>
        <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[140px] truncate">{name}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
          <div className="p-4 bg-green-footer border-b border-green-border flex items-center gap-3">
            <span className="w-12 h-12 rounded-full bg-white border border-green-border flex items-center justify-center text-primary"><ProfileIcon size={28} /></span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{name}</p>
              <p className="text-xs text-gray-600 truncate">{email}</p>
              <span className="inline-block mt-1 text-[11px] bg-white border border-green-border text-primary px-2 py-0.5 rounded-full font-medium">{userRole}</span>
            </div>
          </div>
          <div className="p-2 flex flex-col gap-1">
            <button onClick={()=>{setOpen(false); navigate('/profile');}} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700 text-left"><ProfileIcon size={18} /> View Profile</button>
            <button onClick={async()=>{setOpen(false); await logout(); navigate('/login');}} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 text-sm text-red-600 text-left"><LogoutIcon /> Logout</button>
          </div>
        </div>
      )}
    </div>
  );
}
