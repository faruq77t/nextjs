// components/Footer.tsx
import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Üst Kısım */}
        <div className={styles.footerTop}>
          <div className={styles.footerSection}>
            <h3>SiteLogo</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
          
          <div className={styles.footerSection}>
            <h4>Hızlı Linkler</h4>
            <Link href="/">Ana Sayfa</Link>
            <Link href="/hakkimizda">Hakkımızda</Link>
            <Link href="/hizmetler">Hizmetler</Link>
          </div>
          
          <div className={styles.footerSection}>
            <h4>İletişim</h4>
            <p>Email: info@site.com</p>
            <p>Tel: +90 555 555 55 55</p>
          </div>
        </div>

        {/* Alt Kısım */}
        <div className={styles.footerBottom}>
          <p>&copy; 2024 SiteLogo. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}