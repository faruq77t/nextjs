import fs from "fs/promises";
import "../post.css";
import Link from "next/link";
import ShareButtons from "../../../components/ShareButtons";

interface Announcement {
  id: number | string;
  title: string;
  content: string;
  date: string;
  author: string;
  photo?: string;
}

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  // params'ı await ile bekleyin
  const { id } = await params;
  
  const data = await fs.readFile(process.cwd() + "/data/announcements.json", "utf8");
  const announcements: Announcement[] = JSON.parse(data);

  const post = announcements.find(a => a.id.toString() === id);
  if (!post) return <p>Bu duyuru bulunamadı.</p>;

  const url = `http://localhost:3000/post/${post.id}`;

  return (
    <div className="post-container">
      <h1>{post.title}</h1>
      <p className="meta">{post.date} - {post.author}</p>
      {post.photo && <img src={post.photo} alt={post.title} />}
      <div className="content">{post.content}</div>

      <ShareButtons title={post.title} url={url} />

      <Link href="/" className="back-link">← Geri dön</Link>
    </div>
  );
}