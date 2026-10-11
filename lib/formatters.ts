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

type AddressDetails = {
  address?: string | null;
  addressType?: string | null;
  villageName?: string | null;
  postOffice?: string | null;
  cityName?: string | null;
  colony?: string | null;
  district?: string | null;
  tehsil?: string | null;
  ucNumber?: string | null;
  ucName?: string | null;
  streetNumber?: string | null;
  houseNumber?: string | null;
};

export function formatAddress(details: AddressDetails | null | undefined, fallback = 'N/A'): string {
  if (!details) return fallback;

  const parts = [
    details.addressType,
    details.addressType === 'Village'
      ? details.villageName
      : details.addressType === 'City'
        ? details.cityName
        : details.postOffice || details.colony,
    details.addressType === 'Village' ? details.postOffice : null,
    details.addressType === 'City' ? details.colony : null,
    details.district,
    details.tehsil,
    details.ucNumber,
    details.ucName,
    details.streetNumber,
    details.houseNumber,
  ].map((part) => part?.trim()).filter((part): part is string => Boolean(part));
  const legacyAddress = details.address?.trim();

  const legacyParts = legacyAddress?.split(', ').map((part) => part.trim()).filter(Boolean) || [];
  if (legacyAddress && !legacyParts.every((part) => parts.includes(part))) parts.push(legacyAddress);
  return parts.join(', ') || fallback;
}
