import { readFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESOURCES_DIR = join(__dirname, "../../language-resources");

let cachedResources = null;

export function loadLanguageResources() {
  if (cachedResources) return cachedResources;

  const files = readdirSync(RESOURCES_DIR).filter((f) => f.endsWith(".json"));
  cachedResources = {};

  for (const file of files) {
    const content = readFileSync(join(RESOURCES_DIR, file), "utf-8");
    const resource = JSON.parse(content);
    cachedResources[resource.code] = resource;
  }

  return cachedResources;
}

export function getResourceByCode(code) {
  return loadLanguageResources()[code];
}
