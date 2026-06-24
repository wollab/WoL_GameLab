// WoL 9 Learning Angles — Quiz Logic & Results Rendering

(function () {
  let currentQ = 0;
  let quizQuestions = QUESTIONS;
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

  function shuffled(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Reshuffle question order (main questions only, tiebreaker stays last)
  // and each question's option order, so the same click-pattern never
  // maps to the same moves twice in a row.
  function buildQuizQuestions() {
    const tiebreaker = QUESTIONS[QUESTIONS.length - 1];
    const mainQs = QUESTIONS.slice(0, QUESTIONS.length - 1);
    const ordered = shuffled(mainQs).map((q) => ({ ...q, options: shuffled(q.options) }));
    ordered.push({ ...tiebreaker, options: shuffled(tiebreaker.options) });
    return ordered;
  }

  document.getElementById("btn-start").addEventListener("click", () => {
    currentQ = 0;
    quizQuestions = buildQuizQuestions();
    Object.keys(scores).forEach((id) => (scores[id] = 0));
    showScreen("quiz");
    renderQuestion();
  });

  document.getElementById("btn-restart").addEventListener("click", () => {
    showScreen("intro");
  });

  function renderQuestion() {
    const q = quizQuestions[currentQ];
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
        if (currentQ < quizQuestions.length) {
          renderQuestion();
        } else {
          showResults();
        }
      });
      wrap.appendChild(btn);
    });

    const pct = Math.round((currentQ / quizQuestions.length) * 100);
    document.getElementById("progress-fill").style.width = pct + "%";
    document.getElementById("progress-label").textContent = `คำถามที่ ${currentQ + 1} จาก ${quizQuestions.length}`;
  }

  function getPercentages() {
    const pct = {};
    Object.keys(scores).forEach((id) => {
      pct[id] = Math.round((scores[id] / TOTAL_POINTS) * 100);
    });
    return pct;
  }

  // Strictly the top 3 moves by score (zero-score moves never count as "top").
  function getTopMoves(pct) {
    return Object.keys(pct)
      .filter((id) => pct[id] > 0)
      .sort((a, b) => pct[b] - pct[a])
      .slice(0, 3);
  }

  function getGrowthMove(pct) {
    const ids = Object.keys(pct).sort((a, b) => pct[a] - pct[b]);
    return ids[0];
  }

  let lastPct = null;
  let lastTopMoves = [];
  let lastGrowthMove = null;

  function showResults() {
    lastPct = getPercentages();
    lastTopMoves = getTopMoves(lastPct);
    lastGrowthMove = getGrowthMove(lastPct);
    showScreen("results");

    const topNames = lastTopMoves.map((id) => MOVES[id].thai).join(" · ");
    document.getElementById("top-moves-text").textContent =
      `ความถนัดของคุณคือ: ${topNames}`;

    renderMatrix(lastPct, lastTopMoves);
    renderDetailSections(lastTopMoves, lastGrowthMove);

    document.getElementById("btn-share").onclick = doShare;
    document.getElementById("btn-save-image").onclick = doSaveImage;
    document.getElementById("btn-copy-link").onclick = doCopyCaption;
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

  /* ===== SHARE: build canvas on demand (same pattern as Tarot of Learning) ===== */
  const SITE_URL = "https://wollab.github.io/WoL_GameLab/9-learning-angles/";

  function buildShareCaption() {
    const top3 = lastTopMoves.map((id) => MOVES[id].thai).join(" · ");
    const gm = MOVES[lastGrowthMove];
    return [
      "🧙‍♂️ เพิ่งรู้จัก Learning Move ของตัวเองจาก 9 Learning Angles!",
      "",
      `✨ ความถนัดของฉัน: ${top3}`,
      `🌱 มุมที่อยากลองฝึกเพิ่ม: ${gm.thai}`,
      "",
      "อยากรู้ว่าตัวเองถนัดมุมไหน ลองทำดูเลย 👇",
      `🔗 ${SITE_URL}`,
      "",
      "🪄 9 Learning Angles — by Wizards of Learning",
    ].join("\n");
  }

  function loadImg(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawContain(ctx, img, x, y, w, h) {
    if (!img) return;
    const ratio = Math.min(w / img.width, h / img.height);
    const iw = img.width * ratio, ih = img.height * ratio;
    ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "", lines = 0;
    for (const w of words) {
      const test = line + w + " ";
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line.trim(), x, y + lines * lineHeight);
        line = w + " ";
        lines++;
      } else {
        line = test;
      }
    }
    if (line.trim()) {
      ctx.fillText(line.trim(), x, y + lines * lineHeight);
      lines++;
    }
    return lines;
  }

  function countWrapLines(ctx, text, maxWidth) {
    const words = text.split(" ");
    let line = "", lines = 0;
    for (const w of words) {
      const test = line + w + " ";
      if (ctx.measureText(test).width > maxWidth && line) {
        line = w + " ";
        lines++;
      } else {
        line = test;
      }
    }
    if (line.trim()) lines++;
    return lines;
  }

  const CARD_PAD = 12;
  const CARD_THUMB = 56;
  const CARD_NAME_FONT = "600 14px Kanit, sans-serif";
  const CARD_BODY_FONT = "400 12px Kanit, sans-serif";
  const CARD_LINE_H = 16;

  function drawMoveCard(ctx, x, y, w, h, m, img) {
    roundRect(ctx, x, y, w, h, 14);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = m.color;
    ctx.stroke();

    const innerX = x + w / 2;
    let cy = y + CARD_PAD;
    drawContain(ctx, img, innerX - CARD_THUMB / 2, cy, CARD_THUMB, CARD_THUMB);
    cy += CARD_THUMB + 10;

    ctx.textAlign = "center";
    ctx.fillStyle = "#1c4b4b";
    ctx.font = CARD_NAME_FONT;
    ctx.fillText(m.thai, innerX, cy + 12);
    cy += 18 + 6;

    ctx.font = CARD_BODY_FONT;
    ctx.fillStyle = "#3f6e6d";
    wrapText(ctx, m.guide, innerX, cy + 11, w - CARD_PAD * 2, CARD_LINE_H);
  }

  async function buildShareCanvas() {
    const W = 640;
    const headerH = 198;
    const gridCell = 152;
    const gridH = gridCell * 3;
    const footerH = 60;

    const moveIds = Object.keys(MOVES);
    const [logoImg, ...charImgArr] = await Promise.all([
      loadImg("assets/wol-logo.png"),
      ...moveIds.map((id) => loadImg(MOVES[id].img)),
    ]);
    const charImgs = {};
    moveIds.forEach((id, i) => (charImgs[id] = charImgArr[i]));

    // Measure card layout before sizing the real canvas
    const mctx = document.createElement("canvas").getContext("2d");
    mctx.font = CARD_BODY_FONT;

    const strengthGap = 12;
    const strengthCols = lastTopMoves.length;
    const strengthBoxW = (W - 80 - (strengthCols - 1) * strengthGap) / strengthCols;
    const strengthBodyW = strengthBoxW - CARD_PAD * 2;
    const strengthLineCounts = lastTopMoves.map((id) => countWrapLines(mctx, MOVES[id].guide, strengthBodyW));
    const strengthBoxH = CARD_PAD * 2 + CARD_THUMB + 10 + 18 + 6 + Math.max(...strengthLineCounts) * CARD_LINE_H;
    const strengthsH = 36 + strengthBoxH;

    const growthBoxW = 300;
    const growthBodyW = growthBoxW - CARD_PAD * 2;
    const growthLineCount = countWrapLines(mctx, MOVES[lastGrowthMove].guide, growthBodyW);
    const growthBoxH = CARD_PAD * 2 + CARD_THUMB + 10 + 18 + 6 + growthLineCount * CARD_LINE_H;
    const growthH = 36 + growthBoxH;

    const H = headerH + gridH + 30 + strengthsH + 24 + growthH + footerH;

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, "#fffdf8");
    bgGrad.addColorStop(0.4, "#eaf7f6");
    bgGrad.addColorStop(1, "#d8f0ee");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    const glow = ctx.createRadialGradient(W / 2, 0, 10, W / 2, 0, 360);
    glow.addColorStop(0, "rgba(254,197,102,0.4)");
    glow.addColorStop(1, "rgba(254,197,102,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, 280);

    const cx = W / 2;
    let y = 36;

    drawContain(ctx, logoImg, cx - 45, y, 90, 90);
    y += 90 + 24;

    ctx.textAlign = "center";
    ctx.fillStyle = "#1a8586";
    ctx.font = "700 28px Kanit, sans-serif";
    ctx.fillText("9 Learning Angles", cx, y);
    y += 26;
    ctx.font = "400 15px Kanit, sans-serif";
    ctx.fillStyle = "#3f6e6d";
    ctx.fillText("ผลสำรวจ Learning Move ของฉัน", cx, y);
    y += 22;

    // 3x3 grid
    const gridLeft = cx - (gridCell * 3) / 2;
    const gridTop = y;

    MATRIX_ROWS.forEach((row, ri) => {
      MATRIX_COLS.forEach((col, ci) => {
        const moveId = moveIds.find((id) => MOVES[id].phase === row && MOVES[id].source === col);
        const m = MOVES[moveId];
        const p = lastPct[moveId];
        const isTop = lastTopMoves.includes(moveId);
        const isZero = p === 0;
        const bx = gridLeft + ci * gridCell;
        const by = gridTop + ri * gridCell;
        const pad = 9;
        const boxW = gridCell - pad * 2;
        const boxH = gridCell - pad * 2 - 18;

        roundRect(ctx, bx + pad, by + pad, boxW, boxH, 14);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.lineWidth = isTop ? 4 : 2.5;
        ctx.strokeStyle = isTop ? "#fec566" : isZero ? "#d9d4c8" : m.color;
        ctx.stroke();

        if (isZero) {
          ctx.save();
          ctx.filter = "grayscale(1)";
          ctx.globalAlpha = 0.45;
        }
        drawContain(ctx, charImgs[moveId], bx + pad + 6, by + pad + 4, boxW - 12, boxH - 8);
        if (isZero) {
          ctx.restore();
          roundRect(ctx, bx + pad, by + pad, boxW, boxH, 14);
          ctx.fillStyle = "rgba(150,148,140,0.38)";
          ctx.fill();
        }

        if (isTop) {
          ctx.beginPath();
          ctx.arc(bx + gridCell - pad - 4, by + pad + 4, 12, 0, Math.PI * 2);
          ctx.fillStyle = "#fec566";
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.font = "700 13px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("★", bx + gridCell - pad - 4, by + pad + 8);
        }

        ctx.fillStyle = "#3f6e6d";
        ctx.font = "600 13px Kanit, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(m.thai, bx + gridCell / 2, by + gridCell - 6);
      });
    });

    y = gridTop + gridH + 26;

    ctx.textAlign = "left";
    ctx.fillStyle = "#1a8586";
    ctx.font = "700 19px Kanit, sans-serif";
    ctx.fillText("✨ จุดเด่นของคุณ", 40, y);
    y += 28;

    let cardX = 40;
    lastTopMoves.forEach((id) => {
      drawMoveCard(ctx, cardX, y, strengthBoxW, strengthBoxH, MOVES[id], charImgs[id]);
      cardX += strengthBoxW + strengthGap;
    });
    y += strengthBoxH + 24;

    ctx.textAlign = "left";
    ctx.fillStyle = "#d78600";
    ctx.font = "700 19px Kanit, sans-serif";
    ctx.fillText("🌱 ลองฝึกเพิ่ม", 40, y);
    y += 28;

    drawMoveCard(ctx, cx - growthBoxW / 2, y, growthBoxW, growthBoxH, MOVES[lastGrowthMove], charImgs[lastGrowthMove]);
    y += growthBoxH;

    // Footer CTA — plain text, no pill
    ctx.fillStyle = "#1a8586";
    ctx.font = "400 14px Kanit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🔮 มาเปิดมุมการเรียนรู้ของคุณได้ที่ " + SITE_URL.replace("https://", ""), cx, H - 24);

    return canvas;
  }

  function canvasToBlob(canvas) {
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }

  async function withButtonBusy(btn, busyText, fn) {
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = busyText;
    try {
      await fn();
    } catch (e) {
      console.error(e);
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  }

  function doSaveImage() {
    const btn = document.getElementById("btn-save-image");
    withButtonBusy(btn, "กำลังสร้างภาพ...", async () => {
      const canvas = await buildShareCanvas();
      const blob = await canvasToBlob(canvas);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "9-learning-angles.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  // Most desktop browsers report navigator.share but silently fail on files,
  // so only offer the native share sheet on mobile (same check as Tarot of Learning).
  const canShareFiles = !!(navigator.canShare && navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  if (!canShareFiles) {
    const shareBtn = document.getElementById("btn-share");
    if (shareBtn) shareBtn.classList.add("hidden-share");
  }

  function doShare() {
    const btn = document.getElementById("btn-share");
    withButtonBusy(btn, "กำลังสร้างภาพ...", async () => {
      const canvas = await buildShareCanvas();
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], "9-learning-angles.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "9 Learning Angles", text: buildShareCaption() });
        } catch (e) { /* user cancelled — not an error */ }
      } else {
        toast("อุปกรณ์นี้ไม่รองรับการแชร์ไฟล์ภาพ กดปุ่ม “บันทึกภาพสรุป” แทนได้เลยครับ");
      }
    });
  }

  function doCopyCaption() {
    const btn = document.getElementById("btn-copy-link");
    const original = btn.textContent;
    navigator.clipboard.writeText(buildShareCaption()).then(() => {
      btn.textContent = "✅ คัดลอกแล้ว! เอาไปวางตอนโพสต์ได้เลย";
      setTimeout(() => (btn.textContent = original), 2500);
    }).catch(() => toast("คัดลอกไม่ได้ในเบราว์เซอร์นี้"));
  }

  function toast(msg) {
    const el = document.createElement("div");
    el.textContent = msg;
    el.style.cssText = `
      position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
      background: #2e2e2e; color: #fff; padding: 12px 20px; border-radius: 8px;
      font-size: 14px; z-index: 9999; max-width: 90vw; text-align: center;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
})();
