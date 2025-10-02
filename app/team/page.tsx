import fs from "fs/promises";
import "./team.css";
import Link from "next/link";

interface TeamMember {
  id: number | string;
  name: string;
  position: string;
  photo?: string;
}

export default async function TeamPage() {
  // team.json dosyasını oku
  const data = await fs.readFile(process.cwd() + "/data/team.json", "utf8");
  const team: TeamMember[] = JSON.parse(data);

  if (team.length === 0) {
    return <p>Henüz hiç takım üyesi bulunmamaktadır.</p>;
  }

  return (
    <div className="team-container">
      <h1>Tüm Takım Üyeleri</h1>
      <div className="team-grid">
        {team.map(member => (
          <div key={member.id} className="team-card">
          {member.photo && (
                  <img
                    src={`/images/team/${member.photo}`}
                    alt={member.name}
                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }}
                  />
                )}
            <h2>
              <Link href={`/team/${member.id}`}>{member.name}</Link>
            </h2>
            <p className="position">{member.position}</p>
            <Link href={`/team/${member.id}`} className="view-profile">Profili Gör →</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
