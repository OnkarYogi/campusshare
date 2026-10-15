const nodemailer = require('nodemailer');

// In-memory record for testing and validation
let sentEmails = [];
let customTransporter = null;

/**
 * Check if SMTP is configured in the environment
 */
const isSmtpConfigured = () => {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
};

/**
 * Determine if email sending is enabled
 */
const isEmailEnabled = () => {
  if (process.env.EMAIL_ENABLED === 'false') return false;
  if (process.env.EMAIL_ENABLED === 'true') return true;
  return isSmtpConfigured();
};

/**
 * Get or create the active Nodemailer transporter
 */
const getTransporter = () => {
  if (customTransporter) return customTransporter;

  if (process.env.NODE_ENV === 'test') {
    return null; // Test mode uses the in-memory mock collector
  }

  if (!isSmtpConfigured()) {
    return null;
  }

  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Allow test suites or custom setups to inject a custom transporter
 */
const setTransporter = (transporter) => {
  customTransporter = transporter;
};

/**
 * Reset transporter and sent email buffer
 */
const resetTransporter = () => {
  customTransporter = null;
  sentEmails = [];
};

/**
 * Inspect sent emails (useful for automated testing and viva verification)
 */
const getSentEmails = () => [...sentEmails];

/**
 * Clear sent email buffer
 */
const clearSentEmails = () => {
  sentEmails = [];
};

/**
 * Standard branded HTML template for CampusShare notifications
 */
const renderEmailTemplate = ({ title, preheader, bodyHtml, actionText, actionUrl, footnote }) => {
  const currentYear = new Date().getFullYear();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; padding: 24px 32px; color: #ffffff; }
    .brand { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; text-decoration: none; display: flex; align-items: center; gap: 8px; }
    .brand-sub { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #38bdf8; margin-top: 4px; }
    .content { padding: 32px; }
    .headline { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; }
    .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13px; line-height: 1.6; }
    .card-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .card-label { color: #64748b; font-weight: 600; }
    .card-value { color: #0f172a; font-weight: 700; text-align: right; }
    .btn { display: inline-block; background-color: #0284c7; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 13px; font-weight: 700; margin: 16px 0; text-align: center; }
    .footnote { font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
    .footer { background-color: #f8fafc; padding: 20px 32px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">CampusShare</div>
      <div class="brand-sub">Community Resource Exchange Platform</div>
    </div>
    <div class="content">
      <h2 class="headline">${title}</h2>
      ${bodyHtml}
      ${actionText && actionUrl ? `<div style="text-align: center;"><a href="${actionUrl}" class="btn">${actionText}</a></div>` : ''}
      ${footnote ? `<div class="footnote">${footnote}</div>` : ''}
    </div>
    <div class="footer">
      <p>© ${currentYear} CampusShare — Academic Resource Exchange Platform.</p>
      <p>This is an automated academic transaction notification. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Core sendEmail dispatcher with robust reliability and non-crashing guarantee
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    console.warn('[Email Service] Skipping email send: No recipient address specified.');
    return { success: false, reason: 'missing_recipient' };
  }

  const from = process.env.EMAIL_FROM || '"CampusShare" <no-reply@campusshare.edu>';
  const emailPayload = { from, to, subject, html, text, sentAt: new Date() };

  // 1. In Test Environment: record to mock buffer and return deterministic success
  if (process.env.NODE_ENV === 'test') {
    sentEmails.push(emailPayload);
    return { success: true, messageId: `mock-test-${Date.now()}`, mock: true };
  }

  // 2. Custom transporter injected (e.g., during viva demonstration mock)
  if (customTransporter) {
    try {
      const info = await customTransporter.sendMail(emailPayload);
      sentEmails.push(emailPayload);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[Email Service] Custom transport error sending to ${to}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  // 3. In Development/Production without active SMTP credentials: safe fallback
  if (!isEmailEnabled() || !isSmtpConfigured()) {
    console.log(
      `[Email Service] (SMTP not configured) Skipped real email to <${to}>: "${subject}". In-app notification delivered.`
    );
    sentEmails.push({ ...emailPayload, skipped: true });
    return { success: true, skipped: true, reason: 'smtp_not_configured' };
  }

  // 4. Live SMTP Dispatch
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn(`[Email Service] Unable to initialize transporter. Skipped email to <${to}>.`);
      return { success: true, skipped: true };
    }

    const info = await transporter.sendMail(emailPayload);
    console.log(`[Email Service] Email successfully delivered to <${to}> [ID: ${info.messageId}]`);
    sentEmails.push(emailPayload);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // Non-fatal: An email failure must NOT crash or roll back a valid database transaction
    console.error(`[Email Service] Delivery failed to <${to}>:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Event 1: Borrower submits a borrow request -> Notify resource owner (Steward)
 */
const sendBorrowRequestEmail = async ({ steward, borrower, resource, borrowRequest }) => {
  const subject = `[CampusShare] New Borrow Request: ${resource.title}`;
  const startStr = new Date(borrowRequest.startDate).toLocaleDateString();
  const endStr = new Date(borrowRequest.endDate).toLocaleDateString();

  const bodyHtml = `
    <p>Hello <strong>${steward.name}</strong>,</p>
    <p>A fellow campus member has requested to borrow one of your listed resources.</p>
    <div class="card">
      <div class="card-row"><span class="card-label">Resource:</span> <span class="card-value">${resource.title}</span></div>
      <div class="card-row"><span class="card-label">Borrower:</span> <span class="card-value">${borrower.name} (${borrower.department || 'Campus Member'})</span></div>
      <div class="card-row"><span class="card-label">Requested Period:</span> <span class="card-value">${startStr} → ${endStr} (${borrowRequest.durationDays} days)</span></div>
      <div class="card-row"><span class="card-label">Pickup Location:</span> <span class="card-value">${resource.location}</span></div>
      <div style="margin-top: 10px; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
        <span class="card-label">Academic Purpose:</span>
        <p style="margin: 4px 0 0; font-style: italic; color: #334155;">"${borrowRequest.purpose}"</p>
      </div>
    </div>
    <p>Please review this request in your Lending Desk to approve or decline it.</p>
  `;

  const text = `Hello ${steward.name},\n\n${borrower.name} has submitted a request to borrow "${resource.title}" from ${startStr} to ${endStr} (${borrowRequest.durationDays} days).\nPurpose: "${borrowRequest.purpose}"\nPickup Location: ${resource.location}\n\nPlease sign in to CampusShare to review and respond to this request.`;

  return sendEmail({
    to: steward.email,
    subject,
    html: renderEmailTemplate({
      title: 'New Borrow Request Received',
      bodyHtml,
      actionText: 'Review Request in Lending Desk',
      actionUrl: process.env.CORS_ORIGIN || 'http://localhost:5173',
      footnote: 'You can accept or decline this request from the "Ongoing Transactions" tab.',
    }),
    text,
  });
};

/**
 * Event 2a: Steward approves the borrow request -> Notify Borrower
 */
const sendRequestApprovedEmail = async ({ steward, borrower, resource, borrowRequest }) => {
  const subject = `[CampusShare] Request Approved: ${resource.title}`;
  const startStr = new Date(borrowRequest.startDate).toLocaleDateString();
  const endStr = new Date(borrowRequest.endDate).toLocaleDateString();

  const bodyHtml = `
    <p>Hello <strong>${borrower.name}</strong>,</p>
    <p>Great news! Your request to borrow <strong>"${resource.title}"</strong> has been <span style="color: #0284c7; font-weight: bold;">APPROVED</span> by ${steward.name}.</p>
    <div class="card">
      <div class="card-row"><span class="card-label">Resource:</span> <span class="card-value">${resource.title}</span></div>
      <div class="card-row"><span class="card-label">Steward:</span> <span class="card-value">${steward.name} (${steward.email})</span></div>
      <div class="card-row"><span class="card-label">Approved Period:</span> <span class="card-value">${startStr} → ${endStr} (${borrowRequest.durationDays} days)</span></div>
      <div class="card-row"><span class="card-label">Pickup Location:</span> <span class="card-value">${resource.location}</span></div>
    </div>
    <p><strong>Next Action:</strong> Coordinate with ${steward.name} to collect the item from the pickup location. Once handed over, the steward will mark it as in your custody.</p>
  `;

  const text = `Hello ${borrower.name},\n\nYour request for "${resource.title}" was approved by ${steward.name}.\nPickup location: ${resource.location}.\nApproved period: ${startStr} to ${endStr}.\nPlease coordinate pickup with the steward.`;

  return sendEmail({
    to: borrower.email,
    subject,
    html: renderEmailTemplate({
      title: 'Borrow Request Approved!',
      bodyHtml,
      actionText: 'View in My Borrowings',
      actionUrl: process.env.CORS_ORIGIN || 'http://localhost:5173',
      footnote: 'This transaction is active in your Ongoing Transactions dashboard.',
    }),
    text,
  });
};

/**
 * Event 2b: Steward declines/rejects the borrow request -> Notify Borrower
 */
const sendRequestRejectedEmail = async ({ steward, borrower, resource, borrowRequest, rejectionReason }) => {
  const subject = `[CampusShare] Request Update: ${resource.title}`;
  const reason = rejectionReason || 'Unavailable for requested schedule.';

  const bodyHtml = `
    <p>Hello <strong>${borrower.name}</strong>,</p>
    <p>Your borrow request for <strong>"${resource.title}"</strong> could not be accommodated at this time.</p>
    <div class="card">
      <div class="card-row"><span class="card-label">Resource:</span> <span class="card-value">${resource.title}</span></div>
      <div class="card-row"><span class="card-label">Steward:</span> <span class="card-value">${steward.name}</span></div>
      <div class="card-row"><span class="card-label">Reason:</span> <span class="card-value" style="color: #b91c1c;">${reason}</span></div>
    </div>
    <p>You can search the CampusShare catalog for other available equipment, textbooks, and laboratory gear.</p>
  `;

  const text = `Hello ${borrower.name},\n\nYour borrow request for "${resource.title}" was declined by ${steward.name}.\nReason: ${reason}\n\nYou are welcome to browse the catalog for other available resources.`;

  return sendEmail({
    to: borrower.email,
    subject,
    html: renderEmailTemplate({
      title: 'Borrow Request Declined',
      bodyHtml,
      actionText: 'Browse Campus Catalog',
      actionUrl: process.env.CORS_ORIGIN || 'http://localhost:5173',
      footnote: 'This request has been archived under Closed History.',
    }),
    text,
  });
};

/**
 * Event 3: Borrower cancels a pending borrow request -> Notify Steward
 */
const sendRequestCancelledEmail = async ({ steward, borrower, resource, borrowRequest }) => {
  const subject = `[CampusShare] Borrow Request Cancelled: ${resource.title}`;

  const bodyHtml = `
    <p>Hello <strong>${steward.name}</strong>,</p>
    <p>Borrower <strong>${borrower.name}</strong> has cancelled their pending request for <strong>"${resource.title}"</strong>.</p>
    <div class="card">
      <div class="card-row"><span class="card-label">Resource:</span> <span class="card-value">${resource.title}</span></div>
      <div class="card-row"><span class="card-label">Borrower:</span> <span class="card-value">${borrower.name}</span></div>
      <div class="card-row"><span class="card-label">Status:</span> <span class="card-value">Cancelled by Borrower</span></div>
    </div>
    <p>No action is required. Your resource remains available in the campus catalog for other students and faculty.</p>
  `;

  const text = `Hello ${steward.name},\n\n${borrower.name} has cancelled their pending borrow request for "${resource.title}". The resource remains available in the catalog.`;

  return sendEmail({
    to: steward.email,
    subject,
    html: renderEmailTemplate({
      title: 'Borrow Request Cancelled',
      bodyHtml,
      actionText: 'View Lending Desk',
      actionUrl: process.env.CORS_ORIGIN || 'http://localhost:5173',
    }),
    text,
  });
};

/**
 * Event 4: Resource is marked as collected / handed over -> Notify Borrower
 */
const sendHandoverEmail = async ({ steward, borrower, resource, borrowRequest, handoverNotes }) => {
  const subject = `[CampusShare] Resource Handed Over: ${resource.title}`;
  const endStr = new Date(borrowRequest.endDate).toLocaleDateString();

  const bodyHtml = `
    <p>Hello <strong>${borrower.name}</strong>,</p>
    <p>Steward <strong>${steward.name}</strong> has confirmed the handover of <strong>"${resource.title}"</strong>.</p>
    <div class="card">
      <div class="card-row"><span class="card-label">Resource:</span> <span class="card-value">${resource.title}</span></div>
      <div class="card-row"><span class="card-label">Steward:</span> <span class="card-value">${steward.name}</span></div>
      <div class="card-row"><span class="card-label">Due Return Date:</span> <span class="card-value" style="color: #0284c7;">${endStr}</span></div>
      ${handoverNotes ? `<div class="card-row"><span class="card-label">Handover Notes:</span> <span class="card-value">${handoverNotes}</span></div>` : ''}
    </div>
    <p>Please take good care of the item and initiate its return on or before <strong>${endStr}</strong>.</p>
  `;

  const text = `Hello ${borrower.name},\n\n"${resource.title}" has been handed over by ${steward.name}. Due return date: ${endStr}.${handoverNotes ? ` Notes: ${handoverNotes}` : ''}`;

  return sendEmail({
    to: borrower.email,
    subject,
    html: renderEmailTemplate({
      title: 'Resource In Custody',
      bodyHtml,
      actionText: 'View Transaction',
      actionUrl: process.env.CORS_ORIGIN || 'http://localhost:5173',
      footnote: 'When you are ready to return the item, click "Initiate Return" in your Ongoing Transactions dashboard.',
    }),
    text,
  });
};

/**
 * Event 5: Borrower initiates return -> Notify Steward to inspect and confirm
 */
const sendReturnInitiatedEmail = async ({ steward, borrower, resource, borrowRequest }) => {
  const subject = `[CampusShare] Return Initiated: ${resource.title}`;

  const bodyHtml = `
    <p>Hello <strong>${steward.name}</strong>,</p>
    <p>Borrower <strong>${borrower.name}</strong> has initiated the return of <strong>"${resource.title}"</strong>.</p>
    <div class="card">
      <div class="card-row"><span class="card-label">Resource:</span> <span class="card-value">${resource.title}</span></div>
      <div class="card-row"><span class="card-label">Borrower:</span> <span class="card-value">${borrower.name} (${borrower.email})</span></div>
      <div class="card-row"><span class="card-label">Return Location:</span> <span class="card-value">${resource.location}</span></div>
    </div>
    <p><strong>Next Action:</strong> Once you inspect the resource and verify it is intact, please confirm the return in your Lending Desk to finalize this transaction.</p>
  `;

  const text = `Hello ${steward.name},\n\n${borrower.name} has initiated the return for "${resource.title}". Please inspect the item at ${resource.location} and confirm the return on CampusShare to complete the transaction.`;

  return sendEmail({
    to: steward.email,
    subject,
    html: renderEmailTemplate({
      title: 'Return Awaiting Your Confirmation',
      bodyHtml,
      actionText: 'Confirm Return in Lending Desk',
      actionUrl: process.env.CORS_ORIGIN || 'http://localhost:5173',
      footnote: 'Confirming return will move this transaction to Completed Transactions and restore the resource catalog status to Available.',
    }),
    text,
  });
};

/**
 * Event 6: Steward confirms return -> Notify Borrower that transaction is completed
 */
const sendReturnConfirmedEmail = async ({ steward, borrower, resource, borrowRequest, returnNotes }) => {
  const subject = `[CampusShare] Return Confirmed — Transaction Completed: ${resource.title}`;

  const bodyHtml = `
    <p>Hello <strong>${borrower.name}</strong>,</p>
    <p>Steward <strong>${steward.name}</strong> has confirmed the return of <strong>"${resource.title}"</strong>.</p>
    <div class="card">
      <div class="card-row"><span class="card-label">Resource:</span> <span class="card-value">${resource.title}</span></div>
      <div class="card-row"><span class="card-label">Status:</span> <span class="card-value" style="color: #16a34a; font-weight: bold;">Successfully Completed</span></div>
      <div class="card-row"><span class="card-label">Completion Date:</span> <span class="card-value">${new Date().toLocaleDateString()}</span></div>
      ${returnNotes ? `<div class="card-row"><span class="card-label">Steward Notes:</span> <span class="card-value">${returnNotes}</span></div>` : ''}
    </div>
    <p>This transaction is now officially closed and has moved to your <strong>Completed Transactions</strong> record. Thank you for being a responsible campus community member!</p>
    <p>Please leave a rating and review for ${steward.name} to help build community trust.</p>
  `;

  const text = `Hello ${borrower.name},\n\n${steward.name} has confirmed the return of "${resource.title}". Transaction is now complete! Please sign in to CampusShare and submit a rating to maintain community trust.`;

  return sendEmail({
    to: borrower.email,
    subject,
    html: renderEmailTemplate({
      title: 'Transaction Completed Successfully',
      bodyHtml,
      actionText: 'Rate Steward & Experience',
      actionUrl: process.env.CORS_ORIGIN || 'http://localhost:5173',
      footnote: 'Both participants have earned an increment in total completed loans.',
    }),
    text,
  });
};

module.exports = {
  sendEmail,
  sendBorrowRequestEmail,
  sendRequestApprovedEmail,
  sendRequestRejectedEmail,
  sendRequestCancelledEmail,
  sendHandoverEmail,
  sendReturnInitiatedEmail,
  sendReturnConfirmedEmail,
  getSentEmails,
  clearSentEmails,
  setTransporter,
  resetTransporter,
  isSmtpConfigured,
  isEmailEnabled,
};
