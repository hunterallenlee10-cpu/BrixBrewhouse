"use server";

import { SITE } from "@/lib/site";
import { buildEmail, validators, type Errors, type InquiryKind } from "@/lib/inquiry";

export type InquiryResult = { ok: true } | { ok: false; errors?: Errors; message?: string };

const FAILED = `Sorry, that didn't send. Please call us at ${SITE.phone} or email ${SITE.email}.`;

// Emails a large group or private event form to the brewhouse inbox through Resend.
// Needs RESEND_API_KEY. FORMS_FROM_EMAIL must be on a domain verified in Resend.
export async function sendInquiry(formData: FormData): Promise<InquiryResult> {
  const kind = String(formData.get("kind")) as InquiryKind;
  const validate = validators[kind];
  if (!validate) return { ok: false, message: FAILED };

  // Hidden field people never see. Bots that fill it get a quiet "success".
  if (String(formData.get("company") ?? "").trim()) return { ok: true };

  const errors = validate(formData);
  if (Object.keys(errors).length) return { ok: false, errors };

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("sendInquiry: RESEND_API_KEY is not set, so the form could not be emailed.");
    return { ok: false, message: FAILED };
  }

  const email = buildEmail(kind, formData);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.FORMS_FROM_EMAIL ?? "Brix Brewhouse Website <website@brixbrewhouse.com>",
        to: [SITE.email],
        subject: email.subject,
        text: email.text,
        ...(email.replyTo ? { reply_to: email.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.error("sendInquiry: Resend returned", res.status, await res.text());
      return { ok: false, message: FAILED };
    }
  } catch (err) {
    console.error("sendInquiry: request to Resend failed", err);
    return { ok: false, message: FAILED };
  }
  return { ok: true };
}
