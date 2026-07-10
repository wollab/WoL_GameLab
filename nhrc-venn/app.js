// ผู้พิทักษ์เวทมนตร์แห่งสิทธิ — alpha digital playtest (กติกาตาม game-design v1.1 + token ทายวง 2026-07-10)
// แอปทำหน้าที่ "ผู้คุมเวท": รู้คู่ผู้พิทักษ์, ให้คำใบ้, และเฉลยถูก/ผิด
// แมตช์: เล่น 3 รอบนับแต้มรวม (ชนะรอบ +1, token ทายวง +1/0/−1) / ชนะรอบ 2 ติดจบทันที / แต้มเท่ากัน = เสมอ

const GUARDIANS = {
  CRC: { name: "พิทักษ์ผู้เยาว์", protect: "สิทธิเด็ก", shortName: "เด็ก", metaphor: "เกราะให้คนที่ยังโตไม่เต็มวัย", clues: ["ของเล่น โรงเรียน ครอบครัว", "ใครยังเล็ก ต้องมีคนช่วยคุ้ม", "เรื่องเติบโต ปลอดภัย และมีตัวตน"] },
  ICESCR: { name: "พิทักษ์หล่อเลี้ยง", protect: "กิน เรียน อยู่ รักษา", shortName: "ชีวิตพื้นฐาน", metaphor: "เสบียงของการมีชีวิตที่พออยู่ได้", clues: ["ข้าว บ้าน โรงพยาบาล โรงเรียน", "สิ่งที่ทำให้ชีวิตยืนอยู่ได้", "ปากท้อง สุขภาพ งาน และที่อยู่"] },
  ICCPR: { name: "พิทักษ์แห่งเสียง", protect: "พูด เชื่อ ชุมนุม ความเป็นส่วนตัว", shortName: "เสียงและเสรีภาพ", metaphor: "พื้นที่ให้คนพูด เชื่อ และไม่ถูกปิดปาก", clues: ["ไมโครโฟน ศาสนา ชุมนุม รหัสผ่าน", "เสียง ความเชื่อ และพื้นที่ส่วนตัว", "สิทธิที่ทำให้คนมีตัวตนทางการเมือง"] },
  CEDAW: { name: "พิทักษ์เสมอภาค", protect: "ผู้หญิงไม่ถูกกีดกัน", shortName: "เสมอภาคหญิง", metaphor: "ประตูที่ต้องเปิดเท่ากันไม่ว่าเพศใด", clues: ["แม่ท้อง ประจำเดือน เงินเดือนเท่ากัน", "ไม่ให้เพศเป็นเหตุผลของการกีดกัน", "โอกาสและศักดิ์ศรีของผู้หญิง"] },
  CRPD: { name: "พิทักษ์ผู้เข้าถึง", protect: "สิทธิคนพิการ", shortName: "เข้าถึงได้", metaphor: "สะพาน ทางลาด และภาษาที่ทุกคนใช้ได้", clues: ["รถเข็น ทางลาด เบรลล์ ภาษามือ", "ระบบต้องปรับให้คนเข้าได้จริง", "ไม่ได้ช่วยสงสาร แต่ทำให้เท่าเทียม"] },
  ICERD: { name: "พิทักษ์หลากสาย", protect: "ไม่ถูกเหยียดเชื้อชาติ", shortName: "ไม่เหยียดที่มา", metaphor: "ร่มใหญ่ให้ทุกสีผิว ภาษา และเชื้อสาย", clues: ["สีผิว ภาษาแม่ ชาติพันธุ์ สำเนียง", "ที่มาไม่ควรกลายเป็นตราบาป", "ปกป้องคนที่ถูกแบ่งจากเชื้อสาย"] },
  CAT: { name: "พิทักษ์เกราะ", protect: "ไม่ถูกทรมาน", shortName: "ไม่ถูกทรมาน", metaphor: "กำแพงห้ามความเจ็บปวดจากอำนาจ", clues: ["ห้องสอบสวน คำสารภาพ ขู่เข็ญ", "ห้ามใช้ความเจ็บบังคับความจริง", "ศักดิ์ศรีต้องไม่ถูกทำลายระหว่างควบคุมตัว"] },
  ICRMW: { name: "พิทักษ์ผู้เดินทาง", protect: "สิทธิแรงงานข้ามชาติ", shortName: "แรงงานข้ามแดน", metaphor: "แผนที่คุ้มคนที่ทำงานไกลบ้าน", clues: ["พาสปอร์ต ใบอนุญาต นายจ้าง ค่าแรง", "ทำงานต่างถิ่นก็ยังมีสิทธิ", "ครอบครัวและคนทำงานที่ข้ามพรมแดน"] },
  CPED: { name: "พิทักษ์แสงสืบหา", protect: "ไม่ถูกบังคับให้สูญหาย", shortName: "ไม่ถูกทำให้หาย", metaphor: "ไฟฉายตามหาคนที่รัฐทำให้ไร้ร่องรอย", clues: ["อุ้มหาย รายชื่อผู้สูญหาย กล้องวงจรปิด", "ไม่มีใครควรหายไปโดยไม่มีคำตอบ", "การควบคุมตัวต้องตรวจสอบได้"] },
};

const ZONE_LABELS = { left: "วงซ้าย", right: "วงขวา", center: "ตรงกลาง", outside: "นอกวง" };
const SIDE_LABELS = { left: "ฝั่งซ้าย", right: "ฝั่งขวา" };
const MIN_PLAYABLE_FOR_PAIR = 10; // คู่วงต้องมีการ์ดที่เข้าวงได้อย่างน้อยเท่านี้ (จากทั้งสำรับ)
const MIN_SIDE_CARDS_FOR_PAIR = 3;
const MIN_CENTER_CARDS_FOR_PAIR = 1;
const MATCH_ROUNDS = 3; // เล่น 3 รอบต่อแมตช์
const TEAM_COLORS = ["#1d6fb8", "#d2574a", "#2f9b66", "#8a5bbf"]; // น้ำเงิน / แดง / เขียว / ม่วง
const OPENER_NAME = "ผู้นำเกม";

const state = {
  teams: [],
  cardSet: [],
  deck: [],
  danger: [],
  removed: [],
  pair: null,
  pairHistory: [],
  matchScores: [], // แต้มรวม: ชนะรอบ +1, token +1/0/−1
  roundWinners: [], // index ทีมที่ชนะแต่ละรอบ (null = รอบแพ้ร่วม)
  matchOver: false,
  matchWinner: null, // index ทีมที่ชนะแมตช์ (null = เสมอ/ยังไม่จบ)
  roundNumber: 0,
  threshold: 8,
  tokensPerSide: 1,
  tokenSeq: 0, // ตัวนับลำดับการวาง token (ใครวางก่อน)
  currentTeam: 0,
  selectedCard: null,
  swapUsedThisTurn: false,
  revealedHints: { left: false, right: false },
  roundHints: { left: 0, right: 0 },
  rescueUsed: false,
  keepTurn: false,
  streak: 0,
  placed: { left: [], right: [], center: [], outside: [] },
  selectedTreaty: null,
  phase: "idle", // idle | place | feedback | gameover
  log: [],
};

const els = {};
for (const id of [
  "pairLabel","dangerLabel","thresholdNote","teamCount","handSize","dangerThreshold","tokenCount","wordSet",
  "newGameBtn","resetMatchBtn","exportBtn","abilitySwap","abilityRescue",
  "revealLeftHint","revealRightHint",
  "turnLabel","deckLabel","clueLeft","clueRight","clueLeftBox","clueRightBox","boardHint",
  "feedback","resultBadge","resultTitle","resultReason","nextBtn",
  "handTitle","handCount","handList","teamsStrip","summaryLabel","logList",
  "treatyBank","leftGuess","rightGuess","guessStatus","clearGuesses","tokenBoard",
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

function activeCardSet() {
  if (els.wordSet.value === "v3" && typeof WORD_CARDS_V3 !== "undefined") return WORD_CARDS_V3;
  if (els.wordSet.value === "v2" && typeof WORD_CARDS_V2 !== "undefined") return WORD_CARDS_V2;
  return WORD_CARDS;
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
  return state.cardSet.filter((c) => correctZone(c, pair) !== "outside").length;
}

function zoneCountsForPair(pair) {
  return state.cardSet.reduce((counts, card) => {
    counts[correctZone(card, pair)] += 1;
    return counts;
  }, { left: 0, center: 0, right: 0, outside: 0 });
}

function eligiblePairs() {
  const ids = Object.keys(GUARDIANS);
  const pairs = [];
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++)
      {
        const pair = [ids[i], ids[j]];
        const counts = zoneCountsForPair(pair);
        const playable = counts.left + counts.center + counts.right;
        if (
          playable >= MIN_PLAYABLE_FOR_PAIR &&
          counts.left >= MIN_SIDE_CARDS_FOR_PAIR &&
          counts.right >= MIN_SIDE_CARDS_FOR_PAIR &&
          counts.center >= MIN_CENTER_CARDS_FOR_PAIR
        ) pairs.push(pair);
      }
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

function prioritizeEarlyDeck(deck, pair) {
  const work = [...deck];
  const early = [];
  const take = (zone, count) => {
    for (let n = 0; n < count; n++) {
      const index = work.findIndex((card) => correctZone(card, pair) === zone);
      if (index < 0) break;
      early.push(work.splice(index, 1)[0]);
    }
  };
  take("left", 2);
  take("right", 2);
  take("center", 2);
  take("outside", 2);
  return [...shuffle(work), ...shuffle(early)];
}

function guardianTokenLabel(id) {
  const guardian = GUARDIANS[id];
  return `${id}: ${guardian.shortName}`;
}

function teamTokenOn(team, side) {
  const token = (team.tokens && team.tokens[side] ? team.tokens[side] : []).find(Boolean);
  return token ? token.treaty : "";
}

function logEntry(kind, team, detail, correct = null) {
  const [actualLeft = "", actualRight = ""] = state.pair || [];
  const current = state.teams.length ? currentTeam() : null;
  state.log.push({
    seq: state.log.length + 1,
    round: state.roundNumber,
    pair: state.pair ? state.pair.join("+") : "",
    actualLeft,
    actualRight,
    guessLeft: current ? teamTokenOn(current, "left") : "",
    guessRight: current ? teamTokenOn(current, "right") : "",
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
  if (state.matchOver) {
    showFeedback("neutral", "แมตช์นี้จบแล้ว", "กด 'รีเซ็ตแมตช์' เพื่อเริ่มแมตช์ใหม่");
    els.nextBtn.hidden = true;
    return;
  }
  const handSize = Number(els.handSize.value);
  state.threshold = Number(els.dangerThreshold.value);
  state.tokensPerSide = Number(els.tokenCount.value);
  state.cardSet = activeCardSet();
  if (state.matchScores.length !== teamCount) {
    state.matchScores = Array.from({ length: teamCount }, () => 0);
    state.roundWinners = [];
    state.roundNumber = 0;
    state.pairHistory = [];
    state.log = [];
  }
  state.roundNumber += 1;
  state.deck = [];
  state.danger = [];
  state.removed = [];
  state.placed = { left: [], right: [], center: [], outside: [] };
  state.keepTurn = false;
  state.streak = 0;
  state.rescueUsed = false;
  state.selectedTreaty = null;
  state.tokenSeq = 0;
  state.currentTeam = 0;
  state.revealedHints = { left: false, right: false };
  state.teams = Array.from({ length: teamCount }, (_, i) => ({
    name: `ทีม ${i + 1}`,
    color: TEAM_COLORS[i % TEAM_COLORS.length],
    hand: [],
    tokens: {
      left: Array.from({ length: state.tokensPerSide }, () => null),
      right: Array.from({ length: state.tokensPerSide }, () => null),
    },
  }));
  els.thresholdNote.textContent = `หลุดการป้องกันเกิน ${state.threshold} ใบ = แพ้ทุกทีม`;
  summonPair(state.roundNumber === 1 ? ["CRC", "ICESCR"] : null); // รอบแรกเป็น tutorial pair
  state.deck = shuffle(state.cardSet);
  openerReveal(); // ผู้นำเกมเปิดการ์ดซ้าย/กลาง/ขวาเป็นข้อมูลตั้งต้น
  state.deck = prioritizeEarlyDeck(state.deck, state.pair);
  for (const team of state.teams) draw(team, handSize);
  state.phase = "place";
  beginTurn();
}

function summonPair(forcedPair) {
  state.pair = forcedPair || pickPair();
  state.pairHistory.push(state.pair);
  state.streak = 0;
  state.placed = { left: [], right: [], center: [], outside: [] };
  state.selectedTreaty = null;
  state.roundHints = {
    left: Math.floor(Math.random() * GUARDIANS[state.pair[0]].clues.length),
    right: Math.floor(Math.random() * GUARDIANS[state.pair[1]].clues.length),
  };
  logEntry("summon", null, `เริ่มรอบที่ ${state.roundNumber} เรียกผู้พิทักษ์คู่ใหม่`);
  renderClues();
}

// ผู้นำเกมเปิดตัวอย่างซ้าย/กลาง/ขวาอย่างละใบ ถ้าคู่นั้นมีการ์ดพอ
function openerReveal() {
  for (const targetZone of ["left", "center", "right"]) {
    const index = state.deck.findIndex((card) => correctZone(card, state.pair) === targetZone);
    if (index < 0) continue;
    const [card] = state.deck.splice(index, 1);
    state.placed[targetZone].push({
      no: card.no,
      text: card.text,
      team: OPENER_NAME,
      teamColor: "#dda342",
      wasCorrect: true,
      reason: card.reason,
    });
    logEntry("opener", null, `${OPENER_NAME}เปิดการ์ด "${card.text}" วางที่${ZONE_LABELS[targetZone]}`);
  }
}

function renderClues() {
  const [left, right] = state.pair;
  const revealDone = state.phase === "gameover";
  const render = (id, box, target, side) => {
    const g = GUARDIANS[id];
    let html = state.revealedHints[side]
      ? g.clues[state.roundHints[side] || 0]
      : "ยังไม่เปิดคำใบ้";
    if (revealDone) html = `<strong>${g.name} (${id})</strong> — ${g.protect}`;
    target.innerHTML = html;
    box.classList.toggle("revealed", revealDone || state.revealedHints[side]);
  };
  render(left, els.clueLeftBox, els.clueLeft, "left");
  render(right, els.clueRightBox, els.clueRight, "right");
  const availableHints = state.danger.length >= 4 ? 2 : state.danger.length >= 2 ? 1 : 0;
  const usedHints = Number(state.revealedHints.left) + Number(state.revealedHints.right);
  const canRead = state.phase === "place" && usedHints < availableHints;
  els.revealLeftHint.disabled = !canRead || state.revealedHints.left;
  els.revealRightHint.disabled = !canRead || state.revealedHints.right;
  els.pairLabel.textContent = `รอบที่ ${state.roundNumber}/${MATCH_ROUNDS}`;
}

function answerSummary() {
  if (!state.pair) return "";
  const [left, right] = state.pair;
  const leftGuardian = GUARDIANS[left];
  const rightGuardian = GUARDIANS[right];
  return `เฉลยวง: วงซ้าย = ${leftGuardian.name} (${left}) — ${leftGuardian.protect} / วงขวา = ${rightGuardian.name} (${right}) — ${rightGuardian.protect}`;
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

function scoreText() {
  return state.matchScores.map((score, i) => `ทีม ${i + 1}: ${score}`).join(" / ");
}

function renderAll() {
  const team = currentTeam();
  els.turnLabel.textContent = state.phase === "gameover"
    ? (state.matchOver ? "จบแมตช์" : "จบรอบ")
    : `รอบที่ ${state.roundNumber}/${MATCH_ROUNDS} · ตาของ ${team.name}`;
  els.turnLabel.style.color = state.phase === "place" ? team.color : "";
  els.deckLabel.textContent = `กองจั่ว ${state.deck.length} ใบ`;
  els.dangerLabel.textContent = `หลุดการป้องกัน ${state.danger.length}/${state.threshold}`;
  renderClues();
  renderHand();
  renderTeams();
  renderSummary();
  renderPlacedCards();
  renderTokenPanel();
  const disable = state.phase !== "place";
  zoneButtons.forEach((z) => (z.disabled = disable || !state.selectedCard));
  els.abilitySwap.disabled = disable || state.swapUsedThisTurn;
  els.abilityRescue.disabled = disable || !state.danger.length || state.rescueUsed;
  els.leftGuess.disabled = disable;
  els.rightGuess.disabled = disable;
  els.clearGuesses.disabled = disable;
  els.boardHint.textContent = disable
    ? "รอเริ่มตาใหม่"
    : state.selectedCard
      ? `กำลังวาง: "${state.selectedCard.text}" — แตะตำแหน่งบนกระดาน`
      : "เลือกการ์ดจากมือ แล้วแตะตำแหน่งที่คิดว่าถูก";
}

function renderTokenPanel() {
  const team = state.teams.length ? currentTeam() : null;
  const freeLeft = team ? team.tokens.left.filter((t) => t === null).length : 0;
  const freeRight = team ? team.tokens.right.filter((t) => t === null).length : 0;
  els.leftGuess.textContent = `วาง token ฝั่งซ้าย`;
  els.rightGuess.textContent = `วาง token ฝั่งขวา`;
  if (team && state.phase === "place") {
    els.guessStatus.textContent = state.selectedTreaty
      ? `เลือก: ${guardianTokenLabel(state.selectedTreaty)} — กดวางฝั่งซ้ายหรือขวา (${team.name}: ซ้าย ${freeLeft}/${state.tokensPerSide}, ขวา ${freeRight}/${state.tokensPerSide})`
      : `${team.name} มี token ซ้าย ${freeLeft}/${state.tokensPerSide} และขวา ${freeRight}/${state.tokensPerSide} — เลือกสนธิสัญญาจากคลังก่อน`;
  }

  // กระดาน token รวมทุกทีม (ข้อมูลเปิด เหมือนวางบนโต๊ะจริง)
  els.tokenBoard.innerHTML = "";
  for (const side of ["left", "right"]) {
    const box = document.createElement("div");
    box.className = "token-side";
    const chips = [];
    state.teams.forEach((t) => {
      (t.tokens[side] || []).forEach((token, ti) => {
        if (token) {
          chips.push(`<button type="button" class="token-chip" data-team="${state.teams.indexOf(t)}" data-side="${side}" data-token="${ti}" style="border-color:${t.color};color:${t.color}" title="วางเป็นลำดับที่ ${token.seq}${t === currentTeam() ? " — แตะเพื่อยกออก" : ""}">${t.name}: ${guardianTokenLabel(token.treaty)}</button>`);
        }
      });
    });
    box.innerHTML = `<span>${SIDE_LABELS[side]}</span>${chips.join("") || "<em>ยังไม่มี token</em>"}`;
    els.tokenBoard.appendChild(box);
  }
  // แตะ token ของทีมตัวเองเพื่อยกออก (ย้ายใหม่ได้)
  els.tokenBoard.querySelectorAll(".token-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const teamIdx = Number(chip.dataset.team);
      if (teamIdx !== state.currentTeam || state.phase !== "place") return;
      state.teams[teamIdx].tokens[chip.dataset.side][Number(chip.dataset.token)] = null;
      els.guessStatus.textContent = "ยก token ออกแล้ว วางใหม่ได้";
      renderTokenPanel();
    });
  });

  els.treatyBank.innerHTML = "";
  for (const [id, guardian] of Object.entries(GUARDIANS)) {
    const button = document.createElement("button");
    button.className = "treaty-token" + (state.selectedTreaty === id ? " selected" : "");
    button.type = "button";
    button.innerHTML = `<strong>${id}</strong><span>${guardian.shortName}</span><small>${guardian.metaphor}</small>`;
    button.addEventListener("click", () => {
      state.selectedTreaty = state.selectedTreaty === id ? null : id;
      renderTokenPanel();
    });
    els.treatyBank.appendChild(button);
  }
}

function placeGuess(side) {
  if (state.phase !== "place") return;
  const team = currentTeam();
  if (!state.selectedTreaty) {
    els.guessStatus.textContent = "เลือกสนธิสัญญาจากคลังก่อน แล้วค่อยกดวาง";
    return;
  }
  const sideTokens = team.tokens[side];
  let idx = sideTokens.findIndex((t) => t === null);
  if (idx < 0) idx = 0;
  state.tokenSeq += 1;
  sideTokens[idx] = { treaty: state.selectedTreaty, seq: state.tokenSeq };
  logEntry("token", team, `วาง token ทาย${SIDE_LABELS[side]} = ${guardianTokenLabel(state.selectedTreaty)} (ลำดับที่ ${state.tokenSeq})`);
  els.guessStatus.textContent = `${team.name} วาง ${guardianTokenLabel(state.selectedTreaty)} ที่${SIDE_LABELS[side]} (ลำดับที่ ${state.tokenSeq})`;
  state.selectedTreaty = null;
  renderTokenPanel();
}

function clearGuesses() {
  if (state.phase !== "place") return;
  const team = currentTeam();
  team.tokens.left = team.tokens.left.map(() => null);
  team.tokens.right = team.tokens.right.map(() => null);
  state.selectedTreaty = null;
  els.guessStatus.textContent = `ยก token ของ${team.name}ออกทั้งหมดแล้ว`;
  renderTokenPanel();
}

// เฉลย token ตอนจบรอบ: ถูก+วางเป็นคนแรก +1 / ถูกแต่ช้ากว่า 0 / ผิด −1 / ไม่วาง 0
function scoreTokens() {
  const lines = [];
  for (const side of ["left", "right"]) {
    const actual = side === "left" ? state.pair[0] : state.pair[1];
    const placedTokens = [];
    state.teams.forEach((team, ti) => {
      (team.tokens[side] || []).forEach((token) => {
        if (token) placedTokens.push({ ti, token });
      });
    });
    const correctOnes = placedTokens.filter((p) => p.token.treaty === actual).sort((a, b) => a.token.seq - b.token.seq);
    placedTokens.forEach(({ ti, token }) => {
      const team = state.teams[ti];
      if (token.treaty === actual) {
        const isFirst = correctOnes.length && correctOnes[0].token.seq === token.seq;
        const pts = isFirst ? 1 : 0;
        state.matchScores[ti] += pts;
        lines.push(`${team.name} ทาย${SIDE_LABELS[side]}ถูก${isFirst ? " เป็นคนแรก +1" : " แต่ช้ากว่า 0"}`);
        logEntry("tokenScore", team, `token ${SIDE_LABELS[side]}: ทายถูก${isFirst ? " เป็นคนแรก +1 แต้ม" : " แต่ไม่ใช่คนแรก 0 แต้ม"}`, true);
      } else {
        state.matchScores[ti] -= 1;
        lines.push(`${team.name} ทาย${SIDE_LABELS[side]}ผิด −1`);
        logEntry("tokenScore", team, `token ${SIDE_LABELS[side]}: ทายผิด (ทาย ${guardianTokenLabel(token.treaty)}) −1 แต้ม`, false);
      }
    });
  }
  return lines.length ? `ผล token: ${lines.join(" · ")}` : "ไม่มีทีมใดวาง token";
}

function renderHand() {
  const team = currentTeam();
  els.handTitle.textContent = `มือของ${team.name}`;
  els.handTitle.style.color = team.color;
  els.handCount.textContent = `${team.hand.length} ใบ`;
  const handArea = els.handList.closest(".hand-area");
  if (handArea) handArea.style.borderColor = state.phase === "place" ? team.color : "";
  els.handList.innerHTML = "";
  for (const card of team.hand) {
    const btn = document.createElement("button");
    btn.className = "hand-card" + (state.selectedCard === card ? " selected" : "");
    btn.type = "button";
    btn.style.borderColor = team.color;
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
    const isMatchWinner = state.matchOver && state.matchWinner === i;
    chip.className = "team-chip" + (i === state.currentTeam && state.phase === "place" ? " active" : "") + (isMatchWinner ? " winner" : "");
    chip.style.borderLeft = `6px solid ${team.color}`;
    if (i === state.currentTeam && state.phase === "place") chip.style.borderColor = team.color;
    const tokenInfo = ["left", "right"].map((side) => {
      const token = team.tokens[side].find(Boolean);
      return `${SIDE_LABELS[side]}=${token ? guardianTokenLabel(token.treaty) : "ว่าง"}`;
    }).join(", ");
    chip.innerHTML = `<strong style="color:${team.color}">${team.name}</strong><span>แต้ม ${score} · การ์ดในมือ ${team.hand.length} ใบ</span><span>token: ${tokenInfo}</span>`;
    els.teamsStrip.appendChild(chip);
  });
}

function renderSummary() {
  const placements = state.log.filter((e) => e.kind === "place");
  const scores = state.matchScores.length
    ? state.matchScores.map((score, i) => `ทีม ${i + 1}: ${score} แต้ม`).join(" · ")
    : "ยังไม่เริ่มแมตช์";
  if (!placements.length) {
    els.summaryLabel.textContent = scores;
    return;
  }
  const correct = placements.filter((e) => e.correct === true).length;
  els.summaryLabel.textContent = `${scores} · วางแล้ว ${placements.length} ครั้ง ถูก ${correct} (${Math.round((correct / placements.length) * 100)}%)`;
}

function renderLog() {
  els.logList.innerHTML = "";
  for (const entry of [...state.log].reverse().slice(0, 30)) {
    const row = document.createElement("article");
    const cls = entry.correct === false ? "wrong" : entry.kind === "place" ? "" : "neutral";
    row.className = `log-item ${cls}`;
    row.innerHTML = `<strong>R${entry.round} #${entry.seq}</strong><span>${entry.team} · ${entry.detail}</span><span>หลุดการป้องกัน ${entry.danger}</span>`;
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
      logEntry("place", team, `"${card.text}" → นอกวง ถูก ไม่นับเป็นหลุดการป้องกัน`, true);
      showFeedback("good", `ถูกต้อง — "${card.text}" ไม่อยู่ใต้วงคู่นี้`, `ทายว่านอกวงแล้วถูก จึงไม่นับเป็นหลุดการป้องกัน — ${card.reason}`);
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
    if (state.log.filter((e) => e.kind === "place" && e.round === state.roundNumber).length >= 10) {
      reason += " | Facilitator: ถามทีมว่าอะไรทำให้คิดว่าวางช่องเดิม และหลังเห็นเฉลยจะเปลี่ยนหลักคิดอย่างไร";
    }
    showFeedback("bad", `ยังไม่ถูก — ย้าย "${card.text}" ไป${ZONE_LABELS[answer]}`, reason);
  }

  state.selectedCard = null;
  state.phase = "feedback";
  checkEndThenRender(team);
}

function addPlacedCard(zone, card, team, wasCorrect) {
  state.placed[zone].push({
    no: card.no,
    text: card.text,
    team: team.name,
    teamColor: team.color || "#8b8468",
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
          .map((card) => `<span class="${card.wasCorrect ? "placed-correct" : "placed-corrected"}" style="border-color:${card.teamColor}" title="วางโดย${card.team}">${card.text}</span>`)
          .join("")
      : `<em>ยังไม่มีการ์ด</em>`;
  }
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
  logEntry("ability", team, `ใช้ 'กู้คืน' ทุกทีมเห็นด้วย ทุกทีมจั่ว 1 (${draws}) แล้วเอา "${card.text}" ออกจากกองหลุดการป้องกัน`);
  if (checkDeckEmptyEnd()) return;
  renderAll();
}

// ประเมินสถานะแมตช์หลังจบรอบ: เล่นครบ 3 รอบเสมอ แล้วนับแต้มรวม / เท่ากัน = เสมอ
function evaluateMatch() {
  const n = state.roundWinners.length;
  if (n >= MATCH_ROUNDS) {
    state.matchOver = true;
    const max = Math.max(...state.matchScores);
    const leaders = state.matchScores.map((s, i) => (s === max ? i : -1)).filter((i) => i >= 0);
    state.matchWinner = leaders.length === 1 ? leaders[0] : null; // null = เสมอ
  }
}

function matchEndText() {
  if (state.matchWinner !== null) return `${state.teams[state.matchWinner].name} ชนะ!`;
  return "เสมอ!";
}

function endRound(winnerIndex, title, reason, kind) {
  state.phase = "gameover";
  const tokenSummary = scoreTokens(); // เฉลย token ก่อนสรุปแต้ม
  state.roundWinners.push(winnerIndex);
  evaluateMatch();
  const fullReason = `${reason} · ${tokenSummary} · แต้มรวม: ${scoreText()}`;
  if (state.matchOver) {
    logEntry("end", null, `จบแมตช์: ${matchEndText()} (${scoreText()})`);
    showFeedback(kind, matchEndText(), `${fullReason} · กด 'รีเซ็ตแมตช์' เพื่อเริ่มแมตช์ใหม่`);
  } else {
    showFeedback(kind, title, `${fullReason} · กด 'เริ่มรอบใหม่' เพื่อเล่นรอบถัดไป (${state.roundNumber}/${MATCH_ROUNDS})`);
  }
  els.nextBtn.hidden = true;
  renderAll();
}

function checkDeckEmptyEnd() {
  if (state.deck.length > 0) return false;
  logEntry("end", null, "กองจั่วหมด ทุกทีมแพ้ร่วมกัน");
  endRound(null, "กองจั่วหมด — รอบนี้ไม่มีทีมได้แต้มรอบ", `ไม่มีการ์ดเหลือให้จั่ว เกมจบรอบทันที · ${answerSummary()}`, "bad");
  return true;
}

function checkEndThenRender(team) {
  if (team.hand.length === 0) {
    state.matchScores[state.currentTeam] = (state.matchScores[state.currentTeam] || 0) + 1;
    logEntry("end", team, `${team.name} การ์ดหมดมือ ชนะรอบนี้ +1 แต้ม`);
    endRound(state.currentTeam, `${team.name} ชนะรอบนี้ +1 แต้ม`, `${answerSummary()}`, "good");
    return;
  }
  if (checkDeckEmptyEnd()) return;
  if (state.danger.length > state.threshold) {
    logEntry("end", null, `หลุดการป้องกันเกิน ${state.threshold} ใบ ทุกทีมแพ้ร่วมกัน`);
    endRound(null, "หลุดการป้องกัน — รอบนี้ไม่มีทีมได้แต้มรอบ", `การ์ดที่ทีมวางผิดแต่เฉลยเป็น "นอกวง" สะสมเกิน ${state.threshold} ใบ · ${answerSummary()}`, "bad");
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
    ["seq", "round", "pair", "actual_left", "actual_right", "guess_left", "guess_right", "hint_stage", "team", "kind", "detail", "correct", "protection_gap_count"],
    ...state.log.map((e) => [
      e.seq,
      e.round,
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
  state.roundWinners = [];
  state.matchOver = false;
  state.matchWinner = null;
  state.roundNumber = 0;
  state.pairHistory = [];
  state.log = [];
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

function revealHint(side) {
  if (!state.pair || state.phase !== "place") return;
  const availableHints = state.danger.length >= 4 ? 2 : state.danger.length >= 2 ? 1 : 0;
  const usedHints = Number(state.revealedHints.left) + Number(state.revealedHints.right);
  if (usedHints >= availableHints || state.revealedHints[side]) return;
  state.revealedHints[side] = true;
  const guardianId = side === "left" ? state.pair[0] : state.pair[1];
  const label = side === "left" ? "วงซ้าย" : "วงขวา";
  const clue = GUARDIANS[guardianId].clues[state.roundHints[side] || 0];
  logEntry("hint", currentTeam(), `อ่านคำใบ้${label}: ${clue}`);
  renderAll();
}

startGame();
