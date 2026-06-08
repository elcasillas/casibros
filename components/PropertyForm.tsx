'use client';

import { useRef, useState } from 'react';
import type { Dispatch, FormEvent, SetStateAction } from 'react';

type FormValues = {
  fullName: string;
  email: string;
  phone: string;
  askingPrice: string;
  propertyType: string;
  propertyCondition: string;
  preferredContactMethod: string;
  consent: boolean;
};

type FormErrors = Partial<Record<keyof FormValues | 'preferredContactMethod', string>>;

const initialValues: FormValues = {
  fullName: '',
  email: '',
  phone: '',
  askingPrice: '',
  propertyType: '',
  propertyCondition: '',
  preferredContactMethod: '',
  consent: false
};

const fieldIds = {
  fullName: 'full-name',
  email: 'email-address',
  phone: 'phone-number',
  askingPrice: 'asking-price',
  propertyType: 'property-type',
  propertyCondition: 'property-condition',
  preferredContactMethod: 'preferred-contact-method-phone',
  consent: 'consent'
} as const;

const errorIds = {
  fullName: 'full-name-error',
  email: 'email-address-error',
  phone: 'phone-number-error',
  askingPrice: 'asking-price-error',
  propertyType: 'property-type-error',
  propertyCondition: 'property-condition-error',
  preferredContactMethod: 'preferred-contact-method-error',
  consent: 'consent-error'
} as const;

const preferredContactOptions = [
  { value: 'Phone', title: 'Phone', copy: 'Best for direct follow-up calls.' },
  { value: 'Email', title: 'Email', copy: 'Good for written responses and attachments.' },
  { value: 'Text Message', title: 'Text Message', copy: 'Fastest for quick coordination.' }
] as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(value: string) {
  return value.replace(/\D/g, '');
}

function parseCurrency(value: string) {
  const cleaned = value.trim().replace(/[$,\s]/g, '');
  if (!cleaned) {
    return null;
  }

  const numeric = Number(cleaned);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
}

function formatCurrency(value: string) {
  const numeric = parseCurrency(value);
  if (numeric === null) {
    return '';
  }

  return `$${numeric.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(numeric) ? 0 : 2,
    maximumFractionDigits: 2
  })}`;
}

function getFirstErrorField(errors: FormErrors) {
  const order: Array<keyof FormValues | 'preferredContactMethod'> = [
    'fullName',
    'email',
    'phone',
    'askingPrice',
    'propertyType',
    'propertyCondition',
    'preferredContactMethod',
    'consent'
  ];

  return order.find((name) => errors[name]);
}

function validateField(name: keyof FormValues | 'preferredContactMethod', values: FormValues) {
  switch (name) {
    case 'fullName':
      if (!values.fullName.trim()) return 'Full name is required.';
      if (values.fullName.trim().length < 2) return 'Please enter your full name.';
      return '';
    case 'email':
      if (!values.email.trim()) return 'Email address is required.';
      if (!emailPattern.test(values.email.trim())) return 'Enter a valid email address.';
      return '';
    case 'phone':
      if (!values.phone.trim()) return 'Phone number is required.';
      if (normalizePhone(values.phone).length < 10) {
        return 'Enter a valid phone number with at least 10 digits.';
      }
      return '';
    case 'askingPrice':
      if (!values.askingPrice.trim()) return '';
      if (parseCurrency(values.askingPrice) === null) return 'Enter a valid currency amount.';
      return '';
    case 'propertyType':
      if (!values.propertyType) return 'Property type is required.';
      return '';
    case 'propertyCondition':
      if (!values.propertyCondition) return 'Estimated property condition is required.';
      return '';
    case 'preferredContactMethod':
      if (!values.preferredContactMethod) return 'Preferred contact method is required.';
      return '';
    case 'consent':
      if (!values.consent) return 'You must agree before submitting.';
      return '';
    default:
      return '';
  }
}

function clearFieldError(name: keyof FormValues | 'preferredContactMethod', setErrors: Dispatch<SetStateAction<FormErrors>>) {
  setErrors((current) => {
    if (!current[name]) {
      return current;
    }

    const next = { ...current };
    delete next[name];
    return next;
  });
}

export function PropertyForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const statusRef = useRef<HTMLDivElement | null>(null);

  function updateField(name: keyof FormValues, value: string | boolean) {
    setValues((current) => ({ ...current, [name]: value }));
    setStatus(null);
    clearFieldError(name, setErrors);
  }

  function validateForm(nextValues: FormValues) {
    const nextErrors: FormErrors = {};

    (Object.keys(errorIds) as Array<keyof FormErrors>).forEach((name) => {
      const error = validateField(name as keyof FormValues | 'preferredContactMethod', nextValues);
      if (error) {
        nextErrors[name] = error;
      }
    });

    setErrors(nextErrors);
    return nextErrors;
  }

  function focusFirstError(nextErrors: FormErrors) {
    const firstError = getFirstErrorField(nextErrors);
    if (!firstError) {
      return;
    }

    const id = fieldIds[firstError as keyof typeof fieldIds] ?? fieldIds.consent;
    const element = document.getElementById(id);
    if (element instanceof HTMLElement) {
      element.focus();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const nextErrors = validateForm(values);
    if (Object.keys(nextErrors).length > 0) {
      setStatus({ type: 'error', message: 'Please fix the highlighted fields and try again.' });
      focusFirstError(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit-property', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          askingPrice: values.askingPrice.trim(),
          propertyType: values.propertyType,
          propertyCondition: values.propertyCondition,
          preferredContactMethod: values.preferredContactMethod,
          consent: values.consent
        })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        if (result && result.fieldErrors) {
          setErrors(result.fieldErrors as FormErrors);
        }

        const message = result.message || 'We could not submit your property right now. Please try again.';
        setStatus({ type: 'error', message });
        focusFirstError(result.fieldErrors || nextErrors);
        statusRef.current?.focus();
        return;
      }

      setValues(initialValues);
      setErrors({});
      setStatus({
        type: 'success',
        message:
          'Thank you. Your property information has been submitted. A member of the Casi Bros team will follow up shortly.'
      });
      statusRef.current?.focus();
    } catch {
      setStatus({
        type: 'error',
        message: 'Submission failed due to a network or server issue. Please try again in a moment.'
      });
      statusRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBlur(name: keyof FormValues | 'preferredContactMethod') {
    const error = validateField(name, values);
    setErrors((current) => {
      const next = { ...current };
      if (error) {
        next[name] = error;
      } else {
        delete next[name];
      }
      return next;
    });

    if (name === 'askingPrice' && values.askingPrice.trim()) {
      const formatted = formatCurrency(values.askingPrice.trim());
      if (formatted) {
        setValues((current) => ({ ...current, askingPrice: formatted }));
      }
    }
  }

  return (
    <form className="property-form" onSubmit={handleSubmit} noValidate>
      <div
        ref={statusRef}
        className={`form-status ${status ? `is-visible ${status.type}` : ''}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        tabIndex={-1}
      >
        {status?.message ?? ''}
      </div>

      <section className="form-section" aria-labelledby="contact-info-heading">
        <h3 id="contact-info-heading" className="form-section-title">
          Contact Information
        </h3>

        <div className="form-grid">
          <div className="field field-full">
            <label htmlFor="full-name" className="field-label">
              Full name
            </label>
            <input
              id="full-name"
              className="field-input"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              required
              value={values.fullName}
              onChange={(event) => updateField('fullName', event.target.value)}
              onBlur={() => handleBlur('fullName')}
              aria-invalid={Boolean(errors.fullName)}
            />
            <div className="field-error" id={errorIds.fullName}>
              {errors.fullName ?? ''}
            </div>
          </div>

          <div className="field">
            <label htmlFor="email-address" className="field-label">
              Email address
            </label>
            <input
              id="email-address"
              className="field-input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              value={values.email}
              onChange={(event) => updateField('email', event.target.value)}
              onBlur={() => handleBlur('email')}
              aria-invalid={Boolean(errors.email)}
            />
            <div className="field-error" id={errorIds.email}>
              {errors.email ?? ''}
            </div>
          </div>

          <div className="field">
            <label htmlFor="phone-number" className="field-label">
              Phone number
            </label>
            <input
              id="phone-number"
              className="field-input"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="(828) 555-0123"
              required
              value={values.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              onBlur={() => handleBlur('phone')}
              aria-invalid={Boolean(errors.phone)}
            />
            <div className="field-error" id={errorIds.phone}>
              {errors.phone ?? ''}
            </div>
          </div>
        </div>
      </section>

      <section className="form-section" aria-labelledby="property-info-heading">
        <h3 id="property-info-heading" className="form-section-title">
          Property Information
        </h3>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="asking-price" className="field-label">
              Asking price <span className="field-hint">(optional)</span>
            </label>
            <input
              id="asking-price"
              className="field-input"
              type="text"
              inputMode="decimal"
              placeholder="$450,000"
              value={values.askingPrice}
              onChange={(event) => updateField('askingPrice', event.target.value)}
              onBlur={() => handleBlur('askingPrice')}
              aria-invalid={Boolean(errors.askingPrice)}
            />
            <div className="field-hint">Optional. You can enter a currency-style value like $450,000 or 450000.</div>
            <div className="field-error" id={errorIds.askingPrice}>
              {errors.askingPrice ?? ''}
            </div>
          </div>

          <div className="field">
            <label htmlFor="property-type" className="field-label">
              Property type
            </label>
            <select
              id="property-type"
              className="field-select"
              required
              value={values.propertyType}
              onChange={(event) => updateField('propertyType', event.target.value)}
              onBlur={() => handleBlur('propertyType')}
              aria-invalid={Boolean(errors.propertyType)}
            >
              <option value="">Select a property type</option>
              <option value="Single Family Home">Single Family Home</option>
              <option value="Townhome">Townhome</option>
              <option value="Condo">Condo</option>
              <option value="Multi Family">Multi Family</option>
              <option value="Land">Land</option>
              <option value="Other">Other</option>
            </select>
            <div className="field-error" id={errorIds.propertyType}>
              {errors.propertyType ?? ''}
            </div>
          </div>

          <div className="field field-full">
            <label htmlFor="property-condition" className="field-label">
              Estimated property condition
            </label>
            <select
              id="property-condition"
              className="field-select"
              required
              value={values.propertyCondition}
              onChange={(event) => updateField('propertyCondition', event.target.value)}
              onBlur={() => handleBlur('propertyCondition')}
              aria-invalid={Boolean(errors.propertyCondition)}
            >
              <option value="">Select condition</option>
              <option value="Move in ready">Move in ready</option>
              <option value="Needs minor repairs">Needs minor repairs</option>
              <option value="Needs major repairs">Needs major repairs</option>
              <option value="Distressed">Distressed</option>
              <option value="Unknown">Unknown</option>
            </select>
            <div className="field-error" id={errorIds.propertyCondition}>
              {errors.propertyCondition ?? ''}
            </div>
          </div>
        </div>
      </section>

      <section className="form-section" aria-labelledby="contact-preference-heading">
        <h3 id="contact-preference-heading" className="form-section-title">
          Contact Preference
        </h3>

        <div className="form-grid">
          <div className="field field-full choice-group">
            <div className="choice-label">Preferred contact method</div>
            <div className="choice-grid">
              {preferredContactOptions.map((option) => (
                <label
                  key={option.value}
                  className={`choice-card ${values.preferredContactMethod === option.value ? 'is-selected' : ''}`}
                >
                  <input
                    id={option.value === 'Phone' ? fieldIds.preferredContactMethod : undefined}
                    type="radio"
                    name="preferredContactMethod"
                    value={option.value}
                    required
                    checked={values.preferredContactMethod === option.value}
                    onChange={(event) => updateField('preferredContactMethod', event.target.value)}
                    onBlur={() => handleBlur('preferredContactMethod')}
                  />
                  <span className="choice-title">{option.title}</span>
                  <small className="choice-copy">{option.copy}</small>
                </label>
              ))}
            </div>
            <div className="field-error" id={errorIds.preferredContactMethod}>
              {errors.preferredContactMethod ?? ''}
            </div>
          </div>

          <div className="field field-full">
            <label htmlFor="consent" className="checkbox-field">
              <input
                id="consent"
                type="checkbox"
                required
                checked={values.consent}
                onChange={(event) => updateField('consent', event.target.checked)}
                onBlur={() => handleBlur('consent')}
                aria-invalid={Boolean(errors.consent)}
              />
              <span className="checkbox-copy">I agree to be contacted by Casi Bros about this property submission.</span>
            </label>
            <div className="field-error" id={errorIds.consent}>
              {errors.consent ?? ''}
            </div>
          </div>
        </div>
      </section>

      <div className="submit-actions">
        <button className={`submit-button ${isSubmitting ? 'is-loading' : ''}`} type="submit" disabled={isSubmitting}>
          <span className="submit-spinner" aria-hidden="true" />
          <span>{isSubmitting ? 'Submitting...' : 'Submit Property'}</span>
        </button>
        <div className="privacy-note">
          We only use your information to review the submission and respond about the property.
        </div>
      </div>
    </form>
  );
}
