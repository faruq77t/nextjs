// lib/database.ts
import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data')

// data klasörünü oluştur (yoksa)
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true })
}

// Okuma fonksiyonu
export function readData(filename: string) {
  try {
    const filePath = path.join(dataPath, filename)
    
    // Dosya yoksa boş array döndür ve dosya oluştur
    if (!fs.existsSync(filePath)) {
      const defaultData: any[] = []
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2))
      return defaultData
    }
    
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading data:', error)
    return []
  }
}

// Yazma fonksiyonu
export function writeData(filename: string, data: any) {
  try {
    const filePath = path.join(dataPath, filename)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error writing data:', error)
    return false
  }
}