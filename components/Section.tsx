import type { ReactNode } from 'react';

type SectionProps = {
  id: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
  sectionClassName?: string;
  panelClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  headingClassName?: string;
};

export function Section({
  id,
  title,
  description,
  children,
  sectionClassName = 'site-section',
  panelClassName = '',
  titleClassName = 'section-title',
  descriptionClassName = 'section-description',
  headingClassName = 'section-heading'
}: SectionProps) {
  const titleId = `${id}-title`;

  return (
    <section id={id} aria-labelledby={titleId} className={sectionClassName}>
      <div className="site-container mx-auto">
        <div className={panelClassName}>
          <div className={headingClassName}>
            <div>
              <h2 id={titleId} className={titleClassName}>
                {title}
              </h2>
            </div>
            <p className={descriptionClassName}>{description}</p>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
