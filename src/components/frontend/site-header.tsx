"use client";

import { SiteImage } from "@/components/frontend/site-image";
import { usePathname } from "next/navigation";
import { SITE_NAV, SHOP_URL, asset, isActive } from "@/lib/site";

/**
 * Port of `resources/views/frontend/layouts/header.blade.php`.
 *
 * The Blade template emitted the whole document (`<!DOCTYPE>` … `<main>`); the
 * root layout already owns `<html>`/`<body>`, so this component only reproduces
 * the header markup plus the off-canvas `#targetElement` sidebar. The layout
 * wraps `{children}` in `<main>`.
 */
export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <>
      {/* Header area start here */}
      <header className="header-area">
        <div className="container-fluid">
          <div className="header__main">
            <a href="/" className="logo">
              <SiteImage targetWidth={828}
                src={asset("assets/frontend/images/logo/logo.png")}
                alt="logo"
              />
            </a>
            <div className="main-menu">
              <nav>
                <ul>
                  {SITE_NAV.map((item) => (
                    <li key={item.label}>
                      <a
                        className={isActive(pathname, item) ? "active" : ""}
                        href={item.href}
                      >
                        {item.label}
                      </a>
                      {item.children ? (
                        <ul className="sub-menu">
                          {item.children.map((child) => (
                            <li key={child.label}>
                              <a
                                className={
                                  isActive(pathname, child) ? "active" : ""
                                }
                                href={child.href}
                              >
                                {child.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="d-flex gap-3">
              <div className="btn-one d-none d-lg-inline-block">
                <a href={SHOP_URL} target="_blank" className="btn-inner">
                  <span className="btn-text">
                    <i className="fa fa-shopping-cart"></i> Shop
                  </span>
                </a>
              </div>
              <div className="btn-two d-none d-lg-inline-block">
                <a href="/contact_us" className="btn-inner">
                  <span className="btn-text">Contact Us</span>
                </a>
              </div>
            </div>

            <div className="bars d-block d-lg-none">
              <i id="openButton" className="fa-solid fa-bars"></i>
            </div>
          </div>
        </div>
      </header>
      {/* Header area end here */}

      {/* Sidebar area start here */}
      <div id="targetElement" className="sidebar-area sidebar__hide">
        <div className="sidebar__overlay"></div>
        <a href="/" className="logo mb-40">
          <SiteImage targetWidth={828}
            src={asset("assets/frontend/images/logo/light_logo.png")}
            alt="logo"
          />
        </a>
        <div className="mobile-menu overflow-hidden"></div>

        <ul className="info pt-20">
          <li>
            <div className="d-flex gap-2 pb-3">
              <div className="btn-two d-lg-inline-block">
                <span className="btn-circle"></span>
                <a
                  href={SHOP_URL}
                  target="_blank"
                  className="btn-inner shop_btn"
                >
                  <span className="btn-text">
                    <i className="fa fa-shopping-cart"></i> Shop
                  </span>
                </a>
              </div>
              <div className="btn-two d-lg-inline-block">
                <span className="btn-circle"></span>
                <a href="/contact_us" className="btn-inner">
                  <span className="btn-text">Contact Us</span>
                </a>
              </div>
            </div>
          </li>
        </ul>
        <div className="social-icon mt-20">
          <a href="#0">
            <i className="fa-brands fa-facebook-f"></i>
          </a>
          <a href="#0">
            <i className="fa-brands fa-twitter"></i>
          </a>
          <a href="#0">
            <i className="fa-brands fa-linkedin-in"></i>
          </a>
          <a href="#0">
            <i className="fa-brands fa-pinterest-p"></i>
          </a>
        </div>
        <button id="closeButton" className="text-white">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
      {/* Sidebar area end here */}
    </>
  );
}
