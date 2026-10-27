// Route-target consistency (M2.7a): every literal or Routes.* constant passed
// to navigate()/replace()/push() — including nested `screen:` params — must
// resolve to a name registered in a navigator. Static scan; catches the whole
// dead-target bug class without a device.
import fs from "fs";
import path from "path";
import Routes from "../navigation/routes";

const ROOT = path.join(__dirname, "..");

const walk = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.jsx?$/.test(entry.name)) out.push(full);
  }
  return out;
};

const SOURCES = [
  path.join(ROOT, "App.js"),
  ...walk(path.join(ROOT, "screens")),
  ...walk(path.join(ROOT, "components")),
  ...walk(path.join(ROOT, "navigation")),
];

const stripComments = (text) =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((line) => (line.trimStart().startsWith("//") ? "" : line))
    .join("\n");

const read = (file) => stripComments(fs.readFileSync(file, "utf8"));

// Registered names: `name: Routes.X` entries in the App.js screens table plus
// `name="…"` / `name={Routes.X}` JSX attributes on Screen elements in every
// navigator file.
const registered = new Set();
const addConstant = (key, file) => {
  const value = Routes[key];
  if (value === undefined) {
    throw new Error(`${path.relative(ROOT, file)}: Routes.${key} is not declared in navigation/routes.js`);
  }
  registered.add(value);
};

const registerFrom = (file) => {
  const text = read(file);
  for (const m of text.matchAll(/name:\s*Routes\.(\w+)/g)) addConstant(m[1], file);
  for (const m of text.matchAll(/name:\s*"([^"]+)"/g)) registered.add(m[1]);
  for (const m of text.matchAll(/Screen[^>]*?name="([^"]+)"/gs)) registered.add(m[1]);
  for (const m of text.matchAll(/Screen[^>]*?name=\{\s*Routes\.(\w+)\s*\}/gs)) addConstant(m[1], file);
};

registerFrom(path.join(ROOT, "App.js"));
for (const file of fs.readdirSync(path.join(ROOT, "navigation"))) {
  const full = path.join(ROOT, "navigation", file);
  if (fs.statSync(full).isFile() && /\.jsx?$/.test(file)) registerFrom(full);
}

const targets = [];
for (const file of SOURCES) {
  const text = read(file);
  const rel = path.relative(ROOT, file);
  for (const m of text.matchAll(/\bnavigation\.(navigate|replace|push|popTo|jumpTo)\(\s*"([^"]+)"/g)) {
    targets.push({ file: rel, target: m[2], via: `literal (${m[1]})` });
  }
  for (const m of text.matchAll(/\bnavigation\.(navigate|replace|push|popTo|jumpTo)\(\s*Routes\.(\w+)/g)) {
    targets.push({ file: rel, target: Routes[m[2]], via: `Routes.${m[2]} (${m[1]})` });
  }
  for (const m of text.matchAll(/\bscreen:\s*"([^"]+)"/g)) {
    targets.push({ file: rel, target: m[1], via: "nested screen literal" });
  }
  for (const m of text.matchAll(/\bscreen:\s*Routes\.(\w+)/g)) {
    targets.push({ file: rel, target: Routes[m[1]], via: `nested Routes.${m[1]}` });
  }
  for (const m of text.matchAll(/\binitialRouteName="([^"]+)"/g)) {
    targets.push({ file: rel, target: m[1], via: "initialRouteName literal" });
  }
  for (const m of text.matchAll(/\binitialRouteName=\{\s*Routes\.(\w+)\s*\}/g)) {
    targets.push({ file: rel, target: Routes[m[1]], via: `initialRouteName Routes.${m[1]}` });
  }
}

test("route registrations were collected", () => {
  expect(registered.size).toBeGreaterThan(50);
});

test("every literal navigate target is a registered route", () => {
  const missing = targets.filter(({ target }) => target !== undefined && !registered.has(target));
  expect(missing.map((m) => `${m.file}: "${m.target}" via ${m.via}`)).toEqual([]);
});

test("every Routes.* navigate target is declared", () => {
  const missing = targets.filter(({ target }) => target === undefined);
  expect(missing.map((m) => `${m.file}: ${m.via}`)).toEqual([]);
});
