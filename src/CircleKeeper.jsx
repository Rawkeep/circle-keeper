import { useState, useEffect, useCallback, useMemo } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "inner", label: "Innerer Kreis", emoji: "✦", color: "#D4644A", bg: "#FFF0EC", desc: "Familie & Engste" },
  { id: "close", label: "Enge Freunde", emoji: "◈", color: "#E8A849", bg: "#FFF8EC", desc: "Die du nicht verlieren willst" },
  { id: "network", label: "Netzwerk", emoji: "◇", color: "#5B8A72", bg: "#EDFAF3", desc: "Kollegen & Mentoren" },
  { id: "dormant", label: "Schlafend", emoji: "○", color: "#8B8B9E", bg: "#F3F3F8", desc: "Eingeschlafene Kontakte" },
];

const ROLES = [
  { id: "personal", label: "Persönlich", icon: "♡", color: "#E8A849" },
  { id: "key_account", label: "Key Account", icon: "★", color: "#D4644A" },
  { id: "client", label: "Kunde", icon: "◆", color: "#5B8A72" },
  { id: "prospect", label: "Interessent", icon: "◇", color: "#7B9EC4" },
  { id: "mentor", label: "Mentor", icon: "▲", color: "#9B7EC4" },
  { id: "colleague", label: "Kollege", icon: "■", color: "#6B8A9E" },
  { id: "partner", label: "Partner/Dienstleister", icon: "◎", color: "#8B7E74" },
];

const REACH_ACTIONS = [
  { id: "call", label: "Anrufen", icon: "📞", effort: 3 },
  { id: "text", label: "Schreiben", icon: "💬", effort: 1 },
  { id: "meet", label: "Treffen", icon: "☕", effort: 4 },
  { id: "gift", label: "Überraschen", icon: "🎁", effort: 3 },
  { id: "voice", label: "Sprachnachricht", icon: "🎙️", effort: 2 },
  { id: "react", label: "Reagieren/Liken", icon: "👍", effort: 0 },
  { id: "email", label: "E-Mail", icon: "📧", effort: 2 },
  { id: "video", label: "Videocall", icon: "🖥️", effort: 3 },
];

const INCOMING_ACTIONS = [
  { id: "in_call", label: "Hat angerufen", icon: "📲" },
  { id: "in_text", label: "Hat geschrieben", icon: "💌" },
  { id: "in_meet", label: "Hat Treffen vorgeschlagen", icon: "🤝" },
  { id: "in_email", label: "Hat gemailt", icon: "📨" },
  { id: "in_social", label: "Social Media Interaktion", icon: "📱" },
  { id: "in_gift", label: "Hat etwas geschickt", icon: "🎀" },
];

const FREQUENCY_OPTIONS = [
  { id: "weekly", label: "Wöchentlich", days: 7 },
  { id: "biweekly", label: "Alle 2 Wochen", days: 14 },
  { id: "monthly", label: "Monatlich", days: 30 },
  { id: "quarterly", label: "Quartalsweise", days: 90 },
  { id: "halfyearly", label: "Halbjährlich", days: 180 },
  { id: "yearly", label: "Jährlich", days: 365 },
];

const ENERGY_LEVELS = [
  { id: "high", label: "Volle Energie", emoji: "⚡", color: "#4CAF50", desc: "Bereit für alles" },
  { id: "medium", label: "Okay", emoji: "◐", color: "#FFC107", desc: "Leichte Kontakte möglich" },
  { id: "low", label: "Brauche Ruhe", emoji: "◑", color: "#FF9800", desc: "Nur Minimales" },
  { id: "recharge", label: "Aufladen", emoji: "○", color: "#8B8B9E", desc: "Nur wenn es sein muss" },
];

const TAGS = [
  "VIP", "Follow-up", "Geburtstag bald", "Projekt", "Empfehlung",
  "Intro nötig", "Dankbar", "Offen", "Warten auf Antwort", "Idee teilen",
];

const CONVERSATION_TOPICS = [
  "Projekt-Update", "Persönliches", "Business-Idee", "Empfehlung",
  "Feedback", "Kennenlernen", "Nachfassen", "Geburtstag/Anlass",
  "Problem lösen", "Strategie", "Small Talk", "Tiefes Gespräch",
];

const EMOJIS = ["😊","🌸","🔥","💎","🦋","🌙","⭐","🌊","🎯","🎵","🍀","🌺","🐝","🦊","🌻","🍂","💼","🏢","🤝","🎓","👔","📊","🚀","💡"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function daysSince(dateStr) {
  if (!dateStr) return 999;
  return Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
}

function daysUntil(dateStr) {
  if (!dateStr) return 999;
  const d = new Date(dateStr);
  const now = new Date();
  const thisYear = new Date(now.getFullYear(), d.getMonth(), d.getDate());
  if (thisYear < now) thisYear.setFullYear(now.getFullYear() + 1);
  return Math.floor((thisYear - now) / (1000 * 60 * 60 * 24));
}

function getWarmth(lastContact, frequencyDays) {
  const days = daysSince(lastContact);
  if (days <= frequencyDays * 0.5) return { level: "thriving", label: "Blüht", pct: 100, color: "#4CAF50" };
  if (days <= frequencyDays * 0.8) return { level: "good", label: "Gut", pct: 75, color: "#8BC34A" };
  if (days <= frequencyDays) return { level: "cooling", label: "Kühlt ab", pct: 50, color: "#FFC107" };
  if (days <= frequencyDays * 1.5) return { level: "fading", label: "Verblasst", pct: 25, color: "#FF9800" };
  return { level: "wilting", label: "Welkt!", pct: 10, color: "#F44336" };
}

function getBalance(contact) {
  const history = contact.history || [];
  const outgoing = history.filter(h => !h.incoming).length;
  const incoming = history.filter(h => h.incoming).length;
  const total = outgoing + incoming;
  if (total === 0) return { ratio: 0.5, label: "Neu", color: "#8B8B9E", outgoing, incoming, icon: "◌" };
  const ratio = outgoing / total;
  if (ratio > 0.75) return { ratio, label: "Du gibst mehr", color: "#E8A849", outgoing, incoming, icon: "↗" };
  if (ratio > 0.55) return { ratio, label: "Du initiierst etwas mehr", color: "#8BC34A", outgoing, incoming, icon: "↗" };
  if (ratio >= 0.45) return { ratio, label: "Ausgeglichen", color: "#4CAF50", outgoing, incoming, icon: "⇄" };
  if (ratio >= 0.25) return { ratio, label: "Sie initiieren etwas mehr", color: "#8BC34A", outgoing, incoming, icon: "↙" };
  return { ratio, label: "Sie geben mehr", color: "#7B9EC4", outgoing, incoming, icon: "↙" };
}

function formatDate(dateStr) {
  if (!dateStr) return "Nie";
  const days = daysSince(dateStr);
  if (days === 0) return "Heute";
  if (days === 1) return "Gestern";
  if (days < 7) return `vor ${days} Tagen`;
  if (days < 30) return `vor ${Math.floor(days / 7)} Wo.`;
  if (days < 365) return `vor ${Math.floor(days / 30)} Mon.`;
  return new Date(dateStr).toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "2-digit" });
}

function formatBirthday(dateStr) {
  if (!dateStr) return null;
  const d = daysUntil(dateStr);
  if (d === 0) return "Heute Geburtstag!";
  if (d === 1) return "Morgen Geburtstag!";
  if (d <= 7) return `Geburtstag in ${d} Tagen`;
  if (d <= 30) return `Geburtstag in ${Math.ceil(d / 7)} Wochen`;
  return null;
}

function getSmartSuggestions(contacts, energyLevel) {
  const suggestions = [];
  const now = new Date();

  contacts.forEach(c => {
    const warmth = getWarmth(c.lastContact, c.frequencyDays);
    const balance = getBalance(c);
    const bday = c.birthday ? formatBirthday(c.birthday) : null;

    if (bday) {
      suggestions.push({ contact: c, type: "birthday", priority: 10, text: bday, icon: "🎂", effort: 1 });
    }

    if (warmth.level === "wilting") {
      suggestions.push({ contact: c, type: "wilting", priority: 8, text: `${c.name} verblasst — meld dich!`, icon: "🌡️", effort: 2 });
    } else if (warmth.level === "fading") {
      suggestions.push({ contact: c, type: "fading", priority: 6, text: `${c.name} kühlt ab`, icon: "❄️", effort: 1 });
    }

    if (balance.ratio > 0.8 && (c.history || []).length > 4) {
      suggestions.push({ contact: c, type: "imbalance_out", priority: 4, text: `Du gibst viel mehr bei ${c.name} — beobachte das`, icon: "⚖️", effort: 0 });
    }
    if (balance.ratio < 0.2 && (c.history || []).length > 4) {
      suggestions.push({ contact: c, type: "imbalance_in", priority: 3, text: `${c.name} gibt viel — zeig Wertschätzung`, icon: "💝", effort: 2 });
    }

    if (c.tags && c.tags.includes("Follow-up") && daysSince(c.lastContact) > 3) {
      suggestions.push({ contact: c, type: "followup", priority: 7, text: `Follow-up bei ${c.name} fällig`, icon: "📌", effort: 2 });
    }

    if (c.tags && c.tags.includes("Warten auf Antwort") && daysSince(c.lastContact) > 5) {
      suggestions.push({ contact: c, type: "waiting", priority: 5, text: `Wartest noch auf Antwort von ${c.name}`, icon: "⏳", effort: 0 });
    }
  });

  // Filter by energy level
  const maxEffort = energyLevel === "high" ? 5 : energyLevel === "medium" ? 3 : energyLevel === "low" ? 1 : 0;
  const filtered = energyLevel === "recharge"
    ? suggestions.filter(s => s.priority >= 8)
    : suggestions.filter(s => s.effort <= maxEffort);

  return filtered.sort((a, b) => b.priority - a.priority).slice(0, 8);
}

// ─── STORAGE ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "circle-keeper-data";
const SETTINGS_KEY = "circle-keeper-settings";

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function CircleKeeper() {
  const [contacts, setContacts] = useState([]);
  const [view, setView] = useState("dashboard");
  const [selectedContact, setSelectedContact] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [energyLevel, setEnergyLevel] = useState("medium");
  const [showIncoming, setShowIncoming] = useState(false);
  const [showBalanceDetail, setShowBalanceDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [logNote, setLogNote] = useState("");
  const [logTopic, setLogTopic] = useState("");
  const [showLogOptions, setShowLogOptions] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("close");
  const [formFrequency, setFormFrequency] = useState("monthly");
  const [formNote, setFormNote] = useState("");
  const [formEmoji, setFormEmoji] = useState("");
  const [formRole, setFormRole] = useState("personal");
  const [formCompany, setFormCompany] = useState("");
  const [formBirthday, setFormBirthday] = useState("");
  const [formTags, setFormTags] = useState([]);
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");

  // Load
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result?.value) setContacts(JSON.parse(result.value));
        const settings = await window.storage.get(SETTINGS_KEY);
        if (settings?.value) {
          const s = JSON.parse(settings.value);
          if (s.energyLevel) setEnergyLevel(s.energyLevel);
        }
      } catch { }
      setLoaded(true);
    })();
  }, []);

  const persist = useCallback(async (data) => {
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(data)); } catch { }
  }, []);

  const persistSettings = useCallback(async (settings) => {
    try { await window.storage.set(SETTINGS_KEY, JSON.stringify(settings)); } catch { }
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const setEnergy = (level) => {
    setEnergyLevel(level);
    persistSettings({ energyLevel: level });
  };

  // ─── CRUD ────────────────────────────────────────────────────────────────────

  const addContact = () => {
    if (!formName.trim()) return;
    const freq = FREQUENCY_OPTIONS.find(f => f.id === formFrequency);
    const newContact = {
      id: Date.now().toString(),
      name: formName.trim(),
      category: formCategory,
      frequency: formFrequency,
      frequencyDays: freq.days,
      note: formNote,
      emoji: formEmoji || EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      role: formRole,
      company: formCompany,
      birthday: formBirthday || null,
      tags: formTags,
      phone: formPhone,
      email: formEmail,
      lastContact: null,
      lastIncoming: null,
      history: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [newContact, ...contacts];
    setContacts(updated);
    persist(updated);
    resetForm();
    setShowAdd(false);
    showToast(`${newContact.emoji} ${newContact.name} hinzugefügt`);
  };

  const updateContact = () => {
    if (!selectedContact || !formName.trim()) return;
    const freq = FREQUENCY_OPTIONS.find(f => f.id === formFrequency);
    const updated = contacts.map(c => c.id === selectedContact.id ? {
      ...c, name: formName.trim(), category: formCategory,
      frequency: formFrequency, frequencyDays: freq.days,
      note: formNote, emoji: formEmoji || c.emoji,
      role: formRole, company: formCompany,
      birthday: formBirthday || c.birthday,
      tags: formTags, phone: formPhone, email: formEmail,
    } : c);
    setContacts(updated);
    persist(updated);
    setSelectedContact(updated.find(c => c.id === selectedContact.id));
    setEditMode(false);
    showToast("Aktualisiert ✓");
  };

  const deleteContact = (id) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    persist(updated);
    setSelectedContact(null);
    setView("dashboard");
    showToast("Entfernt");
  };

  const logReach = (contact, actionId, note = "", topic = "") => {
    const action = REACH_ACTIONS.find(a => a.id === actionId);
    const entry = {
      action: actionId, label: action.label, icon: action.icon,
      date: new Date().toISOString(), incoming: false,
      note: note || undefined, topic: topic || undefined,
    };
    const updated = contacts.map(c => c.id === contact.id ? {
      ...c, lastContact: new Date().toISOString(),
      history: [entry, ...(c.history || [])].slice(0, 100),
    } : c);
    setContacts(updated);
    persist(updated);
    setSelectedContact(updated.find(c => c.id === contact.id));
    setLogNote("");
    setLogTopic("");
    setShowLogOptions(false);
    showToast(`${action.icon} ${action.label} mit ${contact.name} geloggt`);
  };

  const logIncoming = (contact, actionId, note = "", topic = "") => {
    const action = INCOMING_ACTIONS.find(a => a.id === actionId);
    const entry = {
      action: actionId, label: action.label, icon: action.icon,
      date: new Date().toISOString(), incoming: true,
      note: note || undefined, topic: topic || undefined,
    };
    const updated = contacts.map(c => c.id === contact.id ? {
      ...c, lastContact: new Date().toISOString(), lastIncoming: new Date().toISOString(),
      history: [entry, ...(c.history || [])].slice(0, 100),
    } : c);
    setContacts(updated);
    persist(updated);
    setSelectedContact(updated.find(c => c.id === contact.id));
    setShowIncoming(false);
    setLogNote("");
    setLogTopic("");
    showToast(`${action.icon} ${contact.name} ${action.label.toLowerCase()}`);
  };

  const toggleTag = (contact, tag) => {
    const currentTags = contact.tags || [];
    const newTags = currentTags.includes(tag) ? currentTags.filter(t => t !== tag) : [...currentTags, tag];
    const updated = contacts.map(c => c.id === contact.id ? { ...c, tags: newTags } : c);
    setContacts(updated);
    persist(updated);
    setSelectedContact(updated.find(c => c.id === contact.id));
  };

  const resetForm = () => {
    setFormName(""); setFormCategory("close"); setFormFrequency("monthly");
    setFormNote(""); setFormEmoji(""); setFormRole("personal");
    setFormCompany(""); setFormBirthday(""); setFormTags([]);
    setFormPhone(""); setFormEmail("");
  };

  const openEdit = (c) => {
    setFormName(c.name); setFormCategory(c.category); setFormFrequency(c.frequency);
    setFormNote(c.note || ""); setFormEmoji(c.emoji); setFormRole(c.role || "personal");
    setFormCompany(c.company || ""); setFormBirthday(c.birthday || "");
    setFormTags(c.tags || []); setFormPhone(c.phone || ""); setFormEmail(c.email || "");
    setEditMode(true);
  };

  // ─── COMPUTED DATA ───────────────────────────────────────────────────────────

  const needAttention = useMemo(() => contacts.filter(c => {
    const w = getWarmth(c.lastContact, c.frequencyDays);
    return w.level === "fading" || w.level === "wilting";
  }), [contacts]);

  const upcomingBirthdays = useMemo(() =>
    contacts.filter(c => c.birthday && daysUntil(c.birthday) <= 30)
      .sort((a, b) => daysUntil(a.birthday) - daysUntil(b.birthday)),
  [contacts]);

  const suggestions = useMemo(() => getSmartSuggestions(contacts, energyLevel), [contacts, energyLevel]);

  const networkHealth = useMemo(() => {
    if (contacts.length === 0) return null;
    const thriving = contacts.filter(c => getWarmth(c.lastContact, c.frequencyDays).level === "thriving").length;
    const good = contacts.filter(c => getWarmth(c.lastContact, c.frequencyDays).level === "good").length;
    const cooling = contacts.filter(c => getWarmth(c.lastContact, c.frequencyDays).level === "cooling").length;
    const fading = contacts.filter(c => getWarmth(c.lastContact, c.frequencyDays).level === "fading").length;
    const wilting = contacts.filter(c => getWarmth(c.lastContact, c.frequencyDays).level === "wilting").length;

    const totalHistory = contacts.reduce((sum, c) => sum + (c.history || []).length, 0);
    const totalOutgoing = contacts.reduce((sum, c) => sum + (c.history || []).filter(h => !h.incoming).length, 0);
    const totalIncoming = contacts.reduce((sum, c) => sum + (c.history || []).filter(h => h.incoming).length, 0);

    const balancedCount = contacts.filter(c => {
      const b = getBalance(c);
      return b.ratio >= 0.35 && b.ratio <= 0.65 && (c.history || []).length >= 2;
    }).length;

    const score = Math.round(
      (thriving * 100 + good * 75 + cooling * 50 + fading * 25 + wilting * 0) / contacts.length
    );

    return { thriving, good, cooling, fading, wilting, score, totalHistory, totalOutgoing, totalIncoming, balancedCount };
  }, [contacts]);

  const filtered = useMemo(() => {
    let list = contacts;
    if (filterCat !== "all") list = list.filter(c => c.category === filterCat);
    if (filterRole !== "all") list = list.filter(c => (c.role || "personal") === filterRole);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.company || "").toLowerCase().includes(q) ||
        (c.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    return [...list].sort((a, b) => getWarmth(a.lastContact, a.frequencyDays).pct - getWarmth(b.lastContact, b.frequencyDays).pct);
  }, [contacts, filterCat, filterRole, searchQuery]);

  // ─── RENDER HELPERS ────────────────────────────────────────────────────────

  if (!loaded) return (
    <div style={styles.loadWrap}>
      <div style={styles.loadPulse}>◉</div>
      <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: "#5B4A3F", fontSize: 18 }}>Lade dein Netzwerk...</p>
    </div>
  );

  // ─── INSIGHTS VIEW ──────────────────────────────────────────────────────────

  if (view === "insights") {
    const roleStats = ROLES.map(r => ({
      ...r,
      count: contacts.filter(c => (c.role || "personal") === r.id).length,
    })).filter(r => r.count > 0);

    const balanceOverview = contacts
      .filter(c => (c.history || []).length >= 2)
      .map(c => ({ ...c, balance: getBalance(c) }))
      .sort((a, b) => Math.abs(b.balance.ratio - 0.5) - Math.abs(a.balance.ratio - 0.5));

    return (
      <div style={styles.app}>
        <Fonts />
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => setView("dashboard")}>← Zurück</button>
          <h2 style={styles.headerTitle}>Netzwerk-Insights</h2>
        </div>

        {/* Network Score */}
        {networkHealth && (
          <div style={{ ...styles.insightCard, textAlign: "center" }}>
            <div style={{ fontSize: 48, fontFamily: "'DM Serif Display', Georgia, serif", color: networkHealth.score >= 60 ? "#4CAF50" : networkHealth.score >= 40 ? "#FFC107" : "#F44336" }}>
              {networkHealth.score}
            </div>
            <p style={{ fontSize: 13, color: "#8B7E74", margin: "4px 0 16px" }}>Netzwerk-Gesundheit</p>
            <div style={styles.healthBar}>
              {[
                { count: networkHealth.thriving, color: "#4CAF50", label: "Blüht" },
                { count: networkHealth.good, color: "#8BC34A", label: "Gut" },
                { count: networkHealth.cooling, color: "#FFC107", label: "Kühlt" },
                { count: networkHealth.fading, color: "#FF9800", label: "Verblasst" },
                { count: networkHealth.wilting, color: "#F44336", label: "Welkt" },
              ].map((s, i) => s.count > 0 && (
                <div key={i} style={{ flex: s.count, height: 8, background: s.color, borderRadius: i === 0 ? "4px 0 0 4px" : i === 4 ? "0 4px 4px 0" : 0 }} title={`${s.label}: ${s.count}`} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
              {[
                { n: networkHealth.thriving, label: "Blüht", color: "#4CAF50" },
                { n: networkHealth.good, label: "Gut", color: "#8BC34A" },
                { n: networkHealth.cooling, label: "Kühlt", color: "#FFC107" },
                { n: networkHealth.fading, label: "Verblasst", color: "#FF9800" },
                { n: networkHealth.wilting, label: "Welkt", color: "#F44336" },
              ].filter(s => s.n > 0).map((s, i) => (
                <span key={i} style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.n} {s.label}</span>
              ))}
            </div>
          </div>
        )}

        {/* Initiative Balance */}
        {networkHealth && networkHealth.totalHistory > 0 && (
          <div style={styles.insightCard}>
            <h3 style={styles.insightTitle}>⇄ Gesamtbalance</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#5B8A72" }}>Du → {networkHealth.totalOutgoing}</span>
                  <span style={{ fontSize: 12, color: "#7B9EC4" }}>{networkHealth.totalIncoming} ← Sie</span>
                </div>
                <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ flex: networkHealth.totalOutgoing || 1, background: "#5B8A72" }} />
                  <div style={{ flex: networkHealth.totalIncoming || 1, background: "#7B9EC4" }} />
                </div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "#8B7E74" }}>
              {networkHealth.balancedCount} von {contacts.filter(c => (c.history || []).length >= 2).length} aktiven Kontakten sind ausgeglichen
            </p>
          </div>
        )}

        {/* Balance per contact */}
        {balanceOverview.length > 0 && (
          <div style={styles.insightCard}>
            <h3 style={styles.insightTitle}>⚖️ Balance pro Kontakt</h3>
            {balanceOverview.slice(0, 10).map(c => (
              <button key={c.id} style={styles.balanceRow} onClick={() => { setSelectedContact(c); setView("detail"); }}>
                <span style={{ fontSize: 16 }}>{c.emoji}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, textAlign: "left" }}>{c.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "#5B8A72" }}>{c.balance.outgoing}↗</span>
                  <div style={{ width: 48, height: 6, borderRadius: 3, overflow: "hidden", display: "flex" }}>
                    <div style={{ flex: c.balance.outgoing || 1, background: "#5B8A72" }} />
                    <div style={{ flex: c.balance.incoming || 1, background: "#7B9EC4" }} />
                  </div>
                  <span style={{ fontSize: 11, color: "#7B9EC4" }}>↙{c.balance.incoming}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Roles */}
        {roleStats.length > 0 && (
          <div style={styles.insightCard}>
            <h3 style={styles.insightTitle}>Rollen-Verteilung</h3>
            {roleStats.map(r => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{r.icon}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{r.label}</span>
                <div style={{ width: 80, height: 6, borderRadius: 3, background: "#EDE4D8", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(r.count / contacts.length) * 100}%`, background: r.color, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 12, color: "#8B7E74", width: 20, textAlign: "right" }}>{r.count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Longest no contact */}
        <div style={styles.insightCard}>
          <h3 style={styles.insightTitle}>Längste Funkstille</h3>
          {[...contacts].sort((a, b) => daysSince(a.lastContact) - daysSince(b.lastContact)).reverse().slice(0, 5).map(c => (
            <button key={c.id} style={styles.balanceRow} onClick={() => { setSelectedContact(c); setView("detail"); }}>
              <span style={{ fontSize: 16 }}>{c.emoji}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, textAlign: "left" }}>{c.name}</span>
              <span style={{ fontSize: 12, color: "#D4644A" }}>{formatDate(c.lastContact)}</span>
            </button>
          ))}
        </div>

        {toast && <div style={styles.toast}>{toast}</div>}
      </div>
    );
  }

  // ─── CONTACT DETAIL VIEW ────────────────────────────────────────────────────

  if (selectedContact && view === "detail") {
    const c = selectedContact;
    const cat = CATEGORIES.find(ct => ct.id === c.category);
    const warmth = getWarmth(c.lastContact, c.frequencyDays);
    const freq = FREQUENCY_OPTIONS.find(f => f.id === c.frequency);
    const role = ROLES.find(r => r.id === (c.role || "personal"));
    const balance = getBalance(c);
    const bday = c.birthday ? formatBirthday(c.birthday) : null;

    if (editMode) {
      return (
        <div style={styles.app}>
          <Fonts />
          <div style={styles.header}>
            <button style={styles.backBtn} onClick={() => { setEditMode(false); resetForm(); }}>← Zurück</button>
            <h2 style={styles.headerTitle}>Bearbeiten</h2>
          </div>
          <div style={styles.formWrap}>{renderForm(true)}</div>
          {toast && <div style={styles.toast}>{toast}</div>}
        </div>
      );
    }

    // Incoming logging modal
    if (showIncoming) {
      return (
        <div style={styles.app}>
          <Fonts />
          <div style={styles.header}>
            <button style={styles.backBtn} onClick={() => { setShowIncoming(false); setLogNote(""); setLogTopic(""); }}>← Zurück</button>
            <h2 style={styles.headerTitle}>Eingehend loggen</h2>
          </div>
          <div style={{ padding: "8px 24px" }}>
            <p style={{ fontSize: 14, color: "#8B7E74", marginBottom: 16 }}>{c.emoji} {c.name} hat sich bei dir gemeldet</p>

            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Gesprächsthema (optional)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                {CONVERSATION_TOPICS.map(t => (
                  <button key={t} style={{ ...styles.topicChip, ...(logTopic === t ? { background: "#5B4A3F", color: "#FAF5EF", borderColor: "#5B4A3F" } : {}) }}
                    onClick={() => setLogTopic(logTopic === t ? "" : t)}>{t}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Notiz (optional)</label>
              <textarea style={styles.textarea} value={logNote} onChange={e => setLogNote(e.target.value)}
                placeholder="Was wurde besprochen?" rows={2} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {INCOMING_ACTIONS.map(a => (
                <button key={a.id} style={styles.actionBtn} onClick={() => logIncoming(c, a.id, logNote, logTopic)}>
                  <span style={{ fontSize: 22 }}>{a.icon}</span>
                  <span style={styles.actionLabel}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
          {toast && <div style={styles.toast}>{toast}</div>}
        </div>
      );
    }

    return (
      <div style={styles.app}>
        <Fonts />
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => { setSelectedContact(null); setView("dashboard"); setShowLogOptions(false); setLogNote(""); setLogTopic(""); }}>← Zurück</button>
          <button style={styles.editBtn} onClick={() => openEdit(c)}>✎</button>
        </div>

        <div style={styles.detailHero}>
          <div style={styles.detailEmoji}>{c.emoji}</div>
          <h1 style={styles.detailName}>{c.name}</h1>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 8 }}>
            <span style={{ ...styles.catBadge, background: cat.bg, color: cat.color }}>{cat.emoji} {cat.label}</span>
            {role && <span style={{ ...styles.catBadge, background: role.color + "18", color: role.color }}>{role.icon} {role.label}</span>}
          </div>
          {c.company && <p style={{ fontSize: 13, color: "#8B7E74", margin: "4px 0" }}>{c.company}</p>}

          {/* Warmth bar */}
          <div style={styles.warmthBarOuter}>
            <div style={{ ...styles.warmthBarInner, width: `${warmth.pct}%`, background: warmth.color }} />
          </div>
          <p style={styles.warmthLabel}>{warmth.label} · Zuletzt: {formatDate(c.lastContact)} · Ziel: {freq.label}</p>

          {/* Birthday */}
          {bday && <div style={styles.bdayBadge}>{bday}</div>}
        </div>

        {/* Balance */}
        <div style={styles.balanceCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>⚖️ Balance</span>
            <span style={{ fontSize: 12, color: balance.color, fontWeight: 600 }}>{balance.icon} {balance.label}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "#5B8A72" }}>Du {balance.outgoing}×</span>
            <div style={{ flex: 1, height: 6, borderRadius: 3, overflow: "hidden", display: "flex" }}>
              <div style={{ flex: balance.outgoing || 1, background: "#5B8A72", transition: "flex 0.6s" }} />
              <div style={{ flex: balance.incoming || 1, background: "#7B9EC4", transition: "flex 0.6s" }} />
            </div>
            <span style={{ fontSize: 11, color: "#7B9EC4" }}>{balance.incoming}× Sie</span>
          </div>
        </div>

        {/* Tags */}
        {(c.tags && c.tags.length > 0) && (
          <div style={{ padding: "0 24px 8px", display: "flex", flexWrap: "wrap", gap: 6 }}>
            {c.tags.map(t => (
              <span key={t} style={styles.tagDisplay}>{t}</span>
            ))}
          </div>
        )}

        {c.note && <div style={styles.noteBox}><span style={{ opacity: 0.5 }}>📝</span> {c.note}</div>}

        {/* Contact Info */}
        {(c.phone || c.email) && (
          <div style={{ padding: "0 24px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {c.phone && <span style={styles.contactInfo}>📞 {c.phone}</span>}
            {c.email && <span style={styles.contactInfo}>📧 {c.email}</span>}
          </div>
        )}

        {/* Quick tags */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Schnell-Tags</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {TAGS.map(t => (
              <button key={t} style={{
                ...styles.topicChip,
                ...((c.tags || []).includes(t) ? { background: "#5B4A3F", color: "#FAF5EF", borderColor: "#5B4A3F" } : {}),
              }} onClick={() => toggleTag(c, t)}>{t}</button>
            ))}
          </div>
        </div>

        {/* Log outgoing */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Kontakt aufnehmen</h3>

          {showLogOptions && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 11, color: "#8B7E74" }}>Thema</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                  {CONVERSATION_TOPICS.slice(0, 8).map(t => (
                    <button key={t} style={{ ...styles.topicChip, fontSize: 10, padding: "3px 8px", ...(logTopic === t ? { background: "#5B4A3F", color: "#FAF5EF", borderColor: "#5B4A3F" } : {}) }}
                      onClick={() => setLogTopic(logTopic === t ? "" : t)}>{t}</button>
                  ))}
                </div>
              </div>
              <input style={{ ...styles.input, fontSize: 13, padding: "8px 12px" }} value={logNote}
                onChange={e => setLogNote(e.target.value)} placeholder="Kurze Notiz..." />
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button style={{ ...styles.topicChip, fontSize: 11 }} onClick={() => setShowLogOptions(!showLogOptions)}>
              {showLogOptions ? "Weniger ▲" : "+ Notiz/Thema ▼"}
            </button>
          </div>

          <div style={styles.actionGrid}>
            {REACH_ACTIONS.map(a => {
              const energyOk = energyLevel === "high" || a.effort <= (energyLevel === "medium" ? 3 : energyLevel === "low" ? 1 : 0);
              return (
                <button key={a.id} style={{ ...styles.actionBtn, opacity: energyOk ? 1 : 0.4 }}
                  onClick={() => logReach(c, a.id, logNote, logTopic)}>
                  <span style={{ fontSize: 22 }}>{a.icon}</span>
                  <span style={styles.actionLabel}>{a.label}</span>
                  {!energyOk && <span style={{ fontSize: 9, color: "#8B7E74" }}>Energie?</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Log incoming */}
        <div style={styles.section}>
          <button style={styles.incomingBtn} onClick={() => { setShowIncoming(true); setLogNote(""); setLogTopic(""); }}>
            📥 Eingehenden Kontakt loggen
          </button>
        </div>

        {/* History */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Verlauf</h3>
          {(!c.history || c.history.length === 0) ? (
            <p style={styles.emptyHint}>Noch keine Einträge. Logge deine erste Verbindung!</p>
          ) : (
            <div style={styles.timeline}>
              {c.history.slice(0, 25).map((h, i) => (
                <div key={i} style={styles.timelineItem}>
                  <div style={{ ...styles.timelineDot, background: h.incoming ? "#7B9EC4" : "#5B8A72" }} />
                  <div style={styles.timelineContent}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                      <span style={{ fontSize: 13 }}>
                        {h.incoming ? "📥 " : "📤 "}{h.icon} {h.label}
                      </span>
                      {h.topic && <span style={{ fontSize: 11, color: "#5B8A72" }}>{h.topic}</span>}
                      {h.note && <span style={{ fontSize: 11, color: "#8B7E74", fontStyle: "italic" }}>{h.note}</span>}
                    </div>
                    <span style={styles.timelineDate}>{formatDate(h.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button style={styles.deleteBtn} onClick={() => { if (confirm(`${c.name} wirklich entfernen?`)) deleteContact(c.id); }}>
          Kontakt entfernen
        </button>

        {toast && <div style={styles.toast}>{toast}</div>}
      </div>
    );
  }

  // ─── ADD FORM ─────────────────────────────────────────────────────────────

  function renderForm(isEdit = false) {
    return (
      <div style={styles.formInner}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Name *</label>
          <input style={styles.input} value={formName} onChange={e => setFormName(e.target.value)} placeholder="Wer ist dir wichtig?" />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Emoji</label>
          <div style={styles.emojiGrid}>
            {EMOJIS.map(e => (
              <button key={e} style={{ ...styles.emojiBtn, ...(formEmoji === e ? { background: "#5B4A3F", transform: "scale(1.2)" } : {}) }}
                onClick={() => setFormEmoji(e)}>{e}</button>
            ))}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Rolle</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ROLES.map(r => (
              <button key={r.id} style={{
                ...styles.catOption,
                ...(formRole === r.id ? { background: r.color, color: "#fff", borderColor: r.color } : {}),
              }} onClick={() => setFormRole(r.id)}>
                {r.icon} {r.label}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Kreis</label>
          <div style={styles.catSelect}>
            {CATEGORIES.map(c => (
              <button key={c.id} style={{
                ...styles.catOption,
                ...(formCategory === c.id ? { background: c.color, color: "#fff", borderColor: c.color } : {}),
              }} onClick={() => setFormCategory(c.id)}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Kontakt-Rhythmus</label>
          <div style={styles.freqSelect}>
            {FREQUENCY_OPTIONS.map(f => (
              <button key={f.id} style={{
                ...styles.freqOption,
                ...(formFrequency === f.id ? { background: "#5B4A3F", color: "#fff", borderColor: "#5B4A3F" } : {}),
              }} onClick={() => setFormFrequency(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Firma</label>
            <input style={styles.input} value={formCompany} onChange={e => setFormCompany(e.target.value)} placeholder="Firma/Org" />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Geburtstag</label>
            <input style={styles.input} type="date" value={formBirthday} onChange={e => setFormBirthday(e.target.value)} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Telefon</label>
            <input style={styles.input} value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="+49..." />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>E-Mail</label>
            <input style={styles.input} type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="mail@..." />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Tags</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {TAGS.map(t => (
              <button key={t} style={{
                ...styles.topicChip,
                ...(formTags.includes(t) ? { background: "#5B4A3F", color: "#FAF5EF", borderColor: "#5B4A3F" } : {}),
              }} onClick={() => setFormTags(formTags.includes(t) ? formTags.filter(x => x !== t) : [...formTags, t])}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Notiz <span style={{ opacity: 0.4 }}>(optional)</span></label>
          <textarea style={styles.textarea} value={formNote} onChange={e => setFormNote(e.target.value)}
            placeholder="Was verbindet euch? Kontext, Insider, Projekte..." rows={3} />
        </div>

        <button style={styles.submitBtn} onClick={isEdit ? updateContact : addContact}>
          {isEdit ? "Speichern ✓" : "Hinzufügen ✦"}
        </button>
        {!isEdit && <button style={styles.cancelBtn} onClick={() => { setShowAdd(false); resetForm(); }}>Abbrechen</button>}
      </div>
    );
  }

  // ─── ADD VIEW ─────────────────────────────────────────────────────────────

  if (showAdd) {
    return (
      <div style={styles.app}>
        <Fonts />
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => { setShowAdd(false); resetForm(); }}>← Zurück</button>
          <h2 style={styles.headerTitle}>Neue Verbindung</h2>
        </div>
        <div style={styles.formWrap}>{renderForm(false)}</div>
        {toast && <div style={styles.toast}>{toast}</div>}
      </div>
    );
  }

  // ─── DASHBOARD ────────────────────────────────────────────────────────────

  return (
    <div style={styles.app}>
      <Fonts />
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #D4C4B0; border-radius: 4px; }
        button:active { transform: scale(0.97) !important; }
      `}</style>

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroDecor}>
          {["◌","◠","◡","◦","◎"].map((s, i) => (
            <span key={i} style={{ ...styles.heroShape, animationDelay: `${i * 0.7}s`, left: `${10 + i * 18}%`, top: `${15 + (i % 3) * 25}%`, fontSize: 14 + i * 4, opacity: 0.08 + i * 0.02 }}>{s}</span>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={styles.heroTitle}>Circle<br/>Keeper</h1>
            <p style={styles.heroSub}>Dein Netzwerk verdient Aufmerksamkeit</p>
          </div>
          <button style={styles.insightsBtn} onClick={() => setView("insights")}>
            📊
          </button>
        </div>

        {/* Quick Stats */}
        <div style={styles.statsRow}>
          <div style={styles.stat}>
            <span style={styles.statNum}>{contacts.length}</span>
            <span style={styles.statLabel}>Kontakte</span>
          </div>
          <div style={{ width: 1, height: 28, background: "rgba(91,74,63,0.15)" }} />
          <div style={styles.stat}>
            <span style={{ ...styles.statNum, color: needAttention.length > 0 ? "#D4644A" : "#5B8A72" }}>{needAttention.length}</span>
            <span style={styles.statLabel}>brauchen dich</span>
          </div>
          <div style={{ width: 1, height: 28, background: "rgba(91,74,63,0.15)" }} />
          <div style={styles.stat}>
            <span style={{ ...styles.statNum, color: "#5B8A72" }}>
              {contacts.filter(c => getWarmth(c.lastContact, c.frequencyDays).level === "thriving").length}
            </span>
            <span style={styles.statLabel}>blühen</span>
          </div>
          {networkHealth && (
            <>
              <div style={{ width: 1, height: 28, background: "rgba(91,74,63,0.15)" }} />
              <div style={styles.stat}>
                <span style={{ ...styles.statNum, color: networkHealth.score >= 60 ? "#4CAF50" : networkHealth.score >= 40 ? "#FFC107" : "#F44336" }}>
                  {networkHealth.score}
                </span>
                <span style={styles.statLabel}>Gesundheit</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Energy Level */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Wie geht's dir gerade?</h3>
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {ENERGY_LEVELS.map(e => (
            <button key={e.id} style={{
              ...styles.energyBtn,
              ...(energyLevel === e.id ? { background: e.color, color: "#fff", borderColor: e.color, boxShadow: `0 2px 12px ${e.color}40` } : {}),
            }} onClick={() => setEnergy(e.id)}>
              <span style={{ fontSize: 18 }}>{e.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 500 }}>{e.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            {energyLevel === "recharge" ? "○ Nur Dringendes" : energyLevel === "low" ? "◑ Leichte Vorschläge" : "💡 Vorschläge für dich"}
          </h3>
          <div style={styles.suggestionList}>
            {suggestions.slice(0, 5).map((s, i) => (
              <button key={i} style={styles.suggestionCard} onClick={() => { setSelectedContact(s.contact); setView("detail"); }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <span style={{ fontSize: 13, fontWeight: 500, display: "block" }}>{s.text}</span>
                  <span style={{ fontSize: 11, color: "#8B7E74" }}>{s.contact.emoji} {s.contact.name}</span>
                </div>
                <span style={{ fontSize: 14, opacity: 0.3 }}>→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Birthdays */}
      {upcomingBirthdays.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🎂 Geburtstage</h3>
          <div style={styles.attentionScroll}>
            {upcomingBirthdays.map(c => (
              <button key={c.id} style={{ ...styles.attentionCard, borderColor: "rgba(155,126,196,0.3)" }}
                onClick={() => { setSelectedContact(c); setView("detail"); }}>
                <div style={styles.attentionEmoji}>{c.emoji}</div>
                <span style={styles.attentionName}>{c.name}</span>
                <span style={{ fontSize: 11, color: "#9B7EC4", fontWeight: 600 }}>
                  {daysUntil(c.birthday) === 0 ? "Heute!" : `in ${daysUntil(c.birthday)}d`}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attention needed */}
      {needAttention.length > 0 && (
        <div style={styles.section}>
          <h3 style={{ ...styles.sectionTitle, color: "#D4644A" }}>⚡ Brauchen Aufmerksamkeit</h3>
          <div style={styles.attentionScroll}>
            {needAttention.slice(0, 8).map(c => {
              const w = getWarmth(c.lastContact, c.frequencyDays);
              const role = ROLES.find(r => r.id === (c.role || "personal"));
              return (
                <button key={c.id} style={styles.attentionCard} onClick={() => { setSelectedContact(c); setView("detail"); }}>
                  <div style={styles.attentionEmoji}>{c.emoji}</div>
                  <span style={styles.attentionName}>{c.name}</span>
                  {role && role.id !== "personal" && (
                    <span style={{ fontSize: 10, color: role.color }}>{role.icon}</span>
                  )}
                  <span style={{ ...styles.attentionStatus, color: w.color }}>{w.label}</span>
                  <span style={styles.attentionTime}>{formatDate(c.lastContact)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ padding: "8px 24px 4px" }}>
        <input style={{ ...styles.input, fontSize: 13, padding: "10px 14px" }}
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="🔍 Suche nach Name, Firma oder Tag..." />
      </div>

      {/* Filters */}
      <div style={styles.filterRow}>
        <button style={{ ...styles.filterBtn, ...(filterCat === "all" && filterRole === "all" ? styles.filterActive : {}) }}
          onClick={() => { setFilterCat("all"); setFilterRole("all"); }}>Alle</button>
        {CATEGORIES.map(c => (
          <button key={c.id} style={{
            ...styles.filterBtn,
            ...(filterCat === c.id ? { background: c.color, color: "#fff", borderColor: c.color } : {}),
          }} onClick={() => setFilterCat(filterCat === c.id ? "all" : c.id)}>
            {c.emoji}
          </button>
        ))}
        <div style={{ width: 1, height: 24, background: "rgba(91,74,63,0.15)", flexShrink: 0 }} />
        {ROLES.filter(r => contacts.some(c => (c.role || "personal") === r.id)).map(r => (
          <button key={r.id} style={{
            ...styles.filterBtn,
            ...(filterRole === r.id ? { background: r.color, color: "#fff", borderColor: r.color } : {}),
          }} onClick={() => setFilterRole(filterRole === r.id ? "all" : r.id)}>
            {r.icon}
          </button>
        ))}
      </div>

      {/* Contact List */}
      <div style={styles.contactList}>
        {filtered.length === 0 && !searchQuery && (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 48, animation: "float 3s ease-in-out infinite" }}>◉</div>
            <p style={styles.emptyTitle}>Dein Kreis ist noch leer</p>
            <p style={styles.emptyHint}>Füge die Menschen hinzu, die dir wichtig sind</p>
          </div>
        )}
        {filtered.length === 0 && searchQuery && (
          <div style={styles.emptyState}>
            <p style={styles.emptyHint}>Keine Ergebnisse für "{searchQuery}"</p>
          </div>
        )}
        {filtered.map((c, i) => {
          const cat = CATEGORIES.find(ct => ct.id === c.category);
          const warmth = getWarmth(c.lastContact, c.frequencyDays);
          const role = ROLES.find(r => r.id === (c.role || "personal"));
          const balance = getBalance(c);
          return (
            <button key={c.id} style={{ ...styles.contactCard, animationDelay: `${i * 0.04}s` }}
              onClick={() => { setSelectedContact(c); setView("detail"); }}>
              <div style={styles.cardLeft}>
                <div style={{ ...styles.cardEmoji, background: cat.bg }}>{c.emoji}</div>
                <div style={styles.cardInfo}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={styles.cardName}>{c.name}</span>
                    {role && role.id !== "personal" && (
                      <span style={{ fontSize: 10, color: role.color }}>{role.icon}</span>
                    )}
                  </div>
                  <span style={styles.cardMeta}>
                    {cat.emoji} {c.company ? c.company + " · " : ""}{formatDate(c.lastContact)}
                  </span>
                </div>
              </div>
              <div style={styles.cardRight}>
                <div style={styles.miniBar}>
                  <div style={{ ...styles.miniBarFill, width: `${warmth.pct}%`, background: warmth.color }} />
                </div>
                <span style={{ ...styles.cardStatus, color: warmth.color }}>{warmth.label}</span>
                {(c.history || []).length >= 2 && (
                  <span style={{ fontSize: 9, color: balance.color }}>{balance.icon}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* FAB */}
      <button style={styles.fab} onClick={() => { resetForm(); setShowAdd(true); }}>
        <span style={{ fontSize: 28, lineHeight: 1 }}>+</span>
      </button>

      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}

// ─── FONTS COMPONENT ─────────────────────────────────────────────────────────

function Fonts() {
  return <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet" />;
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = {
  app: {
    fontFamily: "'Outfit', -apple-system, sans-serif",
    background: "linear-gradient(180deg, #FAF5EF 0%, #F5EDE3 50%, #EDE4D8 100%)",
    minHeight: "100vh",
    maxWidth: 480,
    margin: "0 auto",
    position: "relative",
    paddingBottom: 100,
    color: "#3A2F28",
    overflow: "hidden",
  },
  loadWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "#FAF5EF" },
  loadPulse: { fontSize: 48, animation: "pulse 1.5s ease-in-out infinite", color: "#5B4A3F", marginBottom: 16 },

  // Hero
  hero: { position: "relative", padding: "48px 24px 28px", overflow: "hidden" },
  heroDecor: { position: "absolute", inset: 0, pointerEvents: "none" },
  heroShape: { position: "absolute", color: "#5B4A3F", animation: "float 4s ease-in-out infinite" },
  heroTitle: {
    fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 44, fontWeight: 400,
    lineHeight: 1, color: "#3A2F28", margin: 0, letterSpacing: -1,
  },
  heroSub: { fontSize: 14, color: "#8B7E74", marginTop: 8, fontWeight: 300, letterSpacing: 0.5 },
  insightsBtn: {
    width: 44, height: 44, borderRadius: 14, border: "1.5px solid #D4C4B0",
    background: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 20, cursor: "pointer", backdropFilter: "blur(10px)",
  },
  statsRow: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
    marginTop: 24, padding: "16px 16px", background: "rgba(255,255,255,0.6)",
    borderRadius: 16, backdropFilter: "blur(10px)", flexWrap: "wrap",
  },
  stat: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  statNum: { fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: "#3A2F28", lineHeight: 1 },
  statLabel: { fontSize: 10, color: "#8B7E74", fontWeight: 400, letterSpacing: 0.5, textTransform: "uppercase" },

  // Section
  section: { padding: "12px 24px 8px" },
  sectionTitle: {
    fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, fontWeight: 400,
    margin: "0 0 12px 0", color: "#3A2F28",
  },

  // Energy
  energyBtn: {
    flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    padding: "10px 14px", borderRadius: 14, border: "1.5px solid #D4C4B0", background: "rgba(255,255,255,0.6)",
    cursor: "pointer", transition: "all 0.2s", fontFamily: "'Outfit', sans-serif",
  },

  // Suggestions
  suggestionList: { display: "flex", flexDirection: "column", gap: 8 },
  suggestionCard: {
    display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
    background: "rgba(255,255,255,0.7)", border: "1px solid rgba(212,196,176,0.3)",
    borderRadius: 14, cursor: "pointer", transition: "all 0.2s", fontFamily: "'Outfit', sans-serif",
    width: "100%", textAlign: "left",
  },

  // Attention cards
  attentionScroll: { display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8, scrollSnapType: "x mandatory" },
  attentionCard: {
    flex: "0 0 auto", width: 110, padding: "14px 10px", background: "#fff",
    border: "1px solid rgba(212,100,74,0.15)", borderRadius: 16,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
    cursor: "pointer", scrollSnapAlign: "start", transition: "all 0.2s",
    boxShadow: "0 2px 8px rgba(91,74,63,0.06)", fontFamily: "'Outfit', sans-serif",
  },
  attentionEmoji: { fontSize: 26 },
  attentionName: { fontSize: 12, fontWeight: 500, color: "#3A2F28", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" },
  attentionStatus: { fontSize: 11, fontWeight: 600 },
  attentionTime: { fontSize: 10, color: "#8B7E74" },

  // Filters
  filterRow: { display: "flex", gap: 6, padding: "8px 24px 4px", overflowX: "auto", alignItems: "center" },
  filterBtn: {
    padding: "6px 12px", borderRadius: 20, border: "1.5px solid #D4C4B0",
    background: "transparent", fontSize: 12, fontWeight: 500, color: "#5B4A3F",
    cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Outfit', sans-serif",
    transition: "all 0.2s", flexShrink: 0,
  },
  filterActive: { background: "#5B4A3F", color: "#FAF5EF", borderColor: "#5B4A3F" },

  // Contact List
  contactList: { padding: "8px 16px" },
  contactCard: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    width: "100%", padding: "12px 14px", background: "#fff",
    border: "1px solid rgba(212,196,176,0.4)", borderRadius: 16,
    marginBottom: 8, cursor: "pointer", transition: "all 0.2s",
    animation: "fadeUp 0.4s ease-out both", boxShadow: "0 1px 4px rgba(91,74,63,0.04)",
    fontFamily: "'Outfit', sans-serif", textAlign: "left",
  },
  cardLeft: { display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 },
  cardEmoji: { width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  cardInfo: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  cardName: { fontSize: 14, fontWeight: 500, color: "#3A2F28", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cardMeta: { fontSize: 11, color: "#8B7E74", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cardRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0, marginLeft: 8 },
  miniBar: { width: 48, height: 4, borderRadius: 2, background: "#EDE4D8", overflow: "hidden" },
  miniBarFill: { height: "100%", borderRadius: 2, transition: "width 0.6s ease" },
  cardStatus: { fontSize: 10, fontWeight: 600 },

  // FAB
  fab: {
    position: "fixed", bottom: 28, right: "calc(50% - 210px)",
    width: 56, height: 56, borderRadius: "50%",
    background: "linear-gradient(135deg, #5B4A3F 0%, #3A2F28 100%)",
    color: "#FAF5EF", border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 20px rgba(58,47,40,0.3), 0 0 0 4px rgba(250,245,239,0.4)",
    transition: "all 0.3s", zIndex: 100,
  },

  // Header
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 8px" },
  headerTitle: { fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 20, margin: 0, color: "#3A2F28" },
  backBtn: { background: "none", border: "none", fontSize: 15, color: "#5B4A3F", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 500, padding: "8px 4px" },
  editBtn: { background: "none", border: "none", fontSize: 18, color: "#5B4A3F", cursor: "pointer", padding: "8px" },

  // Detail
  detailHero: { textAlign: "center", padding: "8px 24px 16px" },
  detailEmoji: { fontSize: 56, marginBottom: 8 },
  detailName: { fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 32, fontWeight: 400, margin: "0 0 8px", color: "#3A2F28" },
  catBadge: { display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500 },
  warmthBarOuter: { height: 6, borderRadius: 3, background: "#EDE4D8", margin: "14px auto 8px", maxWidth: 200, overflow: "hidden" },
  warmthBarInner: { height: "100%", borderRadius: 3, transition: "width 0.8s ease" },
  warmthLabel: { fontSize: 12, color: "#8B7E74" },
  noteBox: { margin: "0 24px 12px", padding: "12px 16px", background: "rgba(255,255,255,0.7)", borderRadius: 12, fontSize: 13, color: "#5B4A3F", lineHeight: 1.5 },
  bdayBadge: { display: "inline-block", marginTop: 8, padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: "#F3E8FF", color: "#9B7EC4" },

  // Balance card
  balanceCard: {
    margin: "0 24px 12px", padding: "14px 16px", background: "rgba(255,255,255,0.7)",
    borderRadius: 14, border: "1px solid rgba(212,196,176,0.3)",
  },

  // Contact info
  contactInfo: {
    fontSize: 12, color: "#5B4A3F", padding: "4px 10px", borderRadius: 8,
    background: "rgba(255,255,255,0.7)", border: "1px solid rgba(212,196,176,0.3)",
  },

  // Tags
  tagDisplay: {
    fontSize: 11, padding: "3px 10px", borderRadius: 10,
    background: "rgba(91,74,63,0.08)", color: "#5B4A3F", fontWeight: 500,
  },
  topicChip: {
    padding: "5px 10px", borderRadius: 10, border: "1px solid #D4C4B0",
    background: "transparent", fontSize: 11, color: "#5B4A3F", cursor: "pointer",
    fontFamily: "'Outfit', sans-serif", transition: "all 0.15s", whiteSpace: "nowrap",
  },

  // Incoming
  incomingBtn: {
    width: "100%", padding: "14px 16px", borderRadius: 14,
    border: "1.5px solid rgba(123,158,196,0.4)", background: "rgba(123,158,196,0.08)",
    color: "#5B7A94", fontSize: 14, fontWeight: 500, cursor: "pointer",
    fontFamily: "'Outfit', sans-serif", transition: "all 0.2s", textAlign: "center",
  },

  // Actions
  actionGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 },
  actionBtn: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    padding: "14px 8px", background: "#fff", border: "1.5px solid #D4C4B0",
    borderRadius: 14, cursor: "pointer", transition: "all 0.2s", fontFamily: "'Outfit', sans-serif",
  },
  actionLabel: { fontSize: 10, fontWeight: 500, color: "#3A2F28" },

  // Timeline
  timeline: { paddingLeft: 8 },
  timelineItem: { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, position: "relative" },
  timelineDot: { width: 8, height: 8, borderRadius: "50%", background: "#D4C4B0", marginTop: 6, flexShrink: 0 },
  timelineContent: { display: "flex", justifyContent: "space-between", flex: 1, fontSize: 13, alignItems: "flex-start" },
  timelineDate: { fontSize: 11, color: "#8B7E74", flexShrink: 0, marginLeft: 8 },

  // Form
  formWrap: { padding: "8px 24px", paddingBottom: 32 },
  formInner: { display: "flex", flexDirection: "column", gap: 14 },
  formGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: "#5B4A3F", letterSpacing: 0.3 },
  input: {
    padding: "12px 16px", borderRadius: 12, border: "1.5px solid #D4C4B0",
    fontSize: 15, fontFamily: "'Outfit', sans-serif", background: "#fff",
    color: "#3A2F28", outline: "none", transition: "border-color 0.2s",
  },
  textarea: {
    padding: "12px 16px", borderRadius: 12, border: "1.5px solid #D4C4B0",
    fontSize: 14, fontFamily: "'Outfit', sans-serif", background: "#fff",
    color: "#3A2F28", outline: "none", resize: "none", transition: "border-color 0.2s",
  },
  emojiGrid: { display: "flex", flexWrap: "wrap", gap: 6 },
  emojiBtn: {
    width: 36, height: 36, borderRadius: 10, border: "1.5px solid #D4C4B0", background: "#fff",
    fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.2s",
  },
  catSelect: { display: "flex", gap: 6, flexWrap: "wrap" },
  catOption: {
    padding: "7px 12px", borderRadius: 12, border: "1.5px solid #D4C4B0", background: "transparent",
    fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
    transition: "all 0.2s", color: "#5B4A3F",
  },
  freqSelect: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 },
  freqOption: {
    padding: "10px 8px", borderRadius: 12, border: "1.5px solid #D4C4B0", background: "transparent",
    fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
    transition: "all 0.2s", color: "#5B4A3F", textAlign: "center",
  },
  submitBtn: {
    padding: "14px 20px", borderRadius: 14, border: "none",
    background: "linear-gradient(135deg, #5B4A3F 0%, #3A2F28 100%)",
    color: "#FAF5EF", fontSize: 15, fontWeight: 600, cursor: "pointer",
    fontFamily: "'Outfit', sans-serif", boxShadow: "0 4px 16px rgba(58,47,40,0.2)",
    marginTop: 4, transition: "all 0.2s",
  },
  cancelBtn: {
    padding: "12px 20px", borderRadius: 14, border: "1.5px solid #D4C4B0", background: "transparent",
    color: "#5B4A3F", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
  },
  deleteBtn: {
    margin: "24px auto", display: "block", padding: "10px 20px", borderRadius: 12,
    border: "1px solid rgba(212,100,74,0.3)", background: "transparent",
    color: "#D4644A", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
  },

  // Insights
  insightCard: {
    margin: "8px 24px", padding: "18px 18px", background: "rgba(255,255,255,0.7)",
    borderRadius: 16, border: "1px solid rgba(212,196,176,0.3)",
  },
  insightTitle: {
    fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 16, fontWeight: 400,
    margin: "0 0 12px 0", color: "#3A2F28",
  },
  healthBar: { display: "flex", borderRadius: 4, overflow: "hidden", height: 8 },
  balanceRow: {
    display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
    borderBottom: "1px solid rgba(212,196,176,0.2)", width: "100%",
    background: "transparent", border: "none", borderBottom: "1px solid rgba(212,196,176,0.2)",
    cursor: "pointer", fontFamily: "'Outfit', sans-serif",
  },

  // Empty
  emptyState: { textAlign: "center", padding: "48px 24px" },
  emptyTitle: { fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 20, color: "#3A2F28", margin: "12px 0 4px" },
  emptyHint: { fontSize: 13, color: "#8B7E74" },

  // Toast
  toast: {
    position: "fixed", bottom: 96, left: "50%", transform: "translateX(-50%)",
    padding: "10px 20px", borderRadius: 12,
    background: "rgba(58,47,40,0.92)", color: "#FAF5EF",
    fontSize: 13, fontWeight: 500, zIndex: 200,
    animation: "fadeUp 0.3s ease-out", backdropFilter: "blur(8px)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)", fontFamily: "'Outfit', sans-serif",
    whiteSpace: "nowrap",
  },
};
