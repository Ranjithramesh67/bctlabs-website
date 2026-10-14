import { asset } from "@/lib/site";

export default function PrivacyAndPolicyPage() {
  return (
    <>
      <section
        className="banner__inner-page bg-image pt-50 pb-50 bg-image"
        data-background={asset("assets/frontend/images/banner/about_banner.png")}
      >
        <div className="overlay"></div> {/* Overlay added */}
        <div className="container banner">
          <div className="breadcrumb-list wow fadeInUp" data-wow-delay="200ms" data-wow-duration="1500ms">
            <h6 className="text-white normal">BCTLABS</h6>
          </div>
          <h2 className="wow fadeInUp" data-wow-delay="00ms" data-wow-duration="1500ms">
            PRIVACY <span>POLICY</span>
          </h2>
        </div>
      </section>

      <section className="about-area pt-30 pb-30">
        <div className="container">
          <div className="row g-2">
            <div className="col-lg-12 text-center">
              <div className="section-header mb-20">
                <h3
                  className="wow fadeInUp"
                  data-wow-delay="200ms"
                  data-wow-duration="1500ms"
                  style={{
                    visibility: "visible",
                    animationDuration: "1500ms",
                    animationDelay: "200ms",
                    animationName: "fadeInUp",
                  }}
                >
                  <small>Policies</small>
                </h3>
                <h2
                  className="wow fadeInUp"
                  data-wow-delay="00ms"
                  data-wow-duration="1500ms"
                  style={{
                    visibility: "visible",
                    animationDuration: "1500ms",
                    animationDelay: "0ms",
                    animationName: "fadeInUp",
                  }}
                >
                  Privacy Policy
                </h2>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="section-header mb-20">
                <p className="mt-2">
                  At <b>BCTLABS STEM Academy</b>, we value your trust and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, store, and protect the information you provide while interacting with our website or services.
                </p>

                <p className="mt-2">By visiting our website or using our services, you agree to the practices described below.</p>

                <section>
                  <h3 className="mt-3">1. Information We Collect</h3>

                  <p>
                    <strong>Personal Information:</strong> Name, email address, phone number, postal address, and other identifiable details submitted through forms, registrations, or contact pages.
                  </p>
                  <p>
                    <b>Non-Personal Information:</b> Browser type, device details, IP address, and browsing patterns used to enhance user experience.
                  </p>
                  <p>
                    <b>Cookies:</b> We use cookies and similar technologies to understand user behavior and improve website functionality.
                  </p>
                </section>

                <section>
                  <h3 className="mt-3">2. How We Use Your Information</h3>

                  <p>Respond to your inquiries or requests</p>
                  <p>Provide information about our courses, programs, or services</p>
                  <p>Improve website content and user experience</p>
                  <p>Send updates, newsletters, or promotional messages (only with your consent)</p>
                  <p>Ensure site security and prevent misuse</p>

                  <p className="mt-2">We do not sell, rent, or trade your personal data with third parties for marketing purposes.</p>
                </section>

                <section>
                  <h3 className="mt-3">3. Data Protection and Security</h3>
                  <p className="mt-2">
                    We implement industry-standard safeguards to protect your data from unauthorized access, misuse, or disclosure. However, please note that no method of online transmission or storage is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </section>

                <section>
                  <h3 className="mt-3">4. Sharing of Information</h3>
                  <p className="mt-2">
                    We may share limited information with trusted service providers who assist us in operating the website or delivering services. These partners are obligated to keep your information confidential and are not allowed to use it for any other purpose.
                  </p>
                  <p className="mt-2">We may also disclose your information if required by law or in response to a legal request from authorities.</p>
                </section>

                <section>
                  <h3 className="mt-3">5. Your Rights</h3>
                  <p className="mt-2">You have the right to:</p>

                  <p>Access and review your personal data</p>
                  <p>Request corrections or updates to your data</p>
                  <p>Withdraw consent for marketing communication</p>
                  <p>Request deletion of your data, subject to legal and operational limitations</p>

                  <p className="mt-4">To exercise any of these rights, please contact us at the details provided below.</p>
                </section>

                <section>
                  <h3 className="mt-3">6. External Links</h3>
                  <p className="mt-2">
                    Our website may contain links to other websites. We are not responsible for the privacy practices or content of third-party sites. We encourage users to read their respective privacy policies before sharing any personal data.
                  </p>
                </section>

                <section>
                  <h3 className="mt-3">7. Updates to This Policy</h3>
                  <p className="mt-2">
                    This Privacy Policy may be revised from time to time. Any changes will be posted on this page with an updated effective date. Continued use of our website indicates your acceptance of any updates.
                  </p>
                </section>

                <section>
                  <h3 className="mt-3">8. Contact Us</h3>
                  <p className="mt-2">For any questions or concerns about this Privacy Policy, please reach out to us:</p>
                  <ul>
                    <li>
                      <b>BCTLABS STEM Academy</b>
                    </li>
                    <li>
                      Email: <a href="mailto:bctlabs@gmail.com">bctlabs@gmail.com</a>
                    </li>
                    <li>
                      <a className="ml-35" href="mailto:info@bctlabsedu.com">
                        info@bctlabsedu.com
                      </a>
                    </li>
                    <li>Phone: +91 9543100296, 8825887006</li>
                    <li>
                      Website:{" "}
                      <a href="https://www.bctlabsedu.com" target="_blank" rel="noreferrer">
                        www.bctlabsedu.com
                      </a>
                    </li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
