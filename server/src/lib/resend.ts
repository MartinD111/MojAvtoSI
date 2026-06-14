// Resend — transactional email (outbid / won / sold notifications, booking
// confirmations, business verification). Per-platform sender so MojAvto and
// MojaNavtika mail come from the right domain.
import { Resend } from 'resend';
import { env } from '../config/env.js';

export const resend = new Resend(env.RESEND_API_KEY);

export type Platform = 'avto' | 'navtika';

function fromAddress(platform: Platform) {
  return platform === 'navtika' ? env.RESEND_FROM_NAVTIKA : env.RESEND_FROM_AVTO;
}

export async function sendEmail(opts: {
  platform: Platform;
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  return resend.emails.send({
    from: fromAddress(opts.platform),
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
  });
}
