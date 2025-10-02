import fs from "fs/promises";
import "./page.css"; // sadece bu sayfa için
import Link from "next/link";

interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  author: string;
  photo?: string;
}

interface TeamMember {
  id: number;
  name: string;
  position: string;
  photo: string;
  bio: string;
  email: string;
  phone: string;
  social: {
    twitter: string;
    linkedin: string;
    github: string;
  };
}

async function getData() {
  try {
    const announcementsData = await fs.readFile(
      process.cwd() + "/data/announcements.json",
      "utf8"
    );
    const announcements: Announcement[] = JSON.parse(announcementsData);

    const teamData = await fs.readFile(
      process.cwd() + "/data/team.json",
      "utf8"
    );
    const team: TeamMember[] = JSON.parse(teamData);

    return { announcements, team };
  } catch (error) {
    console.error("Veri çekilirken hata oluştu:", error);
    return { announcements: [], team: [] };
  }
}

export default async function HomePage() {
  const { announcements, team } = await getData();

  // 🔹 Maksimum 10 tane göster
  const limitedAnnouncements = announcements.slice(0, 10);
  const limitedTeam = team.slice(0, 10);

  return (
    <div className="page-container">
      <h1>Ana Sayfa</h1>

      {/* Duyurular */}
      <section className="mb-12">
        <h2>Duyurular</h2>
        <div className="announcements-grid">
          {limitedAnnouncements.map((item, index) => (
            <Link style={{ textDecoration: 'none' }} key={`${item.id}-${index}`} href={`/post/${item.id}`}>
              <div className="announcement-card" style={{ cursor: "pointer" }}>
                {item.photo && <img src={item.photo} alt={item.title} />}
                <h3>{item.title}</h3>
                <p>{item.date} - {item.author}</p>
                <p className="post_content">{item.content}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Takım */}
      <section>
        <h2>Takımımız</h2>
        <div className="team-grid">
          {limitedTeam.map((member, index) => (
            <Link style={{ textDecoration: 'none' }} key={`${member.id}-${index}`} href={`/team/${member.id}`} className="team-card-link">
              <div className="team-card" style={{ cursor: "pointer" }}>
                {member.photo && (
                  <img
                    src={`/images/team/${member.photo}`}
                    alt={member.name}
                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }}
                  />
                )}
                <h3>{member.name}</h3>
                <p>{member.position}</p>
                <p>{member.bio}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
