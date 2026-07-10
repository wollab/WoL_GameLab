const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const GUARDIANS = {
  CRC: "สิทธิเด็ก",
  ICESCR: "กิน เรียน อยู่ รักษา",
  ICCPR: "พูด เชื่อ ชุมนุม ความเป็นส่วนตัว",
  CEDAW: "ผู้หญิงไม่ถูกกีดกัน",
  CRPD: "สิทธิคนพิการ",
  ICERD: "ไม่ถูกเหยียดเชื้อชาติ",
  CAT: "ไม่ถูกทรมาน",
  ICRMW: "สิทธิแรงงานข้ามชาติ",
  CPED: "ไม่ถูกบังคับให้สูญหาย",
};
const IDS = Object.keys(GUARDIANS);
const ZONES = ["left", "center", "right", "outside"];
const MATCH_ROUNDS = 3;
const MIN_PLAYABLE_FOR_PAIR = 10;

function loadCards(filename, varName) {
  const code = fs.readFileSync(path.join(ROOT, filename), "utf8");
  return Function(`${code}; return ${varName};`)();
}

const SETS = {
  v1: loadCards("cards-data.js", "WORD_CARDS"),
  v2: loadCards("cards-data-v2.js", "WORD_CARDS_V2"),
  v3: loadCards("cards-data-v3.js", "WORD_CARDS_V3"),
};

function rng(seed) {
  let x = seed >>> 0;
  return () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return x / 0x100000000;
  };
}

function shuffle(items, random) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
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

function eligiblePairs(cards) {
  const pairs = [];
  for (let i = 0; i < IDS.length; i++) {
    for (let j = i + 1; j < IDS.length; j++) {
      const pair = [IDS[i], IDS[j]];
      const playable = cards.filter((card) => correctZone(card, pair) !== "outside").length;
      if (playable >= MIN_PLAYABLE_FOR_PAIR) pairs.push(pair);
    }
  }
  return pairs;
}

function structuralStats(cards) {
  const pairs = eligiblePairs(cards);
  const pairStats = pairs.map((pair) => {
    const zones = { left: 0, center: 0, right: 0, outside: 0 };
    for (const card of cards) zones[correctZone(card, pair)] += 1;
    return zones;
  });
  const avg = (field) => pairStats.reduce((s, z) => s + z[field], 0) / pairStats.length;
  const types = cards.reduce((acc, card) => {
    acc[card.type || "unknown"] = (acc[card.type || "unknown"] || 0) + 1;
    return acc;
  }, {});
  return {
    cards: cards.length,
    types,
    eligiblePairs: pairs.length,
    avgLeft: avg("left"),
    avgCenter: avg("center"),
    avgRight: avg("right"),
    avgOutside: avg("outside"),
    avgPlayable: avg("left") + avg("center") + avg("right"),
  };
}

function makeTeam(i, tokensPerSide) {
  return {
    id: i,
    hand: [],
    tokens: { left: Array(tokensPerSide).fill(null), right: Array(tokensPerSide).fill(null) },
  };
}

function draw(team, deck, n) {
  let drawn = 0;
  while (drawn < n && deck.length) {
    team.hand.push(deck.pop());
    drawn += 1;
  }
  return drawn;
}

function evidenceScores(placed, side) {
  const scores = Object.fromEntries(IDS.map((id) => [id, 0]));
  const add = (card, weight) => {
    for (const treaty of card.treaties) scores[treaty] += weight;
  };
  for (const card of placed[side]) add(card, 1.25);
  for (const card of placed.center) add(card, 1);
  for (const card of placed.outside) add(card, -0.2);
  return Object.entries(scores).sort((a, b) => b[1] - a[1]);
}

function updateTokens(game, team) {
  for (const side of ["left", "right"]) {
    const ranked = evidenceScores(game.placed, side);
    const useful = ranked.filter(([, score]) => score >= 1.8);
    const targetCount = Math.min(team.tokens[side].length, useful.length);
    for (let i = 0; i < targetCount; i++) {
      const [treaty, score] = useful[i];
      const current = team.tokens[side][i];
      const shouldPlace = !current || current.treaty !== treaty;
      const hedgeAllowed = i === 0 || (score >= 2.7 && useful[i - 1][1] - score <= 1.4);
      if (shouldPlace && hedgeAllowed) {
        game.tokenSeq += 1;
        team.tokens[side][i] = { treaty, seq: game.tokenSeq };
        game.tokenMoves += 1;
      }
    }
  }
}

function chooseCard(team, pair, random, wordSet, placedCount, hintsRead) {
  const card = team.hand[Math.floor(random() * team.hand.length)];
  const answer = correctZone(card, pair);
  const isV2 = wordSet === "v2";
  const isV3 = wordSet === "v3";
  const baseByZone = {
    left: isV2 ? 0.64 : isV3 ? 0.68 : 0.72,
    right: isV2 ? 0.64 : isV3 ? 0.68 : 0.72,
    center: isV2 ? 0.53 : isV3 ? 0.57 : 0.61,
    outside: isV2 ? 0.43 : isV3 ? 0.47 : 0.51,
  };
  const typeBoost = card.type === "clear" ? 0.08 : card.type === "overlap" ? -0.03 : 0;
  const learningBoost = Math.min(0.16, placedCount * 0.012) + hintsRead * 0.045;
  const pCorrect = Math.max(0.2, Math.min(0.9, baseByZone[answer] + typeBoost + learningBoost));
  if (random() < pCorrect) return { card, zone: answer, answer, correct: true };
  const wrongZones = ZONES.filter((z) => z !== answer);
  return { card, zone: wrongZones[Math.floor(random() * wrongZones.length)], answer, correct: false };
}

function scoreTokens(game) {
  let tokenScore = 0;
  let tokenCorrect = 0;
  let tokenWrong = 0;
  for (const side of ["left", "right"]) {
    const actual = side === "left" ? game.pair[0] : game.pair[1];
    const placed = [];
    game.teams.forEach((team) => {
      team.tokens[side].forEach((token) => {
        if (token) placed.push({ team, token });
      });
    });
    const correct = placed.filter((p) => p.token.treaty === actual).sort((a, b) => a.token.seq - b.token.seq);
    for (const item of placed) {
      if (item.token.treaty === actual) {
        tokenCorrect += 1;
        const pts = correct[0] && correct[0].token.seq === item.token.seq ? 1 : 0;
        item.team.score += pts;
        tokenScore += pts;
      } else {
        item.team.score -= 1;
        tokenScore -= 1;
        tokenWrong += 1;
      }
    }
  }
  game.tokenScore += tokenScore;
  game.tokenCorrect += tokenCorrect;
  game.tokenWrong += tokenWrong;
}

function simulateRound(cards, wordSet, tokensPerSide, roundNumber, seenPairs, matchTeams, random) {
  const deck = shuffle(cards, random);
  const teams = matchTeams.map((team) => {
    team.hand = [];
    team.tokens = { left: Array(tokensPerSide).fill(null), right: Array(tokensPerSide).fill(null) };
    return team;
  });
  teams.forEach((team) => draw(team, deck, 7));
  let pair;
  if (roundNumber === 1) {
    pair = ["CRC", "ICESCR"];
  } else {
    const pool = eligiblePairs(cards).filter((p) => !seenPairs.has(p.join("+")));
    pair = shuffle(pool.length ? pool : eligiblePairs(cards), random)[0];
  }
  seenPairs.add(pair.join("+"));

  const game = {
    pair,
    teams,
    deck,
    placed: { left: [], center: [], right: [], outside: [] },
    danger: [],
    currentTeam: 0,
    streak: 0,
    tokenSeq: 0,
    tokenMoves: 0,
    tokenScore: 0,
    tokenCorrect: 0,
    tokenWrong: 0,
  };

  for (let i = game.deck.length - 1; i >= 0 && game.placed.left.length + game.placed.center.length + game.placed.right.length < 2; i--) {
    const card = game.deck[i];
    const zone = correctZone(card, pair);
    if (zone === "outside") continue;
    game.deck.splice(i, 1);
    game.placed[zone].push(card);
  }

  let turns = 0;
  let placements = 0;
  let wrong = 0;
  let hintsRead = 0;
  let endReason = "turn_cap";
  while (turns < 240) {
    const team = game.teams[game.currentTeam];
    if (!team.hand.length) {
      team.score += 1;
      endReason = "hand_empty";
      break;
    }
    if (!game.deck.length) {
      endReason = "deck_empty";
      break;
    }
    if (game.danger.length > 8) {
      endReason = "danger";
      break;
    }
    if (game.danger.length >= 4) hintsRead = 2;
    else if (game.danger.length >= 2) hintsRead = 1;
    updateTokens(game, team);
    const placedCount = Object.values(game.placed).reduce((s, arr) => s + arr.length, 0);
    const move = chooseCard(team, pair, random, wordSet, placedCount, hintsRead);
    team.hand = team.hand.filter((card) => card !== move.card);
    game.placed[move.answer].push(move.card);
    placements += 1;
    turns += 1;
    if (move.correct) {
      game.streak += 1;
      if (game.streak >= 2) {
        game.currentTeam = (game.currentTeam + 1) % game.teams.length;
        game.streak = 0;
      }
    } else {
      wrong += 1;
      game.streak = 0;
      if (move.answer === "outside") game.danger.push(move.card);
      draw(team, game.deck, 1);
      game.currentTeam = (game.currentTeam + 1) % game.teams.length;
    }
  }
  scoreTokens(game);
  const remainingHands = game.teams.map((team) => team.hand.length);
  const winnerHand = endReason === "hand_empty" ? 0 : null;
  const nonWinnerHands = endReason === "hand_empty"
    ? remainingHands.filter((count) => count > 0)
    : remainingHands;
  return {
    roundNumber,
    endReason,
    turns,
    placements,
    wrong,
    danger: game.danger.length,
    deckRemaining: game.deck.length,
    avgHandRemaining: remainingHands.reduce((s, count) => s + count, 0) / remainingHands.length,
    avgNonWinnerHandRemaining: nonWinnerHands.length ? nonWinnerHands.reduce((s, count) => s + count, 0) / nonWinnerHands.length : winnerHand,
    minHandRemaining: Math.min(...remainingHands),
    maxHandRemaining: Math.max(...remainingHands),
    tokenMoves: game.tokenMoves,
    tokenScore: game.tokenScore,
    tokenCorrect: game.tokenCorrect,
    tokenWrong: game.tokenWrong,
  };
}

function simulateVariant(wordSet, tokensPerSide, teamCount, matches, seed) {
  const cards = SETS[wordSet];
  const random = rng(seed);
  const totals = {
    matches,
    rounds: 0,
    hand_empty: 0,
    deck_empty: 0,
    danger: 0,
    turn_cap: 0,
    turns: 0,
    placements: 0,
    wrong: 0,
    dangerCards: 0,
    deckRemaining: 0,
    avgHandRemaining: 0,
    avgNonWinnerHandRemaining: 0,
    minHandRemaining: 0,
    maxHandRemaining: 0,
    perRound: Array.from({ length: MATCH_ROUNDS }, () => ({
      rounds: 0,
      turns: 0,
      placements: 0,
      avgHandRemaining: 0,
      avgNonWinnerHandRemaining: 0,
      minHandRemaining: 0,
      maxHandRemaining: 0,
      deckRemaining: 0,
    })),
    tokenMoves: 0,
    tokenScore: 0,
    tokenCorrect: 0,
    tokenWrong: 0,
    ties: 0,
    winnerMargin: 0,
  };
  for (let m = 0; m < matches; m++) {
    const teams = Array.from({ length: teamCount }, (_, i) => makeTeam(i, tokensPerSide));
    teams.forEach((team) => (team.score = 0));
    const seenPairs = new Set();
    for (let r = 1; r <= MATCH_ROUNDS; r++) {
      const result = simulateRound(cards, wordSet, tokensPerSide, r, seenPairs, teams, random);
      totals.rounds += 1;
      totals[result.endReason] += 1;
      totals.turns += result.turns;
      totals.placements += result.placements;
      totals.wrong += result.wrong;
      totals.dangerCards += result.danger;
      totals.deckRemaining += result.deckRemaining;
      totals.avgHandRemaining += result.avgHandRemaining;
      totals.avgNonWinnerHandRemaining += result.avgNonWinnerHandRemaining;
      totals.minHandRemaining += result.minHandRemaining;
      totals.maxHandRemaining += result.maxHandRemaining;
      const perRound = totals.perRound[result.roundNumber - 1];
      perRound.rounds += 1;
      perRound.turns += result.turns;
      perRound.placements += result.placements;
      perRound.avgHandRemaining += result.avgHandRemaining;
      perRound.avgNonWinnerHandRemaining += result.avgNonWinnerHandRemaining;
      perRound.minHandRemaining += result.minHandRemaining;
      perRound.maxHandRemaining += result.maxHandRemaining;
      perRound.deckRemaining += result.deckRemaining;
      totals.tokenMoves += result.tokenMoves;
      totals.tokenScore += result.tokenScore;
      totals.tokenCorrect += result.tokenCorrect;
      totals.tokenWrong += result.tokenWrong;
    }
    const scores = teams.map((team) => team.score).sort((a, b) => b - a);
    if (scores[0] === scores[1]) totals.ties += 1;
    totals.winnerMargin += scores[0] - scores[1];
  }
  const r = totals.rounds;
  const tokenAttempts = totals.tokenCorrect + totals.tokenWrong;
  return {
    wordSet,
    tokensPerSide,
    teamCount,
    matches,
    cardCount: cards.length,
    endHandPct: +(totals.hand_empty / r * 100).toFixed(1),
    endDeckPct: +(totals.deck_empty / r * 100).toFixed(1),
    endDangerPct: +(totals.danger / r * 100).toFixed(1),
    avgTurnsRound: +(totals.turns / r).toFixed(1),
    avgPlacementsRound: +(totals.placements / r).toFixed(1),
    avgCardsSeenRound: +(totals.placements / r + 2).toFixed(1),
    wrongRatePct: +(totals.wrong / totals.placements * 100).toFixed(1),
    avgDangerCards: +(totals.dangerCards / r).toFixed(2),
    avgDeckRemaining: +(totals.deckRemaining / r).toFixed(1),
    avgHandRemaining: +(totals.avgHandRemaining / r).toFixed(2),
    avgNonWinnerHandRemaining: +(totals.avgNonWinnerHandRemaining / r).toFixed(2),
    avgMinHandRemaining: +(totals.minHandRemaining / r).toFixed(2),
    avgMaxHandRemaining: +(totals.maxHandRemaining / r).toFixed(2),
    perRound: totals.perRound.map((round, i) => ({
      round: i + 1,
      avgTurns: +(round.turns / round.rounds).toFixed(1),
      avgPlacements: +(round.placements / round.rounds).toFixed(1),
      avgCardsSeen: +(round.placements / round.rounds + 2).toFixed(1),
      avgHandRemaining: +(round.avgHandRemaining / round.rounds).toFixed(2),
      avgNonWinnerHandRemaining: +(round.avgNonWinnerHandRemaining / round.rounds).toFixed(2),
      avgMinHandRemaining: +(round.minHandRemaining / round.rounds).toFixed(2),
      avgMaxHandRemaining: +(round.maxHandRemaining / round.rounds).toFixed(2),
      avgDeckRemaining: +(round.deckRemaining / round.rounds).toFixed(1),
    })),
    avgTokenMovesRound: +(totals.tokenMoves / r).toFixed(1),
    tokenAccuracyPct: tokenAttempts ? +(totals.tokenCorrect / tokenAttempts * 100).toFixed(1) : 0,
    avgTokenScoreRound: +(totals.tokenScore / r).toFixed(2),
    tieMatchPct: +(totals.ties / matches * 100).toFixed(1),
    avgWinnerMargin: +(totals.winnerMargin / matches).toFixed(2),
  };
}

function parseMatchesArg(argv) {
  const raw = argv.find((arg) => /^\d+$/.test(arg) || arg.startsWith("--matches="));
  const value = raw && raw.startsWith("--matches=") ? raw.split("=")[1] : raw;
  const matches = Number(value || 3000);
  if (!Number.isFinite(matches) || matches <= 0) {
    throw new Error("Usage: node simulate-variants.js [matches] or --matches=3000");
  }
  return Math.floor(matches);
}

function main() {
  const matches = parseMatchesArg(process.argv.slice(2));
  const summary = [];
  for (const wordSet of ["v1", "v2", "v3"]) {
    summary.push({ wordSet, structural: structuralStats(SETS[wordSet]) });
    for (const teamCount of [2, 3]) {
      for (const tokensPerSide of [1]) {
        summary.push(simulateVariant(wordSet, tokensPerSide, teamCount, matches, 20260710 + matches + tokensPerSide + teamCount * 10 + (wordSet === "v2" ? 100 : wordSet === "v3" ? 200 : 0)));
      }
    }
  }
  console.log(JSON.stringify(summary, null, 2));
}

main();
