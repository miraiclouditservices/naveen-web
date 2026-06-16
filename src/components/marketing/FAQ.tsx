export default function FAQ() {
  const faqs = [
    {
      id: "faq2",
      question: "Can owners see only their office?",
      answer: "Yes, the role-based access system ensures that Office Owners can only view visitor data and alerts specific to their assigned offices."
    },
    {
      id: "faq3",
      question: "Is there a free trial?",
      answer: "Yes! The Business plan comes with a full 14-day free trial. No credit card is required to start your trial."
    },
    {
      id: "faq4",
      question: "Can I export visitor logs?",
      answer: "Absolutely. Super Admins and Office Owners can export visitor history as CSV or PDF reports for compliance and auditing purposes."
    }
  ];

  return (
    <section id="faq" className="py-5 bg-white">
      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="display-6 fw-bold">Common questions</h2>
        </div>
        
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="accordion" id="faqAccordion">
              {faqs.map((faq, index) => (
                <div className="accordion-item" key={faq.id}>
                  <h2 className="accordion-header" id={`heading${faq.id}`}>
                    <button 
                      className={`accordion-button fw-medium fs-5 ${index !== 0 ? 'collapsed' : ''}`} 
                      type="button" 
                      data-bs-toggle="collapse" 
                      data-bs-target={`#collapse${faq.id}`} 
                      aria-expanded={index === 0 ? "true" : "false"} 
                      aria-controls={`collapse${faq.id}`}
                    >
                      {faq.question}
                    </button>
                  </h2>
                  <div 
                    id={`collapse${faq.id}`} 
                    className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`} 
                    aria-labelledby={`heading${faq.id}`} 
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="accordion-body text-muted">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
