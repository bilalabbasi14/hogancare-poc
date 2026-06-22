'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Brain, FileText, CalendarDays } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/ai-comparison', label: 'AI Providers', icon: Brain },
  { href: '/document-processing', label: 'Documents', icon: FileText },
  { href: '/rostering', label: 'Rostering', icon: CalendarDays },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header style={{
      background: 'rgba(255, 255, 255, 0.72)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(0, 119, 182, 0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
      }}>
        <style>{`
          @media (max-width: 600px) {
            .mobile-nav-container {
              flex-wrap: nowrap !important;
              justify-content: space-between !important;
              gap: 2px !important;
            }
            .mobile-nav-link {
              padding: 6px 8px !important;
              font-size: 11px !important;
              gap: 4px !important;
              flex: 1 !important;
              justify-content: center !important;
            }
            .mobile-nav-icon {
              display: none !important;
            }
          }
        `}</style>
        <nav className="mobile-nav-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          flexWrap: 'wrap',
          width: '100%',
        }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="mobile-nav-link" style={{
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: '13px',
                fontWeight: active ? 600 : 500,
                color: active ? '#0077B6' : '#475569',
                background: active ? 'rgba(0, 119, 182, 0.08)' : 'transparent',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: "'Poppins', sans-serif",
              }}>
                <Icon size={14} strokeWidth={active ? 2.5 : 2} className="mobile-nav-icon" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

