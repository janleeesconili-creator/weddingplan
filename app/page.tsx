"use client";

import { useEffect, useMemo, useState } from "react";

type Expense = { id: number; category: string; item: string; budget: number; actual: number; paid: number; due: string };
type Guest = { id: number; name: string; side: string; table: number; rsvp: "Yes" | "No" | "Pending"; dietary: string };
type Task = { id: number; task: string; category: string; due: string; priority: "High" | "Normal" | "Low"; status: "Not Started" | "In Progress" | "Completed" };

const money = (n: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(n);
const nav = [
  ["dashboard", "⌂", "Dashboard"], ["budget", "₱", "Budget"], ["guests", "♙", "Guest List"],
  ["tasks", "✓", "Task Tracker"], ["calendar", "□", "Calendar"], ["venues", "⌖", "Venues & Vendors"],
  ["seating", "◉", "Seating Plan"], ["checklist", "☑", "Emergency Kit"], ["timeline", "◷", "Wedding Timeline"],
  ["playlist", "♫", "Playlist"], ["outfits", "♢", "Outfits"], ["photos", "▣", "Photography"],
];

const seedExpenses: Expense[] = [
  { id: 1, category: "Venue", item: "Reception venue", budget: 75000, actual: 75000, paid: 40000, due: "2026-08-15" },
  { id: 2, category: "Photography", item: "Photo & video package", budget: 35000, actual: 35000, paid: 0, due: "2026-09-01" },
  { id: 3, category: "Attire", item: "Couple attire", budget: 33000, actual: 33200, paid: 12000, due: "2026-09-20" },
  { id: 4, category: "Beauty", item: "Hair & makeup", budget: 20000, actual: 20000, paid: 5000, due: "2026-10-01" },
  { id: 5, category: "Flowers", item: "Florist & styling", budget: 12000, actual: 12000, paid: 0, due: "2026-10-15" },
];
const seedGuests: Guest[] = [
  { id: 1, name: "Rey Tan", side: "Tim", table: 1, rsvp: "Yes", dietary: "None" },
  { id: 2, name: "Janet Tan", side: "Tim", table: 1, rsvp: "Pending", dietary: "Vegetarian" },
  { id: 3, name: "Kim Tan", side: "Jen", table: 2, rsvp: "Yes", dietary: "None" },
];
const seedTasks: Task[] = [
  { id: 1, task: "Book venue", category: "Venue", due: "2026-07-30", priority: "High", status: "Completed" },
  { id: 2, task: "Select wedding cake", category: "Cake", due: "2026-08-15", priority: "High", status: "In Progress" },
  { id: 3, task: "Finalize guest list", category: "Planning", due: "2026-08-20", priority: "Normal", status: "In Progress" },
  { id: 4, task: "Send save-the-dates", category: "Invitation", due: "2026-09-01", priority: "Normal", status: "Not Started" },
];

function useSaved<T>(key: string, seed: T) {
  const [value, setValue] = useState(seed);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) setValue(JSON.parse(saved));
    setReady(true);
  }, [key]);
  useEffect(() => { if (ready) localStorage.setItem(key, JSON.stringify(value)); }, [key, ready, value]);
  return [value, setValue] as const;
}

export default function Home() {
  const [view, setView] = useState("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [expenses, setExpenses] = useSaved<Expense[]>("ever-after-expenses", seedExpenses);
  const [guests, setGuests] = useSaved<Guest[]>("ever-after-guests", seedGuests);
  const [tasks, setTasks] = useSaved<Task[]>("ever-after-tasks", seedTasks);
  const [budgetGoal, setBudgetGoal] = useSaved("ever-after-budget-goal", 458502);
  const [weddingDate, setWeddingDate] = useSaved("ever-after-date", "2026-11-21");
  const totals = useMemo(() => ({
    budget: expenses.reduce((a, b) => a + b.budget, 0),
    actual: expenses.reduce((a, b) => a + b.actual, 0),
    paid: expenses.reduce((a, b) => a + b.paid, 0),
  }), [expenses]);
  const days = Math.max(0, Math.ceil((new Date(weddingDate).getTime() - Date.now()) / 86400000));
  const title = nav.find(([id]) => id === view)?.[2] ?? "Dashboard";

  return (
    <main className="app-shell">
      <aside className={mobileNav ? "sidebar open" : "sidebar"}>
        <div className="brand"><span className="brand-mark">J&T</span><div><b>Ever After</b><small>Wedding Planner</small></div></div>
        <nav>{nav.map(([id, icon, label]) => <button key={id} className={view === id ? "active" : ""} onClick={() => { setView(id); setMobileNav(false); }}><span>{icon}</span>{label}</button>)}</nav>
        <div className="side-card"><small>WEDDING DAY</small><strong>{days} days</strong><span>{new Date(weddingDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span></div>
      </aside>
      <section className="workspace">
        <header><button className="menu" onClick={() => setMobileNav(!mobileNav)}>☰</button><div><p>JANLEE & TIM</p><h1>{title}</h1></div><div className="save-state"><i /> Saved automatically</div></header>
        <div className="content">
          {view === "dashboard" && <Dashboard totals={totals} goal={budgetGoal} days={days} expenses={expenses} guests={guests} tasks={tasks} go={setView} />}
          {view === "budget" && <Budget expenses={expenses} setExpenses={setExpenses} goal={budgetGoal} setGoal={setBudgetGoal} totals={totals} />}
          {view === "guests" && <Guests guests={guests} setGuests={setGuests} />}
          {view === "tasks" && <Tasks tasks={tasks} setTasks={setTasks} />}
          {view === "calendar" && <Calendar date={weddingDate} setDate={setWeddingDate} tasks={tasks} />}
          {view === "venues" && <Venues />}
          {view === "seating" && <Seating guests={guests} />}
          {view === "checklist" && <Checklist />}
          {view === "timeline" && <Timeline />}
          {view === "playlist" && <Playlist />}
          {view === "outfits" && <Outfits />}
          {view === "photos" && <Photography />}
        </div>
      </section>
    </main>
  );
}

function Dashboard({ totals, goal, days, expenses, guests, tasks, go }: { totals: { budget: number; actual: number; paid: number }; goal: number; days: number; expenses: Expense[]; guests: Guest[]; tasks: Task[]; go: (s: string) => void }) {
  const remaining = goal - totals.actual, outstanding = totals.actual - totals.paid;
  return <div className="stack">
    <section className="hero"><div><span className="eyebrow">THE BIG DAY</span><h2>{days} <em>days to go</em></h2><p>Everything for your celebration, beautifully organized in one place.</p></div><div className="rings">○<span>○</span></div></section>
    <div className="stat-grid">
      <Stat label="Wedding budget" value={money(goal)} note={`${Math.round(totals.actual / goal * 100)}% allocated`} />
      <Stat label="Actual cost" value={money(totals.actual)} note={`${money(remaining)} remaining`} />
      <Stat label="Paid so far" value={money(totals.paid)} note={`${money(outstanding)} outstanding`} />
      <Stat label="Guests attending" value={`${guests.filter(g => g.rsvp === "Yes").length}`} note={`${guests.filter(g => g.rsvp === "Pending").length} awaiting reply`} />
    </div>
    <div className="dashboard-grid">
      <Card title="Budget by category" action="View budget" onAction={() => go("budget")}><Donut percent={Math.min(100, totals.actual / goal * 100)} center={money(remaining)} /><div className="legend">{expenses.slice(0, 5).map((e, i) => <p key={e.id}><i style={{ background: ["#17304f", "#b79260", "#dfc9aa", "#4c3b2f", "#8a735f"][i] }} />{e.category}<b>{money(e.actual)}</b></p>)}</div></Card>
      <Card title="Upcoming payments" action="Manage" onAction={() => go("budget")}><div className="rows">{expenses.filter(e => e.actual > e.paid).slice(0, 4).map(e => <div className="row" key={e.id}><div><b>{e.item}</b><small>Due {e.due || "TBD"}</small></div><strong>{money(e.actual - e.paid)}</strong></div>)}</div></Card>
      <Card title="Planning progress" action="All tasks" onAction={() => go("tasks")}><div className="progress-big"><b>{Math.round(tasks.filter(t => t.status === "Completed").length / tasks.length * 100)}%</b><span>complete</span></div><div className="progress"><i style={{ width: `${tasks.filter(t => t.status === "Completed").length / tasks.length * 100}%` }} /></div><div className="task-mini">{tasks.slice(0, 3).map(t => <p key={t.id}><span className={t.status === "Completed" ? "done" : ""}>✓</span>{t.task}<small>{t.status}</small></p>)}</div></Card>
      <Card title="RSVP overview" action="Guest list" onAction={() => go("guests")}><div className="rsvp"><div><b>{guests.filter(g => g.rsvp === "Yes").length}</b><span>Attending</span></div><div><b>{guests.filter(g => g.rsvp === "Pending").length}</b><span>Pending</span></div><div><b>{guests.filter(g => g.rsvp === "No").length}</b><span>Declined</span></div></div><Donut percent={guests.length ? guests.filter(g => g.rsvp === "Yes").length / guests.length * 100 : 0} center={`${guests.length} guests`} /></Card>
    </div>
  </div>;
}

function Budget({ expenses, setExpenses, goal, setGoal, totals }: { expenses: Expense[]; setExpenses: (x: Expense[]) => void; goal: number; setGoal: (n: number) => void; totals: { budget: number; actual: number; paid: number } }) {
  const add = () => setExpenses([...expenses, { id: Date.now(), category: "Other", item: "New expense", budget: 0, actual: 0, paid: 0, due: "" }]);
  const update = (id: number, field: keyof Expense, value: string | number) => setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: value } : e));
  return <div className="stack"><div className="page-lead"><div><span className="eyebrow">MONEY, MADE SIMPLE</span><h2>Wedding Budget</h2><p>Track every peso—from first deposit to final payment.</p></div><button className="primary" onClick={add}>＋ Add expense</button></div>
    <div className="stat-grid"><Stat label="Target budget" value={money(goal)} note="Tap to edit" editable={goal} onEdit={setGoal} /><Stat label="Planned" value={money(totals.budget)} note={`${money(goal - totals.budget)} unallocated`} /><Stat label="Actual cost" value={money(totals.actual)} note={`${Math.round(totals.actual / goal * 100)}% of budget`} /><Stat label="Outstanding" value={money(totals.actual - totals.paid)} note={`${money(totals.paid)} paid`} /></div>
    <Card title="Expense tracker"><div className="table-wrap"><table><thead><tr><th>Category</th><th>Description</th><th>Budget</th><th>Actual</th><th>Paid</th><th>Balance</th><th>Due</th><th /></tr></thead><tbody>{expenses.map(e => <tr key={e.id}><td><input value={e.category} onChange={x => update(e.id, "category", x.target.value)} /></td><td><input value={e.item} onChange={x => update(e.id, "item", x.target.value)} /></td>{(["budget", "actual", "paid"] as const).map(f => <td key={f}><input type="number" value={e[f]} onChange={x => update(e.id, f, +x.target.value)} /></td>)}<td className="money">{money(e.actual - e.paid)}</td><td><input type="date" value={e.due} onChange={x => update(e.id, "due", x.target.value)} /></td><td><button className="delete" onClick={() => setExpenses(expenses.filter(x => x.id !== e.id))}>×</button></td></tr>)}</tbody></table></div></Card></div>;
}

function Guests({ guests, setGuests }: { guests: Guest[]; setGuests: (g: Guest[]) => void }) {
  const update = (id: number, f: keyof Guest, v: string | number) => setGuests(guests.map(g => g.id === id ? { ...g, [f]: v } : g));
  return <div className="stack"><div className="page-lead"><div><span className="eyebrow">YOUR FAVORITE PEOPLE</span><h2>Guest List</h2><p>RSVPs, dietary needs, and table assignments in one view.</p></div><button className="primary" onClick={() => setGuests([...guests, { id: Date.now(), name: "New guest", side: "Both", table: 1, rsvp: "Pending", dietary: "None" }])}>＋ Add guest</button></div>
    <div className="stat-grid"><Stat label="Total guests" value={`${guests.length}`} note="Invited" /><Stat label="Attending" value={`${guests.filter(g => g.rsvp === "Yes").length}`} note="Confirmed" /><Stat label="Awaiting reply" value={`${guests.filter(g => g.rsvp === "Pending").length}`} note="Follow up" /><Stat label="Declined" value={`${guests.filter(g => g.rsvp === "No").length}`} note="Not attending" /></div>
    <Card title="Invitation list"><div className="table-wrap"><table><thead><tr><th>Guest</th><th>Side</th><th>RSVP</th><th>Dietary</th><th>Table</th><th /></tr></thead><tbody>{guests.map(g => <tr key={g.id}><td><input value={g.name} onChange={e => update(g.id, "name", e.target.value)} /></td><td><input value={g.side} onChange={e => update(g.id, "side", e.target.value)} /></td><td><select value={g.rsvp} onChange={e => update(g.id, "rsvp", e.target.value)}><option>Pending</option><option>Yes</option><option>No</option></select></td><td><input value={g.dietary} onChange={e => update(g.id, "dietary", e.target.value)} /></td><td><input type="number" value={g.table} onChange={e => update(g.id, "table", +e.target.value)} /></td><td><button className="delete" onClick={() => setGuests(guests.filter(x => x.id !== g.id))}>×</button></td></tr>)}</tbody></table></div></Card></div>;
}

function Tasks({ tasks, setTasks }: { tasks: Task[]; setTasks: (t: Task[]) => void }) {
  const update = (id: number, f: keyof Task, v: string) => setTasks(tasks.map(t => t.id === id ? { ...t, [f]: v } : t));
  return <div className="stack"><div className="page-lead"><div><span className="eyebrow">ONE STEP AT A TIME</span><h2>Task Tracker</h2><p>Keep every detail moving toward “I do.”</p></div><button className="primary" onClick={() => setTasks([...tasks, { id: Date.now(), task: "New task", category: "Planning", due: "", priority: "Normal", status: "Not Started" }])}>＋ Add task</button></div>
    <Card title={`${tasks.filter(t => t.status !== "Completed").length} open tasks`}><div className="table-wrap"><table><thead><tr><th>Task</th><th>Category</th><th>Due date</th><th>Priority</th><th>Status</th><th /></tr></thead><tbody>{tasks.map(t => <tr key={t.id}><td><input value={t.task} onChange={e => update(t.id, "task", e.target.value)} /></td><td><input value={t.category} onChange={e => update(t.id, "category", e.target.value)} /></td><td><input type="date" value={t.due} onChange={e => update(t.id, "due", e.target.value)} /></td><td><select value={t.priority} onChange={e => update(t.id, "priority", e.target.value)}><option>High</option><option>Normal</option><option>Low</option></select></td><td><select value={t.status} onChange={e => update(t.id, "status", e.target.value)}><option>Not Started</option><option>In Progress</option><option>Completed</option></select></td><td><button className="delete" onClick={() => setTasks(tasks.filter(x => x.id !== t.id))}>×</button></td></tr>)}</tbody></table></div></Card></div>;
}

function Calendar({ date, setDate, tasks }: { date: string; setDate: (d: string) => void; tasks: Task[] }) {
  return <div className="stack"><div className="page-lead"><div><span className="eyebrow">SAVE THE DATE</span><h2>Wedding Calendar</h2><p>See the milestones that matter most.</p></div><label className="date-control">Wedding date<input type="date" value={date} onChange={e => setDate(e.target.value)} /></label></div><Card title="Upcoming schedule"><div className="agenda">{tasks.filter(t => t.due).sort((a,b) => a.due.localeCompare(b.due)).map(t => <div key={t.id}><time>{new Date(t.due + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</time><span><b>{t.task}</b><small>{t.category} · {t.status}</small></span></div>)}</div></Card></div>;
}

function Venues() { return <SimplePage eyebrow="FIND THE PERFECT TEAM" title="Venues & Vendors" subtitle="Compare options, then keep your chosen suppliers close."><div className="compare-grid">{["Lolita's Events Place", "Alessia Garden", "Bonnie's Events"].map((x, i) => <article key={x}><span className="chip">{i === 0 ? "SELECTED" : "OPTION"}</span><h3>{x}</h3><p>{["San Mateo, Rizal", "San Juan", "Quezon City"][i]}</p><hr/><p>Capacity <b>{[100,100,120][i]} guests</b></p><p>Package <b>{money([66000,80000,75000][i])}</b></p><button className="secondary">{i === 0 ? "Selected ✓" : "View details"}</button></article>)}</div></SimplePage> }
function Seating({ guests }: { guests: Guest[] }) { const tables = Array.from({length: Math.max(6, ...guests.map(g => g.table))},(_,i)=>i+1); return <SimplePage eyebrow="EVERYONE HAS A PLACE" title="Seating Plan" subtitle="Table assignments update automatically from your guest list."><div className="seat-grid">{tables.map(n => <article key={n}><h3>Table {n}</h3>{guests.filter(g => g.table === n).map(g => <p key={g.id}>{g.name}<small>{g.rsvp}</small></p>)}{!guests.some(g => g.table === n) && <span className="empty">No guests assigned</span>}</article>)}</div></SimplePage> }

const modules: Record<string, { eyebrow: string; title: string; subtitle: string; groups: [string, string[]][] }> = {
  checklist: { eyebrow: "READY FOR ANYTHING", title: "Emergency Checklist", subtitle: "A calm, prepared wedding day starts here.", groups: [["Essentials", ["Wedding rings", "Vows", "Bible", "Wedding essentials"]], ["Beauty & fashion", ["Bride jewelry", "Bride shoes", "Fashion tape", "Hair pins", "Mini sewing kit"]], ["Wellness kit", ["Band-aids", "Tissues", "Pain medicine", "Eye drops", "Bug repellent"]], ["Miscellaneous", ["Stain remover", "Mints", "Snacks", "Phone charger", "Safety pins"]]] },
  timeline: { eyebrow: "THE BIG DAY", title: "Wedding Timeline", subtitle: "Keep the celebration running beautifully on time.", groups: [["Morning", ["8:00 AM · Hair & makeup", "10:30 AM · Photographer arrives", "11:30 AM · Getting-ready photos"]], ["Ceremony", ["2:00 PM · Guests arrive", "2:30 PM · Processional", "3:00 PM · Ceremony"]], ["Reception", ["5:00 PM · Couple entrance", "6:00 PM · Dinner", "7:00 PM · First dance"]]] },
  playlist: { eyebrow: "THE SOUNDTRACK TO YOUR DAY", title: "Wedding Playlist", subtitle: "Plan every meaningful song and joyful dance.", groups: [["Ceremony", ["Beautiful Savior", "Can't Help Falling in Love", "Until I Found You"]], ["Reception", ["Forevermore", "Ben & Ben", "Palagi"]], ["Special moments", ["Couple entrance", "First dance", "Cake cutting", "Slow dance"]]] },
  outfits: { eyebrow: "DRESSED FOR FOREVER", title: "Outfit Details", subtitle: "Fittings, alterations, accessories, and inspiration.", groups: [["Jen", ["Final fitting", "Shoes", "Veil", "Accessories"]], ["Tim", ["Final fitting", "Suit", "Shoes", "Accessories"]], ["Wedding party", ["Bridesmaids", "Groomsmen", "Parents"]]] },
  photos: { eyebrow: "MEMORIES IN THE MAKING", title: "Photography Plan", subtitle: "Build the shot list you will treasure for years.", groups: [["Getting ready", ["Dress & details", "Bride with family", "Groom with family"]], ["Ceremony", ["Processional", "Ring exchange", "First kiss"]], ["Portraits", ["Couple portraits", "Wedding party", "Golden hour"]], ["Reception", ["Entrance", "First dance", "Speeches", "Cake cutting"]]] },
};
function Checklist(){ return <ModulePage name="checklist" /> } function Timeline(){ return <ModulePage name="timeline" /> } function Playlist(){ return <ModulePage name="playlist" /> } function Outfits(){ return <ModulePage name="outfits" /> } function Photography(){ return <ModulePage name="photos" /> }
function ModulePage({ name }: { name: string }) { const m = modules[name]; const [checks, setChecks] = useSaved<Record<string, boolean>>(`ever-after-${name}`, {}); return <SimplePage eyebrow={m.eyebrow} title={m.title} subtitle={m.subtitle}><div className="module-grid">{m.groups.map(([group, items]) => <Card key={group} title={group}>{items.map(item => <label className="check" key={item}><input type="checkbox" checked={!!checks[item]} onChange={e => setChecks({...checks,[item]:e.target.checked})}/><span>{item}</span></label>)}</Card>)}</div></SimplePage> }

function SimplePage({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children: React.ReactNode }) { return <div className="stack"><div className="page-lead"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{subtitle}</p></div></div>{children}</div> }
function Stat({ label, value, note, editable, onEdit }: { label: string; value: string; note: string; editable?: number; onEdit?: (n: number) => void }) { return <div className="stat"><span>{label}</span>{editable !== undefined ? <input aria-label={label} type="number" value={editable} onChange={e => onEdit?.(+e.target.value)} /> : <b>{value}</b>}<small>{note}</small></div> }
function Card({ title, action, onAction, children }: { title: string; action?: string; onAction?: () => void; children: React.ReactNode }) { return <section className="card"><div className="card-head"><h3>{title}</h3>{action && <button onClick={onAction}>{action} →</button>}</div>{children}</section> }
function Donut({ percent, center }: { percent: number; center: string }) { return <div className="donut" style={{ background: `conic-gradient(#17304f 0 ${percent}%, #dfc9aa ${percent}% 100%)` }}><div>{center}</div></div> }
