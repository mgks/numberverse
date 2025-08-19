// A reliable, browser-native way to format numbers.
const usFormatter = new Intl.NumberFormat('en-US');
const indianFormatter = new Intl.NumberFormat('en-IN');

export function formatUS(numStr) {
    if (!numStr) return '';
    const num = Number(numStr);
    if (isNaN(num)) return 'Invalid Number';
    return usFormatter.format(num);
}

export function formatIndian(numStr) {
    if (!numStr) return '';
    const num = Number(numStr);
    if (isNaN(num)) return 'Invalid Number';
    return indianFormatter.format(num);
}