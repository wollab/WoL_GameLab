// WoL Learning Moves Quiz — logic + rendering
(function () {
  let currentQ = 0;
  const scores = {}; // moveId -> raw points
  Object.keys(MOVES).forEach((id) => (scores[id] = 0));

  const screens = {
    intro: document.getElementById("screen-intro"),
    quiz: document.getElementById("screen-quiz"),
    results: document.getElementById("screen-results"),
  };

  function showScreen(name) {
    Object.values(screens).forEach((s) => s.classList.remove("active"));
    screens[name].classList.add("active");
  }

  document.getElementById("btn-start").addEventListener("click", () => {
    currentQ = 0;
    Object.keys(scores).forEach((id) => (scores[id] = 0));
    showScreen("quiz");
    renderQuestion();
  });

  document.getElementById("btn-restart").addEventListener("click", () => {
    showScreen("intro");
  });

  function renderQuestion() {
    const q = QUESTIONS[currentQ];
    const card = document.getElementById("question-card");
    const isNineGrid = q.options.length > 6;

    card.innerHTML = `
      <p class="question-text">${q.text}</p>
      <div class="${isNineGrid ? "options-grid-9" : ""}"></div>
    `;
    const wrap = card.querySelector("div:last-child");

    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.style.setProperty("--c", MOVES[opt.move].color);
      if (isNineGrid) {
        btn.innerHTML = `<img class="option-thumb" src="${MOVES[opt.move].img}" alt="${MOVES[opt.move].thai}"><span>${opt.text}</span>`;
      } else {
        btn.textContent = opt.text;
      }
      btn.addEventListener("click", () => {
        scores[opt.move] += q.weight || 1;
        currentQ += 1;
        if (currentQ < QUESTIONS.length) {
          renderQuestion();
        } else {
          showResults();
        }
      });
      wrap.appendChild(btn);
    });

    const pct = Math.round((currentQ / QUESTIONS.length) * 100);
    document.getElementById("progress-fill").style.width = pct + "%";
    document.getElementById("progress-label").textContent =
      `คำถามที่ ${currentQ + 1} จาก ${QUESTIONS.length}`;
  }

  function getPercentages() {
    const pct = {};
    Object.keys(scores).forEach((id) => {
      pct[id] = Math.round((scores[id] / TOTAL_POINTS) * 100);
    });
    return pct;
  }

  function showResults() {
    const pct = getPercentages();
    showScreen("results");
    renderTopText(pct);
    renderRadar(pct);
    renderMatrix(pct);
    renderBreakdown(pct);
  }

  function renderTopText(pct) {
    const ranked = Object.keys(pct).sort((a, b) => pct[b] - pct[a]);
    const top = ranked.slice(0, 2).map((id) => MOVES[id].thai);
    document.getElementById("top-moves-text").textContent =
      `move ที่คุณใช้บ่อยที่สุดตอนนี้คือ ${top.join(" และ ")} — ลองดูสัดส่วนทั้งหมดด้านล่างเพื่อเห็นภาพรวม`;
  }

  function renderBreakdown(pct) {
    const wrap = document.getElementById("breakdown-list");
    wrap.innerHTML = "";
    const ranked = Object.keys(pct).sort((a, b) => pct[b] - pct[a]);
    ranked.forEach((id) => {
      const m = MOVES[id];
      const row = document.createElement("div");
      row.className = "breakdown-row";
      row.innerHTML = `
        <img class="breakdown-thumb" src="${m.img}" alt="${m.thai}">
        <span class="breakdown-swatch" style="background:${m.color}"></span>
        <span class="breakdown-name">${m.thai}</span>
        <span class="breakdown-bar-track"><span class="breakdown-bar-fill" style="width:${pct[id]}%;background:${m.color}"></span></span>
        <span class="breakdown-pct">${pct[id]}%</span>
      `;
      wrap.appendChild(row);
    });
  }

  function renderRadar(pct) {
    const wrap = document.getElementById("radar-wrap");
    const size = 380;
    const center = size / 2;
    const maxR = 95;
    const n = RADAR_ORDER.length;
    const angleStep = (2 * Math.PI) / n;
    const startAngle = -Math.PI / 2;

    function pointAt(i, r) {
      const angle = startAngle + i * angleStep;
      return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
    }

    let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;

    // grid rings
    [0.25, 0.5, 0.75, 1].forEach((f) => {
      const pts = RADAR_ORDER.map((_, i) => pointAt(i, maxR * f).join(",")).join(" ");
      svg += `<polygon points="${pts}" fill="none" stroke="#e7e1d8" stroke-width="1"/>`;
    });

    // axes + labels (thumbnail + name)
    RADAR_ORDER.forEach((id, i) => {
      const [x, y] = pointAt(i, maxR);
      svg += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="#e7e1d8" stroke-width="1"/>`;
      const [ix, iy] = pointAt(i, maxR + 26);
      const [lx, ly] = pointAt(i, maxR + 46);
      svg += `<image href="${MOVES[id].img}" x="${ix - 14}" y="${iy - 14}" width="28" height="28"/>`;
      svg += `<text x="${lx}" y="${ly}" font-size="10.5" fill="#2b2640" text-anchor="middle" dominant-baseline="middle">${MOVES[id].thai}</text>`;
    });

    // data polygon
    const dataPts = RADAR_ORDER.map((id, i) => pointAt(i, (pct[id] / 100) * maxR).join(",")).join(" ");
    svg += `<polygon points="${dataPts}" fill="#9c36b5" fill-opacity="0.25" stroke="#9c36b5" stroke-width="2"/>`;

    // dots
    RADAR_ORDER.forEach((id, i) => {
      const [x, y] = pointAt(i, (pct[id] / 100) * maxR);
      svg += `<circle cx="${x}" cy="${y}" r="4" fill="${MOVES[id].color}" stroke="#fff" stroke-width="1.5"/>`;
    });

    svg += `</svg>`;
    wrap.innerHTML = svg;
  }

  function renderMatrix(pct) {
    const wrap = document.getElementById("matrix-wrap");
    const cellSize = 90;
    const maxBubble = 78;
    const minBubble = 18;

    let html = `<table class="matrix-table"><thead><tr><th></th>`;
    MATRIX_COLS.forEach((c) => (html += `<th>${COL_LABELS[c]}</th>`));
    html += `</tr></thead><tbody>`;

    MATRIX_ROWS.forEach((row) => {
      html += `<tr><th class="matrix-row-label">${ROW_LABELS[row]}</th>`;
      MATRIX_COLS.forEach((col) => {
        const moveId = Object.keys(MOVES).find(
          (id) => MOVES[id].phase === row && MOVES[id].source === col
        );
        const m = MOVES[moveId];
        const p = pct[moveId];
        const size = p === 0 ? 0 : Math.max(minBubble, (p / 100) * maxBubble * 1.6);
        const clamped = Math.min(size, maxBubble);
        const faded = p === 0 ? "opacity:0.18;filter:grayscale(1);" : "";
        html += `<td class="matrix-cell" style="width:${cellSize}px;height:${cellSize}px">
          <div class="matrix-bubble" style="width:${clamped}px;height:${clamped}px;border-color:${m.color};${faded}" title="${m.thai} ${p}%">
            <img src="${m.img}" alt="${m.thai}">
            ${p > 0 ? `<span class="matrix-pct" style="background:${m.color}">${p}%</span>` : ""}
          </div>
        </td>`;
      });
      html += `</tr>`;
    });

    html += `</tbody></table>`;
    wrap.innerHTML = html;
  }
})();
