import { SiteImage } from "@/components/frontend/site-image";
import { asset } from "@/lib/site";

export default function WhatWeDoPage() {
  return (
    <>
      <section
        className="banner__inner-page bg-image pt-50 pb-50 bg-image"
        data-background={asset("assets/frontend/images/banner/cover/whatwedo.jpeg")}
      >
        <div className="container banner">
          <h2 className="wow fadeInUp" data-wow-delay="00ms" data-wow-duration="1500ms">
            What We <span>Do</span>
          </h2>
        </div>
      </section>

      <section className="blog-area pt-30 pb-30 ">
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
              Building Tomorrow’s Innovators
            </h2>
          </div>
          <div className="row g-4">
            <div
              className="col-xl-4 col-md-6 wow fadeInUp"
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
                <div className="image rounded">
                  <SiteImage targetWidth={828} src={asset("assets/frontend/images/home/w1.png")} alt="image" />
                </div>
                <div className="blog__content  text-center pt-4 px-2">
                  <h4 className="mt-10 pb-15" style={{ fontWeight: "bold" }}>
                    <a href="/atal_tinkering_labs" className="primary-color">
                      ATAL Tinkering Labs
                    </a>
                  </h4>
                  <p>
                    We help schools establish and run Atal Tinkering Labs with complete support—setup, tools, training, and curriculum—creating a hands-on learning
                    environment that inspires students to explore and innovate
                  </p>
                  <div className="btn-two wwd d-none d-lg-inline-block mt-3">
                    <a href="/atal_tinkering_labs" className="btn-inner">
                      <span className="btn-text">Know More</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="col-xl-4 col-md-6 wow fadeInUp"
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
                <div className="image rounded">
                  <SiteImage targetWidth={828} src={asset("assets/frontend/images/home/w2.png")} alt="image" />
                </div>
                <div className="blog__content  text-center pt-4 px-2">
                  <h4 className="mt-10 pb-15 ">
                    <a href="stem_lab.php" className="primary-color">
                      STEM LAB
                    </a>
                  </h4>
                  <p>
                    Our STEM Lab is a vibrant space where students explore, build, and think creatively. With modern tools and expert guidance, it helps young innovators
                    turn ideas into real-world solutions and grow their passion for science a...
                  </p>
                  <div className="btn-two wwd d-none d-lg-inline-block mt-3">
                    <a href="/stem_labs" className="btn-inner">
                      <span className="btn-text">Know More</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="col-xl-4 col-md-6 wow fadeInUp"
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
                <div className="image rounded">
                  <SiteImage targetWidth={828} src={asset("assets/frontend/images/home/w3.JPG")} alt="image" />
                </div>
                <div className="blog__content  text-center pt-4 px-2">
                  <h4 className="mt-10 pb-15 ">
                    <a href="advanced_innovation_lab.php" className="primary-color">
                      Advanced Innovation Lab
                    </a>
                  </h4>
                  <p>
                    Our Advanced Innovation Lab is designed to empower college students with a professional environment for research, design, and product development.
                    Outfitted with industry-grade tools and cutting-edge...
                    {/* technology, the lab enables students to turn innovative ideas into functional prototypes—effectively bridging the gap between academic learning and real-world application. */}
                  </p>
                  <div className="btn-two wwd d-none d-lg-inline-block mt-3">
                    <a href="/advanced_innovation_lab" className="btn-inner">
                      <span className="btn-text">Know More</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="col-xl-4 col-md-6 wow fadeInUp"
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
                <div className="image rounded">
                  <SiteImage targetWidth={828} src={asset("assets/frontend/images/home/w4.png")} alt="image" />
                </div>
                <div className="blog__content  text-center pt-4 px-2">
                  <h4 className="mt-10 pb-15 ">
                    <a href="csr_stem_solutions.php" className="primary-color">
                      CSR STEM Solutions
                    </a>
                  </h4>
                  <p>
                    We believe every student deserves the chance to explore and excel in STEM. Our CSR STEM Solutions focus on delivering inclusive, high-quality
                    education by offering hands-on learning, modern tools, and expert guidance. By reaching students from all walks of life, we help unlock potential, spark...
                    {/* innovation, and build a future driven by knowledge and opportunity. */}
                  </p>
                  <div className="btn-two wwd d-none d-lg-inline-block mt-3">
                    <a href="/csr_stem_solutions" className="btn-inner">
                      <span className="btn-text">Know More</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="col-xl-4 col-md-6 wow fadeInUp"
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
                <div className="image rounded">
                  <SiteImage targetWidth={828} src={asset("assets/frontend/images/home/w5.png")} alt="image" />
                </div>
                <div className="blog__content  text-center pt-4 px-2">
                  <h4 className="mt-10 pb-15 ">
                    <a href="stem_learning_programs.php" className="primary-color">
                      STEM Learning Programs
                    </a>
                  </h4>
                  <p>
                    Our STEM Learning Programs are designed for curious minds eager to dive into the world of technology. Offered in both online and offline formats,
                    these immersive, long-term courses provide practical, hands-on experience across diverse tech fields. Learners gain real-world skills, foster innovation...
                    {/* , and prepare to thrive in today’s fast-evolving technological landscape. */}
                  </p>
                  <div className="btn-two wwd d-none d-lg-inline-block mt-3">
                    <a href="/stem_learning_programs" className="btn-inner">
                      <span className="btn-text">Know More</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="col-xl-4 col-md-6 wow fadeInUp"
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
                <div className="image rounded">
                  <SiteImage targetWidth={828} src={asset("assets/frontend/images/home/w6.png")} alt="image" />
                </div>
                <div className="blog__content  text-center pt-4 px-2">
                  <h4 className="mt-10 pb-15 ">
                    <a href="stem_workshops.php" className="primary-color">
                      STEM Workshops
                    </a>
                  </h4>
                  <p>
                    Fuel curiosity and creativity through hands-on experiences in AI, robotics, IoT, drones, aeromodelling, and app development. Designed for future tech
                    leaders, our workshops turn learning into innovationwhere students build, code, and create real-world solutions beyond the textbook.
                  </p>
                  <div className="btn-two wwd d-none d-lg-inline-block mt-3">
                    <a href="/stem_workshops" className="btn-inner">
                      <span className="btn-text">Know More</span>
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
