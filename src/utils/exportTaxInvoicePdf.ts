/**
 * Clean & Professional A4 GST Tax Invoice Generator
 */
export const exportTaxInvoicePdf = (data: {
  invoice: any;
  user: any;
  agreement?: any;
}) => {
  const { invoice, user, agreement } = data;
  if (!invoice || !user) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Please allow popups to generate and download the invoice PDF.");
    return;
  }

  // Formatting Helpers
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

  const invoiceNo = invoice.invoiceId?.startsWith("INV-")
    ? `INV-${invoice.invoiceId.slice(4).padStart(6, "0")}`
    : invoice.invoiceId || `INV-${Date.now().toString().slice(-6)}`;

  const propertyName =
    user.assignedProperties
      ?.map((p: any) => p.propertyName || p.name)
      .filter(Boolean)
      .join(", ") || "Green Valley Commercial Hub";

  const unitsText =
    user.assignedUnits
      ?.map((u: any) => (typeof u === "object" ? `Office ${u.unitNumber}` : `Office ${u}`))
      .filter(Boolean)
      .join(", ") || "Office 201";

  const baseAmount = Number(invoice.amount || 0);
  const isTaxInclusive = false;
  const taxableValue = isTaxInclusive ? Math.round(baseAmount / 1.18) : baseAmount;
  const cgstAmount = Math.round(taxableValue * 0.09);
  const sgstAmount = Math.round(taxableValue * 0.09);
  const totalTax = cgstAmount + sgstAmount;
  const grossTotal = taxableValue + totalTax;

  const invoiceDate = formatDate(invoice.dueDate ? new Date(new Date(invoice.dueDate).setDate(new Date(invoice.dueDate).getDate() - 5)) : new Date());
  const dueDateStr = formatDate(invoice.dueDate);
  const paidAmount = Number(invoice.paidAmount || 0);
  const balanceDue = Number(invoice.pendingAmount ?? (grossTotal - paidAmount));
  const isPaid = invoice.status === 'Paid' || balanceDue <= 0;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Tax_Invoice_${invoiceNo}_${user.name.replace(/\s+/g, '_')}</title>
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
          --danger-color: #C62828;
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
          box-sizing: border-box;
          padding: 0 2px;
        }

        /* Watermark */
        .watermark {
          position: fixed;
          top: 48%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 6rem;
          font-weight: 900;
          color: rgba(1, 74, 173, 0.03);
          white-space: nowrap;
          z-index: -1;
          pointer-events: none;
          text-transform: uppercase;
          letter-spacing: 4px;
        }

        /* Top Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2.5px solid var(--primary-color);
          padding-bottom: 14px;
          margin-bottom: 18px;
        }

        .brand-title h1 {
          font-size: 22px;
          font-weight: 800;
          color: var(--primary-color);
          letter-spacing: -0.5px;
          text-transform: uppercase;
        }

        .brand-title p {
          margin-top: 3px;
          font-size: 11px;
          color: var(--accent-color);
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .invoice-badge-box {
          text-align: right;
        }

        .invoice-badge {
          display: inline-block;
          background: var(--primary-color);
          color: #ffffff;
          font-weight: 800;
          font-size: 13px;
          padding: 4px 14px;
          border-radius: 4px;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .invoice-status {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }

        /* Parties Grid */
        .parties-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 18px;
        }

        .party-box {
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 12px 14px;
          background: #ffffff;
        }

        .box-title {
          font-size: 9.5px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.5px;
          margin-bottom: 4px;
          display: block;
        }

        .party-name {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 4px;
        }

        .party-details {
          font-size: 10.5px;
          color: var(--text-main);
          line-height: 1.45;
        }

        /* Invoice Summary Grid */
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 18px;
        }

        .summary-box {
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 9px 10px;
          background: var(--bg-light);
          text-align: center;
        }

        .summary-label {
          font-size: 9px;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 600;
          display: block;
          margin-bottom: 3px;
        }

        .summary-val {
          font-size: 12px;
          font-weight: 700;
          color: var(--primary-color);
        }

        /* Items Table */
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          margin-bottom: 18px;
        }

        th {
          background-color: var(--bg-light);
          color: var(--primary-color);
          font-weight: 700;
          text-align: left;
          padding: 9px 12px;
          border-top: 1px solid var(--border-color);
          border-bottom: 2px solid var(--border-color);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        td {
          padding: 10px 12px;
          border-bottom: 1px solid var(--border-color);
          vertical-align: top;
        }

        .text-end {
          text-align: right;
        }

        .text-center {
          text-align: center;
        }

        /* Financial Breakdown Calculation Box */
        .calc-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          gap: 20px;
        }

        .bank-details {
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 12px 14px;
          background: var(--bg-light);
          flex: 1;
          font-size: 10px;
        }

        .bank-title {
          font-weight: 700;
          color: var(--primary-color);
          font-size: 10.5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
          display: block;
        }

        .calc-table {
          width: 280px;
          font-size: 11px;
          margin-bottom: 0;
        }

        .calc-table td {
          padding: 6px 10px;
          border-bottom: 1px solid var(--border-color);
        }

        .calc-table tr.total-row td {
          font-size: 13px;
          font-weight: 800;
          background-color: var(--primary-color);
          color: #ffffff;
          border-bottom: none;
        }

        /* Signatures Footer */
        .footer-signatures {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 30px;
          padding-top: 12px;
          border-top: 1px solid var(--border-color);
          font-size: 9.5px;
          color: var(--text-muted);
        }

        .stamp-box {
          border: 1px dashed var(--border-color);
          padding: 8px 12px;
          border-radius: 4px;
          text-align: center;
          width: 180px;
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
      <div class="watermark">TAX INVOICE</div>

      <div class="page-container">
        
        <!-- Header -->
        <div class="header">
          <div class="brand-title">
            <h1>Tax Invoice</h1>
            <p>${propertyName} &bull; Commercial Real Estate</p>
          </div>
          <div class="invoice-badge-box">
            <div class="invoice-badge">${invoiceNo}</div>
            <div class="invoice-status">
              Status: <span style="color: ${isPaid ? 'var(--success-color)' : 'var(--danger-color)'}">${invoice.status || (isPaid ? 'PAID' : 'PENDING')}</span>
            </div>
          </div>
        </div>

        <!-- Billed From & Billed To -->
        <div class="parties-grid">
          <div class="party-box">
            <span class="box-title">Billed By (Lessor / Property Mgmt)</span>
            <div class="party-name">${propertyName}</div>
            <div class="party-details">
              <strong>GSTIN:</strong> 36AABCP1234M1Z5<br/>
              <strong>PAN:</strong> AABCP1234M<br/>
              <strong>Address:</strong> Financial District, Nanakramguda, Hyderabad, TS 500032<br/>
              <strong>Email:</strong> billing@pms-hub.com
            </div>
          </div>

          <div class="party-box">
            <span class="box-title">Billed To (Lessee / Tenant)</span>
            <div class="party-name">${user.name}</div>
            <div class="party-details">
              ${user.companyName ? `<strong>Company:</strong> ${user.companyName}<br/>` : ''}
              <strong>Unit(s):</strong> ${unitsText}<br/>
              <strong>GSTIN/PAN:</strong> ${user.gstPan || 'N/A'}<br/>
              <strong>Email:</strong> ${user.email}<br/>
              <strong>Phone:</strong> ${user.phoneNumber || '—'}
            </div>
          </div>
        </div>

        <!-- Meta Summary Grid -->
        <div class="summary-grid">
          <div class="summary-box">
            <span class="summary-label">Invoice Date</span>
            <span class="summary-val">${invoiceDate}</span>
          </div>
          <div class="summary-box">
            <span class="summary-label">Due Date</span>
            <span class="summary-val">${dueDateStr}</span>
          </div>
          <div class="summary-box">
            <span class="summary-label">Billing Period</span>
            <span class="summary-val">${invoice.billingPeriod}</span>
          </div>
          <div class="summary-box">
            <span class="summary-label">Place of Supply</span>
            <span class="summary-val">Telangana (36)</span>
          </div>
        </div>

        <!-- Itemized Table -->
        <table>
          <thead>
            <tr>
              <th style="width: 8%">S.No</th>
              <th style="width: 42%">Item Description & Service Details</th>
              <th style="width: 15%" class="text-center">HSN/SAC</th>
              <th style="width: 15%" class="text-end">Taxable Value</th>
              <th style="width: 20%" class="text-end">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-center">1</td>
              <td>
                <strong style="color: var(--primary-color);">Commercial Office Space Rent & Maintenance</strong><br/>
                <span style="font-size: 10px; color: var(--text-muted);">
                  Monthly rental & maintenance charges for ${unitsText} (${invoice.billingPeriod})
                </span>
              </td>
              <td class="text-center">997212</td>
              <td class="text-end">${formatCurrency(taxableValue)}</td>
              <td class="text-end" style="font-weight: 700;">${formatCurrency(taxableValue)}</td>
            </tr>
          </tbody>
        </table>

        <!-- Calculation & Bank Details -->
        <div class="calc-wrapper">
          <div class="bank-details">
            <span class="bank-title">Payment & Wire Transfer Details</span>
            <strong>Bank Name:</strong> Commercial HDFC Bank Ltd.<br/>
            <strong>Account Name:</strong> ${propertyName} Operating A/C<br/>
            <strong>Account Number:</strong> 50200098765432<br/>
            <strong>IFSC Code:</strong> HDFC0001234 &bull; <strong>UPI ID:</strong> pmsbilling@upi<br/>
            <span style="font-size: 9.5px; color: var(--text-muted); margin-top: 4px; display: block;">
              * Standard credit terms apply. Please include Invoice No <strong>${invoiceNo}</strong> in payment remarks.
            </span>
          </div>

          <table class="calc-table">
            <tbody>
              <tr>
                <td>Sub Total (Taxable):</td>
                <td class="text-end"><strong>${formatCurrency(taxableValue)}</strong></td>
              </tr>
              <tr>
                <td>CGST (9%):</td>
                <td class="text-end">${formatCurrency(cgstAmount)}</td>
              </tr>
              <tr>
                <td>SGST (9%):</td>
                <td class="text-end">${formatCurrency(sgstAmount)}</td>
              </tr>
              <tr class="total-row">
                <td>Total Invoice Amount:</td>
                <td class="text-end">${formatCurrency(grossTotal)}</td>
              </tr>
              <tr>
                <td>Amount Paid:</td>
                <td class="text-end" style="color: var(--success-color); font-weight: 700;">${formatCurrency(paidAmount)}</td>
              </tr>
              <tr style="border-top: 2px solid var(--primary-color);">
                <td><strong>Balance Due:</strong></td>
                <td class="text-end"><strong style="color: ${balanceDue > 0 ? 'var(--danger-color)' : 'var(--success-color)'}">${formatCurrency(balanceDue)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Signatures -->
        <div class="footer-signatures">
          <div>
            Computer Generated Tax Invoice &bull; Valid without physical signature<br/>
            Reference: ${invoiceNo} &bull; Property Management System
          </div>
          <div class="stamp-box">
            <strong>Authorized Signatory</strong><br/>
            <span style="font-size: 8.5px; color: var(--text-muted);">${propertyName}</span>
          </div>
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
