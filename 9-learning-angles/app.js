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

  // Top moves = highest score tier(s), including ties, capped at top-3 distinct tiers.
  // Zero-scored moves are never considered "top", even if everything is zero.
  function getTopMoves(pct) {
    const ids = Object.keys(pct);
    const distinct = [...new Set(ids.map((id) => pct[id]))]
      .filter((s) => s > 0)
      .sort((a, b) => b - a);
    if (distinct.length === 0) return [];
    const cutoff = distinct[Math.min(2, distinct.length - 1)];
    return ids
      .filter((id) => pct[id] >= cutoff)
      .sort((a, b) => pct[b] - pct[a]);
  }

  function getGrowthMove(pct) {
    const ids = Object.keys(pct).sort((a, b) => pct[a] - pct[b]);
    return ids[0];
  }

  let showResultsBusy = false;

  function showResults() {
    if (showResultsBusy) return;
    showResultsBusy = true;

    const pct = getPercentages();
    const topMoves = getTopMoves(pct);
    const growthMove = getGrowthMove(pct);
    showScreen("results");

    const topNames = topMoves.map((id) => MOVES[id].thai).join(" · ");
    document.getElementById("top-moves-text").textContent =
      `ความถนัดของคุณคือ: ${topNames}`;

    renderMatrix(pct, topMoves);
    renderDetailSections(topMoves, growthMove);
    renderShareCard(pct, topMoves, growthMove);

    document.getElementById("btn-share").onclick = doShare;
    document.getElementById("btn-save-image").onclick = saveShareImage;
    document.getElementById("btn-copy-link").onclick = copyResultLink;

    showResultsBusy = false;
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
          <div class="matrix-name">${m.thai}</div>
        </td>`;
      });
      html += `</tr>`;
    });

    html += `</tbody></table>`;
    wrap.innerHTML = html;
  }

  function renderDetailSections(topMoves, growthMove) {
    const topDetailList = document.getElementById("top-detail-list");
    topDetailList.innerHTML = "";
    topMoves.forEach((id) => {
      const m = MOVES[id];
      const row = document.createElement("div");
      row.className = "detail-row";
      row.innerHTML = `
        <img class="detail-thumb" src="${m.img}" alt="${m.thai}" />
        <div class="detail-body">
          <div class="detail-name">${m.thai}</div>
          <div class="detail-guide">${m.detail || m.guide}</div>
          <div class="detail-activity">🎯 ${m.activity}</div>
        </div>
      `;
      topDetailList.appendChild(row);
    });

    const growthM = MOVES[growthMove];
    document.getElementById("growth-detail-list").innerHTML = `
      <div class="detail-row">
        <img class="detail-thumb" src="${growthM.img}" alt="${growthM.thai}" />
        <div class="detail-body">
          <div class="detail-name">${growthM.thai}</div>
          <div class="detail-guide">${growthM.detail || growthM.guide}</div>
          <div class="detail-activity">💡 ${growthM.activity}</div>
        </div>
      </div>
    `;
  }

  /* ===== SHARE CANVAS ===== */
  const GAME_URL = "https://wollab.github.io/WoL_GameLab/9-learning-angles/";

  function shareText(topMoves) {
    const top3 = topMoves.slice(0, 3).map((id) => MOVES[id].thai).join(" · ");
    return `ผมทำแบบสอบถาม 9 Learning Angles แล้ว 🧙‍♂️\n\n` +
      `ความถนัดของผมคือ: ${top3}\n\n` +
      `มาลองรู้จักตัวเองจากมุมการเรียนรู้ของคุณดูบ้าง 👇\n${GAME_URL}`;
  }

  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  function roundRect(ctx, a, b, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(a + r, b);
    ctx.arcTo(a + w, b, a + w, b + h, r);
    ctx.arcTo(a + w, b + h, a, b + h, r);
    ctx.arcTo(a, b + h, a, b, r);
    ctx.arcTo(a, b, a + w, b, r);
    ctx.closePath();
  }

  function drawContain(ctx, img, x, y, w, h) {
    if (!img) return;
    const ratio = Math.min(w / img.width, h / img.height);
    const iw = img.width * ratio, ih = img.height * ratio;
    ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
  }

  // Wraps text and returns the y position after the last line.
  function wrapText(ctx, text, x, y, maxw, lh) {
    const words = text.split(" ");
    let line = "", yy = y;
    for (const w of words) {
      const test = line + w + " ";
      if (ctx.measureText(test).width > maxw && line) {
        ctx.fillText(line.trim(), x, yy);
        line = w + " ";
        yy += lh;
      } else {
        line = test;
      }
    }
    if (line.trim()) {
      ctx.fillText(line.trim(), x, yy);
      yy += lh;
    }
    return yy;
  }

  let shareCardReady = null;

  function renderShareCard(pct, topMoves, growthMove) {
    const cv = document.getElementById("sharecard");
    if (!cv) return;
    const x = cv.getContext("2d");
    const W = cv.width, H = cv.height;

    // Placeholder while images load
    x.clearRect(0, 0, W, H);
    x.fillStyle = "#faf7f2";
    x.fillRect(0, 0, W, H);
    x.fillStyle = "#999";
    x.font = "16px sans-serif";
    x.textAlign = "center";
    x.fillText("กำลังสร้างภาพผล...", W / 2, H / 2);

    const moveIds = Object.keys(MOVES);
    shareCardReady = Promise.all([
      loadImage("assets/wol-logo.png"),
      ...moveIds.map((id) => loadImage(MOVES[id].img)),
    ]).then(([logoImg, ...charImgArr]) => {
      const charImgs = {};
      moveIds.forEach((id, i) => (charImgs[id] = charImgArr[i]));
      paint(x, W, H, logoImg, charImgs, pct, topMoves, growthMove);
    });
  }

  function paint(x, W, H, logoImg, charImgs, pct, topMoves, growthMove) {
    // Gradient background
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#2f9c97");
    g.addColorStop(1, "#1d6a67");
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);

    // Cream card
    x.fillStyle = "#faf7f2";
    roundRect(x, 24, 24, W - 48, H - 48, 20);
    x.fill();

    const cx = W / 2;
    let y = 56;

    // Logo
    drawContain(x, logoImg, cx - 60, y, 120, 60);
    y += 74;

    // Title
    x.textAlign = "center";
    x.fillStyle = "#1d6a67";
    x.font = "bold 26px 'Sukhumvit Set', sans-serif";
    x.fillText("9 Learning Angles", cx, y);
    y += 26;
    x.font = "13px 'Sukhumvit Set', sans-serif";
    x.fillStyle = "#8a8a8a";
    x.fillText("ผลสำรวจ Learning Move ของฉัน", cx, y);
    y += 24;

    // 3x3 matrix grid
    const cellSize = 148;
    const gridW = cellSize * 3;
    const gridStartX = cx - gridW / 2;
    const gridStartY = y;

    MATRIX_ROWS.forEach((row, ri) => {
      MATRIX_COLS.forEach((col, ci) => {
        const moveId = Object.keys(MOVES).find(
          (id) => MOVES[id].phase === row && MOVES[id].source === col
        );
        const m = MOVES[moveId];
        const p = pct[moveId];
        const isTop = topMoves.includes(moveId);
        const isZero = p === 0;
        const bx = gridStartX + ci * cellSize;
        const by = gridStartY + ri * cellSize;
        const pad = 8;
        const boxW = cellSize - pad * 2;
        const boxH = cellSize - pad * 2 - 16; // leave room for label

        roundRect(x, bx + pad, by + pad, boxW, boxH, 14);
        x.fillStyle = "#ffffff";
        x.fill();
        x.lineWidth = isTop ? 4 : 2.5;
        x.strokeStyle = isTop ? "#fec566" : isZero ? "#d9d4c8" : m.color;
        x.stroke();

        if (isZero) x.globalAlpha = 0.35;
        if (isZero) x.filter = "grayscale(1)";
        drawContain(x, charImgs[moveId], bx + pad + 6, by + pad + 4, boxW - 12, boxH - 8);
        x.filter = "none";
        x.globalAlpha = 1;

        if (isTop) {
          x.beginPath();
          x.arc(bx + cellSize - pad - 4, by + pad + 4, 11, 0, Math.PI * 2);
          x.fillStyle = "#fec566";
          x.fill();
          x.fillStyle = "#fff";
          x.font = "bold 12px sans-serif";
          x.textAlign = "center";
          x.fillText("★", bx + cellSize - pad - 4, by + pad + 8);
        }

        x.fillStyle = "#6b6b6b";
        x.font = "600 11px 'Sukhumvit Set', sans-serif";
        x.textAlign = "center";
        x.fillText(m.thai, bx + cellSize / 2, by + cellSize - 6);
      });
    });

    y = gridStartY + cellSize * 3 + 28;

    // Strengths
    x.textAlign = "left";
    x.fillStyle = "#1d6a67";
    x.font = "bold 16px 'Sukhumvit Set', sans-serif";
    x.fillText("จุดเด่นของคุณ", 48, y);
    y += 24;

    x.font = "13px 'Sukhumvit Set', sans-serif";
    x.fillStyle = "#2e2e2e";
    const shownTop = topMoves.slice(0, 4);
    shownTop.forEach((id) => {
      const m = MOVES[id];
      y = wrapText(x, `• ${m.thai} — ${m.guide}`, 48, y, W - 96, 18);
      y += 4;
    });
    if (topMoves.length > shownTop.length) {
      x.fillStyle = "#8a8a8a";
      x.font = "12px 'Sukhumvit Set', sans-serif";
      x.fillText(`+ อีก ${topMoves.length - shownTop.length} มุมที่คะแนนเท่ากัน`, 48, y);
      y += 18;
    }

    y += 10;

    // Growth tip
    x.fillStyle = "#b5811f";
    x.font = "bold 16px 'Sukhumvit Set', sans-serif";
    x.fillText("ลองฝึกเพิ่ม", 48, y);
    y += 24;

    x.font = "13px 'Sukhumvit Set', sans-serif";
    x.fillStyle = "#2e2e2e";
    const gm = MOVES[growthMove];
    y = wrapText(x, `• ${gm.thai} — ${gm.activity}`, 48, y, W - 96, 18);

    // Footer CTA
    const ctaH = 46;
    const ctaY = H - 70;
    roundRect(x, 40, ctaY, W - 80, ctaH, 12);
    x.fillStyle = "#1d6a67";
    x.fill();
    x.fillStyle = "#fec566";
    x.font = "bold 13px 'Sukhumvit Set', sans-serif";
    x.textAlign = "center";
    x.fillText("▶ wollab.github.io/WoL_GameLab/9-learning-angles", cx, ctaY + ctaH / 2 + 4);
  }

  function canvasBlob() {
    return new Promise((res) =>
      document.getElementById("sharecard").toBlob(res, "image/png")
    );
  }

  async function doShare() {
    if (shareCardReady) await shareCardReady;
    const topMoves = getTopMoves(getPercentages());
    try {
      const blob = await canvasBlob();
      const file = new File([blob], "9-learning-angles.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText(topMoves) });
        return;
      }
      if (navigator.share) {
        await navigator.share({ text: shareText(topMoves), url: GAME_URL });
        return;
      }
      copyResultLink();
    } catch (e) {
      if (e.name !== "AbortError") copyResultLink();
    }
  }

  async function saveShareImage() {
    if (shareCardReady) await shareCardReady;
    const a = document.createElement("a");
    a.download = "9-learning-angles.png";
    a.href = document.getElementById("sharecard").toDataURL("image/png");
    a.click();
    toast("บันทึกรูปผลแล้ว");
  }

  function copyResultLink() {
    const topMoves = getTopMoves(getPercentages());
    const t = shareText(topMoves);
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
