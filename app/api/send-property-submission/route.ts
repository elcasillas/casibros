import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

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

type SubmissionBody = {
  fullName: string;
  email: string;
  phone: string;
  askingPrice: string;
  propertyType: string;
  propertyCondition: string;
  preferredContactMethod: string;
  consent: boolean;
};

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
    return 'Not provided';
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

function validatePayload(payload: Record<string, unknown>) {
  const errors: Record<string, string> = {};
  const body: SubmissionBody = {
    fullName: trimString(payload.fullName),
    email: trimString(payload.email),
    phone: trimString(payload.phone),
    askingPrice: trimString(payload.askingPrice),
    propertyType: trimString(payload.propertyType),
    propertyCondition: trimString(payload.propertyCondition),
    preferredContactMethod: trimString(payload.preferredContactMethod),
    consent: Boolean(payload.consent)
  };

  if (!body.fullName) {
    errors.fullName = 'Full name is required.';
  } else if (body.fullName.length < 2) {
    errors.fullName = 'Please enter your full name.';
  }

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

  if (!body.consent) {
    errors.consent = 'Consent is required.';
  }

  return { body, errors };
}

function buildEmailHtml(body: SubmissionBody, submissionId: string) {
  const askingPrice = formatCurrency(body.askingPrice);
  const consent = body.consent ? 'Yes' : 'No';

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #142033; line-height: 1.55; background: #ffffff;">
      <div style="max-width: 720px; margin: 0 auto; padding: 24px;">
        <h2 style="margin: 0 0 12px; color: #0b3f79; font-size: 24px;">New Property Submission</h2>
        <p style="margin: 0 0 20px; color: #415065;">A new property lead was submitted through the Casi Bros website.</p>

        <div style="margin: 0 0 18px; padding: 16px; border: 1px solid #e4e8ef; border-radius: 14px;">
          <h3 style="margin: 0 0 12px; color: #142033; font-size: 18px;">Contact Information</h3>
          <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 5px 0; width: 180px; font-weight: 700;">Full name</td><td style="padding: 5px 0;">${escapeHtml(body.fullName)}</td></tr>
            <tr><td style="padding: 5px 0; width: 180px; font-weight: 700;">Email address</td><td style="padding: 5px 0;">${escapeHtml(body.email)}</td></tr>
            <tr><td style="padding: 5px 0; width: 180px; font-weight: 700;">Phone number</td><td style="padding: 5px 0;">${escapeHtml(body.phone)}</td></tr>
          </table>
        </div>

        <div style="margin: 0 0 18px; padding: 16px; border: 1px solid #e4e8ef; border-radius: 14px;">
          <h3 style="margin: 0 0 12px; color: #142033; font-size: 18px;">Property Information</h3>
          <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 5px 0; width: 180px; font-weight: 700;">Asking price</td><td style="padding: 5px 0;">${escapeHtml(askingPrice)}</td></tr>
            <tr><td style="padding: 5px 0; width: 180px; font-weight: 700;">Property type</td><td style="padding: 5px 0;">${escapeHtml(body.propertyType)}</td></tr>
            <tr><td style="padding: 5px 0; width: 180px; font-weight: 700;">Estimated condition</td><td style="padding: 5px 0;">${escapeHtml(body.propertyCondition)}</td></tr>
          </table>
        </div>

        <div style="margin: 0 0 18px; padding: 16px; border: 1px solid #e4e8ef; border-radius: 14px;">
          <h3 style="margin: 0 0 12px; color: #142033; font-size: 18px;">Contact Preference</h3>
          <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 5px 0; width: 180px; font-weight: 700;">Preferred contact method</td><td style="padding: 5px 0;">${escapeHtml(body.preferredContactMethod)}</td></tr>
            <tr><td style="padding: 5px 0; width: 180px; font-weight: 700;">Consent</td><td style="padding: 5px 0;">${escapeHtml(consent)}</td></tr>
          </table>
        </div>

        <p style="margin: 0; color: #6b7788; font-size: 12px;">Submission ID: ${escapeHtml(submissionId)}</p>
      </div>
    </div>
  `;
}

function buildEmailText(body: SubmissionBody, submissionId: string) {
  const askingPrice = formatCurrency(body.askingPrice);
  const consent = body.consent ? 'Yes' : 'No';

  return [
    'New Property Submission',
    '',
    'Contact Information',
    `Full name: ${body.fullName}`,
    `Email address: ${body.email}`,
    `Phone number: ${body.phone}`,
    '',
    'Property Information',
    `Asking price: ${askingPrice}`,
    `Property type: ${body.propertyType}`,
    `Estimated condition: ${body.propertyCondition}`,
    '',
    'Contact Preference',
    `Preferred contact method: ${body.preferredContactMethod}`,
    `Consent: ${consent}`,
    '',
    `Submission ID: ${submissionId}`
  ].join('\n');
}

function getFromEmail() {
  const configuredFrom =
    trimString(process.env.PROPERTY_SUBMISSION_FROM_EMAIL) ||
    trimString(process.env.PROPERTY_SUBMISSION_FROM);
  if (configuredFrom) {
    return configuredFrom;
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'Casi Bros <donotreply@casibros.com>';
  }

  throw new Error('PROPERTY_SUBMISSION_FROM_EMAIL is not configured.');
}

function getToEmail() {
  return (
    trimString(process.env.PROPERTY_SUBMISSION_TO_EMAIL) ||
    trimString(process.env.PROPERTY_SUBMISSION_TO) ||
    'info@casibros.com'
  );
}

async function handleSubmission(request: Request) {
  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: 'Invalid request payload.'
      },
      { status: 400 }
    );
  }

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

  const apiKey = trimString(process.env.RESEND_API_KEY);
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured.');
  }

  const resend = new Resend(apiKey);
  const submissionId = randomUUID();

  await resend.emails.send({
    from: getFromEmail(),
    to: getToEmail(),
    subject: 'New Property Submission from Casi Bros Website',
    html: buildEmailHtml(body, submissionId),
    text: buildEmailText(body, submissionId),
    replyTo: body.email
  });

  return NextResponse.json(
    {
      ok: true,
      message: 'Property submission sent.'
    },
    { status: 200 }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(request: Request) {
  try {
    return await handleSubmission(request);
  } catch (error) {
    console.error('Property submission email failed:', error);

    return NextResponse.json(
      {
        ok: false,
        message: 'Unable to send property submission.'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      message: 'Method not allowed.'
    },
    { status: 405 }
  );
}
