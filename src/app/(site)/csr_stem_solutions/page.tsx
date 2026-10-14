import { SiteImage } from "@/components/frontend/site-image";
import { asset } from "@/lib/site";

export default function CsrStemSolutionsPage() {
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
            CSR STEM <span>Solutions</span>
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
                  Where Corporate Responsibility Meets STEM Opportunity
                </h2>

                <h3 className="mt-4"> </h3>
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
                  CSR STEM Solutions enable organizations to make a lasting impact by supporting equitable access to STEM education. Through
                  strategic partnerships, BCTLabs implements tech-enabled learning environments that foster innovation and bridge the digital divide in under-resourced
                  areas.
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
                <SiteImage targetWidth={828} src={asset("assets/frontend/images/what_we_do/csr_steam/4.JPG")} width="100%" height="100%" alt="image" />
              </div>

              <div className="col-lg-6 wow fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
                <SiteImage targetWidth={828} src={asset("assets/frontend/images/what_we_do/csr_steam/8.JPG")} width="100%" height="100%" alt="image" />
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
                  CSR STEM Solutions by BCTLabs is a specialized initiative designed to help organizations fulfill their Corporate Social Responsibility (CSR)
                  goals through impactful investments in STEM education. By partnering with schools, NGOs, and educational institutions, we set up state-of-the-art
                  STEM labs and programs that promote hands-on learning, digital literacy, and future-ready skills for underserved communities. These solutions not only
                  empower students with access to modern technology but also contribute to building an inclusive and skilled workforce for tomorrow.
                </p>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-4 wow fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
                <SiteImage targetWidth={828} src={asset("assets/frontend/images/what_we_do/csr_steam/6.JPG")} width="100%" height="100%" alt="image" />
              </div>

              <div className="col-lg-4 wow fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
                <SiteImage targetWidth={828} src={asset("assets/frontend/images/what_we_do/csr_steam/61.jpg")} width="100%" height="100%" alt="image" />
              </div>
              <div className="col-lg-4 wow fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
                <SiteImage targetWidth={828} src={asset("assets/frontend/images/what_we_do/csr_steam/135.jpeg")} width="100%" height="100%" alt="image" />
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
                  Tech-Driven Empowerment
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
                  <small>
                    CSR STEM Solutions equip underserved communities with access to cutting-edge technologies like AI, IoT, and automation, ensuring students can
                    innovate and solve real-world challenges.
                  </small>
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
                  Purpose-Driven Curriculum
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
                  <small>
                    The program integrates practical, real-world applications of advanced STEM concepts, making it relevant and impactful for students from diverse
                    backgrounds.
                  </small>
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
                  Global Impact, Local Change
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
                  <small>
                    Aligned with global standards for STEM education, CSR STEM Solutions aim to elevate underrepresented communities, providing them with the tools
                    and knowledge for a tech-driven future.
                  </small>
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
                  Community Engagement &amp; Innovation
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
                  <small>
                    Students and educators participate in CSR-driven tech events, local hackathons, and innovation challenges, empowering them to showcase their skills
                    and drive positive change.
                  </small>
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
                  Building Tomorrow’s Workforce
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
                  <small>By developing essential skills like problem-solving, collaboration, and tech literacy, students are prepared for careers in emerging fields and industries.</small>
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
                  Bridging the STEM Gap
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
                  <small>
                    Through hands-on experiences and immersive learning, students build a deep understanding of the technologies shaping the future, while overcoming
                    the barriers to accessing quality education.
                  </small>
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
