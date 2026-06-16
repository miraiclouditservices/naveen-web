export default function Pricing() {
  return (
    <section id="pricing" className="py-5" style={{ backgroundColor: 'var(--color-bg-light)' }}>
      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="display-6 fw-bold">Simple, predictable pricing</h2>
        </div>
        
        <div className="row g-4 justify-content-center align-items-center">
          {/* Starter */}
          <div className="col-lg-4 col-md-6">
            <div className="card border-0 custom-shadow rounded-xl p-4 h-100">
              <h4 className="fw-bold mb-3">Starter</h4>
              <div className="mb-4">
                <span className="display-5 fw-bold">₹0</span>
                <span className="text-muted"> / forever</span>
              </div>
              <ul className="list-unstyled mb-4 flex-grow-1">
                <li className="mb-2"><i className="bi bi-check text-primary fs-5 me-2"></i>1 Building</li>
                <li className="mb-2"><i className="bi bi-check text-primary fs-5 me-2"></i>Up to 50 visitors/day</li>
                <li className="mb-2"><i className="bi bi-check text-primary fs-5 me-2"></i>Basic email support</li>
              </ul>
              <button className="btn btn-outline-primary w-100 rounded-pill">Get Started</button>
            </div>
          </div>

          {/* Business */}
          <div className="col-lg-4 col-md-6 position-relative">
            <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-blue-gradient px-3 py-2" style={{ zIndex: 1 }}>
              Most popular
            </span>
            <div className="card border-primary custom-shadow rounded-xl p-5 h-100" style={{ transform: 'scale(1.05)', borderWidth: '2px' }}>
              <h4 className="fw-bold mb-3 text-primary">Business</h4>
              <div className="mb-4">
                <span className="display-5 fw-bold">₹2,499</span>
                <span className="text-muted"> / month</span>
              </div>
              <ul className="list-unstyled mb-4 flex-grow-1">
                <li className="mb-2"><i className="bi bi-check text-primary fs-5 me-2"></i>Up to 5 Buildings</li>
                <li className="mb-2"><i className="bi bi-check text-primary fs-5 me-2"></i>Unlimited visitors</li>
                <li className="mb-2"><i className="bi bi-check text-primary fs-5 me-2"></i>Watchman roster</li>
                <li className="mb-2"><i className="bi bi-check text-primary fs-5 me-2"></i>Real-time alerts</li>
                <li className="mb-2"><i className="bi bi-check text-primary fs-5 me-2"></i>Priority support</li>
              </ul>
              <button className="btn btn-primary w-100 rounded-pill">Start 14-day trial</button>
            </div>
          </div>

          {/* Enterprise */}
          <div className="col-lg-4 col-md-6">
            <div className="card border-0 custom-shadow rounded-xl p-4 h-100">
              <h4 className="fw-bold mb-3">Enterprise</h4>
              <div className="mb-4">
                <span className="display-5 fw-bold fs-3">Custom</span>
                <span className="text-muted d-block mt-1">tailored to your needs</span>
              </div>
              <ul className="list-unstyled mb-4 flex-grow-1">
                <li className="mb-2"><i className="bi bi-check text-primary fs-5 me-2"></i>Unlimited everything</li>
                <li className="mb-2"><i className="bi bi-check text-primary fs-5 me-2"></i>Custom integrations</li>
                <li className="mb-2"><i className="bi bi-check text-primary fs-5 me-2"></i>Dedicated account manager</li>
              </ul>
              <button className="btn btn-outline-dark w-100 rounded-pill">Contact sales</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
