/**
 * Clean & Professional A4 PDF Generator for Lease Agreements
 * Clean Spacing & Layout Optimized
 */
export const exportLeaseAgreementPdf = (data: {
  user: any;
  agreement?: any;
  billingData?: any;
}) => {
  const { user, agreement, billingData } = data;
  if (!user) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Please allow popups to generate and download the PDF agreement.");
    return;
  }

  // Formatting helpers
  const formatDate = (dateStr: any) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? "—"
      : d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const formatCurrency = (amount: number) => {
    return `₹ ${(amount || 0).toLocaleString("en-IN")}`;
  };

  // Metadata Extraction
  const agreementId = agreement?._id
    ? `AGR-${agreement._id.slice(-6).toUpperCase()}`
    : `AGR-${user._id?.slice(-6).toUpperCase() || "000000"}`;

  const propertyName =
    user.assignedProperties
      ?.map((p: any) => p.propertyName || p.name)
      .filter(Boolean)
      .join(", ") || "Green Valley Commercial Hub";

  const unitsText =
    user.assignedUnits
      ?.map((u: any) => (typeof u === "object" ? `Office ${u.unitNumber}` : `Office ${u}`))
      .filter(Boolean)
      .join(", ") || "Office Workspace";

  const floorsText =
    user.assignedFloors
      ?.map((f: any) => f.floorName || `Floor ${f.floorNumber}`)
      .filter(Boolean)
      .join(", ") || "Main Floor";

  const totalAreaSft =
    user.assignedUnits?.reduce((sum: number, u: any) => sum + (u.sqft || 0), 0) || 1000;

  const startDate = formatDate(
    agreement?.startDate || user.floorAssignmentStartDate || "2026-06-23"
  );
  const endDate = formatDate(
    agreement?.endDate || user.floorAssignmentEndDate || "2027-06-22"
  );

  const totalContractAmount =
    agreement?.totalAmount ||
    user.totalAgreementAmount ||
    (billingData?.invoices || []).reduce((sum: number, inv: any) => sum + inv.amount, 0) ||
    0;

  const monthlyAmount =
    agreement?.installmentAmount ||
    user.monthlyManagementAmount ||
    (totalContractAmount > 0 ? Math.round(totalContractAmount / 12) : 0);

  const paymentType = agreement?.paymentType || user.paymentType || "Monthly";
  const dueDay = user.paymentDueDay || 5;

  const landlordCompany = propertyName;
  const issueDate = formatDate(new Date());

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Lease_Agreement_${user.name.replace(/\s+/g, '_')}_${agreementId}</title>
      <style>
        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        :root {
          --primary-color: #040404;
          --accent-color: #040404;
          --text-main: #000000;
          --text-muted: #787878;
          --bg-light: #F9F7F3;
          --border-color: #E8E6E3;
          --success-color: #2E7D32;
        }

        @page {
          size: A4 portrait;
          margin: 15mm 16mm 15mm 16mm;
        }

        body {
          font-family: 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif;
          color: var(--text-main);
          line-height: 1.45;
          background-color: #ffffff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          width: 100%;
        }

        .page-container {
          position: relative;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          padding: 0 2px;
        }

        /* Watermark */
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 5rem;
          font-weight: 900;
          color: rgba(1, 74, 173, 0.035);
          white-space: nowrap;
          z-index: -1;
          pointer-events: none;
          text-transform: uppercase;
          letter-spacing: 3px;
        }

        /* Document Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2.5px solid var(--primary-color);
          padding-bottom: 12px;
          margin-bottom: 16px;
          width: 100%;
        }

        .brand-title h1 {
          font-size: 19px;
          font-weight: 800;
          color: var(--primary-color);
          letter-spacing: -0.4px;
          text-transform: uppercase;
        }

        .brand-title p {
          margin-top: 2px;
          font-size: 10.5px;
          color: var(--accent-color);
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .header-meta {
          text-align: right;
        }

        .meta-badge {
          display: inline-block;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: var(--accent-color);
          font-weight: 700;
          font-size: 11px;
          padding: 3px 10px;
          border-radius: 4px;
          margin-bottom: 4px;
        }

        .meta-ref {
          font-size: 10.5px;
          color: var(--text-muted);
        }

        /* Section titles */
        .section-header {
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--primary-color);
          background: var(--bg-light);
          padding: 6px 12px;
          border-left: 3.5px solid var(--accent-color);
          border-radius: 0 4px 4px 0;
          margin-top: 14px;
          margin-bottom: 10px;
        }

        /* Grid Parties Box */
        .parties-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 14px;
          width: 100%;
        }

        .party-card {
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 12px 14px;
          background: #ffffff;
        }

        .party-role {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.5px;
          margin-bottom: 4px;
          display: block;
        }

        .party-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 6px;
        }

        .party-details {
          font-size: 10.5px;
          color: var(--text-main);
          line-height: 1.45;
        }

        /* Standard Table Styling */
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          margin-bottom: 14px;
        }

        th {
          background-color: var(--bg-light);
          color: var(--primary-color);
          font-weight: 700;
          text-align: left;
          padding: 8px 12px;
          border-top: 1px solid var(--border-color);
          border-bottom: 2px solid var(--border-color);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        td {
          padding: 8px 12px;
          border-bottom: 1px solid var(--border-color);
          vertical-align: top;
        }

        .highlight-cell {
          font-weight: 700;
          color: var(--primary-color);
        }

        /* Key Terms Cards Grid */
        .terms-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 14px;
          width: 100%;
        }

        .term-box {
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 9px 10px;
          background: var(--bg-light);
          text-align: center;
        }

        .term-label {
          font-size: 9px;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 600;
          display: block;
          margin-bottom: 3px;
        }

        .term-value {
          font-size: 12px;
          font-weight: 700;
          color: var(--primary-color);
        }

        /* Clauses List */
        .clauses-box {
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 12px 14px;
          font-size: 10px;
          color: var(--text-main);
          background: #fafafa;
          margin-bottom: 18px;
        }

        .clause-item {
          margin-bottom: 8px;
        }

        .clause-item:last-child {
          margin-bottom: 0;
        }

        .clause-title {
          font-weight: 700;
          color: var(--primary-color);
        }

        /* Signatures Section */
        .signatures-container {
          margin-top: 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          page-break-inside: avoid;
          width: 100%;
        }

        .sig-block {
          border-top: 1px solid #94a3b8;
          padding-top: 8px;
          font-size: 10px;
        }

        .sig-title {
          font-weight: 700;
          color: var(--primary-color);
          font-size: 11px;
          margin-bottom: 32px;
        }

        .sig-line {
          border-bottom: 1px dashed #cbd5e1;
          margin-bottom: 4px;
        }

        .sig-sub {
          font-size: 9.5px;
          color: var(--text-muted);
        }

        /* Footer */
        .footer {
          margin-top: 24px;
          padding-top: 12px;
          border-top: 1px solid var(--border-color);
          text-align: center;
          font-size: 9px;
          color: var(--text-muted);
        }

        @media print {
          body {
            background: white;
          }
          .watermark {
            display: block;
          }
        }
      </style>
    </head>
    <body>
      <div class="watermark">LEASE AGREEMENT</div>

      <div class="page-container">
        
        <!-- Header -->
        <div class="header">
          <div class="brand-title">
            <h1>Commercial Lease & Tenancy Agreement</h1>
            <p>OFFICIAL TENANCY CONTRACT & PREMISES ALLOCATION</p>
          </div>
          <div class="header-meta">
            <div class="meta-badge">${agreementId}</div>
            <div class="meta-ref">Issue Date: <strong>${issueDate}</strong></div>
            <div class="meta-ref">Status: <strong style="color: var(--success-color);">${user.agreementStatus || 'ACTIVE'}</strong></div>
          </div>
        </div>

        <!-- Contracting Parties -->
        <div class="section-header">1. Contracting Parties</div>
        <div class="parties-grid">
          
          <!-- Landlord -->
          <div class="party-card">
            <span class="party-role">Lessor / Landlord</span>
            <div class="party-name">${landlordCompany}</div>
            <div class="party-details">
              <strong>Property Mgmt Office:</strong> Commercial Lease Division<br/>
              <strong>Authorized Contact:</strong> support@pms-hub.com<br/>
              <strong>Premises Location:</strong> ${propertyName}
            </div>
          </div>

          <!-- Tenant -->
          <div class="party-card">
            <span class="party-role">Lessee / Tenant</span>
            <div class="party-name">${user.name}</div>
            <div class="party-details">
              ${user.companyName ? `<strong>Company:</strong> ${user.companyName}<br/>` : ''}
              <strong>Email:</strong> ${user.email}<br/>
              <strong>Phone:</strong> ${user.phoneNumber || user.emergencyNumber || '—'}<br/>
              <strong>GST/PAN:</strong> ${user.gstPan || 'N/A'}<br/>
              <strong>Registered Address:</strong> ${user.address || 'Standard Registered Tenant Address'}
            </div>
          </div>

        </div>

        <!-- Premises Particulars -->
        <div class="section-header">2. Demised Premises Particulars</div>
        <table>
          <thead>
            <tr>
              <th style="width: 24%">Property Name</th>
              <th style="width: 18%">Assigned Floor</th>
              <th style="width: 22%">Demised Unit(s)</th>
              <th style="width: 18%">Allocated Seats</th>
              <th style="width: 18%">Allocated Area</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="highlight-cell">${propertyName}</td>
              <td>${floorsText}</td>
              <td class="highlight-cell">${unitsText}</td>
              <td><strong style="color: var(--accent-color);">${user.assignedSeatCount || user.assignedUnits?.length || 1} Seats</strong></td>
              <td><strong>${totalAreaSft.toLocaleString()} SFT</strong></td>
            </tr>
          </tbody>
        </table>

        <!-- Key Financial Overview Grid -->
        <div class="section-header">3. Commercial Terms & Rent Structure</div>
        <div class="terms-grid">
          <div class="term-box">
            <span class="term-label">Total Contract Value</span>
            <span class="term-value">${formatCurrency(totalContractAmount)}</span>
          </div>
          <div class="term-box">
            <span class="term-label">Monthly Rent Amount</span>
            <span class="term-value">${formatCurrency(monthlyAmount)}</span>
          </div>
          <div class="term-box">
            <span class="term-label">Payment Frequency</span>
            <span class="term-value">${paymentType}</span>
          </div>
          <div class="term-box">
            <span class="term-label">Billing Due Day</span>
            <span class="term-value">${dueDay}th of Month</span>
          </div>
        </div>

        <!-- Duration & Lifecycle -->
        <table>
          <thead>
            <tr>
              <th style="width: 25%">Lease Commencement</th>
              <th style="width: 25%">Lease Expiration</th>
              <th style="width: 25%">Lock-in Period</th>
              <th style="width: 25%">Notice Period</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="highlight-cell">${startDate}</td>
              <td class="highlight-cell">${endDate}</td>
              <td>6 Months</td>
              <td>3 Months</td>
            </tr>
          </tbody>
        </table>

        <!-- Terms & Covenants -->
        <div class="section-header">4. Terms, Covenants & Operational Guidelines</div>
        <div class="clauses-box">
          <div class="clause-item">
            <span class="clause-title">1. Payment Obligations:</span> The Tenant agrees to pay the stipulated recurring rent of <strong>${formatCurrency(monthlyAmount)}</strong> on or before the <strong>${dueDay}th day</strong> of each calendar cycle. Payments made after the grace period will incur a standard late penalty fee of 2% per month.
          </div>
          <div class="clause-item">
            <span class="clause-title">2. Use & Occupancy:</span> The demised premises (<strong>${unitsText}</strong>) shall be used exclusively for commercial workspace purposes. Sub-leasing, structural alterations, or unauthorized assignment of the space is strictly prohibited without prior written approval from Landlord.
          </div>
          <div class="clause-item">
            <span class="clause-title">3. Maintenance & Access:</span> Regular interior maintenance, routine upkeep, and compliance with building security (including biometric access logs and visitor entries) shall be strictly maintained by the Tenant.
          </div>
          <div class="clause-item">
            <span class="clause-title">4. Lock-In & Termination:</span> Neither party may terminate this agreement during the initial 6-month lock-in period. Subsequent termination requires a mandatory 3-month written notice prior to departure.
          </div>
        </div>

        <!-- Signatures & Seals -->
        <div class="signatures-container">
          <div class="sig-block">
            <div class="sig-title">For & On Behalf of Landlord / Lessor</div>
            <div class="sig-line"></div>
            <div class="sig-sub">Authorized Signatory & Seal</div>
            <div class="sig-sub" style="margin-top: 4px;">Date: ________________________</div>
          </div>
          <div class="sig-block">
            <div class="sig-title">Accepted & Agreed by Lessee / Tenant</div>
            <div class="sig-line"></div>
            <div class="sig-sub"><strong>${user.name}</strong> (Tenant Signature)</div>
            <div class="sig-sub" style="margin-top: 4px;">Date: ________________________</div>
          </div>
        </div>

        <!-- Confidentiality Footer -->
        <div class="footer">
          Confidential & Legal Document &bull; ${propertyName} Management System &bull; Document Reference: ${agreementId} &bull; Page 1 of 1
        </div>

      </div>

      <script>
        setTimeout(() => {
          window.print();
        }, 500);
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
