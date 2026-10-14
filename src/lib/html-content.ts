/**
 * Port of `FrontendController::applyCustomStylesToContent`.
 *
 * The original loads the HTML into a DOMDocument and, for every matching tag,
 * appends animation classes (and inline styles for `<strong>`). We operate on
 * the opening tags only, which is exactly the set of nodes the original
 * mutates, so the output stays equivalent without an HTML parser dependency.
 */
export function applyCustomStylesToContent(html: string): string {
  const withParagraphs = decorateTag(html, "p", (attributes) =>
    appendClass(attributes, "wow fadeInUp text-black"),
  );

  const withHeadings = decorateTag(withParagraphs, "h3", (attributes) =>
    appendClass(attributes, "wow fadeInUp mt-20 mb-10"),
  );

  return decorateTag(
    withHeadings,
    "strong",
    // The original only sets an inline style on <strong>, never wow attributes.
    (attributes) =>
      appendStyle(attributes, "font-size:24px; font-weight:900;  color:#5e0075;"),
    { addWowAttributes: false },
  );
}

type Attributes = string;

type Decorator = (attributes: Attributes) => Attributes;

function decorateTag(
  html: string,
  tag: string,
  decorate: Decorator,
  options: { addWowAttributes?: boolean } = {},
): string {
  const addWowAttributes = options.addWowAttributes ?? true;
  const pattern = new RegExp(`<${tag}(\\s[^>]*)?>`, "gi");

  return html.replace(pattern, (match, rawAttributes: string | undefined) => {
    const attributes = rawAttributes ?? "";
    let next = decorate(attributes);

    if (addWowAttributes) {
      next = appendAttribute(next, "data-wow-delay", "300ms");
      next = appendAttribute(next, "data-wow-duration", "1500ms");
    }

    return `<${tag}${next}>`;
  });
}

function hasAttribute(attributes: Attributes, name: string): boolean {
  return new RegExp(`\\s${name}\\s*=`, "i").test(attributes);
}

function getAttribute(attributes: Attributes, name: string): string | null {
  const match = new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, "i").exec(attributes);
  return match ? match[1] : null;
}

function setAttribute(
  attributes: Attributes,
  name: string,
  value: string,
): Attributes {
  if (hasAttribute(attributes, name)) {
    return attributes.replace(
      new RegExp(`(\\s${name}\\s*=\\s*)"[^"]*"`, "i"),
      `$1"${value}"`,
    );
  }
  return `${attributes} ${name}="${value}"`;
}

function appendAttribute(
  attributes: Attributes,
  name: string,
  value: string,
): Attributes {
  return hasAttribute(attributes, name)
    ? attributes
    : `${attributes} ${name}="${value}"`;
}

function appendClass(attributes: Attributes, className: string): Attributes {
  const existing = getAttribute(attributes, "class");
  if (existing === null) {
    return setAttribute(attributes, "class", className);
  }
  if (existing.includes(className)) {
    return attributes;
  }
  return setAttribute(attributes, "class", `${existing} ${className}`.trim());
}

function appendStyle(attributes: Attributes, style: string): Attributes {
  const existing = getAttribute(attributes, "style") ?? "";
  return setAttribute(attributes, "style", `${existing} ${style}`.trim());
}
