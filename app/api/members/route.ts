import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data', 'members.json')
const imagesDir = path.join(process.cwd(), 'public', 'images', 'members')

// Klasör yoksa oluştur
if (!fs.existsSync(path.dirname(dataPath))) {
  fs.mkdirSync(path.dirname(dataPath), { recursive: true })
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true })
}

// Yardımcı fonksiyon: Durumu hesapla (Bitiş tarihi bugün veya gelecekte ise aktif)
function calculateStatus(endDate: string): 'active' | 'inactive' {
  const today = new Date().toISOString().split('T')[0]
  return endDate >= today ? 'active' : 'inactive'
}

export async function GET() {
  try {
    const fileData = fs.existsSync(dataPath) ? fs.readFileSync(dataPath, 'utf-8') : '[]'
    const members = JSON.parse(fileData)
    return NextResponse.json(members)
  } catch (error) {
    console.error('GET hatası:', error)
    return NextResponse.json({ error: 'Üyeler alınamadı' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData()

    const id = parseInt(form.get('id') as string)
    const name = form.get('name') as string
    const email = form.get('email') as string
    const phone = form.get('phone') as string
    const position = form.get('position') as string
    const passportNo = form.get('passportNo') as string
    const birthDate = form.get('birthDate') as string
    const joinDate = form.get('joinDate') as string
    const age = parseInt(form.get('age') as string)
    const membershipYears = parseInt(form.get('membershipYears') as string)

    // Validasyon
    if (!name || !email || !phone || !passportNo || !birthDate) {
      return NextResponse.json(
        { error: 'Tüm zorunlu alanları doldurun' },
        { status: 400 }
      )
    }

    // Bitiş tarihini hesapla
    const joinDateObj = new Date(joinDate)
    const endDateObj = new Date(joinDateObj.setFullYear(joinDateObj.getFullYear() + membershipYears))
    const endDate = endDateObj.toISOString().split('T')[0]

    // Durumu hesapla
    const status = calculateStatus(endDate)

    let photoFileName = ''
    const photo = form.get('photo') as File | null

    if (photo && photo.size > 0) {
      // Dosya adını üye ID'sine göre oluştur ve uzantıyı al
      const fileExt = path.extname(photo.name) || '.jpg'
      photoFileName = `${id}${fileExt}`

      // Eski fotoğrafları sil (farklı uzantılar için)
      const baseFilePath = path.join(imagesDir, id.toString())
      const possibleExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
      possibleExtensions.forEach(ext => {
        const oldFilePath = baseFilePath + ext
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath)
        }
      })

      // Yeni fotoğrafı kaydet
      const arrayBuffer = await photo.arrayBuffer()
      fs.writeFileSync(path.join(imagesDir, photoFileName), Buffer.from(arrayBuffer))
    }

    const newMember = {
      id,
      name,
      email,
      phone,
      position,
      passportNo,
      birthDate,
      joinDate,
      age,
      membershipYears,
      endDate,
      status,
      photo: photoFileName
    }

    const fileData = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath, 'utf-8')) : []
    const existingIndex = fileData.findIndex((m: any) => m.id === id)

    if (existingIndex >= 0) {
      // Mevcut üyeyi güncelle
      fileData[existingIndex] = newMember
    } else {
      // Yeni üye ekle
      fileData.push(newMember)
    }

    fs.writeFileSync(dataPath, JSON.stringify(fileData, null, 2))
    return NextResponse.json(newMember)
  } catch (error) {
    console.error('POST hatası:', error)
    return NextResponse.json({ error: 'Üye eklenemedi' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const idParam = searchParams.get('id')
    if (!idParam) return NextResponse.json({ error: 'ID eksik' }, { status: 400 })
    const id = parseInt(idParam)

    const fileData = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath, 'utf-8')) : []
    const memberIndex = fileData.findIndex((m: any) => m.id === id)
    if (memberIndex === -1) return NextResponse.json({ error: 'Üye bulunamadı' }, { status: 404 })

    // Fotoğrafı sil: Üye ID'sini kullanarak olası tüm uzantıları sil
    const baseFilePath = path.join(imagesDir, id.toString())
    const possibleExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    possibleExtensions.forEach(ext => {
      const photoPath = baseFilePath + ext
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath)
      }
    })

    fileData.splice(memberIndex, 1)
    fs.writeFileSync(dataPath, JSON.stringify(fileData, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE hatası:', error)
    return NextResponse.json({ error: 'Üye silinemedi' }, { status: 500 })
  }
}