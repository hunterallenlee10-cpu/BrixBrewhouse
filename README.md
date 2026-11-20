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

The "On tap" section, the flight builder, the featured beer panel and the "N beers on tap" lines all read the **Tap List** tab of the owners' *Brix Website Management* sheet. Every row whose **Website Status** is `LIVE` shows, in **Tap #** order, with its Beer, Style, ABV, Short Website Description, IBU and Color. A blank cell hides that stat. **Featured? = Yes** picks the beer the panel opens on (none marked: the lowest tap). The server re-reads the sheet every minute, so an edit shows up within a minute or two. Nothing redeploys.

Setup (once):

1. The sheet must be readable by link: **Share → General access → Anyone with the link → Viewer**.
2. In Vercel → Project → Settings → Environment Variables, set `TAP_SHEET_ID` to the sheet's link, then redeploy once.

| Variable | Value |
|---|---|
| `TAP_SHEET_ID` | The sheet's link or id. A "Publish to web" CSV link also works. |
| `TAP_SHEET_TAB` | Optional. Tab name, default `Tap List`. |

The site reads rows from row 4 (the header row) down. Rows 1–4 carry a warning-only protection so staff don't move them by accident.

If a re-read fails, the site keeps the last good copy for up to a week. If there's no good copy, it shows `data/taps.json` with an "Ask your bartender for today's pours" line. With no `TAP_SHEET_ID`, it uses `data/taps.json` as before.

## Food photos

The real photos live in `assets/food` as received. `node scripts/encode-food.mjs` crops each to 4:5, applies one light warm grade and writes AVIF/WebP sizes to `public/img/food`. Menu items point at a photo with `"image"` in `data/menu.json` (keys in `src/components/kitchen/foodPhotos.tsx`). New items without a confirmed price have `"price": null`, which hides the price.

## Virtual tour

"Take the Virtual Tour" (closing section) and "Tour the taproom in 3D" (Visit) open Vivid Visuals' tour page (`SITE.virtualTour` in `src/lib/site.ts`) in a new tab. Clicks send a `virtual_tour_click` event when Vercel Web Analytics or a Google tag is on the page.
