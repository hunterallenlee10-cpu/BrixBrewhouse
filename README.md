This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Form emails

The Large group and Private event forms email each submission to `info@brixbrewhouse.com` (see `src/app/actions.ts`) through [Resend](https://resend.com). Set these in Vercel → Project → Settings → Environment Variables:

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | API key from Resend. Without it, the forms tell guests to call or email instead. |
| `FORMS_FROM_EMAIL` | Optional. Sender address, e.g. `Brix Brewhouse Website <website@brixbrewhouse.com>` (the default). Its domain must be verified in Resend. |

Private event emails set the guest's address as reply-to, so hitting Reply answers them directly.

## Live tap list (Google Sheet)

The "On tap" section reads the owners' Google Sheet (the **Tap List** tab) instead of `data/taps.json` once it's connected. Every row whose **Website Status** is `LIVE` (or, with no status column, whose **On Tap?** is `Yes`) shows on the site in **Tap #** order, using its Beer, Style, ABV and Short Website Description. The site re-reads the sheet about once a minute, so changes show up within a couple of minutes without a redeploy.

1. In the sheet: **Share → General access → Anyone with the link → Viewer**. The site only reads it.
2. In Vercel → Project → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `TAP_SHEET_ID` | The sheet's link (or just its id). A "File → Share → Publish to web" CSV link works too. |
| `TAP_SHEET_TAB` | Optional. Tab name, default `Tap List`. |

3. Redeploy once so the variable takes effect.

If the variable is missing, the sheet isn't shared, or nothing is set to Yes, the site quietly falls back to `data/taps.json`. A beer whose name matches one in `data/taps.json` keeps that file's IBU, colour and glass colour; any other beer gets a glass colour picked from its style.
