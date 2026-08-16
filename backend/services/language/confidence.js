import { thresholds, LANGUAGE_NAMES } from "./config.js";

export function getConfidenceLevel(confidence) {
  if (confidence >= thresholds.high) return "HIGH";
  if (confidence >= thresholds.medium) return "MEDIUM";
  if (confidence >= thresholds.low) return "LOW";
  return "UNKNOWN";
}

export function resolveClassification(topLanguages) {
  if (topLanguages.length === 0) {
    return {
      language: "und",
      languageName: LANGUAGE_NAMES.und,
      confidence: 0,
      confidenceLevel: "UNKNOWN",
    };
  }

  const top = topLanguages[0];
  const second = topLanguages[1];
  const margin = second ? top.total - second.total : top.total;

  if (
    top.total < thresholds.minConfidence ||
    margin < thresholds.minMargin
  ) {
    return {
      language: "und",
      languageName: LANGUAGE_NAMES.und,
      confidence: Number(top.total.toFixed(2)),
      confidenceLevel: "UNKNOWN",
    };
  }

  const confidence = Number(Math.min(top.total, 1).toFixed(2));

  return {
    language: top.lang,
    languageName: LANGUAGE_NAMES[top.lang],
    confidence,
    confidenceLevel: getConfidenceLevel(confidence),
  };
}
