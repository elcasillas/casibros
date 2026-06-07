# casibros
Casi Bros Website

## Environment

The property submission endpoint sends email through Resend.

- `RESEND_API_KEY`
- `PROPERTY_SUBMISSION_TO=info@casibros.com`
- `PROPERTY_SUBMISSION_FROM=Casi Bros <onboarding@resend.dev>`

## Scripts

- `npm run lint`
- `npm run build`

## Cloudflare Deploy

Pushes to `main` trigger the GitHub Actions workflow in `.github/workflows/deploy.yml`.

Required repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
