// WoL 9 Learning Angles — Quiz Logic & Results Rendering
// Matrix-only results with share feature

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

    let html = `<p class="question-text">${q.text}</p>`;
    if (q.note) html += `<p class="q-note">${q.note}</p>`;
    html += `<div class="${isNineGrid ? "options-grid-9" : ""}"></div>`;

    card.innerHTML = html;
    const wrap = card.querySelector("div:last-child");

    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
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
    document.getElementById("progress-label").textContent = `คำถามที่ ${currentQ + 1} จาก ${QUESTIONS.length}`;
  }

  function getPercentages() {
    const pct = {};
    Object.keys(scores).forEach((id) => {
      pct[id] = Math.round((scores[id] / TOTAL_POINTS) * 100);
    });
    return pct;
  }

  function getTopMoves(pct) {
    const ranked = Object.keys(pct).sort((a, b) => pct[b] - pct[a]);
    const topScore = pct[ranked[0]];
    // Include all moves tied for 1st, 2nd, 3rd place
    const top = [];
    let currentRank = 0;
    for (const id of ranked) {
      if (top.length >= 3 && pct[id] < topScore - (Math.floor((top.length - 1) / 3) * 10)) {
        break; // Stop when we've gone past top 3 tiers
      }
      top.push(id);
    }
    return top.slice(0, 9); // Max 9
  }

  function showResults() {
    const pct = getPercentages();
    const topMoves = getTopMoves(pct);
    showScreen("results");

    // Summary text
    const topNames = topMoves.slice(0, 3).map((id) => MOVES[id].thai).join(" · ");
    document.getElementById("top-moves-text").textContent =
      `ความถนัดของคุณคือ: ${topNames}`;

    // Render matrix
    renderMatrix(pct, topMoves);

    // Render detail sections
    renderDetailSections(topMoves, pct);

    // Render share card
    renderShareCard(topNames);

    // Setup share buttons
    document.getElementById("btn-share").addEventListener("click", doShare);
    document.getElementById("btn-save-image").addEventListener("click", saveShareImage);
    document.getElementById("btn-copy-link").addEventListener("click", copyResultLink);
  }

  function renderMatrix(pct, topMoves) {
    const wrap = document.getElementById("matrix-wrap");
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
        const isTop = topMoves.includes(moveId);
        const isZero = p === 0;

        let bubbleClass = "matrix-bubble";
        if (isZero) bubbleClass += " is-zero";
        if (isTop) bubbleClass += " is-top";

        html += `<td class="matrix-cell">
          <div class="${bubbleClass}" style="border-color:${m.color}">
            <img src="${m.img}" alt="${m.thai}">
            ${isTop ? `<div class="matrix-star">★</div>` : ""}
          </div>
        </td>`;
      });
      html += `</tr>`;
    });

    html += `</tbody></table>`;
    wrap.innerHTML = html;
  }

  function renderDetailSections(topMoves, pct) {
    const ranked = Object.keys(pct).sort((a, b) => pct[b] - pct[a]);

    // Top 3 detail
    const topDetailList = document.getElementById("top-detail-list");
    topDetailList.innerHTML = "";
    topMoves.slice(0, 3).forEach((id) => {
      const m = MOVES[id];
      const row = document.createElement("div");
      row.className = "detail-row";
      row.innerHTML = `
        <img class="detail-thumb" src="${m.img}" alt="${m.thai}" />
        <div class="detail-body">
          <div class="detail-name">${m.thai}</div>
          <div class="detail-guide">${m.guide}</div>
          <div class="detail-activity">🎯 ${m.activity}</div>
        </div>
      `;
      topDetailList.appendChild(row);
    });

    // Growth (lowest) detail
    const growthMove = ranked[ranked.length - 1];
    const growthM = MOVES[growthMove];
    const growthDetailList = document.getElementById("growth-detail-list");
    growthDetailList.innerHTML = `
      <div class="detail-row">
        <img class="detail-thumb" src="${growthM.img}" alt="${growthM.thai}" />
        <div class="detail-body">
          <div class="detail-name">${growthM.thai}</div>
          <div class="detail-guide">${growthM.guide}</div>
          <div class="detail-activity">💡 ${growthM.activity}</div>
        </div>
      </div>
    `;
  }

  /* ===== SHARE CANVAS ===== */
  const GAME_URL = "https://wollab.github.io/WoL_GameLab/9-learning-angles/";

  function shareText() {
    const ranked = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
    const top3 = ranked.slice(0, 3).map((id) => MOVES[id].thai).join(" · ");
    return `ผมทำแบบสอบถาม 9 Learning Angles แล้ว 🧙‍♂️\n\n`+
      `ความถนัดของผมคือ: ${top3}\n\n`+
      `มาลองรู้จักตัวเองจากมุมการเรียนรู้ของคุณดูบ้าง 👇\n${GAME_URL}`;
  }

  function renderShareCard(topMovesText) {
    const cv = document.getElementById("sharecard");
    if (!cv) return;
    const x = cv.getContext("2d");
    const W = cv.width, H = cv.height;

    // Gradient bg (teal → deep teal)
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#2f9c97");
    g.addColorStop(1, "#1d6a67");
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);

    // Cream card
    x.fillStyle = "#faf7f2";
    roundRect(x, 30, 30, W - 60, H - 60, 20);
    x.fill();

    // Logo
    const logo = new Image();
    function paint() {
      const cx = W / 2;
      if (logo.complete && logo.naturalWidth) {
        x.drawImage(logo, cx - 80, 40, 160, 160 * logo.naturalHeight / logo.naturalWidth);
      }
      let ly = logo.naturalWidth ? 40 + 160 * logo.naturalHeight / logo.naturalWidth + 14 : 60;

      // Title
      x.textAlign = "center";
      x.fillStyle = "#1d6a67";
      x.font = "bold 28px 'Sukhumvit Set', sans-serif";
      x.fillText("9 Learning Angles", cx, ly);
      ly += 40;

      // Top moves
      x.fillStyle = "#2e2e2e";
      x.font = "bold 24px 'Sukhumvit Set', sans-serif";
      wrapText(x, topMovesText, cx, ly, W - 90, 30);
      ly += 90;

      // CTA
      x.fillStyle = "#1d6a67";
      roundRect(x, 40, H - 110, W - 80, 50, 14);
      x.fill();
      x.fillStyle = "#fec566";
      x.font = "bold 14px 'Sukhumvit Set', sans-serif";
      x.textAlign = "center";
      x.fillText("▶ wollab.github.io/WoL_GameLab/9-learning-angles/", cx, H - 80);
    }

    logo.onload = paint;
    logo.onerror = paint;
    logo.src = "assets/wol-logo.png";
    if (logo.complete) paint();
  }

  function roundRect(x, a, b, w, h, r) {
    x.beginPath();
    x.moveTo(a + r, b);
    x.arcTo(a + w, b, a + w, b + h, r);
    x.arcTo(a + w, b + h, a, b + h, r);
    x.arcTo(a, b + h, a, b, r);
    x.arcTo(a, b, a + w, b, r);
    x.closePath();
  }

  function wrapText(x, t, cx, y, maxw, lh) {
    const words = t.split(" ");
    let line = "", yy = y;
    for (const w of words) {
      const test = line + w + " ";
      if (x.measureText(test).width > maxw && line) {
        x.fillText(line.trim(), cx, yy);
        line = w + " ";
        yy += lh;
      } else {
        line = test;
      }
    }
    x.fillText(line.trim(), cx, yy);
    return yy;
  }

  function canvasBlob() {
    return new Promise((res) =>
      document.getElementById("sharecard").toBlob(res, "image/png")
    );
  }

  async function doShare() {
    try {
      const blob = await canvasBlob();
      const file = new File([blob], "9-learning-angles.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText() });
        return;
      }
      if (navigator.share) {
        await navigator.share({ text: shareText(), url: GAME_URL });
        return;
      }
      copyResultLink();
    } catch (e) {
      if (e.name !== "AbortError") copyResultLink();
    }
  }

  function saveShareImage() {
    const a = document.createElement("a");
    a.download = "9-learning-angles.png";
    a.href = document.getElementById("sharecard").toDataURL("image/png");
    a.click();
    toast("บันทึกรูปผลแล้ว");
  }

  function copyResultLink() {
    const t = shareText();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(t).then(() => toast("คัดลอกแล้ว"));
    } else {
      toast("คัดลอกไม่ได้ในเบราว์เซอร์นี้");
    }
  }

  function toast(msg) {
    const el = document.createElement("div");
    el.textContent = msg;
    el.style.cssText = `
      position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
      background: #2e2e2e; color: #fff; padding: 12px 20px; border-radius: 8px;
      font-size: 14px; z-index: 9999;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }
})();
