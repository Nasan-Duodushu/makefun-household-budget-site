// Small SVG charts, drawn from the data in data.js. No library, no network:
// a donut chart for spending by envelope, and a bar chart for the six-month
// spending trend. Colours match the site's palette in style.css.

const NS = "http://www.w3.org/2000/svg";

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
}

export const PALETTE = [
  "#1e4d3b", // deep green
  "#c65d3b", // terracotta
  "#d9a441", // ochre
  "#7a9b76", // sage
  "#5b7a99", // slate blue
  "#8a6d4b", // tan
  "#b4556d", // muted rose
  "#4a6b5d", // grey green
];

// Draws a donut for [{ label, value, colour }] slices. Returns an SVG string
// with a legend beside it. The centre reads the total.
export function donutChart(slices, totalLabel) {
  const W = 760;
  const H = 320;
  const cx = 150;
  const cy = 160;
  const rOuter = 128;
  const rInner = 82;
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  let angle = -Math.PI / 2;
  const paths = slices.map((s, i) => {
    const frac = total === 0 ? 0 : s.value / total;
    const a0 = angle;
    const a1 = angle + frac * Math.PI * 2;
    angle = a1;
    const large = frac > 0.5 ? 1 : 0;
    const x0o = cx + rOuter * Math.cos(a0);
    const y0o = cy + rOuter * Math.sin(a0);
    const x1o = cx + rOuter * Math.cos(a1);
    const y1o = cy + rOuter * Math.sin(a1);
    const x1i = cx + rInner * Math.cos(a1);
    const y1i = cy + rInner * Math.sin(a1);
    const x0i = cx + rInner * Math.cos(a0);
    const y0i = cy + rInner * Math.sin(a0);
    const colour = PALETTE[i % PALETTE.length];
    return `<path d="M ${x0o.toFixed(1)} ${y0o.toFixed(1)} A ${rOuter} ${rOuter} 0 ${large} 1 ${x1o.toFixed(1)} ${y1o.toFixed(1)} L ${x1i.toFixed(1)} ${y1i.toFixed(1)} A ${rInner} ${rInner} 0 ${large} 0 ${x0i.toFixed(1)} ${y0i.toFixed(1)} Z" fill="${colour}"/>`;
  });
  const legend = slices
    .map((s, i) => {
      const y = 36 + i * 38;
      const pct = total === 0 ? 0 : Math.round((s.value / total) * 100);
      return `<g><rect x="330" y="${y - 12}" width="14" height="14" rx="3" fill="${PALETTE[i % PALETTE.length]}"/><text x="354" y="${y}" class="legend-label">${esc(s.label)}</text><text x="740" y="${y}" class="legend-value" text-anchor="end">£${s.value.toLocaleString("en-GB")} · ${pct}%</text></g>`;
    })
    .join("");
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Spending by envelope, November 2026">${paths.join("")}<text x="${cx}" y="${cy - 6}" class="donut-centre" text-anchor="middle">${totalLabel}</text><text x="${cx}" y="${cy + 18}" class="donut-sub" text-anchor="middle">spent so far</text>${legend}</svg>`;
}

// Draws a bar chart for [{ label, value }] points, with the income line
// drawn across so the gap between income and spending is visible.
export function barChart(points, income) {
  const W = 760;
  const H = 320;
  const padL = 56;
  const padR = 16;
  const padT = 26;
  const padB = 34;
  const max = Math.max(income, ...points.map((p) => p.value)) * 1.08;
  const bw = (W - padL - padR) / points.length;
  const y = (v) => padT + ((max - v) * (H - padT - padB)) / max;
  const bars = points
    .map((p, i) => {
      const x = padL + i * bw + bw * 0.18;
      const w = bw * 0.64;
      return `<rect x="${x.toFixed(1)}" y="${y(p.value).toFixed(1)}" width="${w.toFixed(1)}" height="${(y(0) - y(p.value)).toFixed(1)}" rx="4" class="bar"/><text x="${(x + w / 2).toFixed(1)}" y="${(y(p.value) - 8).toFixed(1)}" class="bar-value" text-anchor="middle">£${p.value.toLocaleString("en-GB")}</text><text x="${(x + w / 2).toFixed(1)}" y="${H - 10}" class="tick" text-anchor="middle">${esc(p.label)}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Monthly money out, June to November 2026"><line x1="${padL}" y1="${y(income).toFixed(1)}" x2="${W - padR}" y2="${y(income).toFixed(1)}" class="income-line"/><text x="${W - padR}" y="${(y(income) - 8).toFixed(1)}" class="income-label" text-anchor="end">income £${income.toLocaleString("en-GB")}</text>${bars}</svg>`;
}
