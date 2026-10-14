import { SiteImage } from "@/components/frontend/site-image";
import { asset } from "@/lib/site";

export default function StemLabsPage() {
  return (
    <>
      <section
        className="banner__inner-page bg-image pt-50 pb-50 bg-image"
        data-background={asset("assets/frontend/images/banner/banner-inner-page.jpg")}
      >
        <div className="container banner">
          <div className="breadcrumb-list wow fadeInUp" data-wow-delay="200ms" data-wow-duration="1500ms">
            <h6 className="text-white normal">What We Do</h6>
          </div>
          <h2 className="wow fadeInUp" data-wow-delay="00ms" data-wow-duration="1500ms">
            STEM <span>Lab</span>
          </h2>
        </div>
      </section>

      <section className="about-area pt-30 pb-30">
        <div className="container">
          <div className="row g-2">
            <div className="col-lg-12 text-center">
              <div className="section-header mb-20">
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
                  STEM Lab
                </h2>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="section-header text-center mb-20">
                <p
                  className="wow fadeInUp text-black pr-30 pr-sm-0 mt-3"
                  data-wow-delay="400ms"
                  data-wow-duration="1500ms"
                  style={{
                    visibility: "visible",
                    animationDuration: "1500ms",
                    animationDelay: "400ms",
                    animationName: "fadeInUp",
                  }}
                >
                  At BCTLABS STEM Academy, we help schools set up fully-equipped STEM labs designed to inspire curiosity and innovation. Our labs feature tools like robotics kits, 3D printers, and coding platforms to provide students with hands-on learning experiences that build problem-solving skills
                  and a passion for technology.
                </p>
                <div className="btn-two d-none d-lg-inline-block mt-60">
                  <a href="#" className="btn-inner" data-bs-toggle="modal" data-bs-target="#consultModal">
                    <span className="btn-text">Consult Now</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-6 wow fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
                <SiteImage targetWidth={828} src={asset("assets/frontend/images/what_we_do/stem_lab/42.jpg")} width="100%" height="100%" alt="image" />
              </div>

              <div className="col-lg-6 wow fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
                <SiteImage targetWidth={828} src={asset("assets/frontend/images/what_we_do/stem_lab/37.jpeg")} width="100%" height="100%" alt="image" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-area pt-30 pb-30">
        <div className="container">
          <div className="row g-2">
            <div className="col-lg-12 text-center">
              <div className="section-header mb-20">
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
                  Summary
                </h2>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="section-header text-center mb-20">
                <p
                  className="wow fadeInUp text-black pr-30 pr-sm-0 mt-3"
                  data-wow-delay="400ms"
                  data-wow-duration="1500ms"
                  style={{
                    visibility: "visible",
                    animationDuration: "1500ms",
                    animationDelay: "400ms",
                    animationName: "fadeInUp",
                  }}
                >
                  BCTLABS STEM Academy provides state-of-the-art STEM labs to schools,
                  offering hands-on experiences in robotics, coding, 3D printing, and more.
                  Our labs are designed to spark innovation, creativity, and problem-solving skills.
                  Students engage in real-world tech applications that build future-ready abilities.
                  We aim to nurture critical thinking and a passion for STEM from an early age.
                  BCTLABS empowers the next generation to thrive in a tech-driven world.
                </p>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-4 wow fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
                <SiteImage targetWidth={828} src={asset("assets/frontend/images/what_we_do/stem_lab/38.jpeg")} width="100%" height="100%" alt="image" />
              </div>

              <div className="col-lg-4 wow fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
                <SiteImage targetWidth={828} src={asset("assets/frontend/images/what_we_do/stem_lab/39.jpeg")} width="100%" height="100%" alt="image" />
              </div>
              <div className="col-lg-4 wow fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
                <SiteImage targetWidth={828} src={asset("assets/frontend/images/what_we_do/stem_lab/41.jpg")} width="100%" height="100%" alt="image" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="about-area pt-30 pb-30">
        <div className="container">
          <div className="row g-2">
            <div className="col-lg-12 text-center">
              <div className="section-header mb-20">
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
                  Program Highlights
                </h2>
              </div>
            </div>

            <div className="col-lg-4">
              <div className=" mb-20 card mvision p-4 text-center">
                <h4
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
                  Hands-On Learning Experience
                </h4>

                <p
                  className="wow fadeInUp mt-2"
                  data-wow-delay="400ms"
                  data-wow-duration="1500ms"
                  style={{
                    visibility: "visible",
                    animationDuration: "1500ms",
                    animationDelay: "400ms",
                    animationName: "fadeInUp",
                  }}
                >
                  <small>Students engage directly with robotics kits, coding tools, and 3D printers—bringing STEM concepts to life through practical exploration.</small>
                </p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className=" mb-20 card mvision p-4 text-center">
                <h4
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
                  Academically Integrated Curriculum
                </h4>

                <p
                  className="wow fadeInUp mt-2"
                  data-wow-delay="400ms"
                  data-wow-duration="1500ms"
                  style={{
                    visibility: "visible",
                    animationDuration: "1500ms",
                    animationDelay: "400ms",
                    animationName: "fadeInUp",
                  }}
                >
                  <small>Our STEM curriculum is seamlessly aligned with academic subjects, making it suitable and relevant for all grades.</small>
                </p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className=" mb-20 card mvision p-4 text-center">
                <h4
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
                  STEM-Accredited Curriculum
                </h4>

                <p
                  className="wow fadeInUp mt-2"
                  data-wow-delay="400ms"
                  data-wow-duration="1500ms"
                  style={{
                    visibility: "visible",
                    animationDuration: "1500ms",
                    animationDelay: "400ms",
                    animationName: "fadeInUp",
                  }}
                >
                  <small>We follow globally recognized STEM education standards to ensure quality, structure, and meaningful learning outcomes.</small>
                </p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className=" mb-20 card mvision p-4 text-center">
                <h4
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
                  STEM Events &amp; Competitions
                </h4>

                <p
                  className="wow fadeInUp mt-2"
                  data-wow-delay="400ms"
                  data-wow-duration="1500ms"
                  style={{
                    visibility: "visible",
                    animationDuration: "1500ms",
                    animationDelay: "400ms",
                    animationName: "fadeInUp",
                  }}
                >
                  <small>Students get the opportunity to participate in intra- and inter-school STEM events, expos, and national-level competitions.</small>
                </p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className=" mb-20 card mvision p-4 text-center">
                <h4
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
                  Skill Development Beyond Academics
                </h4>

                <p
                  className="wow fadeInUp mt-2"
                  data-wow-delay="400ms"
                  data-wow-duration="1500ms"
                  style={{
                    visibility: "visible",
                    animationDuration: "1500ms",
                    animationDelay: "400ms",
                    animationName: "fadeInUp",
                  }}
                >
                  <small>Through collaboration, problem-solving, and innovation challenges, students gain essential life and career skills.</small>
                </p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className=" mb-20 card mvision p-4 text-center">
                <h4
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
                  Improved Conceptual Understanding
                </h4>

                <p
                  className="wow fadeInUp mt-2"
                  data-wow-delay="400ms"
                  data-wow-duration="1500ms"
                  style={{
                    visibility: "visible",
                    animationDuration: "1500ms",
                    animationDelay: "400ms",
                    animationName: "fadeInUp",
                  }}
                >
                  <small>Activity-based learning strengthens students&apos; grasp of science, technology, engineering, and math fundamentals.</small>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="counter-area bg-white  pt-20 pb-20 sub-bg">
        {/* Brand area start here */}
        <div className="brand-area wow fadeInDown" data-wow-delay="200ms" data-wow-duration="1500ms">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="d-flex  gap-5  align-items-center justify-content-center">
                  <div className="btn-two d-lg-inline-block">
                    <a href="#" className="btn-inner">
                      <span className="btn-text">Download Brochure</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
