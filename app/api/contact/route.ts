import { NextRequest, NextResponse } from 'next/server';
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createFailureLimiter } from '@/utils/rateLimit';

const FORM_TYPES = ['general', 'sponsorship', 'join', 'media'];
const LIMITS = { name: 100, email: 254, subject: 150, message: 5000 };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Each accepted message counts against the sender's allowance.
const MESSAGES_PER_HOUR = 5;
const limiter = createFailureLimiter(MESSAGES_PER_HOUR, 60 * 60 * 1000);

/**
 * Messages are appended here, one JSON object per line. Keep it on the same
 * volume as the other site data so nothing is lost when the container is replaced.
 */
function getMessagesFile(): string {
  return process.env.CONTACT_FILE
    ? path.resolve(process.env.CONTACT_FILE)
    : path.join(process.cwd(), 'data', 'contact-messages.jsonl');
}

function getClientKey(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

function badRequest(error: string) {
  return NextResponse.json({ success: false, error }, { status: 400 });
}

/** Passes the message on to a chat or automation webhook when one is configured. */
async function forwardToWebhook(message: Record<string, string>): Promise<void> {
  const url = process.env.CONTACT_WEBHOOK_URL;
  if (!url) return;

  const summary =
    `New ${message.formType} message from ${message.name} <${message.email}>\n` +
    `Subject: ${message.subject}\n\n${message.message}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // "text" and "content" are what Slack and Discord webhooks read.
      body: JSON.stringify({ text: summary, content: summary, ...message }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) console.error(`Contact webhook answered ${response.status}`);
  } catch (error) {
    console.error('Contact webhook failed:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json().catch(() => null);
    const fields = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;

    // Real visitors never see this field, so anything in it is a bot. Pretend it worked.
    if (typeof fields.website === 'string' && fields.website !== '') {
      return NextResponse.json({ success: true });
    }

    const clientKey = getClientKey(request);
    const retryAfter = limiter.retryAfter(clientKey);
    if (retryAfter > 0) {
      return NextResponse.json(
        { success: false, error: 'Too many messages. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const message: Record<string, string> = {};
    for (const field of ['name', 'email', 'subject', 'message'] as const) {
      const value = fields[field];
      if (typeof value !== 'string' || value.trim() === '') {
        return badRequest(`${field} is required`);
      }
      if (value.trim().length > LIMITS[field]) {
        return badRequest(`${field} is too long`);
      }
      message[field] = value.trim();
    }
    if (!EMAIL_PATTERN.test(message.email)) {
      return badRequest('A valid email address is required');
    }
    if (typeof fields.formType !== 'string' || !FORM_TYPES.includes(fields.formType)) {
      return badRequest('Unknown inquiry type');
    }
    message.formType = fields.formType;

    const file = getMessagesFile();
    await mkdir(path.dirname(file), { recursive: true });
    await appendFile(file, JSON.stringify({ receivedAt: new Date().toISOString(), ...message }) + '\n', 'utf-8');
    limiter.recordFailure(clientKey);

    await forwardToWebhook(message);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving contact message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
