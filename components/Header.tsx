import Image from 'next/image';
import Link from 'next/link';

const navItems = [
  { href: '/#what-we-do', label: 'What We Do' },
  { href: '/#process', label: 'Process' },
  { href: '/#properties', label: 'Properties' },
  { href: '/submit-property', label: 'Submit a Property' }
] as const;

export function Header() {
  return (
    <header className="site-header">
      <div className="site-nav">
        <Link href="/" aria-label="Casi Bros Property Development" className="shrink-0">
          <Image
            src="/logo.png"
            alt="Casi Bros Property Development logo"
            width={4775}
            height={1842}
            priority
            className="h-auto w-[235px] max-[560px]:w-[190px]"
          />
        </Link>

        <nav className="site-nav-links" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/submit-property" className="nav-button">
          Submit a Property
        </Link>
      </div>
    </header>
  );
}
