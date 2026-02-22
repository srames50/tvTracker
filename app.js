const CONFIG = window.TV_TRACKER_CONFIG || {};
const MISSING_CONFIG =
  !CONFIG.supabaseUrl ||
  !CONFIG.supabaseAnonKey ||
  CONFIG.supabaseUrl === "YOUR_SUPABASE_URL" ||
  CONFIG.supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY";

const TABLE_NAME = "tv_sessions";

let supabaseClient = null;
if (!MISSING_CONFIG && window.supabase && window.supabase.createClient) {
  supabaseClient = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
}

function requireSupabaseClient() {
  if (MISSING_CONFIG) {
    throw new Error("Missing Supabase config. Check config.js values.");
  }

  if (!window.supabase || !window.supabase.createClient) {
    throw new Error("Supabase SDK failed to load. Check network access to jsdelivr.");
  }

  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
  }

  return supabaseClient;
}

function setStatus(message, isError = false) {
  const statusEl = document.getElementById("sync-status") || document.getElementById("form-message");
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#b02d23" : "#64748b";
}

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function calculateSessionHours(start, end) {
  const startMinutes = toMinutes(start);
  let endMinutes = toMinutes(end);

  // Allow overnight sessions by treating end time before start time as next day.
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  const diffMinutes = endMinutes - startMinutes;
  return diffMinutes / 60;
}

function formatHours(hours) {
  return `${hours.toFixed(2)} hrs`;
}

function dateAtMidnight(dateString) {
  return new Date(`${dateString}T00:00:00`);
}

function calculateStats(sessions) {
  if (sessions.length === 0) {
    return {
      totalHours: 0,
      avgDaily: 0,
      avgWeekly: 0,
      totalSessions: 0,
    };
  }

  const totalHours = sessions.reduce((sum, session) => sum + session.hours, 0);

  const sortedDates = sessions
    .map((session) => session.session_date)
    .sort((a, b) => dateAtMidnight(a) - dateAtMidnight(b));

  const firstDate = dateAtMidnight(sortedDates[0]);
  const lastDate = dateAtMidnight(sortedDates[sortedDates.length - 1]);
  const msPerDay = 24 * 60 * 60 * 1000;
  const trackedDays = Math.max(1, Math.floor((lastDate - firstDate) / msPerDay) + 1);

  const avgDaily = totalHours / trackedDays;
  const avgWeekly = avgDaily * 7;

  return {
    totalHours,
    avgDaily,
    avgWeekly,
    totalSessions: sessions.length,
  };
}

async function fetchSessions() {
  const client = requireSupabaseClient();

  const { data, error } = await client
    .from(TABLE_NAME)
    .select("id, session_date, start_time, end_time, hours, created_at")
    .order("session_date", { ascending: false })
    .order("start_time", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

async function addSession(session) {
  const client = requireSupabaseClient();

  const { error } = await client.from(TABLE_NAME).insert(session);
  if (error) {
    throw new Error(error.message);
  }
}

async function deleteSession(id) {
  const client = requireSupabaseClient();

  const { error } = await client.from(TABLE_NAME).delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}

function renderDashboardStats(sessions) {
  const stats = calculateStats(sessions);

  document.getElementById("total-hours").textContent = formatHours(stats.totalHours);
  document.getElementById("avg-daily").textContent = `${stats.avgDaily.toFixed(2)} hrs/day`;
  document.getElementById("avg-weekly").textContent = `${stats.avgWeekly.toFixed(2)} hrs/week`;
  document.getElementById("total-sessions").textContent = String(stats.totalSessions);
}

async function renderDashboard() {
  const totalHoursEl = document.getElementById("total-hours");
  if (!totalHoursEl) return;

  if (MISSING_CONFIG) {
    setStatus("Add your Supabase settings in config.js before using this app.", true);
    return;
  }

  try {
    setStatus("Syncing from cloud...");
    const sessions = await fetchSessions();
    renderDashboardStats(sessions);
    setStatus("Synced.");
  } catch (error) {
    setStatus(`Sync failed: ${error.message}`, true);
  }
}

function renderTableRows(sessions) {
  const tableBody = document.getElementById("sessions-table-body");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  const emptyState = document.getElementById("empty-state");
  if (emptyState) {
    emptyState.style.display = sessions.length ? "none" : "block";
  }

  for (const session of sessions) {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${session.session_date}</td>
      <td>${session.start_time}</td>
      <td>${session.end_time}</td>
      <td>${session.hours.toFixed(2)}</td>
      <td><button class="delete-btn" data-id="${session.id}">Delete</button></td>
    `;

    tableBody.appendChild(row);
  }

  tableBody.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      if (MISSING_CONFIG) return;
      const id = button.getAttribute("data-id");
      try {
        setStatus("Deleting session...");
        await deleteSession(id);
        await renderSessionsTable();
        setStatus("Session deleted.");
      } catch (error) {
        setStatus(`Delete failed: ${error.message}`, true);
      }
    });
  });
}

async function renderSessionsTable(options = {}) {
  const { announce = true, throwOnError = false } = options;
  const tableBody = document.getElementById("sessions-table-body");
  if (!tableBody) return;

  if (MISSING_CONFIG) {
    if (announce) {
      setStatus("Add your Supabase settings in config.js before using this app.", true);
    }
    return;
  }

  try {
    if (announce) {
      setStatus("Syncing sessions...");
    }
    const sessions = await fetchSessions();
    renderTableRows(sessions);
    if (announce) {
      setStatus("Synced.");
    }
  } catch (error) {
    setStatus(`Sync failed: ${error.message}`, true);
    if (throwOnError) {
      throw error;
    }
  }
}

function setupSessionForm() {
  const form = document.getElementById("session-form");
  if (!form) return;

  const dateInput = document.getElementById("session-date");
  const startInput = document.getElementById("start-time");
  const endInput = document.getElementById("end-time");

  const today = new Date().toISOString().slice(0, 10);
  dateInput.value = today;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (MISSING_CONFIG) {
      setStatus("Add your Supabase settings in config.js before using this app.", true);
      return;
    }

    const session_date = dateInput.value;
    const start_time = startInput.value;
    const end_time = endInput.value;

    if (!session_date || !start_time || !end_time) {
      setStatus("Please complete all fields.", true);
      return;
    }

    const hours = calculateSessionHours(start_time, end_time);

    if (hours <= 0) {
      setStatus("End time must be later than start time.", true);
      return;
    }

    try {
      setStatus("Saving session...");
      await addSession({
        session_date,
        start_time,
        end_time,
        hours,
      });

      form.reset();
      dateInput.value = today;
      await renderSessionsTable({ announce: false, throwOnError: true });
      setStatus(`Saved session (${hours.toFixed(2)} hours).`);
    } catch (error) {
      setStatus(`Save failed: ${error.message}`, true);
    }
  });
}

renderDashboard();
setupSessionForm();
renderSessionsTable();
