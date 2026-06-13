import Link from 'next/link';

import { Section } from '@/components/Section';

export default function SubmitPropertySuccessPage() {
  return (
    <Section
      id="submit-property-success"
      title="Thank you"
      description={
        <>
          Your property submission has been received. Someone from Casi Bros will contact you shortly.
          <br />
          <br />
        </>
      }
      sectionClassName="site-section"
      panelClassName="rounded-[32px] border border-border bg-white p-8 text-center shadow-[0_18px_40px_rgba(8,47,92,0.08)]"
      titleClassName="text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[1.05] tracking-[-0.03em] text-navyDark"
      descriptionClassName="mx-auto max-w-[44ch] text-[1.06rem] leading-[1.52] text-muted"
      headingClassName="mb-0 grid gap-6 justify-items-center"
    >
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="nav-button">
          Back to Home
        </Link>
        <Link href="/submit-property" className="secondary-button">
          Submit Another Property
        </Link>
      </div>
    </Section>
  );
}
