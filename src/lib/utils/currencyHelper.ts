// format currency to PHP
export const formatCurrency = (value, currency = 'PHP', locale = 'en-PH') => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency
    }).format(value);
}

// format currency without currency symbol with two decimal places
export const formatCurrencyNoSymbol = (value, locale = 'en-PH') => {
    return new Intl.NumberFormat(locale, {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}
