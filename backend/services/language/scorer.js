import { weights, SUPPORTED_LANGUAGES } from "./config.js";

export function computeScores(scriptScores, analysisByLang) {
  const scores = {};

  for (const lang of SUPPORTED_LANGUAGES) {
    const script = scriptScores[lang] || 0;
    const analysis = analysisByLang[lang] || {
      lexical: 0,
      transliteration: 0,
      pattern: 0,
    };

    scores[lang] = {
      total:
        weights.script * script +
        weights.lexical * analysis.lexical +
        weights.transliteration * analysis.transliteration +
        weights.pattern * analysis.pattern,
      signals: {
        script,
        lexical: analysis.lexical,
        transliteration: analysis.transliteration,
        pattern: analysis.pattern,
      },
    };
  }

  return scores;
}

export function getTopLanguages(scores) {
  return Object.entries(scores)
    .map(([lang, data]) => ({ lang, ...data }))
    .sort((a, b) => b.total - a.total);
}
