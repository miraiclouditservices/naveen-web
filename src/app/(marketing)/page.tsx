import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import WhoUses from "@/components/marketing/WhoUses";
import Problems from "@/components/marketing/Problems";
import Modules from "@/components/marketing/Modules";
import Services from "@/components/marketing/Services";
import WhyChooseUs from "@/components/marketing/WhyChooseUs";
import DashboardShowcase from "@/components/marketing/DashboardShowcase";
import Solutions from "@/components/marketing/Solutions";
import Comparison from "@/components/marketing/Comparison";
import Contact from "@/components/marketing/Contact";
import CTASection from "@/components/marketing/CTASection";
import Footer from "@/components/marketing/Footer";

export const metadata = {
  title: "Mirai CloudIT SERVICES – AI-Powered Business Operations & Property Platform",
  description: "Manage CRM, Property Management, Coworking, Employees, Visitors, Attendance, Helpdesk, Assets, Reports and AI — everything connected in one intelligent platform.",
  openGraph: {
    title: "Mirai CloudIT SERVICES – AI-Powered Business Operations Platform",
    description: "One intelligent platform for CRM, properties, coworking, employees, visitors, attendance, helpdesk, and AI.",
    type: "website",
    url: "https://miraicloudit.com"
  }
};

export default function Home() {
  return (
    <div className="marketing-page">
      <Navbar />
      <main style={{ paddingTop: 60 }}>
        {/* Section 1: Hero */}
        <Hero />

        {/* Section 2: Who Uses Anvaya360 */}
        <WhoUses />

        {/* Section 3: Problems We Solve */}
        <Problems />

        {/* Section 4: Platform Products */}
        <Modules />

        {/* Section 5: Technology Services */}
        <Services />

        {/* Section 5: Why Businesses Choose Anvaya360 */}
        <WhyChooseUs />

        {/* Section 6: Business Dashboard */}
        <DashboardShowcase />

        {/* Section 7: Industries & Solutions */}
        <Solutions />

        {/* Section 8: Why We're Different (Comparison) */}
        <Comparison />

        {/* Contact Section */}
        <Contact />

        {/* Section 11: Final CTA */}
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
