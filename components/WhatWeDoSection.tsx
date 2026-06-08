import { Section } from '@/components/Section';

const cards = [
  {
    number: '01',
    title: 'We Buy Homes',
    copy:
      'We purchase homes that may be outdated, under-maintained, inherited, vacant, or simply ready for a new chapter in the Western North Carolina market.'
  },
  {
    number: '02',
    title: 'We Flip Homes',
    copy:
      'We renovate kitchens, bathrooms, flooring, paint, fixtures, curb appeal, and core living areas to create a stronger finished product for local buyers and renters.'
  },
  {
    number: '03',
    title: 'We Sell or Rent',
    copy:
      'Once complete, each home is positioned either for resale or as a quality rental, depending on the property and market opportunity in the area.'
  }
] as const;

export function WhatWeDoSection() {
  return (
    <Section
      id="what-we-do"
      title="A simple model built around improving homes in Western North Carolina."
      description="We look for homes that need work across Western North Carolina, invest in the right renovations, and return them to the market as attractive, functional, and livable properties."
    >
      <div className="feature-grid">
        {cards.map((card) => (
          <article key={card.number} className="feature-card">
            <div className="feature-number">{card.number}</div>
            <h3 className="feature-title">{card.title}</h3>
            <p className="feature-copy">{card.copy}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
