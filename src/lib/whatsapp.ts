export function normalizeWhatsAppNumber(phone: string): string | null {
  const trimmedPhone = phone.trim();
  const number = trimmedPhone.startsWith("00")
    ? trimmedPhone.slice(2).replace(/\D/g, "")
    : trimmedPhone.replace(/\D/g, "");

  return /^\d{8,15}$/.test(number) ? number : null;
}

export function createWhatsAppOrderLink(
  phone: string,
  customerName: string,
  orderNumber: string,
): string | null {
  const number = normalizeWhatsAppNumber(phone);
  if (!number) return null;

  const message = `مرحبًا ${customerName}، نتواصل معك بخصوص طلبك رقم ${orderNumber}.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
