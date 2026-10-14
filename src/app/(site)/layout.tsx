import type { Metadata } from "next";
import SiteHeader from "@/components/frontend/site-header";
import SiteFooter from "@/components/frontend/site-footer";

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

// Same stylesheets, in the same order, as the Blade `<head>`.
const STYLESHEETS = [
  "/assets/frontend/css/bootstrap.min.css",
  "/assets/frontend/css/meanmenu.css",
  "/assets/frontend/css/all.min.css",
  "/assets/frontend/css/swiper-bundle.min.css",
  "/assets/frontend/css/magnific-popup.css",
  "/assets/frontend/css/animate.css",
  "/assets/frontend/css/nice-select.css",
  "/assets/frontend/css/style.css",
  "/assets/frontend/css/font-awesome.css",
];

// jQuery must stay first so the plugins below find it.
const SCRIPTS = [
  "/assets/frontend/js/jquery-3.7.1.min.js",
  "/assets/frontend/js/bootstrap.min.js",
  "/assets/frontend/js/meanmenu.js",
  "/assets/frontend/js/swiper-bundle.min.js",
  "/assets/frontend/js/jquery.counterup.min.js",
  "/assets/frontend/js/wow.min.js",
  "/assets/frontend/js/magnific-popup.min.js",
  "/assets/frontend/js/nice-select.min.js",
  "/assets/frontend/js/isotope.pkgd.min.html",
  "/assets/frontend/js/jquery.waypoints.js",
  "/assets/frontend/js/script.js",
];

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {STYLESHEETS.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}

      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />

      {SCRIPTS.map((src) => (
        <script key={src} src={src} />
      ))}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css"
      />
      <script src="https://cdn.jsdelivr.net/npm/toastify-js" />
    </>
  );
}
