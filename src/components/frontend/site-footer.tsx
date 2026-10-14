"use client";

import { SiteImage } from "@/components/frontend/site-image";
import type { FormEvent } from "react";
import { asset } from "@/lib/site";

/**
 * Port of `resources/views/frontend/layouts/footer.blade.php`.
 *
 * The Blade template opened with `</main>` and closed with `</body></html>`;
 * both are owned by the layout/root layout here, so this component only
 * reproduces the footer, the back-to-top button and the two Bootstrap modals.
 * The original inline handlers now live in `@/lib/legacy-site-scripts` and are
 * run by the site layout once the legacy scripts have loaded.
 */

export default function SiteFooter() {
  // The Blade form carried `onsubmit="return false"`; stop the native submit
  // the same way without leaving the page.
  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <>
      {/* Footer area start here */}
      <footer
        className="footer-area overflow-hidden"
        style={{ backgroundColor: "#3b0056" }}
      >
        <div className="footer__main-wrp">
          <div
            className="footer__shape-left wow slideInLeft"
            data-wow-delay="200ms"
            data-wow-duration="1500ms"
          >
            <SiteImage targetWidth={828}
              className="footer__shape__animation"
              src={asset("assets/frontend/images/footer/footer-bg-shape1.png")}
              alt="shape"
            />
          </div>
          <div
            className="footer__shape-right wow slideInRight"
            data-wow-delay="400ms"
            data-wow-duration="1500ms"
          >
            <SiteImage targetWidth={828}
              className="footer__shape__animation-right"
              src={asset("assets/frontend/images/footer/footer-bg-shape2.png")}
              alt="shape"
            />
          </div>
          <div className="">
            <div className="container">
              <div className="footer_top pt-20">
                <div className="row justify-content-center align-items-center mx-auto">
                  <div
                    className="col-lg-4 col-md-4 wow fadeInUp"
                    data-wow-delay="00ms"
                    data-wow-duration="1500ms"
                  >
                    <div className="footer__item">
                      <a href="/" className="logo">
                        <SiteImage targetWidth={828}
                          src={asset(
                            "assets/frontend/images/logo/light_logo.png",
                          )}
                          alt="image"
                        />
                      </a>
                    </div>
                  </div>
                  <div
                    className="col-lg-8 col-md-8 wow fadeInUp"
                    data-wow-delay="00ms"
                    data-wow-duration="1500ms"
                  >
                    <div className="footer__top__content">
                      <div className="d-block d-md-flex flex-md-nowrap justify-content-md-between gap-5">
                        <p className="text-white">
                          Subscribe our newsletter
                          <br /> for latest Updates
                        </p>

                        <form className="" onSubmit={handleNewsletterSubmit}>
                          <div className="d-flex gap-3 d-md-flex flex-md-nowrap newsletter">
                            <input
                              id="email"
                              className="form-control"
                              type="email"
                              placeholder="Enter Your Email"
                            />
                            <button type="submit">SUBSCRIBE NOW</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <hr className="hrline" />
            <div className="container px-4">
              <div className="footer__wrp p-3">
                <div className="row g-4 justify-content-between">
                  <div
                    className="col-lg-4 col-sm-6 wow fadeInUp"
                    data-wow-delay="00ms"
                    data-wow-duration="1500ms"
                  >
                    <div className="footer__item">
                      <p className="text-white mt-3">
                        <small>
                          Since the inception year 2013, we have been providing
                          Electronics solutions to customers around the globe on
                          a Wide range of interests in all fields.
                        </small>
                      </p>
                      <div className="social-icon mt-30">
                        <a className="active" href="#0">
                          <i className="fa-brands fa-facebook-f"></i>
                        </a>
                        <a className="active" href="#0">
                          <i className="fa-brands fa-instagram"></i>
                        </a>
                        <a className="active" href="#0">
                          <i className="fa-brands fa-linkedin-in"></i>
                        </a>
                        <a className="active" href="#0">
                          <i className="fa-brands fa-pinterest-p"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div
                    className="col-lg-3 offset-1 col-sm-12 wow fadeInUp"
                    data-wow-delay="200ms"
                    data-wow-duration="1500ms"
                  >
                    <div className="footer__item">
                      <h6 className="title mb-20 text-white">Our Service</h6>
                      <ul className="link">
                        <li className="mb-1">
                          <a href="/atal_tinkering_labs" className="text-white">
                            <b>
                              <i className="fa-light fa-angles-right me-2"></i>{" "}
                              ATAL Tinkering Labs
                            </b>
                          </a>
                        </li>
                        <li className="mb-1">
                          <a href="/stem_labs" className="text-white">
                            <b>
                              <i className="fa-light fa-angles-right me-2"></i>{" "}
                              STEM Lab
                            </b>
                          </a>
                        </li>
                        <li className="mb-1">
                          <a
                            href="/advanced_innovation_lab"
                            className="text-white"
                          >
                            <b>
                              <i className="fa-light fa-angles-right me-2"></i>{" "}
                              Advanced Innovation Lab
                            </b>
                          </a>
                        </li>
                        <li className="mb-1">
                          <a href="/csr_stem_solutions" className="text-white">
                            <b>
                              <i className="fa-light fa-angles-right me-2"></i>
                              CSR STEM Solutions
                            </b>
                          </a>
                        </li>
                        <li className="mb-1">
                          <a
                            href="/stem_learning_programs"
                            className="text-white"
                          >
                            <b>
                              <i className="fa-light fa-angles-right me-2"></i>
                              STEM Learning Programs
                            </b>
                          </a>
                        </li>
                        <li className="mb-1">
                          <a href="/stem_workshops" className="text-white">
                            <b>
                              <i className="fa-light fa-angles-right me-2"></i>
                              STEM Workshops
                            </b>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div
                    className="col-lg-3 offset-1 col-sm-12 wow fadeInUp"
                    data-wow-delay="200ms"
                    data-wow-duration="1500ms"
                  >
                    <div className="footer__item">
                      <h6 className="title mb-20 text-white">Know More</h6>
                      <ul className="link">
                        <li className="mb-1">
                          <a href="/career-list" className="text-white">
                            <b>
                              <i className="fa-light fa-angles-right me-2"></i>{" "}
                              Careers
                            </b>
                          </a>
                        </li>
                        <li className="mb-1">
                          <a href="/our_team" className="text-white">
                            <b>
                              <i className="fa-light fa-angles-right me-2"></i>{" "}
                              Our Teams
                            </b>
                          </a>
                        </li>
                        <li className="mb-1">
                          <a href="/achievements" className="text-white">
                            <b>
                              <i className="fa-light fa-angles-right me-2"></i>{" "}
                              Achievements
                            </b>
                          </a>
                        </li>
                        <li className="mb-1">
                          <a href="/events/list" className="text-white">
                            <b>
                              <i className="fa-light fa-angles-right me-2"></i>
                              Events
                            </b>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="row g-4 justify-content-between mt-10 copyright">
                  <div
                    className="col-lg-6 wow fadeInUp"
                    data-wow-delay="00ms"
                    data-wow-duration="1500ms"
                  >
                    <div className="footer__item">
                      <div className="contact-box mb-2">
                        <div className="icon">
                          <i className="fa fa-map-marker"></i>
                        </div>
                        <div className="content">
                          <span>Registered Office</span>
                          <p className="mt-0">
                            BCTLABS, 5/3, Nehruji 8th Street, Arakkonam, Vellor
                            - 631001, Tamil Nadu, India
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="col-lg-3 wow fadeInUp"
                    data-wow-delay="00ms"
                    data-wow-duration="1500ms"
                  >
                    <div className="contact-box mb-2">
                      <div className="icon">
                        <i className="fa fa-envelope"></i>
                      </div>
                      <div className="content">
                        <span>Email Support</span>
                        <p className="mt-0">bctlabs@gmail.com</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="col-lg-3 wow fadeInUp"
                    data-wow-delay="00ms"
                    data-wow-duration="1500ms"
                  >
                    <div className="contact-box mb-2">
                      <div className="icon">
                        <i className="fa fa-phone-alt"></i>
                      </div>
                      <div className="content">
                        <span>Call us any time</span>
                        <p className="mt-0">+91 9543100296</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row g-4 justify-content-between mt-10 copyright">
                  <div
                    className="col-lg-6 wow fadeInUp"
                    data-wow-delay="00ms"
                    data-wow-duration="1500ms"
                  >
                    <div className="footer__bottom pl-10">
                      <p className="text-white">
                        <small>
                          Copyright BCTLABS © 2025. All rights reserved.
                        </small>
                      </p>
                    </div>
                  </div>

                  <div
                    className="col-lg-6 wow fadeInUp"
                    data-wow-delay="00ms"
                    data-wow-duration="1500ms"
                  >
                    <div className="footer__bottom text-center">
                      <ul className="footer__bottom__link d-flex justify-content-center gap-4 flex-wrap">
                        <li>
                          <p>
                            <a href="/privacy_and_policy">Privacy Policy</a>
                          </p>
                        </li>
                        <li>
                          <p>
                            <a href="/terms_and_condition">
                              Terms &amp; Conditions
                            </a>
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      {/* Footer area end here */}

      {/* Back to top area start here */}
      <div className="scroll-up">
        <svg
          className="scroll-circle svg-content"
          width="100%"
          height="100%"
          viewBox="-1 -1 102 102"
        >
          <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
        </svg>
      </div>
      {/* Back to top area end here */}

      <div
        className="modal fade"
        id="careerModal"
        tabIndex={-1}
        aria-labelledby="careerModalLabel"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <form
              id="careerForm"
              className="needs-validation"
              noValidate
              encType="multipart/form-data"
            >
              <div className="modal-header">
                <h5 className="modal-title" id="careerModalLabel">
                  Career Application Form
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {/* Name */}
                <div className="mb-3">
                  <label htmlFor="applicantName" className="form-label">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="applicantName"
                    name="name"
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide your full name.
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="qualification" className="form-label">
                    Qualification <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="qualification"
                    name="qualification"
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide your qualification.
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="dob" className="form-label">
                    Date of birth <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="dob"
                    name="dob"
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide your Date of birth.
                  </div>
                </div>

                <div className="col-12 mb-3">
                  <label htmlFor="gender" className="form-label">
                    Gender<span className="text-danger">*</span>
                  </label>
                  <br />
                  <select
                    name="gender"
                    style={{ width: "100%" }}
                    className="form-control col-12 mb-2 w-100"
                    id="gender"
                    required
                  >
                    <option value="">-- Gender --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <div className="invalid-feedback">
                    Please select the Gender
                  </div>
                </div>

                {/* Mobile No */}
                <div className="mb-3">
                  <label htmlFor="applicantMobile" className="form-label">
                    Mobile Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="applicantMobile"
                    name="mobile"
                    pattern="[0-9]{10}"
                    placeholder="10-digit number"
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide a valid 10-digit mobile number.
                  </div>
                </div>

                {/* Mobile No */}
                <div className="mb-3">
                  <label htmlFor="whatsappMobile" className="form-label">
                    Whatsapp Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="whatsappMobile"
                    name="whatsappMobile"
                    pattern="[0-9]{10}"
                    placeholder="10-digit number"
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide a valid 10-digit Whatsapp Number.
                  </div>
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label htmlFor="applicantEmail" className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="applicantEmail"
                    name="email"
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide a valid email address.
                  </div>
                </div>

                {/* Address */}
                <div className="mb-3">
                  <label htmlFor="applicantAddress" className="form-label">
                    Address <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="applicantAddress"
                    name="address"
                    rows={3}
                    required
                  ></textarea>
                  <div className="invalid-feedback">
                    Please provide your complete address.
                  </div>
                </div>

                {/* Address */}
                <div className="mb-3">
                  <label htmlFor="yearofexperience" className="form-label">
                    Proffesional Information{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="yearofexperience"
                    placeholder="Year of Experience"
                    name="yearofexperience"
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide your year of experience.
                  </div>
                </div>

                {/* Resume */}
                <div className="mb-3">
                  <label htmlFor="applicantResume" className="form-label">
                    Upload Resume <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    type="file"
                    id="applicantResume"
                    name="resume"
                    accept=".pdf,.doc,.docx,.jpg"
                    required
                  />
                  <div className="invalid-feedback">
                    Please upload your resume (PDF, DOC, DOCX, or JPG).
                  </div>
                  <small className="text-muted">
                    Accepted formats: PDF, DOC, DOCX, JPG (Max 5MB)
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  <i className="fas fa-times me-1"></i> Close
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-paper-plane me-1"></i> Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="consultModal"
        tabIndex={-1}
        aria-labelledby="consultModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <form
              id="consultForm"
              className="needs-validation"
              noValidate
              encType="multipart/form-data"
            >
              <div className="modal-header">
                <h5 className="modal-title" id="consultModalLabel">
                  Consultation Form
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body row">
                {/* Name */}
                <div className="col-12 mb-3">
                  <label htmlFor="applicantName" className="form-label">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="applicantName"
                    name="name"
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide your full name.
                  </div>
                </div>

                <div className="col-6 mb-3">
                  <label htmlFor="applicantDesignation" className="form-label">
                    Designation<span className="text-danger">*</span>
                  </label>
                  <br />
                  <select
                    name="designation"
                    className="form-control"
                    id="applicantDesignation"
                    required
                  >
                    <option value="">-- Designation --</option>
                    <option value="principal">Principal</option>
                    <option value="chairman">Chairman</option>
                    <option value="teacher">Teacher</option>
                  </select>
                  <div className="invalid-feedback">
                    Please select the Desgnation
                  </div>
                </div>

                <div className="col-6 mb-3">
                  <label htmlFor="applicantLab" className="form-label">
                    Type of Lab Intrested in
                    <span className="text-danger">*</span>
                  </label>
                  <br />
                  <select
                    name="lab_type"
                    className="form-control"
                    id="applicantLab"
                    required
                  >
                    <option value="">-- Lab Types --</option>
                    <option value="stem_lab">STEM Lab</option>
                    <option value="atal_tinkering_lab">
                      Atal Tinkering Lab
                    </option>
                    <option value="both">Both</option>
                  </select>
                  <div className="invalid-feedback">
                    Please select the Lab type
                  </div>
                  <br />
                  <br />
                </div>

                {/* School */}
                <div className="col-6 mb-3">
                  <label htmlFor="applicantSchool" className="form-label">
                    School | Institution name{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="applicantSchool"
                    name="school"
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide your School or Institution name.
                  </div>
                </div>

                {/* City */}
                <div className="col-6 mb-3">
                  <label htmlFor="applicantCity" className="form-label">
                    City &amp; State<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="applicantCity"
                    name="city"
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide your City and State.
                  </div>
                </div>

                {/* Mobile No */}
                <div className="col-6 mb-3">
                  <label htmlFor="applicantMobile" className="form-label">
                    Contact Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="applicantMobile"
                    name="mobile"
                    pattern="[0-9]{10}"
                    placeholder="10-digit number"
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide a valid 10-digit mobile number.
                  </div>
                </div>

                {/* Email */}
                <div className="col-6 mb-3">
                  <label htmlFor="applicantEmail" className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="applicantEmail"
                    name="email"
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide a valid email address.
                  </div>
                </div>

                {/* Grade */}
                <div className="col-6 mb-3">
                  <label htmlFor="applicantClass" className="form-label">
                    Class Range (Grade)<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="applicantClass"
                    name="class"
                    placeholder="e.g., 4th to 9th"
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide student class range.
                  </div>
                </div>

                {/* Student Strength  */}
                <div className="col-6 mb-3">
                  <label htmlFor="applicantStrength" className="form-label">
                    Student Strength <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="applicantStrength"
                    name="strength"
                    required
                  />
                  <div className="invalid-feedback">
                    Please provide Student Strength.
                  </div>
                </div>

                {/* Preferred Date */}
                <div className="col-6 mb-3">
                  <label htmlFor="preferredDate" className="form-label">
                    Preferred Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="preferredDate"
                    name="preferred_date"
                    required
                  />
                  <div className="invalid-feedback">
                    Please select a preferred date.
                  </div>
                </div>

                {/* Preferred Time */}
                <div className="col-6 mb-3">
                  <label htmlFor="preferredTime" className="form-label">
                    Preferred Time <span className="text-danger">*</span>
                  </label>
                  <input
                    type="time"
                    className="form-control"
                    id="preferredTime"
                    name="preferred_time"
                    required
                  />
                  <div className="invalid-feedback">
                    Please select a preferred time.
                  </div>
                </div>

                <div className="col-6 mb-3">
                  <label
                    htmlFor="applicantPreferredMode"
                    className="form-label"
                  >
                    Preferred Mode of Consultation
                    <span className="text-danger">*</span>
                  </label>
                  <br />
                  <select
                    name="preferred_mode"
                    className="form-control"
                    id="applicantPreferredMode"
                    required
                  >
                    <option value="">-- Preferred Mode --</option>
                    <option value="phone_call">Phone Call</option>
                    <option value="zoom_meeting">Zoom Meeting</option>
                    <option value="in_personal_visit">In-Personal Visit</option>
                  </select>
                  <div className="invalid-feedback">
                    Please select the Preferred Mode
                  </div>
                  <br />
                  <br />
                </div>

                <div className="col-6 mb-3">
                  <label htmlFor="applicantKnow" className="form-label">
                    How did you here About us?{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <br />
                  <select
                    name="heard_about"
                    className="form-control"
                    id="applicantKnow"
                    required
                  >
                    <option value="">-- How did you know --</option>
                    <option value="referral">Referral</option>
                    <option value="event">Event</option>
                    <option value="website">Website</option>
                    <option value="social_media">Social Media</option>
                    <option value="others">Others</option>
                  </select>
                  <div className="invalid-feedback">
                    Please select the find Mode
                  </div>
                  <br />
                  <br />
                </div>

                {/* Questions */}
                <div className="col-12 mb-3">
                  <label htmlFor="applicantAddress" className="form-label">
                    Any Specific Requirements or Questions?
                    <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="applicantAddress"
                    name="questions"
                    rows={3}
                    required
                  ></textarea>
                  <div className="invalid-feedback">
                    Please provide your complete address.
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
