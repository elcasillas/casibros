# casibros

Casi Bros Property Development website built with Next.js, React, and Tailwind CSS.

## Development

```bash
npm install
npm run dev
```

The app runs locally at `http://localhost:3000`.

## Scripts

- `npm run dev` - start the Next.js dev server
- `npm run build` - create a production build
- `npm run start` - run the production server
- `npm run lint` - run Next.js linting

## Environment

The property submission API sends email through Resend.

- `RESEND_API_KEY`
- `PROPERTY_SUBMISSION_TO_EMAIL=info@casibros.com`
- `PROPERTY_SUBMISSION_FROM_EMAIL`

Backward-compatible fallbacks are also accepted for older deployments:

- `PROPERTY_SUBMISSION_TO`
- `PROPERTY_SUBMISSION_FROM`

Use a Resend-verified sending domain for production. For local development, you can temporarily use Resend's test sender:

```bash
PROPERTY_SUBMISSION_FROM_EMAIL="Casi Bros <donotreply@casibros.com>"
```

Do not prefix `RESEND_API_KEY` with `NEXT_PUBLIC_`.

## Cloudflare Deploy

Pushes to `main` trigger the GitHub Actions workflow in `.github/workflows/deploy.yml`.

Required repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Routes

- `/` - marketing homepage
- `/submit-property` - dedicated property submission page
- `/api/send-property-submission` - form submission API route

## Project Structure

```text
app/
  layout.tsx
  page.tsx
  submit-property/page.tsx
  api/send-property-submission/route.ts
components/
  Header.tsx
  Footer.tsx
  Hero.tsx
  Section.tsx
  WhatWeDoSection.tsx
  ProcessSection.tsx
  PropertiesSection.tsx
  SubmitPropertySection.tsx
  PropertyForm.tsx
public/
  images/
  logo.png
styles/
  globals.css
```
