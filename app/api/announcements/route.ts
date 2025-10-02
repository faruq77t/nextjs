import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data')
const uploadDir = path.join(process.cwd(), 'public/images/announcements')

function readData(filename: string) {
  try {
    const filePath = path.join(dataPath, filename)
    if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath, { recursive: true })
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2))
      return []
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return []
  }
}

function writeData(filename: string, data: any) {
  try {
    fs.writeFileSync(path.join(dataPath, filename), JSON.stringify(data, null, 2))
    return true
  } catch {
    return false
  }
}

function generateRandomId() {
  return parseInt(`93${Math.floor(10000 + Math.random() * 90000)}`)
}

export async function GET() {
  const announcements = readData('announcements.json')
  return NextResponse.json(announcements)
}

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const id = form.get('id')?.toString() || generateRandomId().toString()
    const title = form.get('title')?.toString() || ''
    const content = form.get('content')?.toString() || ''
    const author = form.get('author')?.toString() || 'Admin'
    const date = form.get('date')?.toString() || new Date().toISOString().split('T')[0]

    if (!title || !content) {
      return NextResponse.json({ error: 'Başlık ve içerik zorunludur' }, { status: 400 })
    }

    let photoUrl = ''
    const photo = form.get('photo') as File | null
    if (photo) {
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
      const fileExt = path.extname(photo.name) || '.jpg'
      const fileName = `${id}${fileExt}`
      const buffer = Buffer.from(await photo.arrayBuffer())
      fs.writeFileSync(path.join(uploadDir, fileName), buffer)
      photoUrl = `/images/announcements/${fileName}`
    }

    const announcements = readData('announcements.json')
    const announcement = { id: Number(id), title, content, date, author, photo: photoUrl }
    announcements.push(announcement)
    writeData('announcements.json', announcements)

    return NextResponse.json(announcement)
  } catch (err) {
    return NextResponse.json({ error: 'Duyuru kaydedilemedi' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })

  let announcements = readData('announcements.json')
  const announcement = announcements.find((a: any) => a.id === parseInt(id))
  if (!announcement) return NextResponse.json({ error: 'Duyuru bulunamadı' }, { status: 404 })

  // Fotoğrafı da sil
  if (announcement.photo) {
    const filePath = path.join(process.cwd(), 'public', announcement.photo)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }

  announcements = announcements.filter((a: any) => a.id !== parseInt(id))
  writeData('announcements.json', announcements)

  return NextResponse.json({ success: true })
}
