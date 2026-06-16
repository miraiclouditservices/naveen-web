export default function Trusted() {
  const companies = [
    "Tech Park",
    "Business Hub",
    "Enterprise Co.",
    "Global Offices",
    "StartUp Space"
  ];

  return (
    <section className="py-5 border-bottom bg-white">
      <div className="container text-center">
        <p className="text-muted small fw-medium mb-4 text-uppercase tracking-wider">
          Trusted by office complexes across India
        </p>
        <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 gap-md-5 opacity-50">
          {companies.map((company, index) => (
            <div key={index} className="fw-bold fs-5 text-secondary">
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
