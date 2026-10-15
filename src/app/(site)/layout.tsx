import type { Metadata } from "next";
import SiteHeader from "@/components/frontend/site-header";
import SiteFooter from "@/components/frontend/site-footer";
import LegacyScripts from "@/components/frontend/legacy-scripts";
import {
  LEGACY_SCRIPTS,
  SITE_INLINE_SCRIPTS,
  TOASTIFY_STYLESHEET,
} from "@/lib/legacy-site-scripts";

/**
 * Layout for the public marketing site.
 *
 * The legacy Blade split the document across `header.blade.php` (which opened
 * `<!DOCTYPE>` … `<main>`) and `footer.blade.php` (which closed `</main>` and
 * carried the scripts). The root layout owns `<html>`/`<body>`, so this layout
 * reproduces only the body content: header, `<main>`, footer and the scripts.
 */
export const metadata: Metadata = {
  title: "BCTLABS STEM Academy",
  icons: {
    icon: "/assets/frontend/images/logo/logo.png",
  },
};

// Bumped whenever `style.css` changes. The preview/CDN caches `/assets/**` for
// hours, so without a new URL a returning visitor keeps the previous theme CSS.
const THEME_CSS_VERSION = "20261015b";

// Same stylesheets, in the same order, as the Blade `<head>`.
const STYLESHEETS = [
  "/assets/frontend/css/bootstrap.min.css",
  "/assets/frontend/css/meanmenu.css",
  "/assets/frontend/css/all.min.css",
  "/assets/frontend/css/swiper-bundle.min.css",
  "/assets/frontend/css/magnific-popup.css",
  "/assets/frontend/css/animate.css",
  "/assets/frontend/css/nice-select.css",
  `/assets/frontend/css/style.css?v=${THEME_CSS_VERSION}`,
  "/assets/frontend/css/font-awesome.css",
];

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {STYLESHEETS.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <link rel="stylesheet" href={TOASTIFY_STYLESHEET} />

      {/*
        Critical rule, inlined on purpose. `style.css` also carries this, but it
        is a separate (cacheable) request, so a device holding a cached copy
        painted the desktop nav for a few seconds on phones until meanmenu ran.
        The HTML is never cached, so the first paint is always correct.
      */}
      <style>{`
        @media (max-width: 991px) {
          .header-area .main-menu { display: none; }
        }
      `}</style>

      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />

      <LegacyScripts
        src={LEGACY_SCRIPTS}
        inline={SITE_INLINE_SCRIPTS}
        replayContentLoaded
      />
    </>
  );
}
