export function normalize(text) {
  if (!text) return { original: "", normalized: "" };

  const original = text;
  let normalized = text.normalize("NFC");
  normalized = normalized.trim();
  normalized = normalized.replace(/\s+/g, " ");
  normalized = normalized.replace(
    /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,
    "",
  );
  normalized = normalized.replace(/[A-Za-z]+/g, (match) =>
    match.toLowerCase(),
  );

  return { original, normalized };
}

export function tokenize(text) {
  return text.split(/\s+/).filter(Boolean);
}
