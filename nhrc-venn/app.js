// ผู้พิทักษ์เวทมนตร์แห่งสิทธิ — alpha digital playtest (กติกาตาม game-design v1.1, 2026-06-21)
// แอปทำหน้าที่ "ผู้คุมเวท": รู้คู่ผู้พิทักษ์, ให้คำใบ้, และเฉลยถูก/ผิด

const GUARDIANS = {
  CRC: { name: "พิทักษ์ผู้เยาว์", protect: "สิทธิเด็ก", clue1: "ข้าดูแลผู้ที่ยังเติบโตไม่เต็มวัย", clue2: "ของเล่น การเรียน และครอบครัว อยู่ใต้ปีกของข้า" },
  ICESCR: { name: "พิทักษ์หล่อเลี้ยง", protect: "กิน เรียน อยู่ รักษา", clue1: "ข้าดูแลสิ่งที่ทำให้ชีวิตอิ่มและเติบโต", clue2: "ข้าว น้ำ บ้าน หมอ และห้องเรียน คือพลังของข้า" },
  ICCPR: { name: "พิทักษ์แห่งเสียง", protect: "พูด เชื่อ ชุมนุม ความเป็นส่วนตัว", clue1: "ข้าคุ้มครองสิ่งที่เปล่งออกมาจากหัวใจ", clue2: "การพูด ความเชื่อ การรวมตัว และความลับส่วนตัว" },
  CEDAW: { name: "พิทักษ์เสมอภาค", protect: "ผู้หญิงไม่ถูกกีดกัน", clue1: "ข้าไม่ยอมให้ใครถูกกดไว้เพียงเพราะเพศ", clue2: "หญิงต้องได้เท่าชาย ทุกสนาม ทุกอาชีพ" },
  CRPD: { name: "พิทักษ์ผู้เข้าถึง", protect: "สิทธิคนพิการ", clue1: "ข้าเปิดทางให้ทุกคนไปถึงได้เท่ากัน", clue2: "ทางลาด อักษรเบรลล์ ภาษามือ คือสะพานของข้า" },
  ICERD: { name: "พิทักษ์หลากสาย", protect: "ไม่ถูกเหยียดเชื้อชาติ", clue1: "ข้าปกป้องผู้คนทุกสีทุกสาย", clue2: "เชื้อชาติ สีผิว ภาษา ต้องไม่เป็นเหตุให้ถูกกีดกัน" },
  CAT: { name: "พิทักษ์เกราะ", protect: "ไม่ถูกทรมาน", clue1: "ข้ากันความเจ็บปวดที่ถูกตั้งใจกระทำ", clue2: "ไม่มีผู้ใดควรถูกทรมานหรือย่ำยีศักดิ์ศรี" },
  ICRMW: { name: "พิทักษ์ผู้เดินทาง", protect: "สิทธิแรงงานข้ามชาติ", clue1: "ข้าดูแลผู้จากบ้านมาไกลเพื่อทำงาน", clue2: "แรงงานข้ามแดนและครอบครัวของพวกเขา" },
  CPED: { name: "พิทักษ์แสงสืบหา", protect: "ไม่ถูกบังคับให้สูญหาย", clue1: "ข้าตามหาผู้ที่เงาของเขาเลือนหาย", clue2: "ไม่มีผู้ใดควรถูกทำให้สูญหายไร้ร่องรอย" },
};

const ZONE_LABELS = { left: "วงซ้าย", right: "วงขวา", center: "ตรงกลาง", outside: "นอกวง" };
const MIN_PLAYABLE_FOR_PAIR = 10; // คู่วงต้องมีการ์ดที่เข้าวงได้อย่างน้อยเท่านี้ (จากทั้งสำรับ)

const state = {
  teams: [],
  deck: [],
  danger: [],
  removed: [],
  pair: null,
  pairHistory: [],
  matchScores: [],
  roundNumber: 0,
  threshold: 7,
  currentTeam: 0,
  selectedCard: null,
  swapUsedThisTurn: false,
  revealedHints: { left: false, right: false },
  rescueUsed: false,
  keepTurn: false,
  streak: 0,
  placed: { left: [], right: [], center: [], outside: [] },
  selectedTreaty: null,
  guesses: { left: null, right: null },
  phase: "idle", // idle | place | feedback | gameover
  log: [],
};

const els = {};
for (const id of [
  "pairLabel","dangerLabel","thresholdNote","teamCount","handSize","dangerThreshold",
  "newGameBtn","resetMatchBtn","exportBtn","abilitySwap","abilityRescue",
  "revealLeftHint","revealRightHint",
  "turnLabel","deckLabel","clueLeft","clueRight","clueLeftBox","clueRightBox","boardHint",
  "feedback","resultBadge","resultTitle","resultReason","nextBtn",
  "handTitle","handCount","handList","teamsStrip","summaryLabel","logList",
  "treatyBank","leftGuess","rightGuess","guessStatus","clearGuesses","checkGuesses",
]) els[id] = document.querySelector("#" + id);

const zoneButtons = [...document.querySelectorAll(".zone")];

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function correctZone(card, pair) {
  const inLeft = card.treaties.includes(pair[0]);
  const inRight = card.treaties.includes(pair[1]);
  if (inLeft && inRight) return "center";
  if (inLeft) return "left";
  if (inRight) return "right";
  return "outside";
}

function playableCount(pair) {
  return WORD_CARDS.filter((c) => correctZone(c, pair) !== "outside").length;
}

function eligiblePairs() {
  const ids = Object.keys(GUARDIANS);
  const pairs = [];
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++)
      if (playableCount([ids[i], ids[j]]) >= MIN_PLAYABLE_FOR_PAIR) pairs.push([ids[i], ids[j]]);
  return pairs;
}

function pickPair() {
  const seen = state.pairHistory.map((p) => p.join("+"));
  let pool = eligiblePairs().filter((p) => !seen.includes(p.join("+")));
  if (!pool.length) pool = eligiblePairs();
  return shuffle(pool)[0];
}

function draw(team, n) {
  let drawn = 0;
  for (let i = 0; i < n; i++) {
    if (!state.deck.length) break;
    team.hand.push(state.deck.pop());
    drawn += 1;
  }
  return drawn;
}

function logEntry(kind, team, detail, correct = null) {
  const [actualLeft = "", actualRight = ""] = state.pair || [];
  state.log.push({
    seq: state.log.length + 1,
    pair: state.pair ? state.pair.join("+") : "",
    actualLeft,
    actualRight,
    guessLeft: state.guesses.left || "",
    guessRight: state.guesses.right || "",
    hintStage: `${Number(state.revealedHints.left) + Number(state.revealedHints.right)}_hints_read`,
    team: team ? team.name : "-",
    kind,
    detail,
    correct,
    danger: state.danger.length,
  });
  renderLog();
}

function startGame() {
  const teamCount = Number(els.teamCount.value);
  const handSize = Number(els.handSize.value);
  state.threshold = Number(els.dangerThreshold.value);
  if (state.matchScores.length !== teamCount) {
    state.matchScores = Array.from({ length: teamCount }, () => 0);
    state.roundNumber = 0;
    state.pairHistory = [];
  }
  state.roundNumber += 1;
  state.deck = shuffle(WORD_CARDS);
  state.danger = [];
  state.removed = [];
  state.placed = { left: [], right: [], center: [], outside: [] };
  state.keepTurn = false;
  state.streak = 0;
  state.rescueUsed = false;
  state.selectedTreaty = null;
  state.guesses = { left: null, right: null };
  state.currentTeam = 0;
  state.revealedHints = { left: false, right: false };
  state.log = [];
  state.teams = Array.from({ length: teamCount }, (_, i) => ({ name: `ทีม ${i + 1}`, hand: [] }));
  for (const team of state.teams) draw(team, handSize);
  els.thresholdNote.textContent = `ทายพลาดแล้วเฉลยเป็นนอกวงเกิน ${state.threshold} ใบ = แพ้ทุกทีม`;
  summonPair(state.roundNumber === 1 ? ["CRC", "ICESCR"] : null); // รอบแรกเป็น tutorial pair
  state.phase = "place";
  beginTurn();
}

function summonPair(forcedPair) {
  state.pair = forcedPair || pickPair();
  state.pairHistory.push(state.pair);
  state.streak = 0;
  state.placed = { left: [], right: [], center: [], outside: [] };
  state.selectedTreaty = null;
  state.guesses = { left: null, right: null };
  logEntry("summon", null, `เรียกผู้พิทักษ์คู่ใหม่ (คู่ที่ ${state.pairHistory.length})`);
  renderClues();
}

function renderClues() {
  const [left, right] = state.pair;
  const revealDone = state.phase === "gameover";
  const render = (id, box, target, side) => {
    const g = GUARDIANS[id];
    let html = state.revealedHints[side]
      ? g.clue1
      : "ยังไม่เปิดคำใบ้";
    if (revealDone) html = `<strong>${g.name} (${id})</strong> — ${g.protect}`;
    target.innerHTML = html;
    box.classList.toggle("revealed", revealDone);
  };
  render(left, els.clueLeftBox, els.clueLeft, "left");
  render(right, els.clueRightBox, els.clueRight, "right");
  const availableHints = state.danger.length >= 4 ? 2 : state.danger.length >= 2 ? 1 : 0;
  const usedHints = Number(state.revealedHints.left) + Number(state.revealedHints.right);
  const canRead = state.phase === "place" && usedHints < availableHints;
  els.revealLeftHint.disabled = !canRead || state.revealedHints.left;
  els.revealRightHint.disabled = !canRead || state.revealedHints.right;
  els.pairLabel.textContent = `คู่ผู้พิทักษ์ที่ ${state.pairHistory.length}`;
}

function beginTurn() {
  state.selectedCard = null;
  state.swapUsedThisTurn = false;
  els.feedback.hidden = true;
  renderAll();
}

function currentTeam() {
  return state.teams[state.currentTeam];
}

function renderAll() {
  const team = currentTeam();
  els.turnLabel.textContent = state.phase === "gameover"
    ? "จบเกม"
    : `รอบที่ ${state.roundNumber} · ตาของ ${team.name}`;
  els.deckLabel.textContent = `กองจั่ว ${state.deck.length} ใบ`;
  els.dangerLabel.textContent = `พลาดนอกวง ${state.danger.length}/${state.threshold}`;
  renderClues();
  renderHand();
  renderTeams();
  renderSummary();
  renderPlacedCards();
  renderTreatyHelper();
  const disable = state.phase !== "place";
  zoneButtons.forEach((z) => (z.disabled = disable || !state.selectedCard));
  els.abilitySwap.disabled = disable || state.swapUsedThisTurn;
  els.abilityRescue.disabled = disable || !state.danger.length || state.rescueUsed;
  els.boardHint.textContent = disable
    ? "รอเริ่มตาใหม่"
    : state.selectedCard
      ? `กำลังวาง: "${state.selectedCard.text}" — แตะตำแหน่งบนกระดาน`
      : "เลือกการ์ดจากมือ แล้วแตะตำแหน่งที่คิดว่าถูก";
}

function renderTreatyHelper() {
  els.leftGuess.textContent = state.guesses.left
    ? `วงซ้าย: ${GUARDIANS[state.guesses.left].protect}`
    : "วาง token วงซ้าย";
  els.rightGuess.textContent = state.guesses.right
    ? `วงขวา: ${GUARDIANS[state.guesses.right].protect}`
    : "วาง token วงขวา";
  els.leftGuess.classList.toggle("filled", Boolean(state.guesses.left));
  els.rightGuess.classList.toggle("filled", Boolean(state.guesses.right));

  els.treatyBank.innerHTML = "";
  for (const [id, guardian] of Object.entries(GUARDIANS)) {
    const button = document.createElement("button");
    button.className = "treaty-token" + (state.selectedTreaty === id ? " selected" : "");
    button.type = "button";
    button.innerHTML = `<strong>${guardian.protect}</strong><span>${guardian.name} · ${id}</span>`;
    button.addEventListener("click", () => {
      state.selectedTreaty = state.selectedTreaty === id ? null : id;
      els.guessStatus.textContent = state.selectedTreaty
        ? `เลือก token: ${guardian.protect} แล้วแตะช่องวงซ้ายหรือวงขวา`
        : "ยังไม่ได้วาง token";
      renderTreatyHelper();
    });
    els.treatyBank.appendChild(button);
  }
}

function placeGuess(side) {
  if (!state.selectedTreaty) {
    els.guessStatus.textContent = "เลือก token จากคลัง 9 ผู้พิทักษ์ก่อน";
    return;
  }
  state.guesses[side] = state.selectedTreaty;
  const label = side === "left" ? "วงซ้าย" : "วงขวา";
  els.guessStatus.textContent = `วาง ${GUARDIANS[state.selectedTreaty].protect} ไว้ที่${label}`;
  state.selectedTreaty = null;
  renderTreatyHelper();
}

function clearGuesses() {
  state.selectedTreaty = null;
  state.guesses = { left: null, right: null };
  els.guessStatus.textContent = "ล้าง token แล้ว";
  renderTreatyHelper();
}

function checkGuesses() {
  if (!state.pair) return;
  const leftOk = state.guesses.left === state.pair[0];
  const rightOk = state.guesses.right === state.pair[1];
  const leftText = state.guesses.left ? (leftOk ? "วงซ้ายตรง" : "วงซ้ายยังไม่ตรง") : "วงซ้ายยังไม่วาง";
  const rightText = state.guesses.right ? (rightOk ? "วงขวาตรง" : "วงขวายังไม่ตรง") : "วงขวายังไม่วาง";
  els.guessStatus.textContent = `${leftText} / ${rightText}`;
  logEntry("guess", currentTeam(), `เช็ก token: ${leftText}, ${rightText}`);
}

function revealHint(side) {
  if (!state.pair || state.phase !== "place") return;
  const availableHints = state.danger.length >= 4 ? 2 : state.danger.length >= 2 ? 1 : 0;
  const usedHints = Number(state.revealedHints.left) + Number(state.revealedHints.right);
  if (usedHints >= availableHints || state.revealedHints[side]) return;
  state.revealedHints[side] = true;
  const guardianId = side === "left" ? state.pair[0] : state.pair[1];
  const label = side === "left" ? "วงซ้าย" : "วงขวา";
  logEntry("hint", currentTeam(), `อ่านคำใบ้${label}: ${GUARDIANS[guardianId].clue1}`);
  renderAll();
}

function addPlacedCard(zone, card, team, wasCorrect) {
  state.placed[zone].push({
    no: card.no,
    text: card.text,
    team: team.name,
    wasCorrect,
    reason: card.reason,
  });
}

function renderPlacedCards() {
  for (const zone of zoneButtons) {
    const zoneName = zone.dataset.zone;
    let list = zone.querySelector(".placed-list");
    if (!list) {
      list = document.createElement("div");
      list.className = "placed-list";
      zone.appendChild(list);
    }
    const cards = state.placed[zoneName] || [];
    list.innerHTML = cards.length
      ? cards
          .map((card) => `<span class="${card.wasCorrect ? "placed-correct" : "placed-corrected"}">${card.text}<small>${card.team}</small></span>`)
          .join("")
      : `<em>ยังไม่มีการ์ด</em>`;
  }
}

function renderHand() {
  const team = currentTeam();
  els.handTitle.textContent = `มือของ${team.name}`;
  els.handCount.textContent = `${team.hand.length} ใบ`;
  els.handList.innerHTML = "";
  for (const card of team.hand) {
    const btn = document.createElement("button");
    btn.className = "hand-card" + (state.selectedCard === card ? " selected" : "");
    btn.type = "button";
    btn.textContent = card.text;
    btn.disabled = state.phase !== "place";
    btn.addEventListener("click", () => {
      state.selectedCard = state.selectedCard === card ? null : card;
      renderAll();
    });
    els.handList.appendChild(btn);
  }
}

function renderTeams() {
  els.teamsStrip.innerHTML = "";
  state.teams.forEach((team, i) => {
    const chip = document.createElement("article");
    const score = state.matchScores[i] || 0;
    chip.className = "team-chip" + (i === state.currentTeam && state.phase === "place" ? " active" : "") + (score >= 2 || team.hand.length === 0 ? " winner" : "");
    chip.innerHTML = `<strong>${team.name}</strong><span>แต้มแมตช์ ${score}/2 · การ์ดในมือ ${team.hand.length} ใบ</span>`;
    els.teamsStrip.appendChild(chip);
  });
}

function renderSummary() {
  const placements = state.log.filter((e) => e.kind === "place");
  const scoreText = state.matchScores.length
    ? state.matchScores.map((score, i) => `ทีม ${i + 1} ${score}/2`).join(" · ")
    : "ยังไม่เริ่มแมตช์";
  if (!placements.length) {
    els.summaryLabel.textContent = scoreText;
    return;
  }
  const correct = placements.filter((e) => e.correct === true).length;
  els.summaryLabel.textContent = `${scoreText} · วางแล้ว ${placements.length} ครั้ง ถูก ${correct} (${Math.round((correct / placements.length) * 100)}%)`;
}

function renderLog() {
  els.logList.innerHTML = "";
  for (const entry of [...state.log].reverse().slice(0, 30)) {
    const row = document.createElement("article");
    const cls = entry.correct === false ? "wrong" : entry.kind === "place" ? "" : "neutral";
    row.className = `log-item ${cls}`;
    row.innerHTML = `<strong>#${entry.seq}</strong><span>${entry.team} · ${entry.detail}</span><span>พลาดนอกวง ${entry.danger}</span>`;
    els.logList.appendChild(row);
  }
}

function showFeedback(kind, title, reason) {
  els.feedback.hidden = false;
  els.feedback.className = `feedback ${kind}`;
  els.resultBadge.textContent = kind === "good" ? "วางถูก" : kind === "bad" ? "ยังไม่ถูก" : "เกิดเหตุ";
  els.resultTitle.textContent = title;
  els.resultReason.textContent = reason || "";
}

function placeCard(zone) {
  if (state.phase !== "place" || !state.selectedCard) return;
  const team = currentTeam();
  const card = state.selectedCard;
  const answer = correctZone(card, state.pair);
  const isCorrect = zone === answer;
  const zoneBtn = zoneButtons.find((z) => z.dataset.zone === zone);
  zoneBtn.classList.add(isCorrect ? "flash-good" : "flash-bad");
  setTimeout(() => zoneBtn.classList.remove("flash-good", "flash-bad"), 900);

  team.hand = team.hand.filter((c) => c !== card);
  addPlacedCard(answer, card, team, isCorrect);
  state.keepTurn = isCorrect;
  if (isCorrect) {
    state.streak += 1;
    if (answer === "outside") {
      logEntry("place", team, `"${card.text}" → นอกวง ถูก ไม่นับเป็นภัยสะสม`, true);
      showFeedback("good", `ถูกต้อง — "${card.text}" ไม่อยู่ใต้วงคู่นี้`, `ทายว่านอกวงแล้วถูก จึงไม่นับเป็นการ์ดแพ้ร่วม — ${card.reason}`);
    } else {
      logEntry("place", team, `"${card.text}" → ${ZONE_LABELS[zone]} ถูก ทิ้งการ์ด`, true);
      showFeedback("good", `ถูกต้อง — "${card.text}" อยู่${ZONE_LABELS[answer]}`, card.reason);
    }
  } else {
    state.streak = 0;
    if (answer === "outside") state.danger.push(card);
    const drawn = draw(team, 1);
    logEntry("place", team, `"${card.text}" → ${ZONE_LABELS[zone]} ผิด ระบบย้ายไป${ZONE_LABELS[answer]} และจั่วเพิ่ม ${drawn} ใบ`, false);
    let reason = `การ์ดถูกลงในช่องที่ถูกแล้ว ทีมจั่วเพิ่ม ${drawn} ใบ — ${card.reason}`;
    if (state.log.filter((e) => e.kind === "place").length >= 10) {
      reason += " | Facilitator: ถามทีมว่าอะไรทำให้คิดว่าวางช่องเดิม และหลังเห็นเฉลยจะเปลี่ยนหลักคิดอย่างไร";
    }
    showFeedback("bad", `ยังไม่ถูก — ย้าย "${card.text}" ไป${ZONE_LABELS[answer]}`, reason);
  }

  state.selectedCard = null;
  state.phase = "feedback";
  checkEndThenRender(team);
}

function abilitySwap() {
  const team = currentTeam();
  if (!state.selectedCard) {
    els.boardHint.textContent = "เลือกการ์ดที่จะเปลี่ยนก่อน แล้วกด 'เปลี่ยนการ์ด' อีกครั้ง";
    return;
  }
  const card = state.selectedCard;
  team.hand = team.hand.filter((c) => c !== card);
  state.removed.push(card);
  const drawn = draw(team, 1);
  state.swapUsedThisTurn = true;
  state.selectedCard = null;
  logEntry("ability", team, `ใช้ 'เปลี่ยนการ์ด' ทิ้ง "${card.text}" จั่วใหม่ ${drawn} ใบ`);
  if (checkDeckEmptyEnd()) return;
  renderAll();
}

function abilityRescue() {
  if (state.rescueUsed || !state.danger.length) return;
  const team = currentTeam();
  const card = state.danger.pop();
  const outsideIndex = [...state.placed.outside].reverse().findIndex((placed) => placed.no === card.no);
  if (outsideIndex >= 0) {
    state.placed.outside.splice(state.placed.outside.length - 1 - outsideIndex, 1);
  }
  state.removed.push(card);
  const draws = state.teams.map((targetTeam) => `${targetTeam.name} +${draw(targetTeam, 1)}`).join(", ");
  state.rescueUsed = true;
  logEntry("ability", team, `ใช้ 'กู้คืน' ทุกทีมเห็นด้วย ทุกทีมจั่ว 1 (${draws}) แล้วเอา "${card.text}" ออกจากกองพลาดนอกวง`);
  if (checkDeckEmptyEnd()) return;
  renderAll();
}

function checkDeckEmptyEnd() {
  if (state.deck.length > 0) return false;
  state.phase = "gameover";
  logEntry("end", null, "กองจั่วหมด ทุกทีมแพ้ร่วมกัน");
  const scoreText = state.matchScores.map((score, i) => `ทีม ${i + 1}: ${score}`).join(" / ");
  showFeedback("bad", "กองจั่วหมด — รอบนี้ไม่มีทีมได้แต้ม", `ไม่มีการ์ดเหลือให้จั่ว เกมจบรอบทันที · คะแนนตอนนี้: ${scoreText}`);
  els.nextBtn.hidden = true;
  renderAll();
  return true;
}

function checkEndThenRender(team) {
  if (team.hand.length === 0) {
    state.phase = "gameover";
    state.matchScores[state.currentTeam] = (state.matchScores[state.currentTeam] || 0) + 1;
    const scoreText = state.matchScores.map((score, i) => `ทีม ${i + 1}: ${score}`).join(" / ");
    const wonMatch = state.matchScores[state.currentTeam] >= 2;
    logEntry("end", team, `${team.name} การ์ดหมดมือ ชนะรอบนี้ (${scoreText})${wonMatch ? " และชนะแมตช์" : ""}`);
    showFeedback(
      "good",
      wonMatch ? `${team.name} ชนะ 2 ใน 3!` : `${team.name} ชนะรอบนี้`,
      wonMatch ? `จบแมตช์ — ${scoreText}` : `คะแนนตอนนี้: ${scoreText} กด 'เริ่มรอบใหม่' เพื่อเล่นรอบถัดไป`
    );
    els.nextBtn.hidden = true;
    renderAll();
    return;
  }
  if (checkDeckEmptyEnd()) return;
  if (state.danger.length > state.threshold) {
    state.phase = "gameover";
    logEntry("end", null, `ทายพลาดแล้วเฉลยเป็นนอกวงเกิน ${state.threshold} ใบ ทุกทีมแพ้ร่วมกัน`);
    const scoreText = state.matchScores.map((score, i) => `ทีม ${i + 1}: ${score}`).join(" / ");
    showFeedback("bad", "ภัยท่วมเมือง — รอบนี้ไม่มีทีมได้แต้ม", `การ์ดที่ทีมวางผิดแต่เฉลยเป็น "นอกวง" สะสมเกิน ${state.threshold} ใบ · คะแนนตอนนี้: ${scoreText}`);
    els.nextBtn.hidden = true;
    renderAll();
    return;
  }
  els.nextBtn.hidden = false;
  if (state.keepTurn && state.streak >= 2) {
    state.keepTurn = false;
    els.nextBtn.textContent = "ครบ 2 ใบ ส่งตาต่อ";
  } else {
    els.nextBtn.textContent = state.keepTurn ? "ทีมเดิมลงต่อ" : "ตาถัดไป";
  }
  renderAll();
}

function nextTurn() {
  if (state.phase !== "feedback") return;
  if (!state.keepTurn) {
    state.currentTeam = (state.currentTeam + 1) % state.teams.length;
    state.streak = 0;
  }
  state.keepTurn = false;
  state.phase = "place";
  beginTurn();
}

function exportCsv() {
  if (!state.log.length) return;
  const rows = [
    ["seq", "pair", "actual_left", "actual_right", "guess_left", "guess_right", "hint_stage", "team", "kind", "detail", "correct", "missed_outside_count"],
    ...state.log.map((e) => [
      e.seq,
      e.pair,
      e.actualLeft,
      e.actualRight,
      e.guessLeft,
      e.guessRight,
      e.hintStage,
      e.team,
      e.kind,
      e.detail,
      e.correct === null ? "" : e.correct,
      e.danger,
    ]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nhrc-venn-alpha-log-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function resetMatch() {
  const teamCount = Number(els.teamCount.value);
  state.matchScores = Array.from({ length: teamCount }, () => 0);
  state.roundNumber = 0;
  state.pairHistory = [];
  els.nextBtn.hidden = false;
  startGame();
}

zoneButtons.forEach((z) => z.addEventListener("click", () => placeCard(z.dataset.zone)));
els.newGameBtn.addEventListener("click", () => { els.nextBtn.hidden = false; startGame(); });
els.resetMatchBtn.addEventListener("click", resetMatch);
els.nextBtn.addEventListener("click", nextTurn);
els.exportBtn.addEventListener("click", exportCsv);
els.abilitySwap.addEventListener("click", abilitySwap);
els.abilityRescue.addEventListener("click", abilityRescue);
els.revealLeftHint.addEventListener("click", () => revealHint("left"));
els.revealRightHint.addEventListener("click", () => revealHint("right"));
els.leftGuess.addEventListener("click", () => placeGuess("left"));
els.rightGuess.addEventListener("click", () => placeGuess("right"));
els.clearGuesses.addEventListener("click", clearGuesses);
els.checkGuesses.addEventListener("click", checkGuesses);
