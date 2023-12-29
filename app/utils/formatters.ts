export const usDollar = (value: number) => Intl.NumberFormat('en-us', {
  style: 'currency',
  currency: 'USD'
}).format(value);
