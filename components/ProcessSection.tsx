import { Section } from '@/components/Section';

const steps = [
  {
    title: 'Identify',
    copy: 'We evaluate properties with renovation potential and determine whether the numbers make sense.'
  },
  {
    title: 'Purchase',
    copy: 'We buy homes directly, creating a clear path for owners who are ready to sell.'
  },
  {
    title: 'Renovate',
    copy: 'We complete practical upgrades that improve function, appearance, and long-term value.'
  },
  {
    title: 'Place',
    copy: 'We either sell the home to a new owner or make it available as a quality rental.'
  }
] as const;

export function ProcessSection() {
  return (
    <Section
      id="process"
      title="How we create value from each property."
      description="Every home is different. Our process keeps the work focused on the improvements that matter most to the property, the neighborhood, and the future resident in Western North Carolina."
      panelClassName="dark-panel"
    >
      <div className="process-grid">
        {steps.map((step, index) => (
          <article key={step.title} className="process-card">
            <div className="process-number">0{index + 1}</div>
            <h3 className="process-title">{step.title}</h3>
            <p className="process-copy">{step.copy}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
