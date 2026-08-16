import { tokenize } from "./normalizer.js";

function countMatches(items, text, tokens) {
  let matches = 0;
  for (const item of items) {
    const term = item.toLowerCase();
    if (term.includes(" ")) {
      if (text.includes(term)) matches += 1;
    } else if (tokens.includes(term)) {
      matches += 1;
    }
  }
  return matches;
}

function countNgramMatches(ngrams, text) {
  let matches = 0;
  for (const ngram of ngrams) {
    if (text.includes(ngram.toLowerCase())) matches += 1;
  }
  return matches;
}

function countPatternMatches(patterns, text) {
  let matches = 0;
  for (const pattern of patterns) {
    try {
      if (new RegExp(pattern, "iu").test(text)) matches += 1;
    } catch {
      // skip invalid patterns
    }
  }
  return matches;
}

function normalizeScore(matches, total, cap = 1) {
  if (total === 0) return 0;
  return Math.min(matches / total, cap);
}

export function analyzeLexical(resource, text, tokens) {
  const total = resource.commonWords?.length || 0;
  if (total === 0) return 0;
  const matches = countMatches(resource.commonWords, text, tokens);
  return normalizeScore(matches, Math.min(total, 5));
}

export function analyzeTransliteration(resource, text, tokens) {
  const words = resource.transliteratedWords || [];
  const wordNgrams = resource.wordNgrams || [];
  const charNgrams = resource.charNgrams || [];

  const wordMatches = countMatches(words, text, tokens);
  const phraseMatches = countNgramMatches(wordNgrams, text);
  const charMatches = countNgramMatches(charNgrams, text);

  const wordScore = normalizeScore(wordMatches, Math.min(words.length, 4));
  const phraseScore = normalizeScore(
    phraseMatches,
    Math.min(wordNgrams.length, 3),
  );
  const charScore = normalizeScore(
    charMatches,
    Math.min(charNgrams.length, 6),
  );

  return Math.max(wordScore, phraseScore, charScore * 0.8);
}

export function analyzePatterns(resource, text) {
  const patterns = resource.patterns || [];
  if (patterns.length === 0) return 0;
  const matches = countPatternMatches(patterns, text);
  return normalizeScore(matches, Math.min(patterns.length, 3));
}

export function analyzeLanguage(resource, text, tokens) {
  return {
    lexical: analyzeLexical(resource, text, tokens),
    transliteration: analyzeTransliteration(resource, text, tokens),
    pattern: analyzePatterns(resource, text),
  };
}
