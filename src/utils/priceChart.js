// priceChart.js — tiny self-contained canvas line chart for auction price history.
// No external charting dependency (keeps package.json lean). Draws the bid
// amount over time, with a faint second line for the number of bidders.
//
// Usage: drawPriceChart(canvasEl, auction.priceSeries, { primary: '#2563eb' })

/**
 * @param {HTMLCanvasElement} canvas
 * @param {Array<{t:number, amount:number, bidders:number}>} series
 * @param {Object} opts { primary, muted, dark }
 */
export function drawPriceChart(canvas, series, opts = {}) {
    if (!canvas || !canvas.getContext) return;
    const primary = opts.primary || '#2563eb';
    const muted = opts.muted || 'rgba(100,116,139,0.5)';
    const dark = !!opts.dark;
    const gridColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const textColor = dark ? '#94a3b8' : '#64748b';

    // Crisp rendering on HiDPI screens.
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || 600;
    const cssH = canvas.clientHeight || 240;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const data = Array.isArray(series) ? series.filter(p => p && Number.isFinite(p.amount)) : [];
    const padL = 56, padR = 16, padT = 14, padB = 26;
    const plotW = cssW - padL - padR;
    const plotH = cssH - padT - padB;

    if (data.length === 0) {
        ctx.fillStyle = textColor;
        ctx.font = '13px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Še ni ponudb', cssW / 2, cssH / 2);
        return;
    }

    const amounts = data.map(p => p.amount);
    const minAmt = Math.min(...amounts);
    const maxAmt = Math.max(...amounts);
    const range = maxAmt - minAmt || Math.max(maxAmt * 0.1, 1);
    const yMin = minAmt - range * 0.1;
    const yMax = maxAmt + range * 0.1;

    const times = data.map(p => p.t);
    const tMin = Math.min(...times);
    const tMax = Math.max(...times);
    const tRange = tMax - tMin || 1;

    const x = t => padL + ((t - tMin) / tRange) * plotW;
    const y = v => padT + (1 - (v - yMin) / (yMax - yMin)) * plotH;

    // Horizontal gridlines + Y labels (4 steps).
    ctx.strokeStyle = gridColor;
    ctx.fillStyle = textColor;
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const v = yMin + ((yMax - yMin) * i) / 4;
        const yy = y(v);
        ctx.beginPath();
        ctx.moveTo(padL, yy);
        ctx.lineTo(cssW - padR, yy);
        ctx.stroke();
        ctx.fillText(Math.round(v).toLocaleString('sl-SI') + ' €', padL - 6, yy + 4);
    }

    // Bidders line (muted, stepped) — scaled into the same plot for shape only.
    const maxBidders = Math.max(...data.map(p => p.bidders || 0), 1);
    if (maxBidders > 0) {
        ctx.strokeStyle = muted;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        data.forEach((p, i) => {
            const yy = padT + (1 - (p.bidders || 0) / maxBidders) * plotH;
            const xx = x(p.t);
            if (i === 0) ctx.moveTo(xx, yy);
            else ctx.lineTo(xx, yy);
        });
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Price line (primary) with filled area.
    ctx.beginPath();
    data.forEach((p, i) => {
        const xx = x(p.t), yy = y(p.amount);
        if (i === 0) ctx.moveTo(xx, yy);
        else ctx.lineTo(xx, yy);
    });
    const grad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
    grad.addColorStop(0, hexToRgba(primary, 0.18));
    grad.addColorStop(1, hexToRgba(primary, 0));
    ctx.lineTo(x(tMax), padT + plotH);
    ctx.lineTo(x(tMin), padT + plotH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    data.forEach((p, i) => {
        const xx = x(p.t), yy = y(p.amount);
        if (i === 0) ctx.moveTo(xx, yy);
        else ctx.lineTo(xx, yy);
    });
    ctx.strokeStyle = primary;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Bid dots.
    ctx.fillStyle = primary;
    data.forEach(p => {
        ctx.beginPath();
        ctx.arc(x(p.t), y(p.amount), 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function hexToRgba(hex, a) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return `rgba(37,99,235,${a})`;
    return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${a})`;
}
