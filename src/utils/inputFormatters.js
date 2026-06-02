/**
 * Utility for formatting numeric inputs as currency/mileage with thousands separators
 * while the user is typing.
 */

/**
 * Formats a number string with dots as thousands separators.
 * @param {string} value 
 * @returns {string}
 */
export function formatNumberWithCommas(value) {
    if (!value) return "";
    // Remove all non-digits
    const cleanValue = value.toString().replace(/\D/g, "");
    if (!cleanValue) return "";
    // Format with dots (Slovenian style)
    return new Intl.NumberFormat('sl-SI').format(parseInt(cleanValue, 10));
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
 * Automatically appends ' €' for prices and ' km' for mileages.
 * @param {HTMLInputElement} input 
 */
export function setupNumericFormatter(input) {
    if (!input) return;

    // Detect suffix based on input name/id/placeholder
    const name = (input.name || '').toLowerCase();
    const id = (input.id || '').toLowerCase();
    const placeholder = (input.placeholder || '').toLowerCase();
    
    let suffix = '';
    if (name.includes('price') || id.includes('price') || placeholder.includes('€') ||
        id.includes('transport') || id.includes('homologation') || id.includes('registration')) {
        suffix = ' €';
    } else if (name.includes('mileage') || id.includes('mileage') || placeholder.includes('km')) {
        suffix = ' km';
    }

    input.addEventListener('input', (e) => {
        if (input._formatting) return;
        
        let val = e.target.value;
        
        // Extract digits
        const digits = val.replace(/\D/g, "");
        if (!digits) {
            input._formatting = true;
            e.target.value = "";
            input._formatting = false;
            return;
        }

        // Format with dots
        const formattedNum = new Intl.NumberFormat('sl-SI').format(parseInt(digits, 10));
        const finalValue = `${formattedNum}${suffix}`;

        const originalCursor = e.target.selectionStart;
        
        input._formatting = true;
        e.target.value = finalValue;
        input._formatting = false;

        // Position cursor before the suffix if the cursor was near the end
        let newCursor = originalCursor;
        if (suffix && originalCursor >= finalValue.length - suffix.length) {
            newCursor = formattedNum.length;
        } else {
            // Adjust cursor for added/removed dots
            const digitsBeforeCursor = val.slice(0, originalCursor).replace(/\D/g, "").length;
            let currentDigits = 0;
            let cursorPlaced = false;
            for (let i = 0; i < finalValue.length; i++) {
                if (/\d/.test(finalValue[i])) {
                    currentDigits++;
                }
                if (currentDigits === digitsBeforeCursor) {
                    newCursor = i + 1;
                    cursorPlaced = true;
                    break;
                }
            }
            if (!cursorPlaced) {
                newCursor = formattedNum.length;
            }
        }

        e.target.setSelectionRange(newCursor, newCursor);
    });

    // Handle backspace properly for suffixes
    if (suffix) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                const cursor = e.target.selectionStart;
                const val = e.target.value;
                if (cursor === val.length || cursor === val.length - suffix.length || (suffix.length > 1 && cursor === val.length - 1)) {
                    e.preventDefault();
                    const digits = val.replace(/\D/g, "");
                    if (digits.length > 0) {
                        const newDigits = digits.slice(0, -1);
                        input._formatting = true;
                        if (newDigits) {
                            const formattedNum = new Intl.NumberFormat('sl-SI').format(parseInt(newDigits, 10));
                            e.target.value = `${formattedNum}${suffix}`;
                            e.target.setSelectionRange(formattedNum.length, formattedNum.length);
                        } else {
                            e.target.value = "";
                        }
                        input._formatting = false;
                        e.target.dispatchEvent(new Event('input'));
                    }
                }
            }
        });
    }
}
