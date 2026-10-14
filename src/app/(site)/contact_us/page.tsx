import { SiteImage } from "@/components/frontend/site-image";
import type { CSSProperties } from "react";

import { asset } from "@/lib/site";

const WOW = (delay: string): CSSProperties => ({
  visibility: "visible",
  animationDuration: "1500ms",
  animationDelay: delay,
  animationName: "fadeInUp",
});

const MAP_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.6229847296145!2d77.53306047460232!3d12.867610217150633!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae43ab1e1173e5%3A0xb6606ce9dd81961e!2sBCTLABS!5e0!3m2!1sen!2sin!4v1748276937852!5m2!1sen!2sin";

/**
 * Port of `resources/views/frontend/main_menu/contact_us.blade.php`
 * (`FrontendController::contact_us`). The controller passes no data, so the
 * page is static markup only. The Blade had one unmatched `</div>` before
 * `</section>`, which is dropped to keep the JSX balanced.
 */
export default function ContactUsPage() {
  return (
    <>
      <section
        className="banner__inner-page bg-image pt-50 pb-50 bg-image"
        data-background={asset(
          "assets/frontend/images/banner/banner-inner-page.jpg",
        )}
      >
        <div className="container banner">
          <h2
            className="wow fadeInUp"
            data-wow-delay="00ms"
            data-wow-duration="1500ms"
          >
            Contact <span>Us</span>
          </h2>
        </div>
      </section>

      <section className="px-3 pt-30 pb-30 bg-light">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-6 order-1  order-lg-2 mt-lg-0">
              <div className="contact__form bg_primary p-5 rounded-3">
                <div className="section-header contact_primary mb-40">
                  <h5
                    className="wow fadeInUp text-white"
                    data-wow-delay="00ms"
                    data-wow-duration="1500ms"
                    style={WOW("0ms")}
                  >
                    CONTACT WITH US!
                  </h5>
                  <h2
                    className="wow fadeInUp text-white"
                    data-wow-delay="200ms"
                    data-wow-duration="1500ms"
                    style={WOW("200ms")}
                  >
                    Get in Touch
                  </h2>
                  <p
                    className="wow fadeInUp text-white"
                    data-wow-delay="300ms"
                    data-wow-duration="1500ms"
                    style={WOW("200ms")}
                  >
                    We value your feedback, inquiries, and suggestions. Please
                    don&apos;t hesitate to get in touch with us using the
                    following contact information:
                  </p>
                </div>
                <form action="return false" name="contactForm" id="contactForm">
                  <input type="hidden" id="actionUrl" value="/contact-mail" />
                  <input type="hidden" id="csrToken" value="" />
                  <div className="row">
                    <div className="col-lg-6 col-md-12">
                      <input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="Your Name*"
                      />
                      <div id="name-error" className="error-message"></div>
                    </div>
                    <div className="col-lg-6 col-md-12">
                      <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Your Email Address*"
                      />
                      <div id="email-error" className="error-message"></div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-6 col-md-12">
                      <input
                        id="subject"
                        type="text"
                        name="subject"
                        placeholder="Select Subject*"
                      />
                      <div id="subject-error" className="error-message"></div>
                    </div>
                    <div className="col-lg-6 col-md-12">
                      <input
                        id="mobile"
                        type="text"
                        name="mobile"
                        placeholder="Phone Number*"
                      />
                      <div id="mobile-error" className="error-message"></div>
                    </div>
                  </div>
                  <div className="text-area">
                    <textarea
                      id="message"
                      name="message"
                      placeholder="Type Your Message here..."
                    ></textarea>
                    <div id="message-error" className="error-message"></div>
                  </div>
                  <div className="btn-two">
                    <span className="btn-circle"></span>
                    <a
                      href="javascript:void(0);"
                      id="sendBtn"
                      className="btn-light"
                    >
                      <b>Send Message</b>
                    </a>
                  </div>
                </form>
              </div>
            </div>

            <div className="col-lg-6">
              <iframe
                className="wow fadeInUp rounded"
                data-wow-delay="00ms"
                data-wow-duration="1500ms"
                src={MAP_SRC}
                width="100%"
                height="100%"
                style={{ border: "0" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          <div className="row g-5 mt-20">
            <div className="col-lg-12">
              <div className="text-justify card p-4 mb-2">
                <div className="d-flex cdetails">
                  <div className="icon me-3">
                    <SiteImage targetWidth={828}
                      src={asset("assets/frontend/images/chennai_city.png")}
                      width="60px"
                      alt=""
                    />
                  </div>
                  <div className="content">
                    <h6
                      className="wow fadeInUp"
                      data-wow-delay="200ms"
                      data-wow-duration="1500ms"
                      style={WOW("200ms")}
                    >
                      Registered office
                    </h6>
                    <p
                      className="wow fadeInUp mt-0"
                      data-wow-delay="400ms"
                      data-wow-duration="1500ms"
                      style={WOW("400ms")}
                    >
                      BCTLABS, 5/3, Nehruji 8th Street, Arakkonam, Vellor -
                      631001, Tamil Nadu, India
                    </p>

                    <p
                      className="wow fadeInUp mt-0"
                      data-wow-delay="400ms"
                      data-wow-duration="1500ms"
                      style={WOW("400ms")}
                    >
                      <b>Mobile Number:</b> +91 9543100296
                    </p>
                    <p
                      className="wow fadeInUp mt-0"
                      data-wow-delay="400ms"
                      data-wow-duration="1500ms"
                      style={WOW("400ms")}
                    >
                      <b>Mail:</b>bctlabs@gmail.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-5 mt-20 justify-content-center">
            <div
              className="col-xl-3 col-md-6 wow fadeInUp"
              data-wow-delay="00ms"
              data-wow-duration="1500ms"
            >
              <div className="blog__item card rounded p-3 text-center">
                <div className="image">
                  <SiteImage targetWidth={828}
                    className="rounded"
                    src={asset("assets/frontend/images/contact/chennai.jpeg")}
                    alt="Main Branch"
                  />
                </div>
                <div className="blog__content p-1">
                  <h4 className="mt-10 pb-15" style={{ fontWeight: "bold" }}>
                    <a href="javascript:void(0);" className="primary-color">
                      {" "}
                      Main Branch
                    </a>
                  </h4>
                  <p
                    className="wow fadeInUp mt-0"
                    data-wow-delay="400ms"
                    data-wow-duration="1500ms"
                    style={WOW("400ms")}
                  >
                    Plot No.B 1, 2nd Floor, 2nd Main Rd, Burma Colony, Industrial
                    Estate, Perungudi, Chennai, Tamil Nadu 600096
                  </p>
                </div>
              </div>
            </div>

            <div
              className="col-xl-3 col-md-6 wow fadeInUp"
              data-wow-delay="00ms"
              data-wow-duration="1500ms"
            >
              <div className="blog__item card rounded p-3 text-center">
                <div className="image">
                  <SiteImage targetWidth={828}
                    className="rounded"
                    src={asset("assets/frontend/images/contact/hyderabad.jpg")}
                    alt="Head Office"
                  />
                </div>
                <div className="blog__content p-1">
                  <h4 className="mt-10 pb-15" style={{ fontWeight: "bold" }}>
                    <a href="javascript:void(0);" className="primary-color">
                      {" "}
                      Head Office
                    </a>
                  </h4>
                  <p
                    className="wow fadeInUp mt-0"
                    data-wow-delay="400ms"
                    data-wow-duration="1500ms"
                    style={WOW("400ms")}
                  >
                    No.10-102/10/5/B Sai Krishna Nagar, Uppal, Hyderabad 500098
                  </p>
                </div>
              </div>
            </div>

            <div
              className="col-xl-3 col-md-6 wow fadeInUp"
              data-wow-delay="00ms"
              data-wow-duration="1500ms"
            >
              <div className="blog__item card rounded p-3 text-center">
                <div className="image">
                  <SiteImage targetWidth={828}
                    className="rounded"
                    src={asset("assets/frontend/images/contact/bangalore.jpeg")}
                    alt="Head Office"
                  />
                </div>
                <div className="blog__content p-1">
                  <h4 className="mt-10 pb-15" style={{ fontWeight: "bold" }}>
                    <a href="javascript:void(0);" className="primary-color">
                      {" "}
                      Head Office
                    </a>
                  </h4>
                  <p
                    className="wow fadeInUp mt-0"
                    data-wow-delay="400ms"
                    data-wow-duration="1500ms"
                    style={WOW("400ms")}
                  >
                    No.7, Jagannth Building, Thalagattapura post, kanakapura
                    main road, Banglore 560062
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
