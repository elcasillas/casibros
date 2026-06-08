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
- `PROPERTY_SUBMISSION_TO`
- `PROPERTY_SUBMISSION_FROM`

## Routes

- `/` - marketing homepage
- `/submit-property` - dedicated property submission page
- `/api/submit-property` - form submission API route

## Project Structure

```text
app/
  layout.tsx
  page.tsx
  submit-property/page.tsx
  api/submit-property/route.ts
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
