"use client";
import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What type of properties can be managed?",
      answer: "ANVAYA360 is built to handle all property portfolios including apartments, commercial offices, IT parks, shopping malls, co-working spaces, and hotel residences."
    },
    {
      question: "Can I add multiple buildings?",
      answer: "Yes, you can register multiple properties, towers, and individual units under a single, unified enterprise dashboard."
    },
    {
      question: "Does it support role-based access?",
      answer: "Absolutely. You can define granular roles and permissions for administrators, floor managers, staff, owners, and tenants."
    },
    {
      question: "Can tenants make online payments?",
      answer: "Yes, tenants can securely pay rent, view invoice details, and access payment receipts from their dashboard."
    },
    {
      question: "Can I generate financial reports?",
      answer: "Yes, ANVAYA360 tracks payments in real-time, displaying collected and pending revenue with custom export options."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="bg-light position-relative" style={{ paddingTop: '25px', paddingBottom: '25px' }}>
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-5">
          <div className="d-inline-block mb-3">
            <span className="faq-badge">FAQ</span>
          </div>
          <h2 className="section-title fw-bold text-dark">
            Questions, answered
          </h2>
        </div>

        {/* FAQ List */}
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="d-flex flex-column gap-3">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div key={index} className="faq-item">
                    <button className="faq-trigger d-flex align-items-center justify-content-between w-100 text-start border-0 bg-transparent" onClick={() => toggleFAQ(index)}>
                      <span className="faq-question fw-bold">{faq.question}</span>
                      <i className={`bi bi-chevron-down faq-arrow-icon ${isOpen ? 'rotated' : ''}`}></i>
                    </button>
                    <div className={`faq-collapse-content ${isOpen ? 'show' : ''}`}>
                      <div className="faq-answer-inner text-muted">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .faq-badge {
          background: #eff6ff;
          border: 1px solid #dbeafe;
          color: #2563eb;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 6px 16px;
          border-radius: 9999px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .faq-item {
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.01);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .faq-item:hover {
          border-color: #dbeafe;
          box-shadow: 0 8px 20px -6px rgba(37, 99, 235, 0.04);
        }

        .faq-trigger {
          outline: none;
          color: #0f172a;
          cursor: pointer;
          padding: 20px 24px;
        }

        .faq-question {
          font-size: 0.98rem;
          letter-spacing: -0.01em;
        }

        .faq-arrow-icon {
          font-size: 0.85rem;
          color: #64748b;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .faq-arrow-icon.rotated {
          transform: rotate(180deg);
        }

        .faq-collapse-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .faq-collapse-content.show {
          max-height: 200px;
        }

        .faq-answer-inner {
          font-size: 0.88rem;
          line-height: 1.6;
          padding: 0 24px 20px 24px;
        }
      `}</style>
    </section>
  );
}
