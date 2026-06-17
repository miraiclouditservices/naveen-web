import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import Features from "@/components/marketing/Features";
import Benefits from "@/components/marketing/Benefits";
import UseCases from "@/components/marketing/UseCases";
import HowItWorks from "@/components/marketing/HowItWorks";
import Roles from "@/components/marketing/Roles";
import FAQ from "@/components/marketing/FAQ";
import Contact from "@/components/marketing/Contact";
import CTA from "@/components/marketing/CTA";
import Footer from "@/components/marketing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Benefits />
        <UseCases />
        <HowItWorks />
        <Roles />
        <FAQ />
        <Contact />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
