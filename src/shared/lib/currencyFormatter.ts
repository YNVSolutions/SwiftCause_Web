export const formatCurrency = (amountInPence: number) => {
  const amountInGbp = (amountInPence || 0) / 100;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInGbp);
};

export const formatCurrencyFromMajor = (amountInGbp: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInGbp || 0);
};
