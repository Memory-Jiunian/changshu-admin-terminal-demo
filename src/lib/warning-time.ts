export const WARNING_MOCK_TODAY = "2026-07-08";

export function formatMockDateTime(date = new Date()) {
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${WARNING_MOCK_TODAY} ${hour}:${minute}`;
}

export function formatDateTimeInput(value: string) {
  return value.replace("T", " ");
}

export function getMockDateTimeInput(date = new Date()) {
  return formatMockDateTime(date).replace(" ", "T");
}
