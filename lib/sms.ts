export interface SmsGatewayRequest {
  to: string;
  message: string;
  externalReference: string;
}

export interface SmsGatewayResult {
  success: boolean;
  providerMessageId?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface SmsGatewayProvider {
  sendSms(request: SmsGatewayRequest): Promise<SmsGatewayResult>;
}

export function normalizePakistaniPhone(phone: string): string {
  const compact = phone.trim().replace(/[\s()-]/g, '');
  if (compact.startsWith('+92')) return compact;
  if (compact.startsWith('0092')) return `+92${compact.slice(4)}`;
  if (compact.startsWith('92')) return `+${compact}`;
  if (compact.startsWith('03')) return `+92${compact.slice(1)}`;
  return compact;
}

export function isValidPakistaniPhone(phone: string): boolean {
  return /^\+923\d{9}$/.test(normalizePakistaniPhone(phone));
}

export function maskPhoneNumber(phone: string): string {
  const normalized = normalizePakistaniPhone(phone);
  return normalized.length > 7 ? `${normalized.slice(0, 4)}****${normalized.slice(-3)}` : '****';
}

function gatewayEnabled() {
  return process.env.SMS_GATEWAY_ENABLED?.trim().toLowerCase() === 'true';
}

class HttpSmsGatewayProvider implements SmsGatewayProvider {
  async sendSms({ to, message, externalReference }: SmsGatewayRequest): Promise<SmsGatewayResult> {
    const url = process.env.SMS_GATEWAY_URL?.trim();
    const apiKey = process.env.SMS_GATEWAY_API_KEY?.trim();
    const deviceId = process.env.SMS_GATEWAY_DEVICE_ID?.trim();
    const timeoutMs = Number(process.env.SMS_GATEWAY_TIMEOUT_MS) || 15000;

    if (!gatewayEnabled()) return { success: false, errorCode: 'GATEWAY_DISABLED', errorMessage: 'SMS gateway is disabled' };
    if (!url || !apiKey) return { success: false, errorCode: 'GATEWAY_NOT_CONFIGURED', errorMessage: 'SMS gateway is not configured' };
    if (!url.startsWith('https://') && process.env.NODE_ENV === 'production') return { success: false, errorCode: 'INSECURE_GATEWAY_URL', errorMessage: 'Production SMS gateway URL must use HTTPS' };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message, externalReference, ...(deviceId ? { deviceId } : {}) }),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) return { success: false, errorCode: `HTTP_${response.status}`, errorMessage: typeof result.error === 'string' ? result.error : `Gateway returned HTTP ${response.status}` };
      return { success: true, providerMessageId: typeof result.providerMessageId === 'string' ? result.providerMessageId : typeof result.id === 'string' ? result.id : undefined };
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === 'AbortError';
      return { success: false, errorCode: timedOut ? 'TIMEOUT' : 'NETWORK_ERROR', errorMessage: timedOut ? 'SMS gateway request timed out' : 'SMS gateway request failed' };
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function getSmsGatewayProvider(): SmsGatewayProvider {
  return new HttpSmsGatewayProvider();
}

export function isSmsConfigured() {
  return gatewayEnabled() && Boolean(process.env.SMS_GATEWAY_URL?.trim() && process.env.SMS_GATEWAY_API_KEY?.trim());
}

export async function sendSms(to: string | null | undefined, message: string, externalReference = 'ERP:SMS') {
  if (!to) return { sent: false, skipped: true, reason: 'NO_PHONE_NUMBER' };
  const normalized = normalizePakistaniPhone(to);
  if (!isValidPakistaniPhone(normalized)) return { sent: false, skipped: true, reason: 'INVALID_PHONE_NUMBER' };
  if (!isSmsConfigured()) return { sent: false, skipped: true, reason: 'SMS_GATEWAY_NOT_CONFIGURED' };
  const result = await getSmsGatewayProvider().sendSms({ to: normalized, message, externalReference });
  if (!result.success) throw new Error(result.errorMessage || result.errorCode || 'SMS gateway request failed');
  return { sent: true, skipped: false, providerMessageId: result.providerMessageId };
}
