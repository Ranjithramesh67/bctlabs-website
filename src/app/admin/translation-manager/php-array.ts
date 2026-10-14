/**
 * Minimal, dependency-free reader/writer for the `<?php return [ ... ];` files
 * that live under `lang/{locale}/`. It exists so the Translation Manager can
 * render an editable form from a PHP language file and write the submitted
 * values back in the same `var_export` style Laravel used, without ever
 * evaluating PHP (no `eval`, no `require`).
 */

export type PhpValue = string | number | boolean | null | PhpArray;

export interface PhpArray {
  [key: string]: PhpValue;
}

function isPhpArray(value: PhpValue): value is PhpArray {
  return typeof value === "object" && value !== null;
}

/** Parse the array returned by a `lang/**.php` file. */
export function parsePhpArray(source: string): PhpArray {
  return new Parser(source).parse();
}

/**
 * Escape a string the way PHP's `var_export` does for single-quoted output:
 * backslashes and single quotes are the only characters that need escaping.
 */
function exportString(value: string): string {
  return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

function exportKey(key: string): string {
  // var_export emits integer keys unquoted; everything else as a string.
  return /^\d+$/.test(key) && String(Number(key)) === key
    ? key
    : exportString(key);
}

function exportValue(value: PhpValue, depth: number): string {
  if (typeof value === "string") {
    return exportString(value);
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "0";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (value === null) {
    return "NULL";
  }

  const entries = Object.entries(value);
  if (entries.length === 0) {
    return "array (\n)";
  }

  const pad = "  ".repeat(depth + 1);
  const closePad = "  ".repeat(depth);
  const body = entries
    .map(
      ([key, entryValue]) =>
        `${pad}${exportKey(key)} => ${exportValue(entryValue, depth + 1)},`,
    )
    .join("\n");

  return `array (\n${body}\n${closePad})`;
}

/** Serialize a nested object into PHP `var_export`-compatible source. */
export function exportPhpArray(value: PhpArray): string {
  return exportValue(value, 0);
}

class Parser {
  private pos = 0;
  private readonly src: string;

  constructor(src: string) {
    this.src = src;
  }

  parse(): PhpArray {
    this.skipTrivia();
    if (this.src.startsWith("<?php", this.pos)) {
      this.pos += 5;
    } else if (this.src.startsWith("<?", this.pos)) {
      this.pos += 2;
    }
    this.skipTrivia();
    if (!this.matchWord("return")) {
      throw new Error("PHP language file does not start with `return`.");
    }
    this.skipTrivia();
    const value = this.parseValue();
    this.skipTrivia();
    if (this.src[this.pos] === ";") {
      this.pos += 1;
    }
    this.skipTrivia();
    if (this.src.startsWith("?>", this.pos)) {
      this.pos += 2;
    }
    if (!isPhpArray(value)) {
      throw new Error("PHP language file must return an array.");
    }
    return value;
  }

  private parseValue(): PhpValue {
    this.skipTrivia();
    const ch = this.src[this.pos];

    if (ch === "[") {
      this.pos += 1;
      return this.parseArrayBody("]");
    }
    if (this.matchWord("array")) {
      this.skipTrivia();
      this.expect("(");
      return this.parseArrayBody(")");
    }
    if (ch === "'" || ch === '"') {
      return this.parseString(ch);
    }
    if (ch === "-" || (ch >= "0" && ch <= "9")) {
      return this.parseNumber();
    }
    if (this.matchWord("true")) {
      return true;
    }
    if (this.matchWord("false")) {
      return false;
    }
    if (this.matchWord("null")) {
      return null;
    }

    throw new Error(`Unexpected token in PHP array at offset ${this.pos}.`);
  }

  private parseArrayBody(close: string): PhpArray {
    const result: PhpArray = {};
    let autoIndex = 0;

    this.skipTrivia();
    if (this.src[this.pos] === close) {
      this.pos += 1;
      return result;
    }

    for (;;) {
      this.skipTrivia();
      const first = this.parseValue();
      this.skipTrivia();

      if (this.src.startsWith("=>", this.pos)) {
        this.pos += 2;
        const entryValue = this.parseValue();
        result[String(first)] = entryValue;
      } else {
        result[String(autoIndex)] = first;
        autoIndex += 1;
      }

      this.skipTrivia();
      const ch = this.src[this.pos];
      if (ch === ",") {
        this.pos += 1;
        this.skipTrivia();
        if (this.src[this.pos] === close) {
          this.pos += 1;
          break;
        }
        continue;
      }
      if (ch === close) {
        this.pos += 1;
        break;
      }
      if (ch === undefined) {
        throw new Error("Unexpected end of PHP array.");
      }
      throw new Error(
        `Expected "," or "${close}" in PHP array at offset ${this.pos}.`,
      );
    }

    return result;
  }

  private parseString(quote: string): string {
    this.pos += 1; // opening quote
    let out = "";

    while (this.pos < this.src.length) {
      const ch = this.src[this.pos];
      if (ch === "\\") {
        const next = this.src[this.pos + 1];
        if (next === undefined) {
          out += "\\";
          this.pos += 1;
          continue;
        }
        if (quote === "'") {
          // Single-quoted strings only escape `\\` and `\'`.
          if (next === "'" || next === "\\") {
            out += next;
            this.pos += 2;
          } else {
            out += "\\";
            this.pos += 1;
          }
          continue;
        }
        switch (next) {
          case "n":
            out += "\n";
            break;
          case "r":
            out += "\r";
            break;
          case "t":
            out += "\t";
            break;
          case "v":
            out += "\v";
            break;
          case "f":
            out += "\f";
            break;
          case "e":
            out += "\u001b";
            break;
          case '"':
            out += '"';
            break;
          case "\\":
            out += "\\";
            break;
          case "$":
            out += "$";
            break;
          default:
            out += "\\";
            this.pos += 1;
            continue;
        }
        this.pos += 2;
        continue;
      }
      if (ch === quote) {
        this.pos += 1;
        return out;
      }
      out += ch;
      this.pos += 1;
    }

    throw new Error("Unterminated string in PHP language file.");
  }

  private parseNumber(): number {
    const match = /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(
      this.src.slice(this.pos),
    );
    if (!match) {
      throw new Error(`Invalid number in PHP language file at ${this.pos}.`);
    }
    this.pos += match[0].length;
    return Number(match[0]);
  }

  private matchWord(word: string): boolean {
    if (!this.src.startsWith(word, this.pos)) {
      return false;
    }
    const after = this.src[this.pos + word.length];
    if (after !== undefined && /[A-Za-z0-9_]/.test(after)) {
      return false;
    }
    this.pos += word.length;
    return true;
  }

  private expect(char: string): void {
    if (this.src[this.pos] !== char) {
      throw new Error(
        `Expected "${char}" in PHP language file at offset ${this.pos}.`,
      );
    }
    this.pos += 1;
  }

  private skipTrivia(): void {
    const length = this.src.length;
    for (;;) {
      const ch = this.src[this.pos];
      if (
        ch === " " ||
        ch === "\t" ||
        ch === "\n" ||
        ch === "\r" ||
        ch === "\f" ||
        ch === "\v"
      ) {
        this.pos += 1;
        continue;
      }
      if (ch === "/" && this.src[this.pos + 1] === "/") {
        while (this.pos < length && this.src[this.pos] !== "\n") {
          this.pos += 1;
        }
        continue;
      }
      if (ch === "#") {
        while (this.pos < length && this.src[this.pos] !== "\n") {
          this.pos += 1;
        }
        continue;
      }
      if (ch === "/" && this.src[this.pos + 1] === "*") {
        const end = this.src.indexOf("*/", this.pos + 2);
        this.pos = end === -1 ? length : end + 2;
        continue;
      }
      break;
    }
  }
}
