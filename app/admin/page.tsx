// app/admin/page.tsx
'use client'
import { useEffect, useState } from 'react'
import CryptoJS from 'crypto-js'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    announcements: 0,
    members: 0,
    team: 0
  })

  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false) // 🔒 Giriş durumu
  const [passwordInput, setPasswordInput] = useState('')
  const [error, setError] = useState(false)

  const correctHash = '9407c826d8e3c07ad37cb2d13d1cb641' // MD5 hash ile doğru şifre

  useEffect(() => {
    if (authenticated) {
      fetchDashboardData()
    }
  }, [authenticated])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [annRes, memRes, teamRes] = await Promise.all([
        fetch('/api/announcements'),
        fetch('/api/members'),
        fetch('/api/team')
      ])
      
      const announcements = await annRes.json()
      const members = await memRes.json()
      const team = await teamRes.json()
      
      setStats({
        announcements: announcements.length,
        members: members.length,
        team: team.length
      })

      setRecentAnnouncements(announcements.slice(-3).reverse())
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkPassword = () => {
    const hashedInput = CryptoJS.MD5(passwordInput).toString()
    if (hashedInput === correctHash) {
      setAuthenticated(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  // 🔒 Şifre giriş popup’ı
  if (!authenticated) {
    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%',
        height: '100vh',
        backgroundColor: '#1e1e1e',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}>
        {/* Üst boşluk / Header */}
        <div style={{position: 'absolute', top: 20}}>
          <h1 style={{color: '#ff9800'}}>Admin Panel</h1>
        </div>

        {/* Popup */}
        <div style={{
          background: '#222',
          padding: '30px',
          borderRadius: '10px',
          textAlign: 'center',
          border: '1px solid #ff9800',
          width: '350px'
        }}>
          <h2 style={{color: '#ff9800', marginBottom: '20px'}}>🔒 Lütfen Şifreyi Girin</h2>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Şifre"
            style={{
              width: '90%',
              padding: '12px',
              marginBottom: '15px',
              borderRadius: '5px',
              border: '1px solid #555',
              background: '#333',
              color: '#fff',
              textAlign: 'center',
              outline: 'none'
            }}
          />
          <button
            onClick={checkPassword}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(45deg, #ff9800, #ff5722)',
              border: 'none',
              borderRadius: '5px',
              color: '#fff',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Giriş Yap
          </button>
          {error && <p style={{color: 'red', marginTop: '10px'}}>❌ Şifre yanlış!</p>}
        </div>

        {/* Alt boşluk / Footer */}
        <div style={{position: 'absolute', bottom: 20}}>
          <p style={{color: '#b0b0b0'}}>© 2025 Admin Panel</p>
        </div>
      </div>
    )
  }

  // Dashboard yükleniyorsa
  if (loading) {
    return (
      <div className="admin-main">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Dashboard içeriği
  return (
    <div>
      <div className="dashboard-header">
        <h1>Hoş Geldiniz! 👋</h1>
        <p>Admin panelinden site içeriğini yönetebilirsiniz.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Toplam Duyuru</h3>
          <p>{stats.announcements}</p>
        </div>
        <div className="stat-card">
          <h3>Kayıtlı Üye</h3>
          <p>{stats.members}</p>
        </div>
        <div className="stat-card">
          <h3>Takım Üyesi</h3>
          <p>{stats.team}</p>
        </div>
      </div>

      <div className="recent-activity">
        <div className="page-header">
          <h2>Son Duyurular</h2>
        </div>
        
        {recentAnnouncements.length > 0 ? (
          <div className="announcements-list">
            {recentAnnouncements.map((announcement) => (
              <div key={announcement.id} className="announcement-card">
                <h3>{announcement.title}</h3>
                <p>{announcement.content}</p>
                <div className="announcement-meta">
                  <span>{new Date(announcement.date).toLocaleDateString('tr-TR')}</span>
                  <span>{announcement.author}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Henüz duyuru bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  )
}
