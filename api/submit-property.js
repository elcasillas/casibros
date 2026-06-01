const { randomUUID } = require('crypto');

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

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') {
      resolve(req.body);
      return;
    }

    if (typeof req.body === 'string') {
      try {
        resolve(JSON.parse(req.body));
      } catch (error) {
        reject(new Error('Invalid JSON payload.'));
      }
      return;
    }

    if (Buffer.isBuffer(req.body)) {
      try {
        resolve(JSON.parse(req.body.toString('utf8')));
      } catch (error) {
        reject(new Error('Invalid JSON payload.'));
      }
      return;
    }

    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });

    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error('Invalid JSON payload.'));
      }
    });

    req.on('error', reject);
  });
}

function trimString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizePhone(value) {
  return trimString(value).replace(/\D/g, '');
}

function parseCurrency(value) {
  const cleaned = trimString(value).replace(/[$,\s]/g, '');
  if (!cleaned) {
    return null;
  }

  const numeric = Number(cleaned);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
}

function validatePayload(payload) {
  const errors = {};
  const body = {
    fullName: trimString(payload.fullName),
    email: trimString(payload.email),
    phone: trimString(payload.phone),
    propertyAddress: trimString(payload.propertyAddress),
    city: trimString(payload.city),
    state: trimString(payload.state),
    zipCode: trimString(payload.zipCode),
    propertyType: trimString(payload.propertyType),
    propertyCondition: trimString(payload.propertyCondition),
    askingPrice: trimString(payload.askingPrice),
    reasonForSelling: trimString(payload.reasonForSelling),
    additionalDetails: trimString(payload.additionalDetails),
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

  if (!body.propertyAddress) errors.propertyAddress = 'Property address is required.';
  if (!body.city) errors.city = 'City is required.';
  if (!body.state) errors.state = 'State is required.';
  if (!body.zipCode) {
    errors.zipCode = 'ZIP code is required.';
  } else if (!/^\d{5}(-\d{4})?$/.test(body.zipCode)) {
    errors.zipCode = 'Enter a valid ZIP code.';
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

function maskEmail(email) {
  const [local = '', domain = ''] = trimString(email).split('@');
  if (!local || !domain) {
    return '';
  }

  return `${local.slice(0, 2)}***@${domain}`;
}

function maskPhone(phone) {
  const digits = normalizePhone(phone);
  if (digits.length < 4) {
    return '';
  }

  return `***-***-${digits.slice(-4)}`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST, OPTIONS');
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      ok: false,
      message: 'Method not allowed.'
    }));
    return;
  }

  try {
    const payload = await readRequestBody(req);
    const { body, errors } = validatePayload(payload);

    if (Object.keys(errors).length > 0) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        ok: false,
        message: 'Please correct the highlighted fields.',
        fieldErrors: errors
      }));
      return;
    }

    const submissionId = randomUUID();
    const safeLog = {
      submissionId,
      email: maskEmail(body.email),
      phone: maskPhone(body.phone),
      location: `${body.city}, ${body.state}`,
      propertyType: body.propertyType,
      propertyCondition: body.propertyCondition,
      askingPrice: body.askingPrice ? parseCurrency(body.askingPrice) : null,
      preferredContactMethod: body.preferredContactMethod,
      hasReasonForSelling: Boolean(body.reasonForSelling),
      hasAdditionalDetails: Boolean(body.additionalDetails),
      receivedAt: new Date().toISOString()
    };

    console.log('Property submission received', safeLog);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      ok: true,
      message: 'Property submission received.',
      submissionId
    }));
  } catch (error) {
    console.error('Property submission failed', {
      message: error instanceof Error ? error.message : 'Unknown error'
    });

    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      ok: false,
      message: 'Unable to process the submission right now.'
    }));
  }
};
