const proposalsEl = document.getElementById("proposals");
const refreshBtn = document.getElementById("refreshBtn");
const form = document.getElementById("proposalForm");
const msg = document.getElementById("formMsg");

document.getElementById("year").textContent = new Date().getFullYear();

async function loadApproved() {
  const res = await fetch("/api/proposals");
  const data = await res.json();

  proposalsEl.innerHTML = "";
  const items = data.proposals || [];

  if (!items.length) {
    proposalsEl.innerHTML = `<div class="empty">No approved proposals yet. Be the first to submit.</div>`;
    return;
  }

  for (const p of items) {
    const reason = (p.reason || "").trim();
    const el = document.createElement("div");
    el.className = "proposal";
    el.innerHTML = `
      <div><b>${escapeHtml(p.name)}</b></div>
      ${reason ? `<div style="margin-top:8px;color:#d6dae5;line-height:1.6">${escapeHtml(reason)}</div>` : ""}
      <div class="meta">${escapeHtml(p.city)}, ${escapeHtml(p.state)} • ${new Date(p.created_at + "Z").toLocaleDateString()}</div>
    `;
    proposalsEl.appendChild(el);
  }
}

refreshBtn?.addEventListener("click", loadApproved);

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "Submitting…";

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    const res = await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to submit.");

    msg.textContent = "Submitted! Check your email — your proposal is pending approval.";
    form.reset();
  } catch (err) {
    msg.textContent = `Error: ${err.message}`;
  }
});

loadApproved();

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
