import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import Trusted from "@/components/marketing/Trusted";
import Features from "@/components/marketing/Features";
import HowItWorks from "@/components/marketing/HowItWorks";
import Roles from "@/components/marketing/Roles";
import Pricing from "@/components/marketing/Pricing";
import FAQ from "@/components/marketing/FAQ";
import CTA from "@/components/marketing/CTA";
import Footer from "@/components/marketing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Trusted />
        <Features />
        <HowItWorks />
        <Roles />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
