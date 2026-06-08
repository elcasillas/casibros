import Link from 'next/link';

const heroPoints = [
  { number: '01', text: 'We buy homes' },
  { number: '02', text: 'We renovate them' },
  { number: '03', text: 'We sell or rent' }
] as const;

export function Hero() {
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-shell">
        <div>
          <div className="eyebrow">We Buy · Renovate · Sell · Rent</div>

          <h1 id="hero-title" className="hero-title">
            We turn overlooked houses into modern homes!
          </h1>

          <p className="hero-copy">
            Casi Bros Property Development serves Western North Carolina by buying undervalued homes,
            renovating them with care, and bringing them back to market as high-quality homes for sale
            or long-term rental.
          </p>

          <div className="hero-actions">
            <Link href="/submit-property" className="nav-button">
              Tell Us About a Property
            </Link>
            <Link href="/#what-we-do" className="secondary-button">
              Learn What We Do
            </Link>
          </div>

          <div className="hero-points">
            {heroPoints.map((point) => (
              <div key={point.number} className="hero-point">
                <strong className="hero-point-number">{point.number}</strong>
                <span className="hero-point-text">{point.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="hero-visual"
          aria-label="A modern renovated house"
        >
          <div className="visual-card">
            <small className="visual-card-label">Property Development</small>
            <h3 className="visual-card-title">
              From distressed or dated properties to clean, modern living spaces across Western North Carolina.
            </h3>
            <p className="visual-card-copy">
              Our focus is simple: identify homes with potential, improve them the right way,
              and create lasting value for buyers, renters, and neighborhoods throughout the region.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
