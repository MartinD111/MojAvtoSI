// auctionContract.js — shared contract widget for auctions (dražbe).
//
// Two ways to commit, both offered (per product decision):
//   • sign  — draw a signature with a finger/mouse on a canvas (signature_pad)
//   • print — generate a PDF (jsPDF) to print & send to the other party
//
// Used by: create-listing (seller's commitment to sell) and the auction detail
// page (buyer's commitment to buy if they win). Heavy deps (signature_pad,
// jspdf) are imported dynamically so they stay out of the main bundle.
//
// PRIVACY: signature image data is only persisted for the auction's duration —
// the backend prunes it at close (see docs/AUCTIONS_HANDOFF.md).

let _signaturePad = null;

/**
 * Markup for an inline contract block. Caller injects this where needed and then
 * calls mountContractWidget(rootEl, opts).
 * @param {Object} o { title, body, party }  party: 'seller' | 'buyer'
 */
export function contractWidgetHtml(o = {}) {
    return `
    <div class="ac-contract" data-party="${o.party || 'buyer'}">
        <div class="ac-contract-head">
            <span class="ac-contract-icon">📝</span>
            <div>
                <p class="ac-contract-title">${o.title || 'Pogodba'}</p>
                <p class="ac-contract-sub">${o.body || ''}</p>
            </div>
        </div>

        <div class="ac-contract-modes">
            <button type="button" class="ac-mode-btn active" data-cmode="sign">✍️ Podpiši s prstom</button>
            <button type="button" class="ac-mode-btn" data-cmode="print">🖨️ Natisni &amp; pošlji</button>
        </div>

        <div class="ac-sign-wrap" data-pane="sign">
            <canvas class="ac-sign-canvas" width="600" height="180" aria-label="Polje za podpis"></canvas>
            <div class="ac-sign-actions">
                <button type="button" class="ac-sign-clear">Počisti</button>
                <span class="ac-sign-status" aria-live="polite"></span>
            </div>
        </div>

        <div class="ac-print-wrap" data-pane="print" style="display:none;">
            <p class="ac-print-note">Prenesite pogodbo, jo natisnite, podpišite in pošljite drugi stranki.
            Hranimo jo le do zaključka dražbe.</p>
            <button type="button" class="ac-print-btn">⬇️ Prenesi PDF pogodbo</button>
        </div>
    </div>`;
}

/**
 * Wires up the widget. Returns a getter for the resulting contract object:
 *   { type:'sign'|'print', signatureData:string|null }
 * @param {HTMLElement} root    the .ac-contract element
 * @param {Object} pdf          { title, lines:[], party, meta:{} } for the PDF
 * @param {Function} onChange   optional callback(contract) when state changes
 */
export async function mountContractWidget(root, pdf = {}, onChange) {
    if (!root) return () => null;
    const canvas = root.querySelector('.ac-sign-canvas');
    const status = root.querySelector('.ac-sign-status');
    const signPane = root.querySelector('[data-pane="sign"]');
    const printPane = root.querySelector('[data-pane="print"]');
    let mode = 'sign';
    let signed = false;
    let printed = false;

    // Lazy-load signature_pad and bind to the canvas.
    try {
        const { default: SignaturePad } = await import('signature_pad');
        resizeCanvasToDpr(canvas);
        _signaturePad = new SignaturePad(canvas, { penColor: '#0f172a', minWidth: 0.8, maxWidth: 2.2 });
        _signaturePad.addEventListener('endStroke', () => {
            signed = !_signaturePad.isEmpty();
            if (status) status.textContent = signed ? 'Podpisano ✓' : '';
            onChange && onChange(getContract());
        });
    } catch (e) {
        if (signPane) signPane.innerHTML = '<p style="color:#ef4444;">Podpisno polje ni na voljo.</p>';
    }

    root.querySelectorAll('.ac-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            mode = btn.dataset.cmode;
            root.querySelectorAll('.ac-mode-btn').forEach(b => b.classList.toggle('active', b === btn));
            if (signPane) signPane.style.display = mode === 'sign' ? '' : 'none';
            if (printPane) printPane.style.display = mode === 'print' ? '' : 'none';
            onChange && onChange(getContract());
        });
    });

    const clearBtn = root.querySelector('.ac-sign-clear');
    if (clearBtn) clearBtn.addEventListener('click', () => {
        _signaturePad && _signaturePad.clear();
        signed = false;
        if (status) status.textContent = '';
        onChange && onChange(getContract());
    });

    const printBtn = root.querySelector('.ac-print-btn');
    if (printBtn) printBtn.addEventListener('click', async () => {
        await generateContractPdf(pdf);
        printed = true;
        onChange && onChange(getContract());
    });

    function getContract() {
        if (mode === 'sign') {
            return {
                type: 'sign',
                signatureData: signed && _signaturePad ? _signaturePad.toDataURL('image/png') : null,
            };
        }
        return { type: 'print', signatureData: null, acknowledged: printed };
    }

    return getContract;
}

/** True when the contract is complete enough to proceed. */
export function isContractComplete(contract) {
    if (!contract) return false;
    if (contract.type === 'sign') return !!contract.signatureData;
    if (contract.type === 'print') return !!contract.acknowledged;
    return false;
}

async function generateContractPdf(pdf = {}) {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 56;
    let y = margin;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(pdf.title || 'Pogodba o dražbi — MojAvto.si', margin, y);
    y += 28;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const lines = pdf.lines || [];
    lines.forEach(line => {
        const wrapped = doc.splitTextToSize(line, 595 - margin * 2);
        wrapped.forEach(w => {
            if (y > 760) { doc.addPage(); y = margin; }
            doc.text(w, margin, y);
            y += 16;
        });
        y += 6;
    });

    y += 40;
    doc.line(margin, y, margin + 220, y);
    doc.setFontSize(10);
    doc.text('Podpis', margin, y + 14);
    doc.text('Datum: ____________________', margin + 280, y + 14);

    doc.save((pdf.fileName || 'pogodba-drazba') + '.pdf');
}

function resizeCanvasToDpr(canvas) {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const w = canvas.offsetWidth || 600;
    const h = canvas.offsetHeight || 180;
    canvas.width = w * ratio;
    canvas.height = h * ratio;
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
}
