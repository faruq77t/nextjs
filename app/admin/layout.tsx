// app/admin/layout.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './admin.css'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <Link 
            href="/admin" 
            className={pathname === '/admin' ? 'nav-link active' : 'nav-link'}
          >
            📊 Dashboard
          </Link>
          <Link 
            href="/admin/announcements" 
            className={pathname === '/admin/announcements' ? 'nav-link active' : 'nav-link'}
          >
            📢 Duyurular
          </Link>
          <Link 
            href="/admin/members" 
            className={pathname === '/admin/members' ? 'nav-link active' : 'nav-link'}
          >
            👥 Üyeler
          </Link>
          <Link 
            href="/admin/team" 
            className={pathname === '/admin/team' ? 'nav-link active' : 'nav-link'}
          >
            🏆 Takım
          </Link>
        </nav>
      </aside>
      <main className="admin-main">
        {children}
      </main>
    </div>
  )
}