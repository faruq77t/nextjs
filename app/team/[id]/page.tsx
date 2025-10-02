import fs from "fs/promises";
import "../team.css"; // modern CSS dosyamız
import Link from "next/link";

interface TeamMember {
  id: number;
  name: string;
  position: string;
  photo?: string | null;
  bio: string;
  email: string;
  phone: string;
  social: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

// Next.js 15'te params artık Promise
interface TeamPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamMemberPage(props: TeamPageProps) {
  // params'ı await ile bekleyin
  const { id } = await props.params;

  const data = await fs.readFile(process.cwd() + "/data/team.json", "utf8");
  const team: TeamMember[] = JSON.parse(data);

  const member = team.find((m) => m.id.toString() === id);
  if (!member) return <p>Üye bulunamadı.</p>;

  return (
    <div className="team-container">
      {member.photo && (
        <img
          src={`/images/team/${member.photo}`}
          alt={member.name}
          style={{
            width: "150px",
            height: "150px",
            objectFit: "cover",
            borderRadius: "50%",
            marginBottom: "1rem",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        />
      )}

      <h1>{member.name}</h1>
      <p className="meta">{member.position}</p>

      <div className="content">{member.bio}</div>
      <div className="content"><strong>Email:</strong> {member.email}</div>
      <div className="content"><strong>Telefon:</strong> {member.phone}</div>

      <div className="social-links">
        {member.social.twitter && (
          <a
            className="twitter"
            href={member.social.twitter}
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>
        )}
        {member.social.linkedin && (
          <a
            className="linkedin"
            href={member.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        )}
        {member.social.github && (
          <a
            className="github"
            href={member.social.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        )}
      </div>

      <Link href="/" className="back-link">← Geri dön</Link>
    </div>
  );
}