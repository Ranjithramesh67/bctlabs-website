import { SiteImage } from "@/components/frontend/site-image";
import { asset } from "@/lib/site";

export default function WhoWeArePage() {
  return (
    <>
      <section
        className="banner__inner-page bg-image pt-50 pb-50 bg-image"
        data-background={asset("assets/frontend/images/banner/about_banner.png")}
      >
        <div className="overlay"></div> {/* Overlay added */}
        <div className="container banner">
          <div className="breadcrumb-list wow fadeInUp" data-wow-delay="200ms" data-wow-duration="1500ms">
            <h6 className="text-white normal">About Us</h6>
          </div>
          <h2 className="wow fadeInUp" data-wow-delay="00ms" data-wow-duration="1500ms">
            Who We <span>Are</span>
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
                  WELCOME TO BCTLABS
                </h2>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="section-header mb-20">
                <p
                  className="wow fadeInUp text-black text-justify pr-30 pr-sm-0 mt-3"
                  data-wow-delay="400ms"
                  data-wow-duration="1500ms"
                  style={{
                    visibility: "visible",
                    animationDuration: "1500ms",
                    animationDelay: "400ms",
                    animationName: "fadeInUp",
                  }}
                >
                  Founded in 2013, BCTLABS has been at the forefront of revolutionizing education through hands-on, practical learning in Science, Technology,
                  Engineering, and Mathematics (STEM). We believe that the future belongs to creators, thinkers, and problem-solvers—and it is our mission to nurture
                  these qualities in every student.
                </p>
                <p
                  className="wow fadeInUp text-black text-justify pr-30 pr-sm-0 mt-3"
                  data-wow-delay="400ms"
                  data-wow-duration="1500ms"
                  style={{
                    visibility: "visible",
                    animationDuration: "1500ms",
                    animationDelay: "400ms",
                    animationName: "fadeInUp",
                  }}
                >
                  Our state-of-the-art STEM Labs are purposefully designed to bridge the gap between classroom theory and real-world application. Through immersive
                  learning experiences, students engage directly with cutting-edge technologies like robotics, 3D printing, and automation, gaining not just knowledge—
                  but the skills and confidence to apply it.
                </p>
                <p
                  className="wow fadeInUp text-black text-justify pr-30 pr-sm-0 mt-3"
                  data-wow-delay="400ms"
                  data-wow-duration="1500ms"
                  style={{
                    visibility: "visible",
                    animationDuration: "1500ms",
                    animationDelay: "400ms",
                    animationName: "fadeInUp",
                  }}
                >
                  At BCTLABS, we don’t just teach concepts—we cultivate curiosity, spark creativity, and develop critical problem-solving abilities that prepare students
                  to lead and innovate in a rapidly evolving world. Over the years, we’ve empowered thousands of young minds to think beyond textbooks and explore
                  learning through experimentation, collaboration, and innovation.
                </p>
                <p
                  className="wow fadeInUp text-black text-justify pr-30 pr-sm-0 mt-3"
                  data-wow-delay="400ms"
                  data-wow-duration="1500ms"
                  style={{
                    visibility: "visible",
                    animationDuration: "1500ms",
                    animationDelay: "400ms",
                    animationName: "fadeInUp",
                  }}
                >
                  Whether building robots, designing prototypes, or programming systems, students in our STEM Labs gain a future-ready education that equips them for
                  both academic excellence and global opportunities.
                </p>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-6 wow fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
                <SiteImage targetWidth={828} src={asset("assets/frontend/images/about.png")} width="100%" alt="image" />
              </div>

              <div className="col-lg-6 wow fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
                <SiteImage targetWidth={828} src={asset("assets/frontend/images/about2.jpg")} width="100%" alt="image" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="counter-area pt-30 pb-30 bg_primary">
        <div className="container">
          <div className="text-center pb-30">
            <h2 className="text-white">Our Mission &amp; Vision</h2>
          </div>
          <div className="row">
            <div className="col-lg-6">
              <div className=" mb-20 card mvision p-4">
                <h2 className="wow fadeInUp" data-wow-delay="200ms" data-wow-duration="1500ms">
                  Our Mission
                </h2>

                <p
                  className="wow fadeInUp mt-2 text-justify"
                  data-wow-delay="400ms"
                  data-wow-duration="1500ms"
                  style={{
                    visibility: "visible",
                    animationDuration: "1500ms",
                    animationDelay: "400ms",
                    animationName: "fadeInUp",
                  }}
                >
                  We bridge the gap between theory and technology-driven practice.
                  Our programs turn classroom knowledge into real-world tech skills.
                  We prepare students to innovate, build, and thrive in a tech-first future.
                </p>
              </div>
            </div>
            <div className="col-lg-6 mt-sm-10">
              <div className=" mb-20 card mvision p-4">
                <h2 className="wow fadeInUp" data-wow-delay="200ms" data-wow-duration="1500ms">
                  Our Vision
                </h2>

                <p
                  className="wow fadeInUp mt-2 text-justify"
                  data-wow-delay="400ms"
                  data-wow-duration="1500ms"
                  style={{
                    visibility: "visible",
                    animationDuration: "1500ms",
                    animationDelay: "400ms",
                    animationName: "fadeInUp",
                  }}
                >
                  Our vision is to equip young minds with essential 21st-century skills through immersive STEM learning.
                  By combining hands-on technology, creativity, and critical thinking, we make education future-ready.
                  We aim to nurture innovators, problem-solvers, and tech leaders of tomorrow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About area start here */}
      <section className="about-area pt-30 pb-30">
        <div className="container">
          <div className="row g-2">
            <div className="col-lg-12 text-center">
              <div className="section-header mb-20">
                <h2 className="wow fadeInUp" data-wow-delay="00ms" data-wow-duration="1500ms">
                  Accreditation
                </h2>
              </div>
            </div>

            <div className="col-lg-6 wow fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
              <div className="">
                <div className="image">
                  <SiteImage targetWidth={828} src={asset("assets/frontend/images/home/cert1.png")} width="100%" alt="image" />
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="section- mb-20">
                <p className="wow fadeInUp text-black text-justify pr-30 pr-sm-0 mt-4" data-wow-delay="400ms" data-wow-duration="1500ms">
                  BCTLABS STEM Academy is accredited by STEM.org, the global leader in STEM education credentialing. This recognition confirms our commitment to high-quality, innovative, and hands-on learning. Partnering with us boosts your school’s credibility, strengthens its reputation, and ensures students receive future-ready skills through world-class STEM programs that meet international standards of excellence and educational impact. Our accreditation also provides measurable benchmarks, assuring parents and stakeholders of a reliable, results-driven education model. Schools that collaborate with us gain access to structured curricula, expert training, and advanced teaching tools that enhance both teacher effectiveness and student engagement. With this global recognition, BCTLABS empowers institutions to become pioneers in STEM education within their region.
                </p>
                <div className="btn-two d-none d-lg-inline-block mt-4"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* About area end here */}

      <section className="blog-area pt-30 pb-30 bg-prime-light">
        <div className="container">
          <div className="section-header mb-40 text-center">
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
              MOU&apos;s and Colloborations
            </h2>
          </div>
          <div className="row g-4">
            <div
              className="col-xl-4 col-md-6 col-sm-12 wow fadeInUp"
              data-wow-delay="00ms"
              data-wow-duration="1500ms"
              style={{
                visibility: "visible",
                animationDuration: "1500ms",
                animationDelay: "0ms",
                animationName: "fadeInUp",
              }}
            >
              <div className="blog__item bg-white rounded card px-3 pt-3 pb-5">
                <div className="text-center rounded">
                  <SiteImage targetWidth={828} src={asset("assets/frontend/images/about/NIT.png")} width="40%" alt="image" />
                </div>
                <div className="blog__content  text-center pt-4 px-2">
                  <p>
                    At BCTLABS STEM Academy, we take pride in our strong industry and academic collaborations that enhance our offerings. We have a Memorandum of
                    Understanding (MoU) with the Siemens Center of Excellence in Manufacturing at NIT Trichy, enabling access to advanced technologies and expertise.
                  </p>
                  <div className="btn-two wwd d-none d-lg-inline-block mt-3"></div>
                </div>
              </div>
            </div>

            <div
              className="col-xl-4 col-md-6 col-sm-12 wow fadeInUp"
              data-wow-delay="00ms"
              data-wow-duration="1500ms"
              style={{
                visibility: "visible",
                animationDuration: "1500ms",
                animationDelay: "0ms",
                animationName: "fadeInUp",
              }}
            >
              <div className="blog__item bg-white rounded card px-3 pt-3 pb-5">
                <div className="text-center rounded">
                  <SiteImage targetWidth={828} src={asset("assets/frontend/images/about/STEMPEDIA.png")} width="40%" alt="image" />
                </div>
                <div className="blog__content  text-center pt-4 px-2">
                  <p>
                    At BCTLABS STEM Academy, we collaborate with renowned organizations like STEMPedia and various other leading companies to bring the latest innovations and resources to our STEM programs. These partnerships strengthen our curriculum, provide unique opportunities for students, and ensure we remain at the forefront of STEM education and development.
                  </p>
                  <div className="btn-two wwd d-none d-lg-inline-block mt-3"></div>
                </div>
              </div>
            </div>

            <div
              className="col-xl-4 col-md-6 col-sm-12 wow fadeInUp"
              data-wow-delay="00ms"
              data-wow-duration="1500ms"
              style={{
                visibility: "visible",
                animationDuration: "1500ms",
                animationDelay: "0ms",
                animationName: "fadeInUp",
              }}
            >
              <div className="blog__item bg-white rounded card px-3 pt-3 pb-5">
                <div className="text-center rounded pt-85 pb-25">
                  <SiteImage targetWidth={828} src={asset("assets/frontend/images/about/CODEAVOUR.png")} width="40%" alt="image" />
                </div>
                <div className="blog__content  text-center pt-4 px-2">
                  <p>
                    At BCTLABS STEM Academy, we are proud to partner with STEMPedia&apos;s Codeavour International Competition. As the regional partner for Chennai since 2020, we provide students with a platform to showcase their skills in AI, coding, and robotics, inspiring innovation and fostering global recognition in STEM.
                  </p>
                  <div className="btn-two wwd d-none d-lg-inline-block mt-3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="counter-area bg-white  pt-20 pb-20 sub-bg">
        {/* Brand area start here */}
        <div className="brand-area wow fadeInDown" data-wow-delay="200ms" data-wow-duration="1500ms">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-4 col-md-12">
                <div className="vline">
                  <h3
                    className="wow fadeInUp"
                    data-wow-delay="200ms"
                    data-wow-duration="1500ms"
                    style={{
                      visibility: "visible",
                      animationDuration: "1500ms",
                      animationDelay: "200ms",
                      animationName: "fadeInUp",
                      fontSize: "30px",
                    }}
                  >
                    Our Esteemed Clients
                    and Partners
                  </h3>
                </div>
              </div>
              <div className="col-lg-8 col-md-12">
                <div className="swiper brand__slider p-4">
                  <div className="swiper-wrapper clients">
                    <div className="swiper-slide">
                      <div className="image">
                        <SiteImage targetWidth={828} src={asset("assets/frontend/images/home/c1.png")} alt="image" />
                      </div>
                    </div>
                    <div className="swiper-slide">
                      <div className="image">
                        <SiteImage targetWidth={828} src={asset("assets/frontend/images/home/c2.png")} alt="image" />
                      </div>
                    </div>
                    <div className="swiper-slide">
                      <div className="image">
                        <SiteImage targetWidth={828} src={asset("assets/frontend/images/home/c3.png")} alt="image" />
                      </div>
                    </div>
                    <div className="swiper-slide">
                      <div className="image">
                        <SiteImage targetWidth={828} src={asset("assets/frontend/images/home/c4.png")} alt="image" />
                      </div>
                    </div>
                    <div className="swiper-slide">
                      <div className="image">
                        <SiteImage targetWidth={828} src={asset("assets/frontend/images/home/c5.png")} alt="image" />
                      </div>
                    </div>
                  </div>
                </div>
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
                    <a href={asset("assets/frontend/pdf/brochure.pdf")} download className="btn-inner">
                      <span className="btn-text">Brochure</span>
                    </a>
                  </div>
                  <div className="btn-two d-lg-inline-block">
                    <a href={asset("assets/frontend/pdf/achievement.pdf")} download className="btn-inner">
                      <span className="btn-text">Achievement</span>
                    </a>
                  </div>
                  <div className="btn-two d-lg-inline-block">
                    <a href={asset("assets/frontend/pdf/proposal.pdf")} download className="btn-inner">
                      <span className="btn-text">Proposal</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Brand area end here */}
    </>
  );
}
