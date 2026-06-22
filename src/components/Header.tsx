'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Brain, FileText, CalendarDays, Menu, X } from 'lucide-react';

const navItems: Array<{ href: string; label: string; icon: any; soon?: boolean }> = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/ai-comparison', label: 'AI Providers', icon: Brain },
  { href: '/document-processing', label: 'Documents', icon: FileText },
  { href: '/rostering', label: 'Rostering', icon: CalendarDays },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{
      background: 'rgba(255, 255, 255, 0.72)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(0, 119, 182, 0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        height: 68,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40,
            background: 'linear-gradient(135deg, #0077B6, #00B4D8)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: 'white', fontSize: 15,
            fontFamily: "'Poppins', sans-serif",
            boxShadow: '0 4px 12px rgba(0, 119, 182, 0.25)',
            letterSpacing: '-0.02em',
          }}>HC</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#0F172A', lineHeight: 1.15, fontFamily: "'Poppins', sans-serif" }}>Hogan Care</div>
            <div style={{ fontSize: 10, color: '#0077B6', fontWeight: 600, letterSpacing: '0.1em', fontFamily: "'Poppins', sans-serif" }}>AI PLATFORM</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.soon ? '#' : item.href} style={{
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? '#0077B6' : '#475569',
                background: active ? 'rgba(0, 119, 182, 0.08)' : 'transparent',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex', alignItems: 'center', gap: 7,
                opacity: item.soon ? 0.5 : 1,
                cursor: item.soon ? 'default' : 'pointer',
                fontFamily: "'Poppins', sans-serif",
                position: 'relative',
              }}>
                <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                {item.label}
                {item.soon && (
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    background: 'rgba(245, 158, 11, 0.12)',
                    color: '#d97706',
                    padding: '2px 6px', borderRadius: 4, letterSpacing: '0.06em',
                    border: '1px solid rgba(245, 158, 11, 0.15)',
                    fontFamily: "'Poppins', sans-serif",
                  }}>SOON</span>
                )}
                {active && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 20,
                    height: 2,
                    borderRadius: 1,
                    background: 'linear-gradient(90deg, #0077B6, #00B4D8)',
                  }} />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
