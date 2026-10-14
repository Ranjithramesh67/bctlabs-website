import { asset } from "@/lib/site";

export default function TermsAndConditionPage() {
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
            TERMS AND <span>CONDITIONS</span>
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
                  Terms And Conditions
                </h2>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="section-header mb-20">
                <p className="mt-2">
                  Welcome to the official website of <strong>BCTLABS STEM Academy</strong> (“we”, “our”, or “us”). These Terms and Conditions govern your access and use of our website. By visiting or using any part of our website, you agree to be bound by these terms. If you disagree with any part of them, we kindly ask that you refrain from using the site.
                </p>

                <p className="mt-2">
                  We may update or change these terms at our discretion. Continued use of the site after updates means you accept the new terms. Please review this page regularly.
                </p>

                <section>
                  <h3 className="mt-3">1. Ownership &amp; Use of Website Content</h3>
                  <p className="mt-2">
                    All text, graphics, logos, icons, audio, video, software, and other content displayed on this website are either owned by or licensed to BCTLABS STEM Academy. Any use of our materials for commercial purposes, including reproduction or redistribution, is strictly prohibited without written permission from us.
                  </p>
                  <p className="mt-2">You may use the content solely for personal and non-commercial purposes, as long as you do not modify or obscure any proprietary notices.</p>
                </section>

                <section>
                  <h3 className="mt-3">2. Acceptable Use Policy</h3>
                  <h4 className="mt-3">A) Security and Access</h4>

                  <p>Do not try to gain unauthorized access to parts of the website, its data, or systems.</p>
                  <p>Do not disrupt the website’s functionality using viruses, bots, or harmful code.</p>
                  <p>Do not attempt to overload or attack our servers or infrastructure.</p>
                  <p>Do not use the website to send unsolicited emails, spam, or promotional messages.</p>

                  <p className="mt-2">Violations may lead to legal action or restriction of access.</p>

                  <h4 className="mt-3">B) Ethical Conduct</h4>

                  <p>Do not post or share unlawful, harmful, or offensive content.</p>
                  <p>Do not infringe on copyrights, trademarks, or intellectual property.</p>
                  <p>Do not violate the privacy rights of others or misuse their information.</p>
                </section>

                <section>
                  <h3 className="mt-3">3. Responsibility &amp; Indemnification</h3>
                  <p className="mt-2">
                    By using our services, you agree to take responsibility for your actions on our site. You further agree to indemnify and defend BCTLABS STEM Academy, its team members, and partners against any claims or damages that arise from your use or misuse of the site or from your violation of these terms.
                  </p>
                </section>

                <section>
                  <h3 className="mt-3">4. Limitation of Liability</h3>
                  <p className="mt-2">
                    We strive to maintain the accuracy and availability of our website, but we do not guarantee uninterrupted or error-free performance. BCTLABS STEM Academy is not liable for any direct or indirect losses, including data loss or business interruption, resulting from the use of this website or any reliance on its content.
                  </p>
                  <p className="mt-2">In any case, our liability shall be limited to the amount (if any) paid by you for any specific service offered by us.</p>
                </section>

                <section>
                  <h3 className="mt-3">5. Service Changes and Suspension</h3>
                  <p className="mt-2">
                    We reserve the right to update, suspend, or discontinue any part of the website or its features without prior notice. We may also block or terminate your access if you violate these terms.
                  </p>
                </section>

                <section>
                  <h3 className="mt-3">6. Governing Law</h3>
                  <p className="mt-2">
                    These Terms and Conditions shall be governed by and interpreted in accordance with the laws of India. Any legal matters arising shall fall under the jurisdiction of courts located in <strong>[Insert City/State]</strong>.
                  </p>
                </section>

                <section>
                  <h3 className="mt-3">7. Contact Details</h3>
                  <p className="mt-2">For any questions or concerns about these terms, feel free to reach out to us:</p>
                  <ul>
                    <li>
                      <strong>BCTLABS STEM Academy</strong>
                    </li>
                    <li>
                      Email: <a href="mailto:bctlabs@gmail.com">bctlabs@gmail.com</a>
                    </li>
                    <li>Phone: +91 9543100296</li>
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
