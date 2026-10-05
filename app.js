const PEOPLE = {
  aaron: { id: "aaron", name: "Aaron", letter: "A" },
  navi: { id: "navi", name: "Navi", letter: "N" }
};

const SWATCHES = ["#2f6fed", "#1f9d55", "#9c3b2e", "#7a4ea3", "#c47b16", "#3d5c4a"];

const DEFAULT_COLORS = { aaron: "#2f6fed", navi: "#1f9d55" };

const BUILTIN = [
  { id: "breakfast", title: "Breakfast", group: "Morning", rule: "daily" },
  { id: "breakfast-clean", title: "Clean up breakfast", group: "Morning", rule: "daily" },
  { id: "walk", title: "Walk the dogs", group: "Morning", rule: "daily" },
  { id: "feed", title: "Feed the dogs", group: "Morning", rule: "daily" },
  { id: "water", title: "Water plants and trees", group: "Morning", rule: "daily" },
  { id: "pack", title: "Pack Aadya's lunch", group: "Morning", rule: "weekdays" },
  { id: "dropoff", title: "Drop off Aadya at school", group: "Morning", rule: "weekdays" },

  { id: "lunch", title: "Lunch", group: "Day", rule: "daily" },
  { id: "lunch-clean", title: "Clean up lunch", group: "Day", rule: "daily" },
  { id: "nap", title: "Ela's nap", group: "Day", rule: "daily" },
  { id: "diapers", title: "Change Ela's diapers", group: "Day", rule: "daily", slots: 3, note: "3 times a day" },
  { id: "piano", title: "Piano practice, 15 minutes", group: "Day", rule: "daily" },
  { id: "math", title: "Aadya math practice", group: "Day", rule: "dows", days: [1, 3, 5], note: "Mon, Wed, Fri" },
  { id: "homework", title: "Aadya homework and spelling", group: "Day", rule: "dows", days: [2, 4], note: "Tue, Thu" },

  { id: "dinner", title: "Dinner", group: "Evening", rule: "daily" },
  { id: "dinner-clean", title: "Clean up dinner", group: "Evening", rule: "daily" },
  { id: "baths", title: "Baths for Aadya and Ela", group: "Evening", rule: "daily" },
  { id: "bed", title: "Bedtime for Aadya and Ela", group: "Evening", rule: "daily" },
  { id: "cleanup", title: "Nightly cleanup", group: "Evening", rule: "daily" },

  { id: "laundry", title: "Laundry", group: "House", rule: "dows", days: [0, 3], note: "Sunday and Wednesday" },
  { id: "groceries", title: "Order groceries", group: "House", rule: "dows", days: [6], note: "Saturday" },
  { id: "mealplan", title: "Meal plan", group: "House", rule: "dows", days: [6], note: "Saturday" },
  { id: "stove", title: "Deep clean stove", group: "House", rule: "dows", days: [6], note: "Saturday" },
  { id: "wipe", title: "Wipe counters", group: "House", rule: "daily", slots: 2, note: "Twice a day" },
  { id: "sink", title: "Clean sink", group: "House", rule: "daily", slots: 2, note: "Twice a day" },
  { id: "playroom", title: "Clean playroom", group: "House", rule: "daily", slots: 2, note: "Twice a day" },
  { id: "vacuum", title: "Vacuum", group: "House", rule: "daily", slots: 2, note: "Twice a day" },
  { id: "irrigation", title: "Repair side yard irrigation", group: "House", rule: "once", date: "2026-10-03", note: "One time" },
  { id: "plan", title: "Plan Aadya's week", group: "House", rule: "dows", days: [0], note: "Sunday" },
  { id: "recycle", title: "Recycling", group: "House", rule: "dows", days: [0, 2, 3, 5], note: "Tue, Wed, Fri, Sun" },
  { id: "teeth", title: "Brush the dogs' teeth", group: "House", rule: "dows", days: [1, 3, 5], note: "Mon, Wed, Fri" },
  { id: "garbage", title: "Take out garbage", group: "House", rule: "dows", days: [1, 4, 6], note: "Mon, Thu, Sat" },
  { id: "costco", title: "Costco", group: "House", rule: "dows", days: [6], note: "Saturday" },
  { id: "beds", title: "Change beds (Aadya, Ela, master)", group: "House", rule: "dows", days: [6], note: "Saturday" },
  { id: "carswipe", title: "Vacuum and wipe the cars", group: "House", rule: "dows", days: [6], note: "Saturday" },
  { id: "carwash", title: "Wash the cars", group: "House", rule: "nthSat", nths: [1, 3], note: "1st and 3rd Saturday" },
  { id: "dogbath", title: "Bathe the dogs", group: "House", rule: "nthSat", nths: [1], note: "1st Saturday" }
];

const GROUPS = ["Morning", "Day", "Evening", "House", "Added"];
const STATE_KEY = "skh-state";

const $ = (sel) => document.querySelector(sel);

let offset = 0;
let mode = "list";
let calCursor = null;
let calSelected = null;

function blankState() {
  return {
    who: "aaron",
    colors: { ...DEFAULT_COLORS },
    assign: {},
    assignAt: {},
    points: {},
    pointsAt: {},
    custom: [],
    checks: {},
    migrated: false
  };
}

function loadState() {
  let state = blankState();
  try {
    const raw = JSON.parse(localStorage.getItem(STATE_KEY) || "null");
    if (raw && typeof raw === "object") state = { ...blankState(), ...raw };
  } catch { /* keep blank */ }
  state.colors = { ...DEFAULT_COLORS, ...(state.colors || {}) };
  state.assign = state.assign || {};
  state.assignAt = state.assignAt || {};
  state.points = state.points || {};
  state.pointsAt = state.pointsAt || {};
  state.custom = Array.isArray(state.custom) ? state.custom : [];
  state.checks = state.checks || {};
  if (!PEOPLE[state.who]) state.who = "aaron";
  if (!state.migrated) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("skh-checks-")) continue;
      const day = key.slice("skh-checks-".length);
      let old = {};
      try { old = JSON.parse(localStorage.getItem(key) || "{}"); } catch { old = {}; }
      state.checks[day] = state.checks[day] || {};
      for (const [id, val] of Object.entries(old)) {
        if (val && typeof val === "object" && PEOPLE[val.by]) state.checks[day][id] = { by: val.by };
        else if (val === true && !state.checks[day][id]) state.checks[day][id] = { by: null };
      }
    }
    state.migrated = true;
    saveState(state);
  }
  return state;
}

function saveState(state, opts) {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
  if (!opts || !opts.silent) schedulePush();
}

let state = loadState();

function allChores() {
  return BUILTIN.concat(state.custom);
}

function localDate(offsetDays) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

function iso(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}

function parseIso(value) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

function nthSaturday(d) {
  if (d.getDay() !== 6) return 0;
  return Math.floor((d.getDate() - 1) / 7) + 1;
}

function due(chore, d) {
  const dow = d.getDay();
  if (chore.rule === "once") return chore.date === iso(d);
  if (chore.rule === "daily") return true;
  if (chore.rule === "weekdays") return dow >= 1 && dow <= 5;
  if (chore.rule === "weekends") return dow === 0 || dow === 6;
  if (chore.rule === "dows") return Array.isArray(chore.days) && chore.days.includes(dow);
  if (chore.rule === "nthSat") {
    const n = nthSaturday(d);
    return n && Array.isArray(chore.nths) && chore.nths.includes(n);
  }
  return false;
}

function pointsFor(chore) {
  const n = Number(state.points[chore.id]);
  if (Number.isFinite(n) && n >= 1) return Math.round(n);
  const own = Number(chore.points);
  if (Number.isFinite(own) && own >= 1) return Math.round(own);
  return 1;
}

function slotCount(chore) {
  const n = Number(chore.slots);
  return Number.isFinite(n) && n > 1 ? Math.round(n) : 1;
}

function slotId(chore, i) {
  return slotCount(chore) === 1 ? chore.id : chore.id + "#" + (i + 1);
}

function slotMark(checks, chore, i) {
  return checks[slotId(chore, i)] || null;
}

function colorFor(personId) {
  return state.colors[personId] || DEFAULT_COLORS[personId] || "#2f5344";
}

function mondayOf(d) {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  return x;
}

function weekPoints(anchor) {
  const start = mondayOf(anchor);
  const totals = { aaron: 0, navi: 0 };
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const checks = state.checks[iso(day)] || {};
    for (const chore of allChores()) {
      if (!due(chore, day)) continue;
      for (let s = 0; s < slotCount(chore); s++) {
        const mark = slotMark(checks, chore, s);
        if (mark && PEOPLE[mark.by]) totals[mark.by] += pointsFor(chore);
      }
    }
  }
  return { start, totals };
}

function repeatNote(chore) {
  if (chore.note) return chore.note;
  if (chore.rule === "once") return "One time";
  if (chore.rule === "daily") return "Every day";
  if (chore.rule === "weekdays") return "Weekdays";
  if (chore.rule === "weekends") return "Weekends";
  if (chore.rule === "nthSat" && chore.nths && chore.nths.length === 1) return "1st Saturday";
  if (chore.rule === "nthSat") return "1st and 3rd Saturday";
  return "";
}

function renderWho() {
  const picks = $("#who-picks");
  picks.innerHTML = "";
  for (const person of Object.values(PEOPLE)) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = person.name;
    btn.setAttribute("aria-pressed", String(state.who === person.id));
    if (state.who === person.id) {
      btn.className = "on";
      btn.style.background = colorFor(person.id);
      btn.style.borderColor = colorFor(person.id);
    }
    btn.addEventListener("click", () => {
      state.who = person.id;
      saveState(state);
      render();
    });
    picks.appendChild(btn);
  }
  const person = PEOPLE[state.who];
  $("#swatch-label").textContent = person.name + "'s check color";
  const box = $("#swatches");
  box.innerHTML = "";
  for (const hex of SWATCHES) {
    const sw = document.createElement("button");
    sw.type = "button";
    sw.style.background = hex;
    sw.setAttribute("aria-label", person.name + " " + hex);
    if (colorFor(person.id).toLowerCase() === hex.toLowerCase()) sw.className = "on";
    sw.addEventListener("click", () => {
      state.colors[person.id] = hex;
      saveState(state);
      render();
    });
    box.appendChild(sw);
  }
}

function renderBoard(anchor) {
  const { start, totals } = weekPoints(anchor);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const ranked = Object.values(PEOPLE)
    .map((p) => ({ ...p, points: totals[p.id] }))
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
  const top = ranked[0] ? ranked[0].points : 0;
  const body = $("#board-body");
  body.innerHTML = "";
  const note = document.createElement("p");
  note.className = "week-note";
  note.textContent = "Monday–Sunday, " + fmt(start) + " – " + fmt(end) + ". Ranked by points.";
  body.appendChild(note);
  ranked.forEach((person, i) => {
    const row = document.createElement("div");
    row.className = "board-row";
    const name = document.createElement("div");
    name.className = "name";
    const label = document.createElement("span");
    label.textContent = (i + 1) + ". " + person.name;
    name.appendChild(label);
    if (top > 0 && person.points === top) {
      const crown = document.createElement("span");
      crown.className = "crown";
      crown.textContent = "👑";
      crown.setAttribute("aria-label", "Leader");
      name.appendChild(crown);
    }
    const pts = document.createElement("span");
    pts.textContent = person.points + (person.points === 1 ? " point" : " points");
    row.appendChild(name);
    row.appendChild(pts);
    body.appendChild(row);
  });
}

function renderChoreList(root, day) {
  const dayIso = iso(day);
  const checks = state.checks[dayIso] || {};
  const items = allChores().filter((c) => due(c, day));
  root.innerHTML = "";
  if (!items.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "Nothing scheduled.";
    root.appendChild(p);
    return items;
  }
  for (const group of GROUPS) {
    const groupItems = items.filter((c) => (c.group || "Added") === group);
    if (!groupItems.length) continue;
    const section = document.createElement("section");
    section.className = "group";
    const h = document.createElement("h2");
    h.textContent = group;
    section.appendChild(h);
    const ul = document.createElement("ul");
    ul.className = "chores";
    for (const chore of groupItems) {
      ul.appendChild(choreRow(chore, dayIso, checks));
    }
    section.appendChild(ul);
    root.appendChild(section);
  }
  return items;
}

function makeCheck(dayIso, chore, checks, index) {
  const mark = slotMark(checks, chore, index);
  const isDone = !!(mark && (mark.by || mark.by === null));
  const by = mark && mark.by;
  const check = document.createElement("button");
  check.type = "button";
  check.className = "check" + (isDone ? " on" : "");
  check.setAttribute("aria-pressed", String(isDone));
  const whoName = by && PEOPLE[by] ? PEOPLE[by].name : PEOPLE[state.who].name;
  const label = slotCount(chore) > 1 ? chore.title + " " + (index + 1) : chore.title;
  check.setAttribute("aria-label", (isDone ? "Mark not done" : "Mark done as " + whoName) + ": " + label);
  if (isDone && PEOPLE[by]) check.style.setProperty("--check", colorFor(by));
  check.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5 6.2 12 13 4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  check.addEventListener("click", () => toggleCheck(dayIso, slotId(chore, index)));
  return check;
}

function choreRow(chore, dayIso, checks) {
  const n = slotCount(chore);
  const marks = [];
  for (let i = 0; i < n; i++) marks.push(slotMark(checks, chore, i));
  const doneMarks = marks.filter((mark) => mark && (mark.by || mark.by === null));
  const isDone = doneMarks.length === n;
  const li = document.createElement("li");
  li.className = "chore" + (isDone ? " done" : "");

  const checksBox = document.createElement("div");
  checksBox.className = "checks";
  for (let i = 0; i < n; i++) checksBox.appendChild(makeCheck(dayIso, chore, checks, i));
  li.appendChild(checksBox);

  const assigned = state.assign[chore.id];
  if (PEOPLE[assigned]) {
    const badge = document.createElement("span");
    badge.className = "letter";
    badge.style.background = colorFor(assigned);
    badge.textContent = PEOPLE[assigned].letter;
    badge.title = "Assigned to " + PEOPLE[assigned].name;
    li.appendChild(badge);
  }

  const main = document.createElement("div");
  main.className = "main";
  const title = document.createElement("div");
  title.className = "title";
  title.textContent = chore.title;
  main.appendChild(title);
  const noteText = repeatNote(chore);
  const bits = [];
  if (noteText) bits.push(noteText);
  bits.push(pointsFor(chore) + (pointsFor(chore) === 1 ? " point" : " points"));
  const names = [...new Set(doneMarks.map((mark) => mark.by).filter((id) => PEOPLE[id]).map((id) => PEOPLE[id].name))];
  if (names.length) bits.push("Checked by " + names.join(" and "));
  const note = document.createElement("span");
  note.className = "note";
  note.textContent = bits.join(" · ");
  main.appendChild(note);

  const controls = document.createElement("div");
  controls.className = "row-controls";
  const assignLabel = document.createElement("label");
  assignLabel.textContent = "Assign ";
  const assign = document.createElement("select");
  assign.setAttribute("aria-label", "Assign " + chore.title);
  for (const [value, label] of [["", "No one"], ["aaron", "Aaron"], ["navi", "Navi"]]) {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = label;
    if ((state.assign[chore.id] || "") === value) opt.selected = true;
    assign.appendChild(opt);
  }
  assign.addEventListener("change", () => {
    if (assign.value) state.assign[chore.id] = assign.value;
    else delete state.assign[chore.id];
    state.assignAt[chore.id] = Date.now();
    saveState(state);
    render();
  });
  assignLabel.appendChild(assign);

  const ptsLabel = document.createElement("label");
  ptsLabel.textContent = "Points ";
  const pts = document.createElement("input");
  pts.type = "number";
  pts.min = "1";
  pts.step = "1";
  pts.value = String(pointsFor(chore));
  pts.setAttribute("aria-label", "Points for " + chore.title);
  pts.addEventListener("change", () => {
    const n = Math.round(Number(pts.value));
    state.points[chore.id] = Number.isFinite(n) && n >= 1 ? n : 1;
    state.pointsAt[chore.id] = Date.now();
    pts.value = String(state.points[chore.id]);
    saveState(state);
    render();
  });
  ptsLabel.appendChild(pts);
  controls.appendChild(assignLabel);
  controls.appendChild(ptsLabel);
  main.appendChild(controls);
  li.appendChild(main);
  return li;
}

function toggleCheck(dayIso, id) {
  const dayChecks = { ...(state.checks[dayIso] || {}) };
  const current = dayChecks[id];
  if (current && current.by === state.who && !current.off) dayChecks[id] = { off: true, t: Date.now() };
  else dayChecks[id] = { by: state.who, t: Date.now() };
  state.checks[dayIso] = dayChecks;
  saveState(state);
  render();
}

function viewedDate() {
  if (mode === "cal" && calSelected) return calSelected;
  return localDate(offset);
}

function renderDaily() {
  const d = localDate(offset);
  const label = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  if (mode === "list") $("#when").textContent = offset === 0 ? "Today, " + label : label;
  $("#jump").hidden = offset === 0;
  const items = renderChoreList($("#list"), d);
  const checks = state.checks[iso(d)] || {};
  let total = 0;
  let done = 0;
  for (const chore of items) {
    total += slotCount(chore);
    for (let i = 0; i < slotCount(chore); i++) {
      const mark = slotMark(checks, chore, i);
      if (mark && mark.by) done += 1;
    }
  }
  $("#count").textContent = done + " of " + total + " done";
  $("#bar").style.width = total ? Math.round((done / total) * 100) + "%" : "0%";
}

function renderCalendar() {
  const cursor = calCursor || localDate(0);
  calCursor = new Date(cursor.getFullYear(), cursor.getMonth(), 1, 12);
  if (!calSelected) calSelected = localDate(offset);
  $("#cal-title").textContent = calCursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const grid = $("#cal-grid");
  grid.innerHTML = "";
  for (const name of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
    const el = document.createElement("div");
    el.className = "cal-dow";
    el.textContent = name;
    grid.appendChild(el);
  }
  const first = new Date(calCursor);
  const lead = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(1 - lead);
  const todayIso = iso(localDate(0));
  const selIso = iso(calSelected);
  for (let i = 0; i < 42; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cal-day";
    if (day.getMonth() !== calCursor.getMonth()) btn.classList.add("out");
    if (iso(day) === todayIso) btn.classList.add("today");
    if (iso(day) === selIso) btn.classList.add("sel");
    btn.textContent = String(day.getDate());
    const checks = state.checks[iso(day)] || {};
    const any = allChores().some((c) => {
      if (!due(c, day)) return false;
      for (let i = 0; i < slotCount(c); i++) {
        const mark = slotMark(checks, c, i);
        if (mark && mark.by) return true;
      }
      return false;
    });
    if (any) {
      const dot = document.createElement("span");
      dot.className = "dot";
      btn.appendChild(dot);
    }
    const picked = new Date(day);
    btn.addEventListener("click", () => {
      calSelected = picked;
      offset = Math.round((picked.getTime() - localDate(0).getTime()) / 86400000);
      render();
    });
    grid.appendChild(btn);
  }
  const heading = calSelected.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  $("#cal-day-heading").textContent = heading;
  $("#when").textContent = heading;
  renderChoreList($("#cal-list"), calSelected);
}

function render() {
  renderWho();
  renderBoard(viewedDate());
  $("#daily").hidden = mode !== "list";
  $("#calendar").hidden = mode !== "cal";
  $("#mode-list").setAttribute("aria-selected", String(mode === "list"));
  $("#mode-cal").setAttribute("aria-selected", String(mode === "cal"));
  if (mode === "list") renderDaily();
  else renderCalendar();
}


const SYNC_URL = "https://script.google.com/macros/s/AKfycbzYHH3wZwtdT2KT2ARLyJ6pYulQDd3F_67-lU-y1_gdrDXQ-y6iCzR_UJUIPd0-cmeE/exec";
const SYNC_CODE = "c576e9b04cc800d9";
const SYNC_CODE_KEY = "skh-sync-code";
let pushTimer = null;
let syncGen = 0;

function syncCode() {
  const params = new URLSearchParams(location.search);
  const fromUrl = params.get("k");
  if (fromUrl) {
    localStorage.setItem(SYNC_CODE_KEY, fromUrl);
    params.delete("k");
    const next = location.pathname + (params.toString() ? "?" + params.toString() : "") + location.hash;
    history.replaceState(null, "", next);
  }
  return localStorage.getItem(SYNC_CODE_KEY) || SYNC_CODE;
}

function setSyncStatus(text) {
  const el = $("#sync-status");
  if (el) el.textContent = text;
}

function stampLocal() {
  let changed = false;
  for (const marks of Object.values(state.checks || {})) {
    for (const mark of Object.values(marks || {})) {
      if (mark && typeof mark === "object" && !mark.t) {
        mark.t = Date.now();
        changed = true;
      }
    }
  }
  if (changed) saveState(state, { silent: true });
}

function schedulePush() {
  syncGen += 1;
  if (!SYNC_URL || !syncCode()) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => { pushSync(); }, 500);
}

function syncSlice() {
  const checks = {};
  for (const [day, marks] of Object.entries(state.checks || {})) {
    checks[day] = {};
    for (const [id, mark] of Object.entries(marks || {})) {
      if (!mark || typeof mark !== "object") continue;
      const t = mark.t || 1;
      checks[day][id] = mark.off ? { off: true, t } : { by: mark.by, t };
    }
  }
  return {
    checks,
    custom: (state.custom || []).map((c) => ({ ...c, t: c.t || 1 })),
    assign: state.assign || {},
    assignAt: state.assignAt || {},
    points: state.points || {},
    pointsAt: state.pointsAt || {}
  };
}

function applyRemote(remote) {
  if (!remote || remote.error) return;
  state.checks = remote.checks || {};
  state.custom = Array.isArray(remote.custom) ? remote.custom : [];
  state.assign = remote.assign || {};
  state.assignAt = remote.assignAt || {};
  state.points = remote.points || {};
  state.pointsAt = remote.pointsAt || {};
  saveState(state, { silent: true });
  render();
}

function jsonp(params) {
  return new Promise((resolve, reject) => {
    const cb = "skh_cb_" + Date.now() + Math.floor(Math.random() * 1000);
    const query = new URLSearchParams({ ...params, callback: cb, code: syncCode() });
    const script = document.createElement("script");
    const timer = setTimeout(() => { cleanup(); reject(new Error("sync timeout")); }, 12000);
    window[cb] = (data) => { cleanup(); resolve(data); };
    function cleanup() {
      clearTimeout(timer);
      try { delete window[cb]; } catch { /* ignore */ }
      script.remove();
    }
    script.onerror = () => { cleanup(); reject(new Error("sync failed")); };
    script.src = SYNC_URL + "?" + query.toString();
    document.head.appendChild(script);
  });
}

function pushSync() {
  if (!SYNC_URL || !syncCode()) return Promise.resolve();
  const gen = syncGen;
  setSyncStatus("Syncing…");
  return jsonp({ op: "push", payload: JSON.stringify(syncSlice()) }).then((remote) => {
    if (!remote || remote.error) {
      setSyncStatus("Not synced");
      return;
    }
    if (gen !== syncGen) return pushSync();
    applyRemote(remote);
    setSyncStatus("Synced");
  }).catch(() => setSyncStatus("Not synced"));
}

function pullSync() {
  if (!SYNC_URL || !syncCode()) return Promise.resolve();
  const gen = syncGen;
  return jsonp({ op: "pull" }).then((remote) => {
    if (!remote || remote.error) {
      setSyncStatus("Not synced");
      return;
    }
    if (gen !== syncGen) return;
    applyRemote(remote);
    setSyncStatus("Synced");
  }).catch(() => setSyncStatus("Not synced"));
}

function boot() {
  $("#prev").addEventListener("click", () => { offset -= 1; render(); });
  $("#next").addEventListener("click", () => { offset += 1; render(); });
  $("#jump").addEventListener("click", () => { offset = 0; render(); });
  $("#mode-list").addEventListener("click", () => { mode = "list"; render(); });
  $("#mode-cal").addEventListener("click", () => {
    mode = "cal";
    calSelected = localDate(offset);
    calCursor = new Date(calSelected.getFullYear(), calSelected.getMonth(), 1, 12);
    render();
  });
  $("#cal-prev").addEventListener("click", () => {
    calCursor = new Date(calCursor.getFullYear(), calCursor.getMonth() - 1, 1, 12);
    render();
  });
  $("#cal-next").addEventListener("click", () => {
    calCursor = new Date(calCursor.getFullYear(), calCursor.getMonth() + 1, 1, 12);
    render();
  });
  $("#back-daily").addEventListener("click", () => {
    if (calSelected) {
      offset = Math.round((calSelected.getTime() - localDate(0).getTime()) / 86400000);
    }
    mode = "list";
    render();
  });
  $("#add-repeat").addEventListener("change", () => {
    $("#add-days").hidden = $("#add-repeat").value !== "dows";
  });
  $("#add").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = $("#add-name").value.trim();
    if (!name) return;
    const points = Math.max(1, Math.round(Number($("#add-points").value) || 1));
    const rule = $("#add-repeat").value;
    const chore = {
      id: "c-" + Date.now(),
      title: name,
      group: "Added",
      rule: rule === "sat1" || rule === "sat13" ? "nthSat" : rule,
      points
    };
    if (rule === "dows") {
      chore.days = [...$("#add-days").querySelectorAll("input:checked")].map((el) => Number(el.value));
      if (!chore.days.length) return;
      chore.rule = "dows";
    }
    if (rule === "once") chore.date = iso(viewedDate());
    if (rule === "sat1") chore.nths = [1];
    if (rule === "sat13") chore.nths = [1, 3];
    chore.t = Date.now();
    state.custom.push(chore);
    state.points[chore.id] = points;
    state.pointsAt[chore.id] = chore.t;
    saveState(state);
    $("#add").reset();
    $("#add-points").value = "1";
    $("#add-days").hidden = true;
    render();
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
  render();
  syncCode();
  stampLocal();
  pushSync();
  setInterval(pullSync, 15000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") pullSync();
  });
}

boot();
