/**
 * Utility for formatting numeric inputs as currency/mileage with thousands separators
 * while the user is typing.
 */

/**
 * Formats a number string with thousands separators.
 * @param {string} value 
 * @returns {string}
 */
export function formatNumberWithCommas(value) {
    if (!value) return "";
    // Remove all non-digits
    const cleanValue = value.toString().replace(/\D/g, "");
    if (!cleanValue) return "";
    // Format with commas
    return new Intl.NumberFormat('en-US').format(parseInt(cleanValue, 10));
}

/**
 * Strips all non-digit characters from a string.
 * @param {string} value 
 * @returns {number}
 */
export function parseFormattedNumber(value) {
    if (!value) return 0;
    const clean = value.toString().replace(/\D/g, "");
    return clean ? parseInt(clean, 10) : 0;
}

/**
 * Sets up an input element to automatically format its value on input.
 * @param {HTMLInputElement} input 
 */
export function setupNumericFormatter(input) {
    if (!input) return;

    input.addEventListener('input', (e) => {
        const cursorPosition = e.target.selectionStart;
        const originalLength = e.target.value.length;
        
        const formatted = formatNumberWithCommas(e.target.value);
        e.target.value = formatted;

        // Restore cursor position roughly (Intl.NumberFormat can add characters)
        const newLength = e.target.value.length;
        const diff = newLength - originalLength;
        input.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
    });
}
