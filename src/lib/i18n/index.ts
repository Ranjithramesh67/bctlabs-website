import en from "./messages.en.json";

type Messages = { [key: string]: string | Messages };

/**
 * English message catalogue extracted from Laravel's `lang/en/messages.php`.
 * Keys mirror the Blade usage, e.g. `__('messages.common.save')` becomes
 * `t("common.save")`.
 */
export const messages = en as Messages;

function lookup(key: string): string | undefined {
  const parts = key.split(".");
  let node: string | Messages | undefined = messages;
  for (const part of parts) {
    if (node === undefined || typeof node === "string") {
      return undefined;
    }
    node = node[part];
  }
  return typeof node === "string" ? node : undefined;
}

/**
 * Laravel `__()` equivalent. Supports `:placeholder` replacement, e.g.
 * `t("common.showing")` and `t("customer.welcome", { name: "Sam" })`.
 */
export function t(
  key: string,
  replacements?: Record<string, string | number>,
): string {
  let value = lookup(key) ?? key;
  if (replacements) {
    for (const [name, replacement] of Object.entries(replacements)) {
      value = value.split(`:${name}`).join(String(replacement));
    }
  }
  return value;
}

export type Translator = typeof t;
