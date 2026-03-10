const dateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const relativeFormatter = new Intl.RelativeTimeFormat("ja", {
  numeric: "auto",
});

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) {
    return "未設定";
  }

  const date = value instanceof Date ? value : new Date(value);
  return dateTimeFormatter.format(date);
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "未設定";
  }

  const date = value instanceof Date ? value : new Date(value);
  return dateFormatter.format(date);
}

export function formatDateInput(value: Date | string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatRelativeFromNow(value: Date | string | null | undefined) {
  if (!value) {
    return "未設定";
  }

  const date = value instanceof Date ? value : new Date(value);
  const diff = date.getTime() - Date.now();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  if (Math.abs(days) >= 1) {
    return relativeFormatter.format(days, "day");
  }

  const hours = Math.round(diff / (1000 * 60 * 60));
  if (Math.abs(hours) >= 1) {
    return relativeFormatter.format(hours, "hour");
  }

  const minutes = Math.round(diff / (1000 * 60));
  return relativeFormatter.format(minutes, "minute");
}
