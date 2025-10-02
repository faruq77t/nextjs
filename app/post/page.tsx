import fs from "fs/promises";
import "./post.css";
import Link from "next/link";

interface Announcement {
  id: number | string;
  title: string;
  content: string;
  date: string;
  author: string;
  photo?: string;
}

export default async function AllPostsPage() {
  // announcements.json dosyasını oku
  const data = await fs.readFile(process.cwd() + "/data/announcements.json", "utf8");
  const announcements: Announcement[] = JSON.parse(data);

  if (announcements.length === 0) {
    return <p>Henüz hiç duyuru bulunmamaktadır.</p>;
  }

  return (
    <div className="posts-container">
      <h1>Tüm Duyurular</h1>
      {announcements.map(post => (
        <div key={post.id} className="post-card">
          <h2>
            <Link href={`/post/${post.id}`}>{post.title}</Link>
          </h2>
          <p className="meta">{post.date} - {post.author}</p>
          {post.photo && <img src={post.photo} alt={post.title} className="post-thumb" />}
          <p className="excerpt">{post.content.slice(0, 150)}...</p>
          <Link href={`/post/${post.id}`} className="read-more">Devamını oku →</Link>
        </div>
      ))}
    </div>
  );
}
