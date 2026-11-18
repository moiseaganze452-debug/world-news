"use client";

import { Facebook, Twitter, Linkedin, MessageCircle, Send, Link2 } from "lucide-react";
import { useState } from "react";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    { name: "Facebook", icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: "X", icon: Twitter, href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { name: "WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
    { name: "Telegram", icon: Send, href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}` },
    { name: "LinkedIn", icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
  ];

  function copyLink() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      {links.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Partager sur ${link.name}`}
          className="rounded-full border border-border p-2 text-foreground/70 transition hover:border-primary hover:text-primary"
        >
          <link.icon className="h-4 w-4" />
        </a>
      ))}
      <button
        onClick={copyLink}
        aria-label="Copier le lien"
        className="rounded-full border border-border p-2 text-foreground/70 transition hover:border-primary hover:text-primary"
      >
        <Link2 className="h-4 w-4" />
      </button>
      {copied && <span className="text-xs text-muted-foreground">Lien copié !</span>}
    </div>
  );
}
