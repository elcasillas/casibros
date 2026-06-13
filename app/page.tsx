import { Hero } from '@/components/Hero';
import { ProcessSection } from '@/components/ProcessSection';
import { PropertiesSection } from '@/components/PropertiesSection';
import { SubmitPropertySection } from '@/components/SubmitPropertySection';
import { WhatWeDoSection } from '@/components/WhatWeDoSection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhatWeDoSection />
      <ProcessSection />
      <PropertiesSection />
      <SubmitPropertySection />
    </>
  );
}
