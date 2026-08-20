import Navbar from "@/components/marketing/Navbar";
import CustomCursor from "@/components/marketing/CustomCursor";
import Hero from "@/components/marketing/Hero";
import AboutUs from "@/components/marketing/AboutUs";
import Problems from "@/components/marketing/Problems";
import Modules from "@/components/marketing/Modules";
import Services from "@/components/marketing/Services";
import WhyChooseUs from "@/components/marketing/WhyChooseUs";
import Solutions from "@/components/marketing/Solutions";
import Contact from "@/components/marketing/Contact";
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
      <CustomCursor />
      <Navbar />
      <main style={{ paddingTop: 60 }}>
        {/* Section 1: Hero */}
        <Hero />

        {/* Section: About Mirai */}
        <AboutUs />

        {/* Section: Technology Services */}
        <Services />

        {/* Section 4: Platform Products */}
        <Modules />

        {/* Section 5: Problems We Solve */}
        <Problems />

        {/* Section 6: Why Businesses Choose Mirai */}
        <WhyChooseUs />

        {/* Section 7: Industries & Solutions */}
        <Solutions />

        {/* Contact Section */}
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
