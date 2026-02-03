import dayjs from 'dayjs';

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
});

export const formatCurrency = (value = 0) => currencyFormatter.format(Number(value || 0));
export const formatDate = (value) => dayjs(value).format('DD MMM YYYY');
export const formatDateTime = (value) => dayjs(value).format('DD MMM · HH:mm');
