import { useState, useEffect, useCallback, useMemo } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "inner", label: "Innerer Kreis", emoji: "✦", color: "#E11D48", bg: "#FFF1F2", desc: "Familie & Engste" },
  { id: "close", label: "Enge Freunde", emoji: "◈", color: "#D97706", bg: "#FFFBEB", desc: "Die du nicht verlieren willst" },
  { id: "network", label: "Netzwerk", emoji: "◇", color: "#059669", bg: "#ECFDF5", desc: "Kollegen & Mentoren" },
  { id: "dormant", label: "Schlafend", emoji: "○", color: "#9CA3AF", bg: "#F3F4F6", desc: "Eingeschlafene Kontakte" },
];

const ROLES = [
  { id: "personal", label: "Persönlich", icon: "♡", color: "#F59E0B" },
  { id: "key_account", label: "Key Account", icon: "★", color: "#EF4444" },
  { id: "client", label: "Kunde", icon: "◆", color: "#10B981" },
  { id: "prospect", label: "Interessent", icon: "◇", color: "#3B82F6" },
  { id: "mentor", label: "Mentor", icon: "▲", color: "#8B5CF6" },
  { id: "colleague", label: "Kollege", icon: "■", color: "#06B6D4" },
  { id: "partner", label: "Partner/Dienstleister", icon: "◎", color: "#78716C" },
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

const SOCIAL_ACTIONS = [
  { id: "whatsapp",  label: "WhatsApp",    icon: "💚", effort: 1, field: "whatsapp",  placeholder: "+49... oder Nummer" },
  { id: "telegram",  label: "Telegram",    icon: "✈️", effort: 1, field: "telegram",  placeholder: "@username" },
  { id: "signal",    label: "Signal",      icon: "🔵", effort: 1, field: "signal",    placeholder: "+49..." },
  { id: "instagram", label: "Instagram",   icon: "📸", effort: 0, field: "instagram", placeholder: "@username" },
  { id: "linkedin",  label: "LinkedIn",    icon: "🔗", effort: 1, field: "linkedin",  placeholder: "Profil-URL oder Username" },
  { id: "twitter",   label: "X / Twitter", icon: "𝕏",  effort: 0, field: "twitter",   placeholder: "@handle" },
  { id: "facebook",  label: "Facebook",    icon: "👤", effort: 1, field: "facebook",  placeholder: "Profil-URL oder Username" },
  { id: "tiktok",    label: "TikTok",      icon: "🎵", effort: 0, field: "tiktok",    placeholder: "@username" },
  { id: "snapchat",  label: "Snapchat",    icon: "👻", effort: 0, field: "snapchat",  placeholder: "Username" },
  { id: "xing",      label: "XING",        icon: "🅧", effort: 1, field: "xing",      placeholder: "Profil-URL oder Username" },
  { id: "discord",   label: "Discord",     icon: "🎮", effort: 1, field: "discord",   placeholder: "Username#1234" },
  { id: "threads",   label: "Threads",     icon: "🧵", effort: 0, field: "threads",   placeholder: "@username" },
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
  return { ratio, label: "Sie geben mehr", color: "#0EA5E9", outgoing, incoming, icon: "↙" };
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
  const [pendingAction, setPendingAction] = useState(null); // {contact, actionId, note, topic}

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
  const [formSocials, setFormSocials] = useState({});
  const [showSocialFields, setShowSocialFields] = useState(false);

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
      socials: { ...formSocials },
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
      socials: { ...formSocials },
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

  // ─── Deep-Link Launcher ─────────────────────────────────────────────
  const _s = (c, key) => (c.socials || {})[key] || "";
  const _clean = (v) => v.replace(/^@/, "");

  const ACTION_LINKS = {
    call:      (c) => c.phone ? `tel:${c.phone}` : null,
    text:      (c) => c.phone ? `sms:${c.phone}` : null,
    email:     (c) => c.email ? `mailto:${c.email}` : null,
    video:     (c) => c.phone ? `facetime:${c.phone}` : (c.email ? `facetime:${c.email}` : null),
    voice:     (c) => c.phone ? `tel:${c.phone}` : null,
    whatsapp:  (c) => { const v = _s(c,"whatsapp") || c.phone; return v ? `https://wa.me/${v.replace(/[^0-9+]/g,"")}` : null; },
    telegram:  (c) => { const v = _s(c,"telegram"); return v ? `https://t.me/${_clean(v)}` : null; },
    signal:    (c) => { const v = _s(c,"signal") || c.phone; return v ? `https://signal.me/#p/${v}` : null; },
    instagram: (c) => { const v = _s(c,"instagram"); return v ? `https://instagram.com/${_clean(v)}` : null; },
    linkedin:  (c) => { const v = _s(c,"linkedin"); return v ? (v.startsWith("http") ? v : `https://linkedin.com/in/${_clean(v)}`) : null; },
    twitter:   (c) => { const v = _s(c,"twitter"); return v ? `https://x.com/${_clean(v)}` : null; },
    facebook:  (c) => { const v = _s(c,"facebook"); return v ? (v.startsWith("http") ? v : `https://facebook.com/${_clean(v)}`) : null; },
    tiktok:    (c) => { const v = _s(c,"tiktok"); return v ? `https://tiktok.com/@${_clean(v)}` : null; },
    snapchat:  (c) => { const v = _s(c,"snapchat"); return v ? `https://snapchat.com/add/${_clean(v)}` : null; },
    xing:      (c) => { const v = _s(c,"xing"); return v ? (v.startsWith("http") ? v : `https://xing.com/profile/${_clean(v)}`) : null; },
    discord:   (c) => { const v = _s(c,"discord"); return v ? `https://discord.com/users/${_clean(v)}` : null; },
    threads:   (c) => { const v = _s(c,"threads"); return v ? `https://threads.net/@${_clean(v)}` : null; },
  };

  const ACTION_LABELS_DE = {
    call:      (c) => `${c.name} anrufen?`,
    text:      (c) => `Nachricht an ${c.name} schreiben?`,
    email:     (c) => `E-Mail an ${c.name} senden?`,
    video:     (c) => `Videocall mit ${c.name} starten?`,
    voice:     (c) => `Sprachnachricht an ${c.name}?`,
    meet:      (c) => `Treffen mit ${c.name} loggen?`,
    gift:      (c) => `Überraschung für ${c.name} loggen?`,
    react:     (c) => `Reaktion an ${c.name} loggen?`,
    whatsapp:  (c) => `WhatsApp an ${c.name} öffnen?`,
    telegram:  (c) => `Telegram-Chat mit ${c.name} öffnen?`,
    signal:    (c) => `Signal-Chat mit ${c.name} öffnen?`,
    instagram: (c) => `Instagram-Profil von ${c.name} öffnen?`,
    linkedin:  (c) => `LinkedIn-Profil von ${c.name} öffnen?`,
    twitter:   (c) => `X/Twitter von ${c.name} öffnen?`,
    facebook:  (c) => `Facebook von ${c.name} öffnen?`,
    tiktok:    (c) => `TikTok von ${c.name} öffnen?`,
    snapchat:  (c) => `Snapchat von ${c.name} öffnen?`,
    xing:      (c) => `XING-Profil von ${c.name} öffnen?`,
    discord:   (c) => `Discord-Profil von ${c.name} öffnen?`,
    threads:   (c) => `Threads von ${c.name} öffnen?`,
  };

  const ACTION_MISSING_DE = {
    call:      "Keine Telefonnummer hinterlegt. Trotzdem als Anruf loggen?",
    text:      "Keine Telefonnummer hinterlegt. Trotzdem als Nachricht loggen?",
    email:     "Keine E-Mail-Adresse hinterlegt. Trotzdem loggen?",
    video:     "Keine Telefonnummer/E-Mail hinterlegt. Trotzdem loggen?",
    voice:     "Keine Telefonnummer hinterlegt. Trotzdem loggen?",
    whatsapp:  "Kein WhatsApp hinterlegt. Trotzdem loggen?",
    telegram:  "Kein Telegram hinterlegt. Trotzdem loggen?",
    signal:    "Kein Signal hinterlegt. Trotzdem loggen?",
    instagram: "Kein Instagram hinterlegt. Trotzdem loggen?",
    linkedin:  "Kein LinkedIn hinterlegt. Trotzdem loggen?",
    twitter:   "Kein X/Twitter hinterlegt. Trotzdem loggen?",
    facebook:  "Kein Facebook hinterlegt. Trotzdem loggen?",
    tiktok:    "Kein TikTok hinterlegt. Trotzdem loggen?",
    snapchat:  "Kein Snapchat hinterlegt. Trotzdem loggen?",
    xing:      "Kein XING hinterlegt. Trotzdem loggen?",
    discord:   "Kein Discord hinterlegt. Trotzdem loggen?",
    threads:   "Kein Threads hinterlegt. Trotzdem loggen?",
  };

  const initiateAction = (contact, actionId, note = "", topic = "") => {
    const action = REACH_ACTIONS.find(a => a.id === actionId) || SOCIAL_ACTIONS.find(a => a.id === actionId);
    if (!action) return;
    const linkFn = ACTION_LINKS[actionId];
    const link = linkFn ? linkFn(contact) : null;
    setPendingAction({ contact, actionId, note, topic, link });
  };

  const confirmAction = () => {
    if (!pendingAction) return;
    const { contact, actionId, note, topic, link } = pendingAction;
    if (link) {
      window.open(link, "_blank");
    }
    logReach(contact, actionId, note, topic);
    setPendingAction(null);
  };

  const cancelAction = () => setPendingAction(null);

  const logReach = (contact, actionId, note = "", topic = "") => {
    const action = REACH_ACTIONS.find(a => a.id === actionId) || SOCIAL_ACTIONS.find(a => a.id === actionId);
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
    setFormSocials({}); setShowSocialFields(false);
  };

  const openEdit = (c) => {
    setFormName(c.name); setFormCategory(c.category); setFormFrequency(c.frequency);
    setFormNote(c.note || ""); setFormEmoji(c.emoji); setFormRole(c.role || "personal");
    setFormCompany(c.company || ""); setFormBirthday(c.birthday || "");
    setFormTags(c.tags || []); setFormPhone(c.phone || ""); setFormEmail(c.email || "");
    setFormSocials(c.socials || {});
    setShowSocialFields(Object.values(c.socials || {}).some(v => v));
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
      <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: "#44403C", fontSize: 18 }}>Lade dein Netzwerk...</p>
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
            <p style={{ fontSize: 13, color: "#78716C", margin: "4px 0 16px" }}>Netzwerk-Gesundheit</p>
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
                  <span style={{ fontSize: 12, color: "#059669" }}>Du → {networkHealth.totalOutgoing}</span>
                  <span style={{ fontSize: 12, color: "#0EA5E9" }}>{networkHealth.totalIncoming} ← Sie</span>
                </div>
                <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ flex: networkHealth.totalOutgoing || 1, background: "#059669" }} />
                  <div style={{ flex: networkHealth.totalIncoming || 1, background: "#0EA5E9" }} />
                </div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "#78716C" }}>
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
                  <span style={{ fontSize: 11, color: "#059669" }}>{c.balance.outgoing}↗</span>
                  <div style={{ width: 48, height: 6, borderRadius: 3, overflow: "hidden", display: "flex" }}>
                    <div style={{ flex: c.balance.outgoing || 1, background: "#059669" }} />
                    <div style={{ flex: c.balance.incoming || 1, background: "#0EA5E9" }} />
                  </div>
                  <span style={{ fontSize: 11, color: "#0EA5E9" }}>↙{c.balance.incoming}</span>
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
                <div style={{ width: 80, height: 6, borderRadius: 3, background: "#E7E5E4", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(r.count / contacts.length) * 100}%`, background: r.color, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 12, color: "#78716C", width: 20, textAlign: "right" }}>{r.count}</span>
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
              <span style={{ fontSize: 12, color: "#E11D48" }}>{formatDate(c.lastContact)}</span>
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
            <p style={{ fontSize: 14, color: "#78716C", marginBottom: 16 }}>{c.emoji} {c.name} hat sich bei dir gemeldet</p>

            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Gesprächsthema (optional)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                {CONVERSATION_TOPICS.map(t => (
                  <button key={t} style={{ ...styles.topicChip, ...(logTopic === t ? { background: "#18181B", color: "#FAFAF9", borderColor: "#18181B" } : {}) }}
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
          {c.company && <p style={{ fontSize: 13, color: "#78716C", margin: "4px 0" }}>{c.company}</p>}

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
            <span style={{ fontSize: 11, color: "#059669" }}>Du {balance.outgoing}×</span>
            <div style={{ flex: 1, height: 6, borderRadius: 3, overflow: "hidden", display: "flex" }}>
              <div style={{ flex: balance.outgoing || 1, background: "#059669", transition: "flex 0.6s" }} />
              <div style={{ flex: balance.incoming || 1, background: "#0EA5E9", transition: "flex 0.6s" }} />
            </div>
            <span style={{ fontSize: 11, color: "#0EA5E9" }}>{balance.incoming}× Sie</span>
          </div>
        </div>

        {/* Tags */}
        {(c.tags && c.tags.length > 0) && (
          <div style={{ padding: "0 28px 8px", display: "flex", flexWrap: "wrap", gap: 8 }}>
            {c.tags.map(t => (
              <span key={t} style={styles.tagDisplay}>{t}</span>
            ))}
          </div>
        )}

        {c.note && <div style={styles.noteBox}><span style={{ opacity: 0.5 }}>📝</span> {c.note}</div>}

        {/* Contact Info */}
        {(c.phone || c.email) && (
          <div style={{ padding: "0 28px 14px", display: "flex", gap: 10, flexWrap: "wrap" }}>
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
                ...((c.tags || []).includes(t) ? { background: "#18181B", color: "#FAFAF9", borderColor: "#18181B" } : {}),
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
                <label style={{ fontSize: 11, color: "#78716C" }}>Thema</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                  {CONVERSATION_TOPICS.slice(0, 8).map(t => (
                    <button key={t} style={{ ...styles.topicChip, fontSize: 10, padding: "3px 8px", ...(logTopic === t ? { background: "#18181B", color: "#FAFAF9", borderColor: "#18181B" } : {}) }}
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
                  onClick={() => initiateAction(c, a.id, logNote, logTopic)}>
                  <span style={{ fontSize: 22 }}>{a.icon}</span>
                  <span style={styles.actionLabel}>{a.label}</span>
                  {!energyOk && <span style={{ fontSize: 9, color: "#78716C" }}>Energie?</span>}
                </button>
              );
            })}
          </div>

          {/* Social Media Actions */}
          {(() => {
            const activeSocials = SOCIAL_ACTIONS.filter(a => {
              const val = (c.socials || {})[a.field];
              return val && val.trim();
            });
            if (!activeSocials.length) return null;
            return (
              <>
                <h3 style={{ ...styles.sectionTitle, fontSize: 15, marginTop: 16, marginBottom: 8 }}>Social Media</h3>
                <div style={styles.actionGrid}>
                  {activeSocials.map(a => (
                    <button key={a.id} style={styles.actionBtn}
                      onClick={() => initiateAction(c, a.id, logNote, logTopic)}>
                      <span style={{ fontSize: 22 }}>{a.icon}</span>
                      <span style={styles.actionLabel}>{a.label}</span>
                    </button>
                  ))}
                </div>
              </>
            );
          })()}
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
                  <div style={{ ...styles.timelineDot, background: h.incoming ? "#0EA5E9" : "#059669" }} />
                  <div style={styles.timelineContent}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                      <span style={{ fontSize: 13 }}>
                        {h.incoming ? "📥 " : "📤 "}{h.icon} {h.label}
                      </span>
                      {h.topic && <span style={{ fontSize: 11, color: "#059669" }}>{h.topic}</span>}
                      {h.note && <span style={{ fontSize: 11, color: "#78716C", fontStyle: "italic" }}>{h.note}</span>}
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

        {/* ─── Action Confirmation Dialog (Detail View) ─── */}
        {pendingAction && (() => {
          const { contact, actionId, link } = pendingAction;
          const action = REACH_ACTIONS.find(a => a.id === actionId) || SOCIAL_ACTIONS.find(a => a.id === actionId);
          const labelFn = ACTION_LABELS_DE[actionId];
          const headline = labelFn ? labelFn(contact) : `${action.label} mit ${contact.name}?`;
          const missingMsg = !link && ACTION_MISSING_DE[actionId];
          const hasLink = !!link;
          const socialVal = (contact.socials || {})[actionId] || "";
          const linkLabel = {
            call: `📞 ${contact.phone}`,
            text: `💬 ${contact.phone}`,
            email: `📧 ${contact.email}`,
            video: `🖥️ ${contact.phone || contact.email}`,
            voice: `🎙️ ${contact.phone}`,
            whatsapp: `💚 ${socialVal || contact.phone}`,
            telegram: `✈️ ${socialVal}`,
            signal: `🔵 ${socialVal || contact.phone}`,
            instagram: `📸 ${socialVal}`,
            linkedin: `🔗 ${socialVal}`,
            twitter: `𝕏 ${socialVal}`,
            facebook: `👤 ${socialVal}`,
            tiktok: `🎵 ${socialVal}`,
            snapchat: `👻 ${socialVal}`,
            xing: `🅧 ${socialVal}`,
            discord: `🎮 ${socialVal}`,
            threads: `🧵 ${socialVal}`,
          }[actionId];

          return (
            <div style={styles.confirmOverlay} onClick={cancelAction}>
              <div style={styles.confirmDialog} onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: 40, textAlign: "center", marginBottom: 8 }}>{action.icon}</div>
                <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, textAlign: "center", marginBottom: 4 }}>
                  {headline}
                </h3>
                {hasLink && (
                  <p style={{ textAlign: "center", fontSize: 13, color: "#57534E", marginBottom: 12 }}>
                    {linkLabel} — App wird geöffnet
                  </p>
                )}
                {missingMsg && (
                  <p style={{ textAlign: "center", fontSize: 12, color: "#D97706", background: "rgba(217,119,6,.08)", padding: "6px 10px", borderRadius: 8, marginBottom: 12 }}>
                    ⚠ {missingMsg}
                  </p>
                )}
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button style={styles.confirmCancel} onClick={cancelAction}>Abbrechen</button>
                  <button style={styles.confirmOk} onClick={confirmAction}>
                    {hasLink ? `${action.icon} Öffnen & Loggen` : `${action.icon} Loggen`}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
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
              <button key={e} style={{ ...styles.emojiBtn, ...(formEmoji === e ? { background: "#18181B", transform: "scale(1.2)" } : {}) }}
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
                ...(formFrequency === f.id ? { background: "#18181B", color: "#fff", borderColor: "#18181B" } : {}),
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
          <button style={{ ...styles.topicChip, width: "100%", textAlign: "center", padding: "10px", fontSize: 13 }}
            onClick={() => setShowSocialFields(!showSocialFields)}>
            {showSocialFields ? "Social Media ausblenden ▲" : "📱 Social Media hinzufügen ▼"}
          </button>
          {showSocialFields && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
              {SOCIAL_ACTIONS.map(s => (
                <div key={s.id} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <label style={{ fontSize: 11, color: "#78716C", fontFamily: "'Outfit', sans-serif" }}>
                    {s.icon} {s.label}
                  </label>
                  <input style={{ ...styles.input, fontSize: 12, padding: "8px 10px" }}
                    value={formSocials[s.field] || ""}
                    onChange={e => setFormSocials({ ...formSocials, [s.field]: e.target.value })}
                    placeholder={s.placeholder} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Tags</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {TAGS.map(t => (
              <button key={t} style={{
                ...styles.topicChip,
                ...(formTags.includes(t) ? { background: "#18181B", color: "#FAFAF9", borderColor: "#18181B" } : {}),
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
        @keyframes slideUp { from { opacity:0; transform:translateY(40px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes popIn { 0% { opacity:0; transform:scale(0.8); } 60% { transform:scale(1.04); } 100% { opacity:1; transform:scale(1); } }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(0.96); } }
        @keyframes float { 0%,100% { transform:translateY(0) rotate(0deg); } 50% { transform:translateY(-6px) rotate(1deg); } }
        @keyframes breathe { 0%,100% { transform:scale(1); } 50% { transform:scale(1.015); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes fabGlow { 0%,100% { box-shadow: 0 8px 32px rgba(99,102,241,0.3), 0 0 0 0px rgba(99,102,241,0.15); } 50% { box-shadow: 0 8px 40px rgba(99,102,241,0.45), 0 0 0 8px rgba(99,102,241,0.08); } }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        ::-webkit-scrollbar { width: 0; height: 0; }
        button { cursor: pointer; }
        button:active { transform: scale(0.96) !important; transition: transform 0.08s !important; }
        button:hover { filter: brightness(0.98); }
        input:focus, textarea:focus { box-shadow: 0 0 0 3px rgba(99,102,241,0.15), 0 2px 16px rgba(99,102,241,0.08) !important; }
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
          <div style={{ width: 1, height: 28, background: "rgba(0,0,0,0.08)" }} />
          <div style={styles.stat}>
            <span style={{ ...styles.statNum, color: needAttention.length > 0 ? "#D4644A" : "#059669" }}>{needAttention.length}</span>
            <span style={styles.statLabel}>brauchen dich</span>
          </div>
          <div style={{ width: 1, height: 28, background: "rgba(0,0,0,0.08)" }} />
          <div style={styles.stat}>
            <span style={{ ...styles.statNum, color: "#059669" }}>
              {contacts.filter(c => getWarmth(c.lastContact, c.frequencyDays).level === "thriving").length}
            </span>
            <span style={styles.statLabel}>blühen</span>
          </div>
          {networkHealth && (
            <>
              <div style={{ width: 1, height: 28, background: "rgba(0,0,0,0.08)" }} />
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
                  <span style={{ fontSize: 11, color: "#78716C" }}>{s.contact.emoji} {s.contact.name}</span>
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
                <span style={{ fontSize: 11, color: "#8B5CF6", fontWeight: 600 }}>
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
          <h3 style={{ ...styles.sectionTitle, color: "#E11D48" }}>⚡ Brauchen Aufmerksamkeit</h3>
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
        <div style={{ width: 1, height: 24, background: "rgba(0,0,0,0.08)", flexShrink: 0 }} />
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

      {/* ─── Action Confirmation Dialog ─── */}
      {pendingAction && (() => {
        const { contact, actionId, link } = pendingAction;
        const action = REACH_ACTIONS.find(a => a.id === actionId) || SOCIAL_ACTIONS.find(a => a.id === actionId);
        const labelFn = ACTION_LABELS_DE[actionId];
        const headline = labelFn ? labelFn(contact) : `${action.label} mit ${contact.name}?`;
        const missingMsg = !link && ACTION_MISSING_DE[actionId];
        const hasLink = !!link;
        const linkLabel = {
          call: `📞 ${contact.phone}`,
          text: `💬 ${contact.phone}`,
          email: `📧 ${contact.email}`,
          video: `🖥️ ${contact.phone || contact.email}`,
          voice: `🎙️ ${contact.phone}`,
        }[actionId];

        return (
          <div style={styles.confirmOverlay} onClick={cancelAction}>
            <div style={styles.confirmDialog} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 40, textAlign: "center", marginBottom: 8 }}>{action.icon}</div>
              <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, textAlign: "center", marginBottom: 4 }}>
                {headline}
              </h3>
              {hasLink && (
                <p style={{ textAlign: "center", fontSize: 13, color: "#57534E", marginBottom: 12 }}>
                  {linkLabel} — App wird geöffnet
                </p>
              )}
              {missingMsg && (
                <p style={{ textAlign: "center", fontSize: 12, color: "#D97706", background: "rgba(217,119,6,.08)", padding: "6px 10px", borderRadius: 8, marginBottom: 12 }}>
                  ⚠ {missingMsg}
                </p>
              )}
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button style={styles.confirmCancel} onClick={cancelAction}>Abbrechen</button>
                <button style={styles.confirmOk} onClick={confirmAction}>
                  {hasLink ? `${action.icon} Öffnen & Loggen` : `${action.icon} Loggen`}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── FONTS COMPONENT ─────────────────────────────────────────────────────────

function Fonts() {
  return <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />;
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = {
  app: {
    fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    background: `
      radial-gradient(ellipse at 20% 0%, rgba(99,102,241,0.06) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 100%, rgba(16,185,129,0.05) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(245,158,11,0.03) 0%, transparent 60%),
      linear-gradient(165deg, #FAFAF8 0%, #F5F3EF 35%, #EFECE7 65%, #E9E5E0 100%)
    `,
    minHeight: "100vh",
    maxWidth: 480,
    margin: "0 auto",
    position: "relative",
    paddingBottom: 110,
    color: "#1C1917",
    overflow: "hidden",
  },
  loadWrap: {
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    height: "100vh",
    background: "linear-gradient(165deg, #FAFAF8 0%, #EFECE7 100%)",
  },
  loadPulse: { fontSize: 52, animation: "pulse 1.8s ease-in-out infinite", color: "#6366F1", marginBottom: 20 },

  // Hero
  hero: { position: "relative", padding: "56px 28px 32px", overflow: "hidden" },
  heroDecor: { position: "absolute", inset: 0, pointerEvents: "none" },
  heroShape: { position: "absolute", color: "#6366F1", animation: "float 5s ease-in-out infinite" },
  heroTitle: {
    fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 48, fontWeight: 400,
    lineHeight: 0.95, color: "#1C1917", margin: 0, letterSpacing: -2,
    background: "linear-gradient(135deg, #1C1917 0%, #6366F1 100%)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSub: { fontSize: 15, color: "#78716C", marginTop: 12, fontWeight: 400, letterSpacing: 0.2 },
  insightsBtn: {
    width: 48, height: 48, borderRadius: 16, border: "none",
    background: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 20, cursor: "pointer", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 2px 16px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)",
    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  statsRow: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 18,
    marginTop: 28, padding: "22px 22px",
    background: "rgba(255,255,255,0.72)",
    borderRadius: 24, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", flexWrap: "wrap",
    boxShadow: "0 4px 32px rgba(0,0,0,0.04), 0 0 0 1px rgba(255,255,255,0.8)",
    border: "1px solid rgba(0,0,0,0.04)",
  },
  stat: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  statNum: { fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 32, color: "#1C1917", lineHeight: 1 },
  statLabel: { fontSize: 10, color: "#78716C", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" },

  // Section
  section: { padding: "16px 28px 10px" },
  sectionTitle: {
    fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 19, fontWeight: 400,
    margin: "0 0 14px 0", color: "#1C1917",
  },

  // Energy
  energyBtn: {
    flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
    padding: "14px 18px", borderRadius: 20, border: "1px solid rgba(0,0,0,0.04)",
    background: "rgba(255,255,255,0.65)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
    cursor: "pointer", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)", fontFamily: "'Outfit', sans-serif",
    boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
  },

  // Suggestions
  suggestionList: { display: "flex", flexDirection: "column", gap: 10 },
  suggestionCard: {
    display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
    background: "rgba(255,255,255,0.72)", border: "1px solid rgba(0,0,0,0.04)",
    borderRadius: 20, cursor: "pointer", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    fontFamily: "'Outfit', sans-serif", width: "100%", textAlign: "left",
    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
    boxShadow: "0 2px 16px rgba(0,0,0,0.03)",
  },

  // Attention cards
  attentionScroll: { display: "flex", gap: 12, overflowX: "auto", paddingBottom: 10, scrollSnapType: "x mandatory" },
  attentionCard: {
    flex: "0 0 auto", width: 120, padding: "20px 14px", background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(0,0,0,0.04)", borderRadius: 22,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
    cursor: "pointer", scrollSnapAlign: "start", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
    fontFamily: "'Outfit', sans-serif",
  },
  attentionEmoji: { fontSize: 32 },
  attentionName: { fontSize: 12, fontWeight: 600, color: "#1C1917", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" },
  attentionStatus: { fontSize: 11, fontWeight: 700 },
  attentionTime: { fontSize: 10, color: "#78716C" },

  // Filters
  filterRow: { display: "flex", gap: 8, padding: "10px 28px 6px", overflowX: "auto", alignItems: "center" },
  filterBtn: {
    padding: "9px 18px", borderRadius: 50, border: "1px solid rgba(0,0,0,0.06)",
    background: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 500, color: "#44403C",
    cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Outfit', sans-serif",
    transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)", flexShrink: 0,
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    boxShadow: "0 1px 6px rgba(0,0,0,0.02)",
  },
  filterActive: {
    background: "linear-gradient(135deg, #18181B 0%, #27272A 100%)", color: "#FAFAF9",
    boxShadow: "0 4px 16px rgba(24,24,27,0.2)", border: "1px solid transparent",
  },

  // Contact List
  contactList: { padding: "8px 20px" },
  contactCard: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    width: "100%", padding: "18px 20px", background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(0,0,0,0.04)", borderRadius: 22,
    marginBottom: 10, cursor: "pointer", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    animation: "fadeUp 0.5s ease-out both",
    boxShadow: "0 2px 16px rgba(0,0,0,0.03)",
    fontFamily: "'Outfit', sans-serif", textAlign: "left",
    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
  },
  cardLeft: { display: "flex", alignItems: "center", gap: 14, minWidth: 0, flex: 1 },
  cardEmoji: {
    width: 50, height: 50, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 24, flexShrink: 0, boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    border: "1px solid rgba(0,0,0,0.04)",
  },
  cardInfo: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  cardName: { fontSize: 15, fontWeight: 600, color: "#1C1917", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cardMeta: { fontSize: 11, color: "#78716C", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cardRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0, marginLeft: 10 },
  miniBar: { width: 56, height: 6, borderRadius: 20, background: "rgba(0,0,0,0.06)", overflow: "hidden" },
  miniBarFill: { height: "100%", borderRadius: 20, transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)" },
  cardStatus: { fontSize: 10, fontWeight: 700, letterSpacing: 0.3 },

  // FAB
  fab: {
    position: "fixed", bottom: 32, right: "calc(50% - 212px)",
    width: 64, height: 64, borderRadius: 22,
    background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #4338CA 100%)",
    color: "#fff", border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 8px 32px rgba(99,102,241,0.35), 0 0 0 4px rgba(99,102,241,0.12)",
    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)", zIndex: 100,
    animation: "fabGlow 3s ease-in-out infinite",
  },

  // Header
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px 10px" },
  headerTitle: { fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 21, margin: 0, color: "#1C1917" },
  backBtn: {
    background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)", fontSize: 14, color: "#44403C",
    cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 500, padding: "10px 18px",
    borderRadius: 50, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    boxShadow: "0 1px 8px rgba(0,0,0,0.03)",
    transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  editBtn: {
    background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)", fontSize: 16, color: "#44403C",
    cursor: "pointer", padding: "10px 14px", borderRadius: 50,
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    boxShadow: "0 1px 8px rgba(0,0,0,0.03)",
    transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },

  // Detail
  detailHero: { textAlign: "center", padding: "12px 28px 24px" },
  detailEmoji: {
    fontSize: 64, marginBottom: 14,
    width: 108, height: 108, lineHeight: "108px",
    borderRadius: 32, background: "rgba(255,255,255,0.75)",
    display: "inline-block",
    boxShadow: "0 12px 40px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)",
    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.8)",
    animation: "popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
  },
  detailName: { fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 36, fontWeight: 400, margin: "0 0 12px", color: "#1C1917", letterSpacing: -0.5 },
  catBadge: {
    display: "inline-block", padding: "7px 18px", borderRadius: 50, fontSize: 12, fontWeight: 600,
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(0,0,0,0.06)",
  },
  warmthBarOuter: {
    height: 8, borderRadius: 20, background: "rgba(0,0,0,0.06)", margin: "20px auto 10px",
    maxWidth: 220, overflow: "hidden",
  },
  warmthBarInner: { height: "100%", borderRadius: 20, transition: "width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" },
  warmthLabel: { fontSize: 12, color: "#78716C", letterSpacing: 0.2 },
  noteBox: {
    margin: "0 28px 14px", padding: "18px 22px",
    background: "rgba(255,255,255,0.68)", borderRadius: 20,
    fontSize: 13, color: "#44403C", lineHeight: 1.65,
    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
    boxShadow: "0 2px 16px rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.04)",
  },
  bdayBadge: {
    display: "inline-block", marginTop: 12, padding: "7px 20px", borderRadius: 50,
    fontSize: 12, fontWeight: 600, background: "rgba(139,92,246,0.1)", color: "#7C3AED",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(139,92,246,0.15)",
  },

  // Balance card
  balanceCard: {
    margin: "0 28px 14px", padding: "20px 22px", background: "rgba(255,255,255,0.68)",
    borderRadius: 22, border: "1px solid rgba(0,0,0,0.04)",
    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
    boxShadow: "0 2px 16px rgba(0,0,0,0.03)",
  },

  // Contact info
  contactInfo: {
    fontSize: 12, color: "#44403C", padding: "9px 16px", borderRadius: 50,
    background: "rgba(255,255,255,0.68)", border: "1px solid rgba(0,0,0,0.05)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    boxShadow: "0 1px 6px rgba(0,0,0,0.02)",
    fontWeight: 500,
  },

  // Tags
  tagDisplay: {
    fontSize: 11, padding: "6px 16px", borderRadius: 50,
    background: "rgba(99,102,241,0.08)", color: "#4F46E5", fontWeight: 600,
    border: "1px solid rgba(99,102,241,0.1)",
  },
  topicChip: {
    padding: "8px 16px", borderRadius: 50, border: "1px solid rgba(0,0,0,0.06)",
    background: "rgba(255,255,255,0.6)", fontSize: 11, color: "#44403C", cursor: "pointer",
    fontFamily: "'Outfit', sans-serif", transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)", whiteSpace: "nowrap",
    boxShadow: "0 1px 6px rgba(0,0,0,0.02)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    fontWeight: 500,
  },

  // Incoming
  incomingBtn: {
    width: "100%", padding: "18px 22px", borderRadius: 22,
    border: "1px solid rgba(14,165,233,0.15)", background: "rgba(14,165,233,0.06)",
    color: "#0284C7", fontSize: 14, fontWeight: 600, cursor: "pointer",
    fontFamily: "'Outfit', sans-serif", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    textAlign: "center", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    boxShadow: "0 2px 12px rgba(14,165,233,0.06)",
  },

  // Actions
  actionGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 },
  actionBtn: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
    padding: "18px 8px", background: "rgba(255,255,255,0.72)", border: "1px solid rgba(0,0,0,0.04)",
    borderRadius: 20, cursor: "pointer", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    fontFamily: "'Outfit', sans-serif",
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
  },
  actionLabel: { fontSize: 10, fontWeight: 700, color: "#1C1917", letterSpacing: 0.2 },

  // Timeline
  timeline: { paddingLeft: 8 },
  timelineItem: {
    display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12, position: "relative",
    padding: "12px 16px", background: "rgba(255,255,255,0.5)", borderRadius: 18,
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(0,0,0,0.03)",
    transition: "all 0.2s ease",
  },
  timelineDot: {
    width: 10, height: 10, borderRadius: 20, background: "#D6D3D1", marginTop: 5, flexShrink: 0,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  timelineContent: { display: "flex", justifyContent: "space-between", flex: 1, fontSize: 13, alignItems: "flex-start" },
  timelineDate: { fontSize: 11, color: "#78716C", flexShrink: 0, marginLeft: 8 },

  // Form
  formWrap: { padding: "8px 28px", paddingBottom: 36 },
  formInner: { display: "flex", flexDirection: "column", gap: 20 },
  formGroup: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 13, fontWeight: 700, color: "#44403C", letterSpacing: 0.3 },
  input: {
    padding: "15px 22px", borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)",
    fontSize: 15, fontFamily: "'Outfit', sans-serif",
    background: "rgba(255,255,255,0.75)", color: "#1C1917", outline: "none",
    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
  },
  textarea: {
    padding: "16px 22px", borderRadius: 20, border: "1px solid rgba(0,0,0,0.06)",
    fontSize: 14, fontFamily: "'Outfit', sans-serif",
    background: "rgba(255,255,255,0.75)", color: "#1C1917", outline: "none", resize: "none",
    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
  },
  emojiGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  emojiBtn: {
    width: 44, height: 44, borderRadius: 14, border: "1px solid rgba(0,0,0,0.04)",
    background: "rgba(255,255,255,0.6)",
    fontSize: 19, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
    boxShadow: "0 1px 6px rgba(0,0,0,0.02)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
  },
  catSelect: { display: "flex", gap: 8, flexWrap: "wrap" },
  catOption: {
    padding: "10px 18px", borderRadius: 50, border: "1px solid rgba(0,0,0,0.06)",
    background: "rgba(255,255,255,0.6)",
    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
    transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)", color: "#44403C",
    boxShadow: "0 1px 6px rgba(0,0,0,0.02)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
  },
  freqSelect: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 },
  freqOption: {
    padding: "13px 10px", borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)",
    background: "rgba(255,255,255,0.6)",
    fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
    transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)", color: "#44403C", textAlign: "center",
    boxShadow: "0 1px 6px rgba(0,0,0,0.02)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
  },
  submitBtn: {
    padding: "18px 28px", borderRadius: 18, border: "none",
    background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #4338CA 100%)",
    color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer",
    fontFamily: "'Outfit', sans-serif",
    boxShadow: "0 8px 32px rgba(99,102,241,0.3), 0 0 0 1px rgba(99,102,241,0.1)",
    marginTop: 8, transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    letterSpacing: 0.3,
  },
  cancelBtn: {
    padding: "15px 24px", borderRadius: 16, border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    color: "#44403C", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
    boxShadow: "0 1px 6px rgba(0,0,0,0.02)",
    transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  deleteBtn: {
    margin: "28px auto", display: "block", padding: "14px 28px", borderRadius: 16,
    border: "1px solid rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.06)",
    color: "#DC2626", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
    boxShadow: "0 2px 12px rgba(239,68,68,0.06)",
    transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },

  // Insights
  insightCard: {
    margin: "10px 28px", padding: "24px 24px", background: "rgba(255,255,255,0.68)",
    borderRadius: 24, border: "1px solid rgba(0,0,0,0.04)",
    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.03)",
  },
  insightTitle: {
    fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 17, fontWeight: 400,
    margin: "0 0 16px 0", color: "#1C1917",
  },
  healthBar: { display: "flex", borderRadius: 20, overflow: "hidden", height: 10 },
  balanceRow: {
    display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
    width: "100%", background: "transparent", border: "none",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
    cursor: "pointer", fontFamily: "'Outfit', sans-serif",
    transition: "all 0.2s",
  },

  // Empty
  emptyState: { textAlign: "center", padding: "60px 28px" },
  emptyTitle: { fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 24, color: "#1C1917", margin: "16px 0 8px" },
  emptyHint: { fontSize: 14, color: "#78716C" },

  // Toast
  toast: {
    position: "fixed", bottom: 104, left: "50%", transform: "translateX(-50%)",
    padding: "14px 28px", borderRadius: 50,
    background: "rgba(24,24,27,0.92)", color: "#FAFAF9",
    fontSize: 14, fontWeight: 500, zIndex: 200,
    animation: "slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05)", fontFamily: "'Outfit', sans-serif",
    whiteSpace: "nowrap", letterSpacing: 0.3,
  },

  // Confirmation Dialog
  confirmOverlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)",
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 300, animation: "fadeUp 0.2s ease-out",
  },
  confirmDialog: {
    background: "rgba(250,250,248,0.96)", borderRadius: 28,
    padding: "32px 28px 24px", maxWidth: 360, width: "90%",
    boxShadow: "0 24px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)",
    backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
    fontFamily: "'Outfit', sans-serif",
    animation: "popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both",
  },
  confirmOk: {
    flex: 1, padding: "15px 0", borderRadius: 16, border: "none",
    background: "linear-gradient(135deg, #6366F1, #4F46E5)", color: "#fff", fontSize: 14, fontWeight: 600,
    cursor: "pointer", fontFamily: "'Outfit', sans-serif",
    transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)", letterSpacing: 0.3,
    boxShadow: "0 4px 16px rgba(99,102,241,0.25)",
  },
  confirmCancel: {
    flex: 1, padding: "15px 0", borderRadius: 16,
    border: "1.5px solid rgba(0,0,0,0.1)", background: "transparent",
    color: "#44403C", fontSize: 14, fontWeight: 500,
    cursor: "pointer", fontFamily: "'Outfit', sans-serif",
    transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
};
