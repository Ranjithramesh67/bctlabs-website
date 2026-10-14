import { getAppLogo, getAppName } from "@/lib/admin/settings";
import { AppLogo } from "@/components/app-logo";

/**
 * Faithful port of `resources/views/layouts/auth.blade.php`: the Bootstrap
 * card chrome shared by every auth screen (login, register, password reset).
 *
 * The original layout is a full HTML document, but Next owns `<html>`/`<body>`
 * via the root layout, so this component only renders the stylesheets (React
 * hoists them into the head) and the `#app > section > .container > .row`
 * markup, mirroring `src/app/admin/layout.tsx`.
 */
export default async function AuthShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [logo, appName] = await Promise.all([getAppLogo(), getAppName()]);
  const year = new Date().getFullYear();

  return (
    <div id="app">
      <link
        rel="stylesheet"
        href="/assets/css/bootstrap.min.css"
        precedence="high"
      />
      <link
        rel="stylesheet"
        href="/assets/css/@fortawesome/fontawesome-free/css/all.css"
      />
      <link rel="stylesheet" href="/assets/web/css/style.css" precedence="high" />
      <link rel="stylesheet" href="/assets/web/css/components.css" />

      <section className="section">
        <div className="container mt-5">
          <div className="row">
            <div className="col-md-6 offset-md-3">
              <div className="login-brand">
                <AppLogo src={logo} width={100} className="shadow-light" />
              </div>
              {children}
              <div className="simple-footer">
                All rights reserved &copy; {year} {appName}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
