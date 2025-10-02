import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')
const dataPath = path.join(dataDir, 'team.json')
const imagesDir = path.join(process.cwd(), 'public', 'images', 'team')

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true })

function readData() {
  try {
    if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, JSON.stringify([], null, 2))
      return []
    }
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  } catch {
    return []
  }
}

function writeData(data: any) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
    return true
  } catch {
    return false
  }
}

function generateRandomId() {
  return parseInt(`93${Math.floor(10000 + Math.random() * 90000)}`)
}

export async function GET() {
  const team = readData()
  return NextResponse.json(team)
}

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const id = form.get('id') ? parseInt(form.get('id') as string) : generateRandomId()
    const name = form.get('name')?.toString() || ''
    const position = form.get('position')?.toString() || ''
    const bio = form.get('bio')?.toString() || ''
    const email = form.get('email')?.toString() || ''
    const phone = form.get('phone')?.toString() || ''
    const social = {
      twitter: form.get('twitter')?.toString() || '',
      linkedin: form.get('linkedin')?.toString() || '',
      github: form.get('github')?.toString() || ''
    }

    if (!name || !position) {
      return NextResponse.json({ error: 'Ad ve pozisyon zorunludur' }, { status: 400 })
    }

    let photoFileName = ''
    const photo = form.get('photo') as File | null
    if (photo && photo.name) {
      photoFileName = `${id}.jpg` // sadece ID kullanılıyor, uzantı sabit
      const buffer = Buffer.from(await photo.arrayBuffer())
      fs.writeFileSync(path.join(imagesDir, photoFileName), buffer)
    }


    const team = readData()
    const existingIndex = team.findIndex((m: any) => m.id === id)
    const newMember = { id, name, position, bio, email, phone, social, photo: photoFileName || null }

    if (existingIndex >= 0) {
      // Düzenleme
      if (photoFileName && team[existingIndex].photo) {
        const oldPhoto = path.join(imagesDir, team[existingIndex].photo)
        if (fs.existsSync(oldPhoto)) fs.unlinkSync(oldPhoto)
      }
      team[existingIndex] = newMember
    } else {
      // Yeni ekleme
      team.push(newMember)
    }

    writeData(team)
    return NextResponse.json(newMember)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Takım üyesi eklenemedi' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const idParam = searchParams.get('id')
    if (!idParam) return NextResponse.json({ error: 'ID eksik' }, { status: 400 })
    const id = parseInt(idParam)

    const team = readData()
    const index = team.findIndex((m: any) => m.id === id)
    if (index === -1) return NextResponse.json({ error: 'Takım üyesi bulunamadı' }, { status: 404 })

    // Fotoğrafı sil
    if (team[index].photo) {
      const photoPath = path.join(imagesDir, team[index].photo)
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath)
    }

    team.splice(index, 1)
    writeData(team)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Takım üyesi silinemedi' }, { status: 500 })
  }
}
