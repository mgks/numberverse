// --- DICTIONARIES AND CONSTANTS ---
const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const magnitudesUS = ['', 'Thousand', 'Million', 'Billion', 'Trillion', 'Quadrillion'];
const magnitudesIndianFormal = ['', 'Thousand', 'Lakh', 'Crore', 'Arab', 'Kharab', 'Neel', 'Padma'];

const shorthandMultipliers = { 'k': 1e3, 'm': 1e6, 'b': 1e9, 't': 1e12, 'l': 1e5, 'cr': 1e7 };
const shorthandAliases = {
    'k': 'k', 'thousand': 'k', 'm': 'm', 'mil': 'm', 'million': 'm',
    'b': 'b', 'bil': 'b', 'billion': 'b', 't': 't', 'tril': 't', 'trillion': 't',
    'l': 'l', 'lakh': 'l', 'c': 'cr', 'cr': 'cr', 'crore': 'cr'
};
const MAX_NUMBER = 1000000000000000000n; // Using BigInt directly for safety

// --- HELPER FUNCTIONS ---
function chunkToWords(n) {
    let words = [];
    if (n >= 100) {
        words.push(units[Math.floor(n / 100)], 'Hundred');
        n %= 100;
    }
    if (n >= 20) {
        words.push(tens[Math.floor(n / 10)]);
        n %= 10;
    }
    if (n > 0) {
        words.push(n < 10 ? units[n] : teens[n - 10]);
    }
    return words.join(' ');
}

// --- CORE WORD CONVERSION LOGIC ---
function numberToWordsUS(numStr) {
    if (!numStr || numStr === '0') return 'Zero';
    let [integerPart] = numStr.split('.');
    if (BigInt(integerPart) > MAX_NUMBER) return 'Number is too large.';
    
    let words = [];
    let tempInt = integerPart;
    let magIndex = 0;
    while (tempInt.length > 0) {
        const chunk = parseInt(tempInt.slice(-3));
        tempInt = tempInt.slice(0, -3);
        if (chunk > 0) {
            words.unshift(chunkToWords(chunk) + (magnitudesUS[magIndex] ? ' ' + magnitudesUS[magIndex] : ''));
        }
        magIndex++;
    }
    return words.join(' ').trim();
}

function numberToWordsIndian(numStr) {
    if (!numStr || numStr === '0') return { colloquial: 'Zero', formal: 'Zero' };
    let [integerPart] = numStr.split('.');
    if (BigInt(integerPart) > MAX_NUMBER) return { colloquial: 'Number is too large.', formal: '' };

    let formalWords = [];
    let tempIntFormal = integerPart;
    let magIndexFormal = 0;
    while (tempIntFormal.length > 0) {
        const sliceLength = magIndexFormal > 0 ? 2 : 3;
        const chunk = parseInt(tempIntFormal.slice(-sliceLength));
        tempIntFormal = tempIntFormal.slice(0, -sliceLength);
        if (chunk > 0) {
            formalWords.unshift(chunkToWords(chunk) + (magnitudesIndianFormal[magIndexFormal] ? ' ' + magnitudesIndianFormal[magIndexFormal] : ''));
        }
        magIndexFormal++;
    }

    let colloquialWords = '';
    const num = BigInt(integerPart);
    // CORRECTED: Compare BigInt to BigInt using the 'n' suffix
    if (num >= 1000000000n) { // 100 Crore
        const lakhCrores = num / 10000000n;
        colloquialWords = `${formatIndian(lakhCrores.toString())} Crore`;
    } else {
        colloquialWords = formalWords.join(' ').trim();
    }
    
    return { colloquial: colloquialWords, formal: formalWords.join(' ').trim() };
}

// --- FORMATTING AND PARSING ---
// (Just in case, here are the safe versions of the formatters)
const formatUS = (numStr) => {
    if (!numStr) return '';
    const [integerPart] = numStr.split('.');
    if (integerPart && BigInt(integerPart) > MAX_NUMBER) return "Number too large";
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return numStr.includes('.') ? `${formattedInteger}.${numStr.split('.')[1]}` : formattedInteger;
};

const formatIndian = (numStr) => {
    if (!numStr) return '';
    const [integerPart] = numStr.split('.');
    if (integerPart && BigInt(integerPart) > MAX_NUMBER) return "Number too large";
    const lastThree = integerPart.slice(-3);
    const otherNumbers = integerPart.slice(0, -3);
    const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    const formattedInteger = formattedOther ? `${formattedOther},${lastThree}` : lastThree;
    return numStr.includes('.') ? `${formattedInteger}.${numStr.split('.')[1]}` : formattedInteger;
};


function parseAdvancedInput(input) {
    if (!input.trim()) return '';
    const cleaned = input.toLowerCase().replace(/,/g, '').trim();
    const match = cleaned.match(/^([0-9.]+)\s*([a-z]+)?$/);
    if (!match) return null;
    const numericPart = match[1];
    const unitPart = match[2];
    if (unitPart) {
        const canonicalUnit = shorthandAliases[unitPart];
        if (!canonicalUnit) return null;
        const multiplier = shorthandMultipliers[canonicalUnit];
        const value = parseFloat(numericPart) * multiplier;
        const isKidMode = document.body.getAttribute('data-mode') === 'kid';
        return isKidMode ? value.toFixed(2) : String(value);
    } else {
        return numericPart;
    }
}

// --- MAIN EXPORTED FUNCTION ---
export function updateConverterOutputs(inputValue) {
    const usOutputCard = document.getElementById('us-output');
    const indianOutputCard = document.getElementById('indian-output');
    const limitMessage = document.getElementById('limit-message');
    if (!usOutputCard || !indianOutputCard) return;

    if (!inputValue.trim()) {
        // Clear all outputs and messages
        usOutputCard.querySelector('.formatted-number').textContent = '...';
        usOutputCard.querySelector('.words').textContent = '...';
        indianOutputCard.querySelector('.formatted-number').textContent = '...';
        indianOutputCard.querySelector('#indian-words-colloquial').textContent = '...';
        indianOutputCard.querySelector('#indian-words-formal').textContent = '';
        limitMessage.textContent = '';
        return;
    }

    const isAdultMode = document.body.getAttribute('data-mode') === 'adult';
    const finalValue = isAdultMode 
        ? parseAdvancedInput(inputValue)
        : inputValue.replace(/[^0-9.]/g, '');

    if (finalValue === null) {
        limitMessage.textContent = 'Invalid format. Check supported inputs.';
        return;
    }

    const [integerPart = '0'] = finalValue.split('.');

    // ADDED SAFETY: Use a try-catch block for BigInt conversion
    try {
        const num = BigInt(integerPart);
        if (num > MAX_NUMBER) {
            limitMessage.textContent = `Input limit is ${formatUS(MAX_NUMBER.toString())}.`;
            return;
        }
    } catch (error) {
        // This catches cases where BigInt() fails, e.g., with "1.2.3"
        limitMessage.textContent = 'Invalid number format.';
        return;
    }
    
    // If we've passed all checks, clear the message
    limitMessage.textContent = '';

    const usFormatted = formatUS(finalValue);
    const indianFormatted = formatIndian(finalValue);
    const usWords = numberToWordsUS(finalValue);
    const indianWordsResult = numberToWordsIndian(finalValue);

    usOutputCard.querySelector('.formatted-number').textContent = usFormatted || '...';
    usOutputCard.querySelector('.words').textContent = usWords;

    const indianWordsColloquial = indianOutputCard.querySelector('#indian-words-colloquial');
    const indianWordsFormal = indianOutputCard.querySelector('#indian-words-formal');
    const wordsContainer = indianOutputCard.querySelector('.words-container');
    
    indianOutputCard.querySelector('.formatted-number').textContent = indianFormatted || '...';
    indianWordsColloquial.textContent = indianWordsResult.colloquial;
    indianWordsFormal.textContent = `Formal: ${indianWordsResult.formal}`;
    
    if (integerPart && BigInt(integerPart) >= 1000000000n && indianWordsResult.colloquial !== indianWordsResult.formal) {
        wordsContainer.classList.add('show-secondary');
    } else {
        wordsContainer.classList.remove('show-secondary');
    }
}