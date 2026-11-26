// Hearth & Ledger — the data for one household's November 2026 budget.
// A worked example household: Mara & Tom Fern, two adults, one child (age 4,
// nursery). Every figure on the site is computed from these rows, so the
// dashboard, the envelopes, the tracker and the charts can never disagree:
// an envelope's "spent" is the sum of its transactions, the month's totals
// are the sums of the envelopes, and the savings rate is income minus spend.
//
// Figures are a realistic worked example for November 2026, not a real
// household's bank statements. Amounts are pounds, dates are November 2026.

export const household = {
  name: "The Fern household",
  members: "Mara & Tom, and one child (age 4, nursery)",
  month: "November 2026",
  currency: "£",
};

export const income = [
  { source: "Mara — salary (teaching assistant)", amount: 2900 },
  { source: "Tom — salary (delivery driver)", amount: 1950 },
];

// The monthly plan: one envelope per kind of spending. "planned" is the
// amount the household sets aside at the start of the month; "spent" is
// always computed from the transactions below, never typed in twice.
export const envelopes = [
  { slug: "rent-bills", name: "Rent & bills", planned: 1950, note: "Rent, council tax, energy, broadband, phones, insurance." },
  { slug: "groceries", name: "Groceries", planned: 520, note: "Weekly shops, market stall, top-ups." },
  { slug: "transport", name: "Transport", planned: 310, note: "Fuel, train top-ups, parking." },
  { slug: "eating-out", name: "Eating out & fun", planned: 220, note: "Takeaways, café, cinema — the fun money with a lid on it." },
  { slug: "household", name: "Home & clothing", planned: 180, note: "Things for the flat, clothes, pharmacy." },
  { slug: "childcare", name: "Childcare & school", planned: 640, note: "Nursery fees, paid on the 1st." },
  { slug: "savings", name: "Savings", planned: 600, note: "Moved to savings on payday, before anything else." },
  { slug: "buffer", name: "Buffer & treats", planned: 430, note: "The slack that catches birthdays, haircuts and surprises." },
];

// Every transaction in November so far (1–26 November). Category sums:
// rent-bills £1,950 · groceries £386 · transport £244 · eating-out £187 ·
// household £96 · childcare £640 · buffer £212. Total spent £3,715, plus
// £600 moved to savings = £4,315 of the £4,850 income, leaving £535
// unspent across the envelopes.
export const transactions = [
  { date: "2026-11-01", merchant: "Nursery — November fees", category: "childcare", amount: 640.0 },
  { date: "2026-11-01", merchant: "Landlord — rent", category: "rent-bills", amount: 1450.0 },
  { date: "2026-11-01", merchant: "Council tax", category: "rent-bills", amount: 185.0 },
  { date: "2026-11-02", merchant: "Train — monthly top-up", category: "transport", amount: 96.0 },
  { date: "2026-11-02", merchant: "Streaming — monthly", category: "buffer", amount: 13.0 },
  { date: "2026-11-03", merchant: "Tesco — weekly shop", category: "groceries", amount: 86.4 },
  { date: "2026-11-03", merchant: "Energy — direct debit", category: "rent-bills", amount: 165.0 },
  { date: "2026-11-04", merchant: "Fuel — Shell", category: "transport", amount: 62.0 },
  { date: "2026-11-05", merchant: "Broadband — direct debit", category: "rent-bills", amount: 38.0 },
  { date: "2026-11-05", merchant: "Bookshop — birthday present", category: "buffer", amount: 24.0 },
  { date: "2026-11-06", merchant: "Pizza night — takeaway", category: "eating-out", amount: 34.5 },
  { date: "2026-11-07", merchant: "Sainsbury's — weekly shop", category: "groceries", amount: 74.2 },
  { date: "2026-11-08", merchant: "IKEA — storage boxes", category: "household", amount: 54.0 },
  { date: "2026-11-09", merchant: "Café — Mara & a friend", category: "eating-out", amount: 18.2 },
  { date: "2026-11-10", merchant: "Mobiles — both phones", category: "rent-bills", amount: 62.0 },
  { date: "2026-11-11", merchant: "Haircut — Tom", category: "buffer", amount: 38.0 },
  { date: "2026-11-12", merchant: "Tesco — weekly shop", category: "groceries", amount: 92.1 },
  { date: "2026-11-12", merchant: "Home insurance — monthly", category: "rent-bills", amount: 50.0 },
  { date: "2026-11-13", merchant: "Boots — pharmacy", category: "household", amount: 22.4 },
  { date: "2026-11-14", merchant: "Takeaway — Thai", category: "eating-out", amount: 42.0 },
  { date: "2026-11-15", merchant: "Fuel — Shell", category: "transport", amount: 58.0 },
  { date: "2026-11-15", merchant: "Gift — nephew's birthday", category: "buffer", amount: 45.0 },
  { date: "2026-11-16", merchant: "Cinema — snacks", category: "eating-out", amount: 16.8 },
  { date: "2026-11-17", merchant: "Lidl — weekly shop", category: "groceries", amount: 58.6 },
  { date: "2026-11-18", merchant: "Bike repair — Tom's commuter", category: "buffer", amount: 52.0 },
  { date: "2026-11-19", merchant: "Parking — hospital visit", category: "transport", amount: 28.0 },
  { date: "2026-11-20", merchant: "Lunch — work canteen", category: "eating-out", amount: 24.5 },
  { date: "2026-11-21", merchant: "Sainsbury's — weekly shop", category: "groceries", amount: 41.3 },
  { date: "2026-11-22", merchant: "Hardware shop — draught excluder", category: "household", amount: 19.6 },
  { date: "2026-11-23", merchant: "Restaurant — anniversary dinner", category: "eating-out", amount: 51.0 },
  { date: "2026-11-24", merchant: "Market stall — vegetables", category: "groceries", amount: 33.4 },
  { date: "2026-11-25", merchant: "Charity — food bank", category: "buffer", amount: 40.0 },
];

// Savings goals. "saved" is what is in the pot today; "target" is the goal.
// Christmas is finished — the pot is full and the presents are bought.
export const goals = [
  { slug: "cornwall", name: "Holiday in Cornwall", target: 1800, saved: 1240, note: "A week by the sea in July. Train tickets already looked at: £96 return." },
  { slug: "boiler", name: "New boiler fund", target: 900, saved: 410, note: "The old one is 14 years old and rattles. A quote is pinned to the fridge: £880." },
  { slug: "christmas", name: "Christmas", target: 450, saved: 450, note: "Done — every present bought by 20 November, £450 on the nose." },
  { slug: "emergency", name: "Emergency fund", target: 5000, saved: 3150, note: "Three months of rent and bills. The rule: never below £3,000 once it is full." },
];

// Six months of money out, June–November 2026: spending plus the £600
// moved to savings each month. Income is £4,850 every month; August is
// high because of the summer holiday. November is money out so far.
export const trend = [
  { month: "Jun", spent: 4120 },
  { month: "Jul", spent: 4380 },
  { month: "Aug", spent: 4560 },
  { month: "Sep", spent: 4210 },
  { month: "Oct", spent: 4290 },
  { month: "Nov", spent: 4315 },
];

export const MONTH_INCOME = 4850;
