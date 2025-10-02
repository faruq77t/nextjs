'use client'
import { useState, useEffect } from 'react'

interface Member {
  id: number
  name: string
  email: string
  phone: string
  photo: string
  position: string
  joinDate: string
  passportNo: string
  birthDate: string
  age: number
  membershipYears: number
  endDate: string
  status: 'active' | 'inactive'
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchType, setSearchType] = useState<'id' | 'name' | 'email' | 'passport' | 'status'>('id')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    photo: null as File | null,
    position: 'Üye',
    passportNo: '',
    birthDate: '',
    membershipYears: 1,
  })

  const [idFormat, setIdFormat] = useState('')
  const [calculatedAge, setCalculatedAge] = useState<number>(0)
  const [calculatedEndDate, setCalculatedEndDate] = useState<string>('')
  const [calculatedStatus, setCalculatedStatus] = useState<'active' | 'inactive'>('active')

  useEffect(() => {
    fetchMembers()
    const now = new Date()
    const yearLastTwo = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    setIdFormat(`93${yearLastTwo}${month}XXXX`)
  }, [])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMembers(members)
      return
    }

    const filtered = members.filter(member => {
      const term = searchTerm.toLowerCase().trim()
      switch (searchType) {
        case 'id': return member.id.toString().includes(term)
        case 'name': return member.name.toLowerCase().includes(term)
        case 'email': return member.email.toLowerCase().includes(term)
        case 'passport': return member.passportNo.toLowerCase().includes(term)
        case 'status': return member.status.toLowerCase().includes(term)
        default: return true
      }
    })
    setFilteredMembers(filtered)
  }, [searchTerm, searchType, members])

  // Bitiş tarihini hesapla
  const calculateEndDate = (membershipYears: number): string => {
    const joinDate = new Date()
    const endDate = new Date(joinDate)
    endDate.setFullYear(endDate.getFullYear() + membershipYears)
    return endDate.toISOString().split('T')[0]
  }

  // Durumu kontrol et (geçmiş tarih ise inactive)
  const calculateStatus = (endDate: string): 'active' | 'inactive' => {
    const today = new Date()
    const end = new Date(endDate)
    return end >= today ? 'active' : 'inactive'
  }

  const fetchMembers = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/members')
      if (!res.ok) throw new Error(`API hatası: ${res.status}`)
      const data = await res.json()
      setMembers(data)
      setFilteredMembers(data)
    } catch (error) {
      console.error('Üyeler yüklenirken hata:', error)
      setError('Üyeler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const generateMemberId = () => {
    const now = new Date()
    const yearLastTwo = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    return parseInt(`93${yearLastTwo}${month}${randomSuffix}`)
  }

  const calculateAge = (birthDate: string): number => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError(null)
      const age = formData.birthDate ? calculateAge(formData.birthDate) : 0
      const memberId = editingId || generateMemberId()
      const endDate = calculateEndDate(formData.membershipYears)
      const status = calculateStatus(endDate)

      const form = new FormData()
      form.append('id', memberId.toString())
      form.append('name', formData.name)
      form.append('email', formData.email)
      form.append('phone', formData.phone)
      form.append('position', formData.position)
      form.append('passportNo', formData.passportNo)
      form.append('birthDate', formData.birthDate)
      form.append('joinDate', new Date().toISOString().split('T')[0])
      form.append('age', age.toString())
      form.append('membershipYears', formData.membershipYears.toString())
      form.append('endDate', endDate)
      form.append('status', status)
      if (formData.photo instanceof File) {
        form.append('photo', formData.photo)
      }

      const res = await fetch('/api/members', { method: 'POST', body: form })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `HTTP hatası: ${res.status}`)
      }

      const newMember = await res.json()
      if (editingId) {
        setMembers(prev => prev.map(item => item.id === editingId ? newMember : item))
      } else {
        setMembers(prev => [newMember, ...prev])
      }

      setFormData({
        name: '',
        email: '',
        phone: '',
        photo: null,
        position: 'Üye',
        passportNo: '',
        birthDate: '',
        membershipYears: 1,
      })
      setShowForm(false)
      setEditingId(null)
    } catch (error) {
      console.error('Üye ekleme hatası:', error)
      setError(error instanceof Error ? error.message : 'Üye eklenirken hata oluştu')
    }
  }

  const deleteMember = async (id: number) => {
    if (confirm('Bu üyeyi silmek istediğinizden emin misiniz?')) {
      try {
        setError(null)
        const res = await fetch(`/api/members?id=${id}`, { method: 'DELETE' })
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || `HTTP hatası: ${res.status}`)
        }
        setMembers(prev => prev.filter(item => item.id !== id))
      } catch (error) {
        console.error('Silme hatası:', error)
        setError(error instanceof Error ? error.message : 'Üye silinirken hata oluştu')
      }
    }
  }

  const editMember = (member: Member) => {
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      photo: null,
      position: member.position,
      passportNo: member.passportNo,
      birthDate: member.birthDate,
      membershipYears: member.membershipYears,
    })
    setEditingId(member.id)
    setCalculatedEndDate(member.endDate)
    setCalculatedStatus(member.status)
    setShowForm(true)
  }

  const cancelEdit = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      photo: null,
      position: 'Üye',
      passportNo: '',
      birthDate: '',
      membershipYears: 1,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value
    setFormData({ ...formData, birthDate: date })
    setCalculatedAge(date ? calculateAge(date) : 0)
  }

  const handleMembershipYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const years = parseInt(e.target.value) || 1
    setFormData({ ...formData, membershipYears: years })
    const endDate = calculateEndDate(years)
    setCalculatedEndDate(endDate)
    setCalculatedStatus(calculateStatus(endDate))
  }

  const clearSearch = () => {
    setSearchTerm('')
    setSearchType('id')
  }

  // Durum badge'i için stil
  const getStatusBadge = (status: 'active' | 'inactive') => {
    return status === 'active' 
      ? { text: 'Aktif', class: 'status-active' }
      : { text: 'Pasif', class: 'status-inactive' }
  }

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>Üyeler</h1>
          <button onClick={fetchMembers} className="btn-secondary" disabled>
            🔄 Yükleniyor...
          </button>
        </div>
        <div className="loading-state"><p>Üyeler yükleniyor...</p></div>
      </div>
    )
  }

  return (
    <div>
      {/* Sayfa Başlığı */}
      <div className="page-header">
        <h1>Üye Yönetimi</h1>
        <div className="header-actions">
          <button onClick={fetchMembers} className="btn-secondary">🔄 Yenile</button>
          <button onClick={() => setShowForm(true)} className="btn-primary">➕ Yeni Üye</button>
        </div>
      </div>

      {/* Arama */}
      <div className="search-section">
        <div className="search-header">
          <h3>🔍 Üye Arama</h3>
          {searchTerm && <button onClick={clearSearch} className="btn-clear">✖️ Temizle</button>}
        </div>
        <div className="search-controls">
          <div className="search-type">
            <label>Arama Türü:</label>
            <select value={searchType} onChange={(e) => setSearchType(e.target.value as any)}>
              <option value="id">ID ile Ara</option>
              <option value="name">İsim ile Ara</option>
              <option value="email">E-posta ile Ara</option>
              <option value="passport">Pasaport No ile Ara</option>
              <option value="status">Duruma Göre Ara</option>
            </select>
          </div>
          <div className="search-input">
            <input
              type="text"
              placeholder={searchType === 'id' ? 'ID girin...' :
                searchType === 'name' ? 'İsim girin...' :
                  searchType === 'email' ? 'E-posta girin...' :
                    searchType === 'passport' ? 'Pasaport No girin...' :
                      'Aktif veya Pasif yazın...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Form */}
      {showForm && (
        <div className="modal">
          <form onSubmit={handleSubmit} className="form">
            <h2>{editingId ? '✏️ Üyeyi Düzenle' : '👥 Yeni Üye'}</h2>

            <div className="form-row">
              <label>Ad Soyad *</label>
              <input type="text" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>

            <div className="form-row">
              <label>Pasaport No *</label>
              <input type="text" value={formData.passportNo}
                onChange={(e) => setFormData({ ...formData, passportNo: e.target.value })} required />
            </div>

            <div className="form-row">
              <label>E-posta *</label>
              <input type="email" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>

            <div className="form-row">
              <label>Telefon *</label>
              <input type="tel" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
            </div>

            <div className="form-row">
              <label>Doğum Tarihi *</label>
              <input type="date" value={formData.birthDate}
                onChange={handleBirthDateChange} required />
              {formData.birthDate && <p>Yaş: {calculatedAge}</p>}
            </div>

            <div className="form-row">
              <label>Üyelik Süresi (Yıl) *</label>
              <input 
                type="number" 
                min="1" 
                max="10"
                value={formData.membershipYears}
                onChange={handleMembershipYearsChange} 
                required 
              />
              {formData.membershipYears > 0 && (
                <div className="date-info">
                  <p><strong>Bitiş Tarihi:</strong> {calculatedEndDate}</p>
                  <p><strong>Durum:</strong> 
                    <span className={calculatedStatus === 'active' ? 'status-active' : 'status-inactive'}>
                      {calculatedStatus === 'active' ? 'Aktif' : 'Pasif'}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="form-row">
              <label>Pozisyon</label>
              <select value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}>
                <option value="Üye">Üye</option>
                <option value="Yönetici">Yönetici</option>
                <option value="Editör">Editör</option>
                <option value="Moderatör">Moderatör</option>
              </select>
            </div>

            <div className="form-row">
              <label>Fotoğraf</label>
              <input type="file" accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFormData({ ...formData, photo: e.target.files[0] })
                  }
                }} />
            </div>

            <div className="form-actions">
              <button type="submit">{editingId ? '💾 Güncelle' : '👥 Üye Ekle'}</button>
              <button type="button" onClick={cancelEdit}>İptal</button>
            </div>
          </form>
        </div>
      )}

      {/* Üye Listesi */}
      <div className="members-list">
        {filteredMembers.map(member => {
          const statusBadge = getStatusBadge(member.status)
          return (
            <div key={member.id} className={`member-card ${member.status}`}>
              <div className="member-avatar">
                {member.photo ? (
                  <img src={`/images/members/${member.photo}`} alt={member.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
              <div className="member-info">
                <div className="member-header">
                  <h3>{member.name}</h3>
                  <span className={`status-badge ${statusBadge.class}`}>
                    {statusBadge.text}
                  </span>
                </div>
                <p><strong>ID:</strong> {member.id}</p>
                <p><strong>E-posta:</strong> {member.email}</p>
                <p><strong>Telefon:</strong> {member.phone}</p>
                <p><strong>Pasaport:</strong> {member.passportNo}</p>
                <p><strong>Doğum:</strong> {member.birthDate} ({member.age} yaş)</p>
                <p><strong>Üyelik:</strong> {member.membershipYears} yıl</p>
                <p><strong>Katılım:</strong> {member.joinDate}</p>
                <p><strong>Bitiş:</strong> {member.endDate}</p>
                <p><strong>Pozisyon:</strong> {member.position}</p>
              </div>
              <div className="member-actions">
                <button onClick={() => editMember(member)}>✏️ Düzenle</button>
                <button onClick={() => deleteMember(member.id)}>🗑️ Sil</button>
              </div>
            </div>
          )
        })}
      </div>



    </div>
  )
}