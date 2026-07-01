import { HeroSection } from "@/components/sections/hero";
import { PopularDestinations } from "@/components/sections/popular-destinations";
import { VisaCategories } from "@/components/sections/visa-categories";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Testimonials } from "@/components/sections/testimonials";
import { FAQ } from "@/components/sections/faq";

export default function Home() {
  return (
    <>
      <HeroSection />
      <PopularDestinations />
      <VisaCategories />
      <HowItWorks />
      <Testimonials />
      <FAQ />
    </>
  );
}
