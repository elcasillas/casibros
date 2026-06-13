import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

function trimString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizePhone(value: unknown) {
  return trimString(value).replace(/\D/g, '');
}

function parseCurrency(value: unknown) {
  const cleaned = trimString(value).replace(/[$,\s]/g, '');
  if (!cleaned) {
    return null;
  }

  const numeric = Number(cleaned);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
}

function formatCurrency(value: unknown) {
  const numeric = parseCurrency(value);
  if (numeric === null) {
    return '';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: Number.isInteger(numeric) ? 0 : 2
  }).format(numeric);
}

function escapeHtml(value: unknown) {
  return trimString(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const ALLOWED_PROPERTY_TYPES = new Set([
  'Single Family Home',
  'Townhome',
  'Condo',
  'Multi Family',
  'Land',
  'Other'
]);

const ALLOWED_PROPERTY_CONDITIONS = new Set([
  'Move in ready',
  'Needs minor repairs',
  'Needs major repairs',
  'Distressed',
  'Unknown'
]);

const ALLOWED_CONTACT_METHODS = new Set(['Phone', 'Email', 'Text Message']);

function validatePayload(payload: Record<string, unknown>) {
  const errors: Record<string, string> = {};
  const body = {
    fullName: trimString(payload.fullName),
    email: trimString(payload.email),
    phone: trimString(payload.phone),
    askingPrice: trimString(payload.askingPrice),
    propertyType: trimString(payload.propertyType),
    propertyCondition: trimString(payload.propertyCondition),
    preferredContactMethod: trimString(payload.preferredContactMethod),
    consent: Boolean(payload.consent)
  };

  if (!body.fullName) errors.fullName = 'Full name is required.';
  if (!body.email) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!body.phone) {
    errors.phone = 'Phone number is required.';
  } else if (normalizePhone(body.phone).length < 10) {
    errors.phone = 'Enter a valid phone number with at least 10 digits.';
  }

  if (!body.propertyType) {
    errors.propertyType = 'Property type is required.';
  } else if (!ALLOWED_PROPERTY_TYPES.has(body.propertyType)) {
    errors.propertyType = 'Select a valid property type.';
  }

  if (!body.propertyCondition) {
    errors.propertyCondition = 'Estimated property condition is required.';
  } else if (!ALLOWED_PROPERTY_CONDITIONS.has(body.propertyCondition)) {
    errors.propertyCondition = 'Select a valid property condition.';
  }

  if (body.askingPrice && parseCurrency(body.askingPrice) === null) {
    errors.askingPrice = 'Enter a valid currency amount.';
  }

  if (!body.preferredContactMethod) {
    errors.preferredContactMethod = 'Preferred contact method is required.';
  } else if (!ALLOWED_CONTACT_METHODS.has(body.preferredContactMethod)) {
    errors.preferredContactMethod = 'Select a valid contact method.';
  }

  if (!body.consent) errors.consent = 'Consent is required.';

  return { body, errors };
}

function formatEmailHtml(body: ReturnType<typeof validatePayload>['body'], submissionId: string) {
  const askingPrice = body.askingPrice ? formatCurrency(body.askingPrice) : 'Not provided';

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #142033; line-height: 1.6;">
      <h2 style="margin: 0 0 16px; color: #0b3f79;">New Property Submission</h2>
      <p style="margin: 0 0 18px;">A new property lead was submitted through the Casi Bros website.</p>
      <table cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 760px;">
        <tr><td style="padding: 6px 0;"><strong>Name:</strong></td><td style="padding: 6px 0;">${escapeHtml(body.fullName)}</td></tr>
        <tr><td style="padding: 6px 0;"><strong>Email:</strong></td><td style="padding: 6px 0;">${escapeHtml(body.email)}</td></tr>
        <tr><td style="padding: 6px 0;"><strong>Phone:</strong></td><td style="padding: 6px 0;">${escapeHtml(body.phone)}</td></tr>
        <tr><td style="padding: 6px 0;"><strong>Asking Price:</strong></td><td style="padding: 6px 0;">${escapeHtml(askingPrice)}</td></tr>
        <tr><td style="padding: 6px 0;"><strong>Property Type:</strong></td><td style="padding: 6px 0;">${escapeHtml(body.propertyType)}</td></tr>
        <tr><td style="padding: 6px 0;"><strong>Condition:</strong></td><td style="padding: 6px 0;">${escapeHtml(body.propertyCondition)}</td></tr>
        <tr><td style="padding: 6px 0;"><strong>Preferred Contact:</strong></td><td style="padding: 6px 0;">${escapeHtml(body.preferredContactMethod)}</td></tr>
        <tr><td style="padding: 6px 0;"><strong>Submission ID:</strong></td><td style="padding: 6px 0;">${escapeHtml(submissionId)}</td></tr>
      </table>
    </div>
  `;
}

function formatEmailText(body: ReturnType<typeof validatePayload>['body'], submissionId: string) {
  const askingPrice = body.askingPrice ? formatCurrency(body.askingPrice) : 'Not provided';
  return [
    'New Property Submission',
    '',
    `Name: ${body.fullName}`,
    `Email: ${body.email}`,
    `Phone: ${body.phone}`,
    `Asking Price: ${askingPrice}`,
    `Property Type: ${body.propertyType}`,
    `Condition: ${body.propertyCondition}`,
    `Preferred Contact: ${body.preferredContactMethod}`,
    `Submission ID: ${submissionId}`
  ].join('\n');
}

function getFromEmail() {
  return (
    trimString(process.env.PROPERTY_SUBMISSION_FROM_EMAIL) ||
    trimString(process.env.PROPERTY_SUBMISSION_FROM) ||
    'Casi Bros <onboarding@resend.dev>'
  );
}

function getToEmail() {
  return (
    trimString(process.env.PROPERTY_SUBMISSION_TO_EMAIL) ||
    trimString(process.env.PROPERTY_SUBMISSION_TO) ||
    'ed@casibros.com'
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const { body, errors } = validatePayload(payload);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Please correct the highlighted fields.',
          fieldErrors: errors
        },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured.');
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const submissionId = randomUUID();
    const emailHtml = formatEmailHtml(body, submissionId);
    const emailText = formatEmailText(body, submissionId);

    await resend.emails.send({
      from: getFromEmail(),
      to: getToEmail(),
      subject: 'New Property Submission from Casi Bros Website',
      html: emailHtml,
      text: emailText,
      replyTo: body.email
    });

    return NextResponse.json({
      ok: true,
      message: 'Property submission sent.',
      submissionId
    });
  } catch (error) {
    console.error('Property submission failed', {
      message: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      {
        ok: false,
        message: 'Unable to send property submission.'
      },
      { status: 500 }
    );
  }
}
