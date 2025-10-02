"use client";

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  return (
    <div className="share-buttons">
      <a
        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(title + "\n" + url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="share-btn whatsapp"
      >
        WhatsApp
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="share-btn facebook"
      >
        Facebook
      </a>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title + "\n" + url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="share-btn twitter"
      >
        Twitter
      </a>

      <button
        className="share-btn copy"
        onClick={() => {
          navigator.clipboard.writeText(url);
          alert("Link kopyalandı!");
        }}
      >
        Linki Kopyala
      </button>
    </div>
  );
}
