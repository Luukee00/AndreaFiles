import React from 'react';

interface NavbarProps {
  onOpenMenu: () => void;
  onOpenUpload: () => void;
  totalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMenu, onOpenUpload }) => {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      height: 'var(--nav-h)',
    }}>
      <div style={{
        maxWidth: 680, margin: '0 auto',
        padding: '0 16px',
        height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Hamburger — left */}
        <button
          onClick={onOpenMenu}
          aria-label="Apri menu categorie"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '6px', display: 'flex', flexDirection: 'column',
            gap: 5, width: 36, height: 36,
            alignItems: 'flex-start', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ display: 'block', width: 22, height: 2, background: 'var(--text)', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 16, height: 2, background: 'var(--text)', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 22, height: 2, background: 'var(--text)', borderRadius: 2 }} />
        </button>

        {/* Title — center */}
        <h1 style={{
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text)',
          margin: 0,
          textAlign: 'center',
          flex: 1,
        }}>
          ANDREA ARCHIVE
        </h1>

        {/* Add button — right: square with + border like mockup */}
        <button
          onClick={onOpenUpload}
          aria-label="Aggiungi ricordo"
          style={{
            flexShrink: 0,
            width: 34, height: 34,
            border: '2px solid var(--text)',
            borderRadius: 6,
            background: 'none',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text)',
            transition: 'var(--transition)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--text)';
            (e.currentTarget as HTMLButtonElement).style.color = '#fff';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'none';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="8" y1="2" x2="8" y2="14" />
            <line x1="2" y1="8" x2="14" y2="8" />
          </svg>
        </button>
      </div>
    </header>
  );
};
