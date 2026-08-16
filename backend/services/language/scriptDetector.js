const SCRIPT_RANGES = [
  { script: "Tamil", start: 0x0b80, end: 0x0bff },
  { script: "Devanagari", start: 0x0900, end: 0x097f },
  { script: "Telugu", start: 0x0c00, end: 0x0c7f },
  { script: "Kannada", start: 0x0c80, end: 0x0cff },
  { script: "Malayalam", start: 0x0d00, end: 0x0d7f },
  { script: "Bengali", start: 0x0980, end: 0x09ff },
  { script: "Gujarati", start: 0x0a80, end: 0x0aff },
  { script: "Gurmukhi", start: 0x0a00, end: 0x0a7f },
  { script: "Arabic", start: 0x0600, end: 0x06ff },
];

const SCRIPT_TO_LANGS = {
  Tamil: ["ta"],
  Devanagari: ["hi", "mr"],
  Telugu: ["te"],
  Kannada: ["kn"],
  Malayalam: ["ml"],
  Bengali: ["bn"],
  Gujarati: ["gu"],
  Gurmukhi: ["pa"],
  Arabic: ["ur"],
  Latin: ["en"],
};

function getScriptForChar(char) {
  const code = char.codePointAt(0);
  if (/[A-Za-z]/.test(char)) return "Latin";

  for (const range of SCRIPT_RANGES) {
    if (code >= range.start && code <= range.end) {
      return range.script;
    }
  }

  return null;
}

export function detectScripts(text) {
  const counts = {};
  let total = 0;

  for (const char of text) {
    if (!/\p{L}/u.test(char)) continue;

    const script = getScriptForChar(char);
    if (!script) continue;

    counts[script] = (counts[script] || 0) + 1;
    total += 1;
  }

  const proportions = {};
  for (const [script, count] of Object.entries(counts)) {
    proportions[script] = count / total;
  }

  return { proportions, total };
}

export function computeScriptScores(proportions) {
  const scores = {};

  for (const [script, proportion] of Object.entries(proportions)) {
    const langs = SCRIPT_TO_LANGS[script] || [];

    if (script === "Latin") {
      scores.en = Math.max(scores.en || 0, proportion * 0.15);
      continue;
    }

    if (langs.length === 1) {
      scores[langs[0]] = Math.max(scores[langs[0]] || 0, proportion);
      continue;
    }

    for (const lang of langs) {
      scores[lang] = Math.max(scores[lang] || 0, proportion * 0.6);
    }
  }

  return scores;
}
