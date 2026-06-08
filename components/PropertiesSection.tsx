import { Section } from '@/components/Section';

const properties = [
  {
    title: 'For Sellers',
    copy:
      'Have a home in Western North Carolina that needs work? We can review the property and determine whether it fits our acquisition and renovation model.',
    image: '/images/cottage-house.jpg',
    large: true
  },
  {
    title: 'For Buyers',
    copy: 'Renovated homes designed to feel fresh, functional, and move-in ready.',
    image: '/images/perfect-house.png',
    large: false
  },
  {
    title: 'For Renters',
    copy: 'Quality rental homes improved with comfort, usability, and long-term upkeep in mind.',
    image: '/images/living-room.jpg',
    large: false
  }
] as const;

export function PropertiesSection() {
  return (
    <Section
      id="properties"
      title="We focus on homes with potential."
      description="Casi Bros is interested in properties across Western North Carolina where thoughtful renovation can make a meaningful difference. That may include outdated homes, homes needing repairs, or homes that are not currently reaching their full market value."
    >
      <div className="property-grid">
        <article className="property-card" style={{ backgroundImage: `url('${properties[0].image}')` }}>
          <div className="property-content">
            <h3 className="property-title">{properties[0].title}</h3>
            <p className="property-copy">{properties[0].copy}</p>
          </div>
        </article>

        <div className="property-stack">
          {properties.slice(1).map((property) => (
            <article
              key={property.title}
              className={`property-card ${property.large ? '' : 'property-card-small'}`}
              style={{ backgroundImage: `url('${property.image}')` }}
            >
              <div className="property-content">
                <h3 className="property-title">{property.title}</h3>
                <p className="property-copy">{property.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
