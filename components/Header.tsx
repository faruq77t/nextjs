// components/Header.tsx
import Link from 'next/link'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          <Link href="/">
            SiteLogo
          </Link>
        </div>

        {/* Navigasyon */}
        <nav className={styles.nav}>
          <Link href="/">Ana Sayfa</Link>
          <Link href="/hakkimizda">Hakkımızda</Link>
          <Link href="/hizmetler">Hizmetler</Link>
          <Link href="/iletisim">İletişim</Link>
          <Link href="/admin">admin</Link>
          <Link href="/post">post</Link>
          <Link href="/team">team</Link>
        </nav>

        {/* Mobil Menü Butonu */}
        <button className={styles.mobileMenuBtn}>
          ☰
        </button>
      </div>
    </header>
  )
}