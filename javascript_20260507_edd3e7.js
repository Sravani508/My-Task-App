'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import './globals.css';

function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };
  
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="text-xl font-bold">
            Task Manager
          </Link>
          <div className="flex space-x-4">
            <Link href="/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded">
              Dashboard
            </Link>
            <Link href="/projects" className="hover:bg-blue-700 px-3 py-2 rounded">
              Projects
            </Link>
            <button onClick={handleLogout} className="hover:bg-blue-700 px-3 py-2 rounded">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
