import { SiteImage } from "@/components/frontend/site-image";
import { asset } from "@/lib/site";

export default function StemWorkshopsPage() {
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
            STEM <span>Workshops</span>
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
                  Hands-on STEM workshops designed to spark curiosity, enhance problem-solving skills, and empower students with practical experience in robotics,
                  coding, and innovation.
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
                  Our STEM Workshops provide hands-on learning in robotics, coding, 3D printing, and AI. Guided by experts, students build projects, solve
                  real-world problems, and explore emerging technologies. They develop essential skills like creativity, problem-solving, and teamwork, preparing them
                  for a tech-driven future.
                </p>
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
                  BCTLABS STEM Workshops are immersive, hands-on experiences where students explore cutting-edge technologies like robotics, coding, 3D printing, and AI. Our expert-led sessions transform learning into an exciting journey of discovery, empowering students to think creatively, solve realworld problems, and collaborate effectively. These workshops aren’t just classes—they’re gateways to innovation, equipping students with skills for a
                  tech-driven future.
                </p>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-6 wow fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
                <SiteImage targetWidth={828} src={asset("assets/frontend/images/what_we_do/stem_workshop/1.JPG")} width="100%" height="100%" alt="image" />
              </div>

              <div className="col-lg-6 wow fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
                <SiteImage targetWidth={828} src={asset("assets/frontend/images/what_we_do/stem_workshop/16.jpg")} width="100%" height="100%" alt="image" />
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
                  Robotics Workshop
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
                  <small>Students dive into the world of robotics, designing, building, and programming robots that bring their ideas to life.</small>
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
                  AI Workshop
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
                  <small>An introduction to artificial intelligence, where students explore machine learning, image recognition, and smart automation.</small>
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
                  Aeromodelling Workshop
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
                  <small>Students learn the science of flight by designing, building, and testing their own model aircraft—merging creativity with physics.</small>
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
                  Drone Racing Workshop
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
                  <small>A thrilling hands-on experience where students assemble and pilot drones, mastering skills in flight control and precision racing.</small>
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
                  STEM Internship Program
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
                  <small>A career-boosting opportunity where students gain practical experience by working on real-world STEM projects under expert mentorship</small>
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
                  Technology Showcase &amp; Competitions
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
                  <small>Students demonstrate their innovations, participate in STEM competitions, and gain recognition for their creative skills.</small>
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
