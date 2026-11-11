export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidCPF(value: string) {
  const d = digitsOnly(value);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  for (const len of [9, 10]) {
    const sum = [...d.slice(0, len)].reduce(
      (acc, digit, i) => acc + Number(digit) * (len + 1 - i),
      0,
    );
    const check = ((sum * 10) % 11) % 10;
    if (check !== Number(d[len])) return false;
  }
  return true;
}

export function isValidCNPJ(value: string) {
  const d = digitsOnly(value);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (const len of [12, 13]) {
    const w = weights.slice(13 - len);
    const sum = [...d.slice(0, len)].reduce(
      (acc, digit, i) => acc + Number(digit) * w[i],
      0,
    );
    const check = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (check !== Number(d[len])) return false;
  }
  return true;
}
