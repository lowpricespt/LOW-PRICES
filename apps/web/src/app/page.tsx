import {
  Header,
  Hero,
  HowItWorks,
  PopularCategories,
  Benefits,
  Testimonials,
  Faq,
  FinalCta,
  Footer,
} from '@/features/marketing/components';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <PopularCategories />
        <Benefits />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
