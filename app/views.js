// HTML for each page, built from the household data. Every value is escaped
// before it goes into the page, and every figure is computed from the state
// passed in — the dashboard, the plan, the tracker and the charts all read
// the same numbers, so they can never disagree.

import { donutChart, barChart } from "./charts.js";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
const gbp = (n) =>
  "£" + Math.round(n).toLocaleString("en-GB");
const gbp2 = (n) =>
  "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function fmtDate(iso) {
  const [, m, d] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d} ${months[m - 1]}`;
}

// Spent in an envelope: the sum of its transactions — except savings, which
// is the amount moved to savings on payday (there is no transaction for it).
export function spentFor(state, slug) {
  if (slug === "savings") return state.savedThisMonth;
  return state.transactions
    .filter((t) => t.category === slug)
    .reduce((sum, t) => sum + t.amount, 0);
}

function envelopeBar(state, env) {
  const spent = spentFor(state, env.slug);
  const pct = env.planned === 0 ? 0 : Math.min(100, Math.round((spent / env.planned) * 100));
  const left = env.planned - spent;
  const over = left < 0;
  return `<div class="env-row">
  <div class="env-head"><span class="env-name">${esc(env.name)}</span><span class="env-nums">${gbp(spent)} of ${gbp(env.planned)}</span></div>
  <div class="bar-track"><div class="bar-fill${over ? " over" : ""}" style="width:${pct}%"></div></div>
  <div class="env-foot"><span>${pct}% used</span><span class="${over ? "over-text" : ""}">${over ? `${gbp(-left)} over plan` : `${gbp(left)} left`}</span></div>
</div>`;
}

function nav(active) {
  const links = [
    ["#/", "Dashboard"],
    ["#/plan", "Monthly plan"],
    ["#/transactions", "Transactions"],
    ["#/goals", "Savings goals"],
    ["#/charts", "Charts"],
    ["#/about", "About"],
  ];
  return `<nav>${links.map(([href, label]) => `<a href="${href}"${href === active ? ' aria-current="page"' : ""}>${label}</a>`).join("")}</nav>`;
}

export function dashboard(state) {
  const income = state.income.reduce((s, i) => s + i.amount, 0);
  const spent = state.envelopes
    .filter((e) => e.slug !== "savings")
    .reduce((s, e) => s + spentFor(state, e.slug), 0);
  const left = income - spent - state.savedThisMonth;
  const recent = [...state.transactions].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);
  return `${nav("#/")}
<h1>November, on track.</h1>
<p class="lede">Mara &amp; Tom Fern, two adults and one four-year-old. Take-home pay <strong>${gbp(income)}</strong> a month, planned to the pound before the month begins — and so far, the plan is holding.</p>
<section class="stats">
  <div class="stat"><span class="stat-label">Income</span><span class="stat-value">${gbp(income)}</span><span class="stat-note">two salaries, paid on the 28th</span></div>
  <div class="stat"><span class="stat-label">Spent so far</span><span class="stat-value">${gbp(spent)}</span><span class="stat-note">26 November, of ${gbp(income - state.savedThisMonth)} planned</span></div>
  <div class="stat"><span class="stat-label">Moved to savings</span><span class="stat-value">${gbp(state.savedThisMonth)}</span><span class="stat-note">on payday, before anything else</span></div>
  <div class="stat highlight"><span class="stat-label">Left to spend</span><span class="stat-value">${gbp(left)}</span><span class="stat-note">across the envelopes, four days left</span></div>
</section>
<section class="two-col">
  <div>
    <h2>Envelopes at a glance</h2>
    ${state.envelopes.map((e) => envelopeBar(state, e)).join("")}
    <p><a href="#/plan">See the full monthly plan &rarr;</a></p>
  </div>
  <div>
    <h2>Savings goals</h2>
    ${state.goals.map((g) => goalCard(state, g, false)).join("")}
    <p><a href="#/goals">All savings goals &rarr;</a></p>
    <h2>Latest spending</h2>
    <ul class="recent">${recent.map((t) => `<li><span>${fmtDate(t.date)} — ${esc(t.merchant)}</span><span>${gbp2(t.amount)}</span></li>`).join("")}</ul>
    <p><a href="#/transactions">All ${state.transactions.length} transactions &rarr;</a></p>
  </div>
</section>`;
}

export function planPage(state) {
  const income = state.income.reduce((s, i) => s + i.amount, 0);
  const planned = state.envelopes.reduce((s, e) => s + e.planned, 0);
  return `${nav("#/plan")}
<h1>The monthly plan</h1>
<p class="lede">Every pound of the <strong>${gbp(income)}</strong> take-home pay has a job before the month starts. Tap <strong>−£10</strong> or <strong>+£10</strong> to move money between envelopes — the totals below update at once, and the plan always has to add up to the income.</p>
<section class="plan-grid">
${state.envelopes
  .map((e) => {
    const spent = spentFor(state, e.slug);
    const left = e.planned - spent;
    const pct = e.planned === 0 ? 0 : Math.min(100, Math.round((spent / e.planned) * 100));
    return `<article class="plan-card">
  <h2>${esc(e.name)}</h2>
  <p class="plan-note">${esc(e.note)}</p>
  <p class="plan-big">${gbp(spent)} <span class="muted">spent of</span> ${gbp(e.planned)} <span class="muted">planned</span></p>
  <div class="bar-track"><div class="bar-fill${left < 0 ? " over" : ""}" style="width:${pct}%"></div></div>
  <p class="plan-left ${left < 0 ? "over-text" : ""}">${left < 0 ? `${gbp(-left)} over plan` : `${gbp(left)} left in this envelope`}</p>
  <p class="plan-buttons"><button type="button" data-plan="${esc(e.slug)}" data-delta="-10">− £10</button><button type="button" data-plan="${esc(e.slug)}" data-delta="10">+ £10</button></p>
</article>`;
  })
  .join("")}
</section>
<p class="plan-total">Planned in total: <strong>${gbp(planned)}</strong> — ${planned === income ? "exactly the income. Nothing unassigned." : planned < income ? `${gbp(income - planned)} still unassigned.` : `${gbp(planned - income)} over the income — move some back.`}</p>
<h2>Where the income comes from</h2>
<ul class="income-list">${state.income.map((i) => `<li><span>${esc(i.source)}</span><span>${gbp(i.amount)}</span></li>`).join("")}</ul>`;
}

export function transactionsPage(state, filter) {
  const cats = state.envelopes.filter((e) => e.slug !== "savings");
  const rows = [...state.transactions]
    .filter((t) => !filter || t.category === filter)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const total = rows.reduce((s, t) => s + t.amount, 0);
  return `${nav("#/transactions")}
<h1>Transactions</h1>
<p class="lede">Every pound that left the account in November, newest first. Add one below and the envelopes, the dashboard and the charts all update — delete a mistake the same way.</p>
<form id="filter-form" class="filter-row">
  <label for="filter">Show</label>
  <select id="filter" name="filter">
    <option value="">All categories</option>
    ${cats.map((c) => `<option value="${esc(c.slug)}"${filter === c.slug ? " selected" : ""}>${esc(c.name)}</option>`).join("")}
  </select>
  <span class="filter-total">${rows.length} transactions · ${gbp2(total)}</span>
</form>
<table class="tx">
  <thead><tr><th>Date</th><th>What</th><th>Envelope</th><th class="num">Amount</th><th></th></tr></thead>
  <tbody>
  ${rows
    .map((t) => {
      const env = state.envelopes.find((e) => e.slug === t.category);
      return `<tr><td>${fmtDate(t.date)}</td><td>${esc(t.merchant)}</td><td>${esc(env ? env.name : t.category)}</td><td class="num">${gbp2(t.amount)}</td><td><button type="button" class="delete" data-delete="${esc(t.date)}|${esc(t.merchant)}|${t.amount}">Delete</button></td></tr>`;
    })
    .join("")}
  </tbody>
</table>
<h2>Add a transaction</h2>
<form id="add-form" class="add-form">
  <label>Date <input type="date" name="date" value="2026-11-26" required></label>
  <label>What <input type="text" name="merchant" placeholder="e.g. Tesco — weekly shop" required></label>
  <label>Envelope <select name="category">${cats.map((c) => `<option value="${esc(c.slug)}">${esc(c.name)}</option>`).join("")}</select></label>
  <label>Amount (£) <input type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required></label>
  <button type="submit">Add transaction</button>
</form>
<p class="muted">Adding a transaction changes the envelope it belongs to everywhere on the site — that is the point of the tracker.</p>`;
}

function goalCard(state, g, withButtons) {
  const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
  const done = g.saved >= g.target;
  return `<article class="goal-card">
  <h3>${esc(g.name)}</h3>
  <p class="goal-note">${esc(g.note)}</p>
  <p class="goal-big">${gbp(g.saved)} <span class="muted">of</span> ${gbp(g.target)}</p>
  <div class="bar-track"><div class="bar-fill${done ? " done" : ""}" style="width:${pct}%"></div></div>
  <p class="goal-pct">${done ? "Goal reached — well done." : `${pct}% there · ${gbp(g.target - g.saved)} to go`}</p>
  ${withButtons && !done ? `<p class="plan-buttons"><button type="button" data-goal="${esc(g.slug)}" data-add="25">+ £25</button><button type="button" data-goal="${esc(g.slug)}" data-add="100">+ £100</button></p>` : ""}
</article>`;
}

export function goalsPage(state) {
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  return `${nav("#/goals")}
<h1>Savings goals</h1>
<p class="lede">Four pots, each with a job and a date. <strong>${gbp(totalSaved)}</strong> saved across them, of <strong>${gbp(totalTarget)}</strong> in targets. The £600 moved to savings this month is split between the pots on payday — add to a pot below and watch its bar move.</p>
<section class="plan-grid">
${state.goals.map((g) => goalCard(state, g, true)).join("")}
</section>
<h2>Start a new goal</h2>
<form id="goal-form" class="add-form">
  <label>Goal <input type="text" name="name" placeholder="e.g. New sofa" required></label>
  <label>Target (£) <input type="number" name="target" min="1" step="1" placeholder="500" required></label>
  <button type="submit">Add goal</button>
</form>
<p class="muted">A new goal starts at £0. The emergency fund is the one pot the household never borrows from.</p>`;
}

export function chartsPage(state) {
  const slices = state.envelopes
    .filter((e) => e.slug !== "savings")
    .map((e) => ({ label: e.name, value: spentFor(state, e.slug) }));
  const spentTotal = slices.reduce((s, x) => s + x.value, 0);
  const income = state.income.reduce((s, i) => s + i.amount, 0);
  const best = [...state.trend].sort((a, b) => a.spent - b.spent)[0];
  const worst = [...state.trend].sort((a, b) => b.spent - a.spent)[0];
  return `${nav("#/charts")}
<h1>Where the money went</h1>
<p class="lede">Two pictures of the same month: the envelopes, and the last six months side by side. The dashed line is the income — everything under it is money out; the gap above each bar is what stayed in the account.</p>
<h2>Spending by envelope — November</h2>
${donutChart(slices, gbp(spentTotal))}
<p>Rent &amp; bills is the biggest slice, as it should be: the fixed costs are paid first and the rest of the month works around them. Groceries are the second slice at ${gbp(spentFor(state, "groceries"))} — four weekly shops and a market stall. That is ${gbp(spentTotal)} spent, plus the ${gbp(state.savedThisMonth)} moved to savings: ${gbp(spentTotal + state.savedThisMonth)} out in total.</p>
<h2>Money out by month — June to November</h2>
${barChart(state.trend.map((t) => ({ label: t.month, value: t.spent })), income)}
<p>${worst.month} was the most expensive month (${gbp(worst.spent)}) — the summer holiday. ${best.month} was the cheapest (${gbp(best.spent)}). November's ${gbp(state.trend[5].spent)} is ordinary for this household: nothing in it is a surprise, which is the whole point of the plan.</p>`;
}

export function aboutPage() {
  return `${nav("#/about")}
<h1>How this household budgets</h1>
<p class="lede">Hearth &amp; Ledger is a worked example: one household, one month, every figure shown and every figure adding up. It exists so a household can see what envelope budgeting actually looks like with real numbers in it.</p>
<h2>The envelope method</h2>
<p>On payday, the whole take-home pay is divided into envelopes — one per kind of spending — before anything is spent. Rent and bills first, then groceries, transport, childcare and savings. What is left is the fun money and the buffer. When an envelope is empty, spending in that kind stops until next month; the buffer is the only envelope allowed to lend to another, and it has to be paid back.</p>
<h2>Three rules this household keeps</h2>
<ol class="rules">
  <li><strong>Pay yourself first.</strong> £600 moves to savings on payday, before the shops open. Savings is an envelope, not whatever happens to be left.</li>
  <li><strong>One number, everywhere.</strong> A transaction is entered once and counted once — the dashboard, the plan, the tracker and the charts all read the same rows.</li>
  <li><strong>Small is still a plan.</strong> A £13 streaming subscription and a £40 food-bank gift sit in the same table as the £1,450 rent. The plan only works if nothing is too small to write down.</li>
</ol>
<h2>About the figures</h2>
<p>The Fern household is invented, and its November 2026 figures are a worked example, not a real family's bank statements. They are realistic for a two-income household with a nursery-age child: take-home pay £4,850, rent £1,450, nursery £640, groceries about £520 planned. Every total on the site is computed from the transaction list, so the figures reconcile to the pound.</p>
<p><a href="#/">&larr; Back to the dashboard</a></p>`;
}

export function missing() {
  return `${nav("#/")}
<h1>Not found</h1>
<p>There is no page at this address. <a href="#/">Back to the dashboard</a>.</p>`;
}
