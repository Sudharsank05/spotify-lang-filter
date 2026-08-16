import { normalize, tokenize } from "./normalizer.js";
import {
  detectScripts,
  computeScriptScores,
} from "./scriptDetector.js";
import { analyzeLanguage } from "./analyzers.js";
import { computeScores, getTopLanguages } from "./scorer.js";
import { resolveClassification } from "./confidence.js";
import { loadLanguageResources } from "../../language-resources/loader.js";
import { SUPPORTED_LANGUAGES } from "./config.js";

export function classify(text) {
  const { normalized } = normalize(text);

  if (!normalized) {
    return {
      language: "und",
      languageName: "Unknown",
      confidence: 0,
      confidenceLevel: "UNKNOWN",
      signals: { script: 0, lexical: 0, transliteration: 0, pattern: 0 },
    };
  }

  const tokens = tokenize(normalized);
  const { proportions } = detectScripts(normalized);
  const scriptScores = computeScriptScores(proportions);
  const resources = loadLanguageResources();

  const analysisByLang = {};
  for (const lang of SUPPORTED_LANGUAGES) {
    const resource = resources[lang];
    if (resource) {
      analysisByLang[lang] = analyzeLanguage(resource, normalized, tokens);
    }
  }

  const scores = computeScores(scriptScores, analysisByLang);
  const topLanguages = getTopLanguages(scores);
  const result = resolveClassification(topLanguages);
  const topSignals = topLanguages[0]?.signals || {
    script: 0,
    lexical: 0,
    transliteration: 0,
    pattern: 0,
  };

  return {
    ...result,
    signals: {
      script: Number(topSignals.script.toFixed(2)),
      lexical: Number(topSignals.lexical.toFixed(2)),
      transliteration: Number(topSignals.transliteration.toFixed(2)),
      pattern: Number(topSignals.pattern.toFixed(2)),
    },
  };
}

export function classifyTrack(track) {
  const classification = classify(track.name);
  return {
    trackId: track.trackId,
    name: track.name,
    artists: track.artists,
    ...classification,
  };
}
