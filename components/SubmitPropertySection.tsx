import { PropertyForm } from '@/components/PropertyForm';
import { Section } from '@/components/Section';

export function SubmitPropertySection() {
  return (
    <Section
      id="submit-property"
      title="Submit a Property"
      description="Casi Bros reviews property opportunities across Western North Carolina from owners, agents, and referral sources. Send the details below and we’ll review the opportunity."
      sectionClassName="site-section"
      headingClassName="mb-6 grid gap-11 lg:grid-cols-[0.9fr_1.1fr] lg:items-end"
    >
      <div className="submission-shell">
        <aside className="submission-card" aria-label="Property submission details">
          <div className="eyebrow">Western North Carolina</div>
          <h3 className="submission-card-title">Tell us about the property, and we will review it quickly.</h3>
          <p className="submission-copy">
            Share the basics and we can determine whether the home is a fit for purchase,
            renovation, resale, or rental.
          </p>

          <ul className="info-list">
            <li>We review submissions from property owners, agents, and referral partners.</li>
            <li>Helpful details include condition and whether the seller wants a quick sale.</li>
            <li>Our focus is on homes, townhomes, condos, multi-family properties, and land in the region.</li>
          </ul>

          <div className="info-note">
            Your information will only be used by Casi Bros to review and respond to your property submission.
          </div>
        </aside>

        <div className="submission-form-card">
          <PropertyForm />
        </div>
      </div>
    </Section>
  );
}
