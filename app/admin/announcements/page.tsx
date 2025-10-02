'use client'
import { useState, useEffect } from 'react'

interface Announcement {
  id: number
  title: string
  content: string
  date: string
  author: string
  photo?: string
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: 'Admin',
    photo: null as File | null
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/announcements')
      if (!res.ok) throw new Error(`API hatası: ${res.status}`)
      const data = await res.json()
      setAnnouncements(data)
    } catch (error) {
      console.error('API hatası:', error)
      setError(`Duyurular yüklenirken hata oluştu`)
    } finally {
      setLoading(false)
    }
  }

  const generateRandomId = () => {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000)
    return parseInt(`93${randomSuffix}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError(null)
      const newId = editingId || generateRandomId()

      const form = new FormData()
      form.append('id', String(newId))
      form.append('title', formData.title)
      form.append('content', formData.content)
      form.append('author', formData.author)
      form.append('date', new Date().toISOString().split('T')[0])
      if (formData.photo) form.append('photo', formData.photo)

      const res = await fetch('/api/announcements', {
        method: 'POST',
        body: form
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `HTTP hatası: ${res.status}`)
      }

      const newAnnouncement = await res.json()

      if (editingId) {
        setAnnouncements(prev =>
          prev.map(item => item.id === editingId ? newAnnouncement : item)
        )
      } else {
        setAnnouncements(prev => [newAnnouncement, ...prev])
      }

      setFormData({ title: '', content: '', author: 'Admin', photo: null })
      setShowForm(false)
      setEditingId(null)
    } catch (error) {
      console.error('Duyuru gönderme hatası:', error)
      setError(error instanceof Error ? error.message : 'Duyuru gönderilemedi')
    }
  }

  const deleteAnnouncement = async (id: number) => {
    if (confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) {
      try {
        setError(null)
        const res = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' })
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || `HTTP hatası: ${res.status}`)
        }
        setAnnouncements(prev => prev.filter(item => item.id !== id))
      } catch (error) {
        console.error('Silme hatası:', error)
        setError(error instanceof Error ? error.message : 'Duyuru silinemedi')
      }
    }
  }

  const editAnnouncement = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      author: announcement.author,
      photo: null
    })
    setEditingId(announcement.id)
    setShowForm(true)
  }

  const cancelEdit = () => {
    setFormData({ title: '', content: '', author: 'Admin', photo: null })
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div>
        <h1>Duyurular</h1>
        <p>Duyurular yükleniyor...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>Duyuru Yönetimi</h1>
        <div className="header-actions">
          <button onClick={fetchAnnouncements} className="btn-secondary">🔄 Yenile</button>
          <button onClick={() => setShowForm(true)} className="btn-primary">➕ Yeni Duyuru</button>
        </div>
      </div>

      {showForm && (
        <div className="modal">
          <form onSubmit={handleSubmit} className="form">
            <h2>{editingId ? '✏️ Düzenle' : '📢 Yeni Duyuru'}</h2>

            <div className="form-group">
              <label>Başlık *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>İçerik *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
                required
              />
            </div>
            <div className="form-group">
              <label>Yazar *</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Fotoğraf Yükle</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({ ...formData, photo: e.target.files?.[0] || null })
                }
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-success">{editingId ? '💾 Güncelle' : '📝 Kaydet'}</button>
              <button type="button" onClick={cancelEdit} className="btn-secondary">İptal</button>
            </div>
          </form>
        </div>
      )}

      <div className="team-grid">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="announcement-card">
            <h3>{announcement.title}</h3>
            <span>{announcement.author} - {announcement.date}</span>
            {announcement.photo && <img className="post_foto" src={announcement.photo} alt={announcement.title} />}
            <p className="post_content">{announcement.content}</p>
            <button onClick={() => editAnnouncement(announcement)}>✏️ Düzenle</button>
            <button onClick={() => deleteAnnouncement(announcement.id)}>🗑️ Sil</button>
            <button onClick={() => window.location.href = `/post/${announcement.id}`}>
              👁️ Git
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
