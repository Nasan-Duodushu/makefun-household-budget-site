// Hearth & Ledger — the router and the state. The site is one page with hash
// routes; every control on it works, and every figure is computed from the
// same state object, so a change anywhere shows up everywhere at once.
//
//   #/                dashboard
//   #/plan            monthly plan, with working +/− £10 envelope buttons
//   #/transactions    the tracker: filter, add, delete
//   #/goals           savings goals, with working +£25 / +£100 buttons
//   #/charts          spending by envelope and by month
//   #/about           the method, and where the figures come from
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { household, income, envelopes, transactions, goals, trend, MONTH_INCOME } from "./data.js";
import { dashboard, planPage, transactionsPage, goalsPage, chartsPage, aboutPage, missing } from "./views.js";

const app = document.getElementById("app");

// The state is a copy of the data, so the site can be used — transactions
// added, envelopes adjusted, goals topped up — without rewriting the file
// the figures came from.
const state = {
  income: income.map((i) => ({ ...i })),
  envelopes: envelopes.map((e) => ({ ...e })),
  transactions: transactions.map((t) => ({ ...t })),
  goals: goals.map((g) => ({ ...g })),
  trend: trend.map((t) => ({ ...t })),
  savedThisMonth: 600,
};

let filter = "";

function render() {
  window.__shotReady = false;
  const hash = location.hash || "#/";
  const planMatch = hash === "#/plan";
  const txMatch = hash === "#/transactions";
  const goalsMatch = hash === "#/goals";
  const chartsMatch = hash === "#/charts";
  const aboutMatch = hash === "#/about";
  if (planMatch) {
    document.title = `Monthly plan | ${household.name}`;
    app.innerHTML = planPage(state);
    bindPlan();
  } else if (txMatch) {
    document.title = `Transactions | ${household.name}`;
    app.innerHTML = transactionsPage(state, filter);
    bindTransactions();
  } else if (goalsMatch) {
    document.title = `Savings goals | ${household.name}`;
    app.innerHTML = goalsPage(state);
    bindGoals();
  } else if (chartsMatch) {
    document.title = `Charts | ${household.name}`;
    app.innerHTML = chartsPage(state);
    bindCharts();
  } else if (aboutMatch) {
    document.title = `About | ${household.name}`;
    app.innerHTML = aboutPage();
  } else if (hash === "#/" || hash === "") {
    document.title = `Hearth & Ledger — ${household.month} budget`;
    app.innerHTML = dashboard(state);
  } else {
    document.title = `Not found | ${household.name}`;
    app.innerHTML = missing();
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

// Monthly plan: move £10 between the plan and the unassigned remainder.
// The planned total must stay at or below the income; a +£10 that would
// push the plan over the income is refused with a note.
function bindPlan() {
  app.querySelectorAll("[data-plan]").forEach((button) => {
    button.addEventListener("click", () => {
      const env = state.envelopes.find((e) => e.slug === button.dataset.plan);
      const delta = Number(button.dataset.delta);
      if (!env) return;
      const planned = state.envelopes.reduce((s, e) => s + e.planned, 0);
      if (delta > 0 && planned + delta > MONTH_INCOME) {
        const note = document.querySelector(".plan-total");
        if (note) note.textContent = `That would take the plan over the ${"£" + MONTH_INCOME.toLocaleString("en-GB")} income — take £10 off another envelope first.`;
        return;
      }
      env.planned = Math.max(0, env.planned + delta);
      render();
    });
  });
}

function bindTransactions() {
  const select = document.getElementById("filter");
  if (select) {
    select.addEventListener("change", () => {
      filter = select.value;
      render();
    });
  }
  app.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      const [date, merchant, amount] = button.dataset.delete.split("|");
      const i = state.transactions.findIndex(
        (t) => t.date === date && t.merchant === merchant && String(t.amount) === amount,
      );
      if (i !== -1) state.transactions.splice(i, 1);
      render();
    });
  });
  const form = document.getElementById("add-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const amount = Number(data.get("amount"));
      if (!Number.isFinite(amount) || amount <= 0) return;
      state.transactions.push({
        date: String(data.get("date") || "2026-11-26"),
        merchant: String(data.get("merchant") || "").trim(),
        category: String(data.get("category")),
        amount,
      });
      filter = "";
      render();
    });
  }
}

function bindGoals() {
  app.querySelectorAll("[data-goal]").forEach((button) => {
    button.addEventListener("click", () => {
      const goal = state.goals.find((g) => g.slug === button.dataset.goal);
      if (!goal) return;
      goal.saved = Math.min(goal.target, goal.saved + Number(button.dataset.add));
      render();
    });
  });
  const form = document.getElementById("goal-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const target = Number(data.get("target"));
      const name = String(data.get("name") || "").trim();
      if (!name || !Number.isFinite(target) || target <= 0) return;
      state.goals.push({
        slug: `goal-${Date.now()}`,
        name,
        target: Math.round(target),
        saved: 0,
        note: "A new goal, started today.",
      });
      render();
    });
  }
}

function bindCharts() {
  // The charts are drawn by views.js from the same state; nothing to bind
  // here, but the hook stays so a future range control has a home.
}

window.addEventListener("hashchange", render);
render();
