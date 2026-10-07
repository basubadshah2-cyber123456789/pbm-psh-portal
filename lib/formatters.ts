/**
 * Auto-formats a 13-digit Pakistani CNIC or B-Form number: 12345-1234567-1
 */
export function formatCNIC(input: string): string {
  if (!input) return '';
  const digits = input.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
}

/**
 * Auto-formats an 11-digit Pakistani phone number: 0300-1234567
 */
export function formatPhone(input: string): string {
  if (!input) return '';
  const digits = input.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}
