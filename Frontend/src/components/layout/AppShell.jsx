import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function AppShell() {
  const { isAuthenticated } = useAuthStore();
  const { sidebarOpen } = useUIStore();
  return (
    <div className="min-h-screen flex bg-gray-50">
      {isAuthenticated && sidebarOpen && <Sidebar />}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
