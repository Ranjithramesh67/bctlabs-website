import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The public site is a faithful port of the Laravel Blade templates and
      // intentionally keeps plain <a>/<img> markup and the original inline
      // jQuery includes instead of next/link, next/image and next/script.
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "off",
      "@next/next/no-sync-scripts": "off",
      // The admin panel loads the original Laravel/Stisla stylesheets directly.
      "@next/next/no-css-tags": "off",
      "@next/next/no-page-custom-font": "off",
      "@next/next/google-font-display": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored legacy Laravel/Stisla assets copied verbatim from the original
    // site; they are third-party bundles, not source we author or lint.
    "public/**",
  ]),
]);

export default eslintConfig;
