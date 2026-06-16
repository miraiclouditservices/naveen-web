export default function CTA() {
  return (
    <section className="py-5">
      <div className="container">
        <div className="bg-blue-gradient rounded-2xl p-5 text-center text-white custom-shadow position-relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="position-absolute top-0 start-0 w-100 h-100 opacity-25" style={{ background: 'radial-gradient(circle at top right, var(--color-white-alpha-40), transparent 50%)', zIndex: 0 }}></div>
          <div className="position-relative" style={{ zIndex: 1 }}>
            <h2 className="display-5 fw-bold mb-3">Ready to secure your offices?</h2>
            <p className="lead mb-4 opacity-75 max-w-md mx-auto">
              Join hundreds of office complexes managing their security intelligently. Setup takes just minutes.
            </p>
            <button className="btn btn-light btn-lg rounded-pill px-5 fw-bold text-primary hover-lift custom-shadow">
              Get started free
            </button>
            <p className="small mt-3 opacity-75">14-day free trial • No credit card needed</p>
          </div>
        </div>
      </div>
    </section>
  );
}
