'use client'
import { useState, useEffect } from 'react'

interface TeamMember {
  id: number
  name: string
  position: string
  photo?: string | null
  bio: string
  email: string
  phone: string
  social: {
    twitter?: string
    linkedin?: string
    github?: string
  }
}

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    photo: null as File | null,
    bio: '',
    email: '',
    phone: '',
    social: { twitter: '', linkedin: '', github: '' }
  })

  useEffect(() => { fetchTeam() }, [])

  const fetchTeam = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/team')
      if (!res.ok) throw new Error(`API hatası: ${res.status}`)
      const data = await res.json()
      setTeam(data)
    } catch (error) {
      console.error('Takım yüklenirken hata:', error)
      setError('Takım üyeleri yüklenirken hata oluştu')
    } finally { setLoading(false) }
  }

  const generateRandomId = () => {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000)
    return parseInt(`93${randomSuffix}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError(null)
      const memberId = editingId || generateRandomId()
      const form = new FormData()
      form.append('id', memberId.toString())
      form.append('name', formData.name)
      form.append('position', formData.position)
      form.append('bio', formData.bio)
      form.append('email', formData.email)
      form.append('phone', formData.phone)
      form.append('twitter', formData.social.twitter)
      form.append('linkedin', formData.social.linkedin)
      form.append('github', formData.social.github)
      if (formData.photo) form.append('photo', formData.photo)

      const res = await fetch('/api/team', { method: 'POST', body: form })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `HTTP hatası: ${res.status}`)
      }
      const newMember = await res.json()

      if (editingId) {
        setTeam(prev => prev.map(m => m.id === editingId ? newMember : m))
      } else {
        setTeam(prev => [newMember, ...prev])
      }

      setFormData({ name: '', position: '', photo: null, bio: '', email: '', phone: '', social: { twitter: '', linkedin: '', github: '' } })
      setEditingId(null)
      setShowForm(false)
    } catch (error) {
      console.error('Takım üyesi ekleme hatası:', error)
      setError(error instanceof Error ? error.message : 'Takım üyesi eklenirken hata oluştu')
    }
  }

  const deleteTeamMember = async (id: number) => {
    if (!confirm('Bu takım üyesini silmek istediğinizden emin misiniz?')) return
    try {
      const res = await fetch(`/api/team?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `HTTP hatası: ${res.status}`)
      }
      setTeam(prev => prev.filter(m => m.id !== id))
    } catch (error) {
      console.error('Silme hatası:', error)
      setError(error instanceof Error ? error.message : 'Takım üyesi silinirken hata oluştu')
    }
  }

  const editTeamMember = (member: TeamMember) => {
    setFormData({
      name: member.name,
      position: member.position,
      photo: null,
      bio: member.bio,
      email: member.email,
      phone: member.phone,
      social: {
        twitter: member.social.twitter || '',
        linkedin: member.social.linkedin || '',
        github: member.social.github || ''
      }
    })
    setEditingId(member.id)
    setShowForm(true)
  }

  const cancelEdit = () => {
    setFormData({ name: '', position: '', photo: null, bio: '', email: '', phone: '', social: { twitter: '', linkedin: '', github: '' } })
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) return <div><p>Takım üyeleri yükleniyor...</p></div>

  return (
    <div>
      <div className="page-header">
        <h1>Takım Yönetimi</h1>
        <div className="header-actions">
          <button onClick={fetchTeam} className="btn-secondary">🔄 Yenile</button>
          <button onClick={() => setShowForm(true)} className="btn-primary">➕ Yeni Üye</button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {showForm && (
        <div className="modal">
          <form onSubmit={handleSubmit} className="form">
            <h2>{editingId ? '✏️ Düzenle' : '🏆 Yeni Üye'}</h2>
            <input type="text" placeholder="Ad Soyad" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            <input type="text" placeholder="Pozisyon" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} required />
            <input type="email" placeholder="E-posta" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            <input type="tel" placeholder="Telefon" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            <textarea placeholder="Biyografi" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
            <h4>Sosyal Medya</h4>
            <input placeholder="Twitter" value={formData.social.twitter} onChange={e => setFormData({ ...formData, social: { ...formData.social, twitter: e.target.value } })} />
            <input placeholder="LinkedIn" value={formData.social.linkedin} onChange={e => setFormData({ ...formData, social: { ...formData.social, linkedin: e.target.value } })} />
            <input placeholder="GitHub" value={formData.social.github} onChange={e => setFormData({ ...formData, social: { ...formData.social, github: e.target.value } })} />
            <div className="form-group">
              <label>Fotoğraf Yükle</label>
              <input type="file" accept="image/*" onChange={e => setFormData({ ...formData, photo: e.target.files?.[0] || null })} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-success">{editingId ? '💾 Güncelle' : '🏆 Üye Ekle'}</button>
              <button type="button" onClick={cancelEdit} className="btn-secondary">İptal</button>
            </div>
          </form>
        </div>
      )}

      <div className="team-grid">
        {team.map(member => (
          <div key={member.id} className="team-card">
            {member.photo && (
              <img
                src={`/images/team/${member.photo}`}
                alt={member.name}
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }}
              />
            )}
            <h3>{member.name}</h3>
            <p>{member.position}</p>
            <p>{member.email}</p>
            <p>{member.phone}</p>
            <div className="social-links">
              {member.social.twitter && <a href={member.social.twitter} target="_blank">Twitter</a>}
              {member.social.linkedin && <a href={member.social.linkedin} target="_blank">LinkedIn</a>}
              {member.social.github && <a href={member.social.github} target="_blank">GitHub</a>}
            </div>
            <button onClick={() => editTeamMember(member)}>✏️ Düzenle</button>
            <button onClick={() => deleteTeamMember(member.id)}>🗑️ Sil</button>
            <button onClick={() => window.location.href = `/team/${member.id}`}>
  👁️ Git
</button>
          </div>
        ))}
      </div>
    </div>
  )
}
