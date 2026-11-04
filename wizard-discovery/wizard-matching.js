/* Pure scoring helpers for Wizard Discovery V1.
 * This is a creative character recommendation, not a validated psychological test.
 */
(function (root) {
  "use strict";
  const W = [3, 2, 1];
  const ANGLES = ["explorer","listener","experimenter","connector","communicator","creator","decider","summarizer","reflector"];
  const safeScore = (n) => Number.isFinite(Number(n)) ? Math.max(0, Number(n)) : 0;
  function matchWizards(scores, archetypes) {
    const values = Object.fromEntries(ANGLES.map(id => [id, safeScore(scores?.[id])]));
    return archetypes.map(type => {
      const components = type.sig.map((id, i) => ({ id, weight: W[i], score: values[id], contribution: W[i] * values[id] }));
      return {
        ...type,
        components,
        matchScore: components.reduce((s, c) => s + c.contribution, 0),
        primaryScore: values[type.sig[0]],
        secondaryScore: values[type.sig[1]]
      };
    }).sort((a,b) => b.matchScore - a.matchScore || b.primaryScore - a.primaryScore ||
      b.secondaryScore - a.secondaryScore || a.name.localeCompare(b.name, "en"));
  }
  function validateSignatures(archetypes) {
    const errors = [];
    if (archetypes.length !== 27) errors.push("Expected 27 archetypes");
    const ids = new Set();
    const signatures = new Set();
    archetypes.forEach(type => {
      if (ids.has(type.id)) errors.push("Duplicate id: "+type.id);
      ids.add(type.id);
      if (!["A","B","C","D","E"].includes(type.family)) errors.push("Invalid family: "+type.id);
      if (!Array.isArray(type.sig) || type.sig.length !== 3 ||
          new Set(type.sig).size !== 3 || type.sig.some(id => !ANGLES.includes(id))) errors.push("Invalid signature: "+type.id);
      const sig = type.sig.join("|");
      if (signatures.has(sig)) errors.push("Duplicate signature: "+sig);
      signatures.add(sig);
    });
    return errors;
  }
  function hasCloseMatch(ranked) {
    return ranked.length > 1 && ranked[0].matchScore - ranked[1].matchScore <= 2;
  }
  root.WizardMatching = { matchWizards, validateSignatures, hasCloseMatch, angleIds: ANGLES };
})(typeof window === "undefined" ? globalThis : window);
