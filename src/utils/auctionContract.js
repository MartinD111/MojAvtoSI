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

// ── AutoHub legal exemption ────────────────────────────────────────────────────
// These clauses are embedded in EVERY auction contract (informative, binding and
// cash). They implement the "izvzetje iz sporov" architecture: AutoHub is only a
// technical intermediary, is not a party to the sale, does not arbitrate disputes,
// and the 3 % is a platform-usage fee — not a brokerage commission. The 48-hour
// escrow auto-release makes "money goes to the seller" the default so the platform
// never has to decide who is right.
export const BUYER_PREMIUM_PCT_DISPLAY = 3;
export const ESCROW_AUTO_RELEASE_HOURS = 48;

export const AUTOHUB_DISCLAIMER_LINES = [
    '— Določila o vlogi platforme AutoHub —',
    '1. AutoHub je zgolj tehnična platforma, ki povezuje prodajalce in kupce. AutoHub NI pogodbena stranka te pogodbe in ne odgovarja za njeno izpolnitev.',
    '2. Prodajna pogodba je sklenjena neposredno med prodajalcem in kupcem. AutoHub vozila ne pregleduje in ne jamči za njegovo stanje, dokumentacijo, homologacijo ali za sposobnost strank, da izpolnijo svoje obveznosti.',
    '3. Reševanje sporov: morebitne spore stranki rešujeta neposredno med seboj oziroma po sodni poti. AutoHub pri reševanju sporov ne sodeluje, ne nudi mediacije in ne odloča o vračilih.',
    `4. Provizija (kupčeva premija ${BUYER_PREMIUM_PCT_DISPLAY} % končne cene) je plačilo za uporabo tehnične platforme in NE plačilo za posredovanje pri prodaji.`,
    `5. Denarni tok: kupnina se ob plačilu zadrži na varnem računu (escrow) in se ${ESCROW_AUTO_RELEASE_HOURS} ur po plačilu samodejno sprosti prodajalcu, razen če kupec v tem času sproži uradni postopek (prijava policiji ali odvetniški dopis). S sprožitvijo spora pravica do vračila prek platforme ugasne — od tedaj je stvar med strankama in njunimi odvetniki.`,
    '6. Kupec potrjuje, da je imel možnost pregleda vozila (ali se tej pravici odreka) in da vse jamčevalne zahtevke naslavlja izključno na prodajalca.',
];

/** Pick the contract scenario from the auction's commercial flags. */
export function contractScenario({ bindingContract = false, cashAllowed = false } = {}) {
    if (bindingContract && cashAllowed) return 'cash';
    if (bindingContract) return 'binding';
    return 'informative';
}

/**
 * Build the full contract document (title + body lines + metadata) for one of the
 * three scenarios. Every variant appends the AutoHub disclaimer above.
 * @param {Object} o
 * @param {'informative'|'binding'|'cash'} o.scenario
 * @param {'seller'|'buyer'} [o.party='buyer']
 * @param {Object} [o.vehicle]            { title, vin, year }
 * @param {number} [o.finalPriceEur]      known final/winning price (optional)
 * @param {number} [o.paymentDeadlineDays=7]
 * @returns {{ title:string, fileName:string, lines:string[], binding:boolean }}
 */
export function buildAuctionContract(o = {}) {
    const scenario = o.scenario || 'informative';
    const party = o.party === 'seller' ? 'seller' : 'buyer';
    const v = o.vehicle || {};
    const vehicleLine = [v.title, v.year ? `(${v.year})` : '', v.vin ? `VIN: ${v.vin}` : '']
        .filter(Boolean).join(' ') || '(vozilo iz oglasa dražbe)';
    const priceLine = o.finalPriceEur
        ? `Dosežena (končna) cena: ${Number(o.finalPriceEur).toLocaleString('sl-SI')} €.`
        : 'Končna cena se določi ob zaključku dražbe kot najvišja veljavna ponudba.';
    const deadline = Number(o.paymentDeadlineDays) || 7;

    const binding = scenario !== 'informative';
    const lines = [];

    lines.push(`Predmet: ${vehicleLine}.`);
    lines.push(priceLine);
    lines.push('');

    if (scenario === 'informative') {
        lines.push('Ta dokument je INFORMATIVNE narave in ni pravno zavezujoč. Služi kot zapis namere strank ob zaključku dražbe.');
        if (party === 'seller') {
            lines.push('Prodajalec izraža namero prodati zgoraj navedeno vozilo najvišjemu ponudniku po končni ceni.');
        } else {
            lines.push('Kupec izraža namero kupiti zgoraj navedeno vozilo po končni ceni, če ob zaključku dražbe zmaga.');
        }
    } else {
        lines.push('Ta pogodba je PRAVNO ZAVEZUJOČA za obe stranki (opcija "Obvezna prodaja").');
        lines.push(`Prodajalec se zavezuje prodati, kupec pa kupiti zgoraj navedeno vozilo po doseženi končni ceni. Rok za plačilo in prevzem: ${deadline} dni od zaključka dražbe.`);
        if (scenario === 'cash') {
            lines.push('NAČIN PLAČILA — GOTOVINA OB PREVZEMU: kupnino za vozilo kupec poravna neposredno prodajalcu v gotovini ob prevzemu. AutoHub v tem denarnem toku ne sodeluje in zanj ne odgovarja.');
            lines.push(`Kupčeva premija (${BUYER_PREMIUM_PCT_DISPLAY} % končne cene) se kljub gotovinskemu plačilu poravna AutoHubu ločeno prek Stripe.`);
        }
        lines.push('Če kupec ne podpiše te pogodbe ali ne izpolni obveznosti, se vozilo lahko ponudi naslednjemu najvišjemu ponudniku.');
    }

    lines.push('');
    lines.push(...AUTOHUB_DISCLAIMER_LINES);

    const titles = {
        informative: 'Informativni zapis o zaključku dražbe — AutoHub',
        binding: 'Pogodba o obvezni prodaji na dražbi — AutoHub',
        cash: 'Pogodba o obvezni prodaji (gotovinsko plačilo) — AutoHub',
    };
    const files = { informative: 'informativni-zapis-drazba', binding: 'pogodba-obvezna-prodaja', cash: 'pogodba-obvezna-prodaja-gotovina' };

    return { title: titles[scenario], fileName: files[scenario], lines, binding };
}

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
 * @param {HTMLElement} root      the .ac-contract element
 * @param {Object|Function} pdf   { title, lines:[], binding } — or a function
 *                                returning that object (evaluated lazily at print
 *                                time, so it can reflect current form state).
 * @param {Function} onChange     optional callback(contract) when state changes
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
        await generateContractPdf(typeof pdf === 'function' ? pdf() : pdf);
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
    doc.text(pdf.title || 'Pogodba o dražbi — AutoHub', margin, y);
    y += 22;

    // Legal-weight banner so the reader instantly sees whether this binds them.
    if (pdf.binding != null) {
        doc.setFontSize(10);
        doc.setTextColor(pdf.binding ? 180 : 100, pdf.binding ? 30 : 100, 30);
        doc.text(pdf.binding ? 'PRAVNO ZAVEZUJOČA POGODBA' : 'INFORMATIVNI DOKUMENT (ni zavezujoč)', margin, y);
        doc.setTextColor(0, 0, 0);
        y += 18;
    }

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
