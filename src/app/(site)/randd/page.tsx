import { asset } from "@/lib/site";

/** Port of `resources/views/frontend/sub_page/randd.blade.php`. */
export default function RanddPage() {
  return (
    <>
      <section
        className="banner__inner-page bg-image pt-50 pb-50 bg-image"
        data-background={asset("assets/frontend/images/banner/banner-inner-page.jpg")}
      >
        <div className="container banner">
          <h2
            className="wow fadeInUp"
            data-wow-delay="00ms"
            data-wow-duration="1500ms"
          >
            R&D ASSOCIATE
          </h2>
        </div>
      </section>

      {/* Blog area start here */}
      <section className="blog-area pt-30 pb-30">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="section-header">
                <div className="mt-20">
                  <h4
                    className="wow fadeInUp"
                    data-wow-delay="00ms"
                    data-wow-duration="1500ms"
                  >
                    Job Description:
                  </h4>
                </div>

                <p
                  className="wow fadeInUp text-black"
                  data-wow-delay="300ms"
                  data-wow-duration="1500ms"
                >
                  We are seeking a motivated and technically skilled R&D
                  Associate – Robotics to support research, development, and
                  innovation initiatives in robotics and automation. This role
                  involves designing prototypes, testing hardware/software
                  integrations, and contributing to the development of
                  cutting-edge robotic systems. You will work closely with
                  cross-functional teams to develop and optimize solutions for
                  educational, industrial, or commercial applications.
                </p>

                <ul className="py-3 px-lg-4 job_items">
                  <li>
                    <p className="text-black">
                      Assist in the design, development, and prototyping of
                      robotic systems, components, and automation solutions
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Conduct research and feasibility analysis on new robotics
                      technologies, sensors, control systems, and software
                      platforms
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Develop and test embedded systems and firmware using
                      platforms like Arduino, IoT, Raspberry Pi, or similar
                      microcontrollers
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Support the creation of technical documentation, including
                      design specifications, test plans, and user manuals
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Collaborate with trainers and engineers to integrate R&D
                      outputs into STEM curriculum and training kits
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Participate in field testing and iterative development,
                      refining robotic systems based on performance metrics and
                      feedback
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Contribute to innovation and product improvement
                      initiatives aligned with educational and industry
                      standards
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Ensure compliance with safety, quality, and performance
                      standards during all stages of development
                    </p>
                  </li>
                </ul>

                <div
                  className="desc wow fadeInUp text-black"
                  data-wow-delay="300ms"
                  data-wow-duration="1500ms"
                >
                  <p className="mb-2 text-black">
                    <span className="text-primary">Location:</span> Chennai,
                    Hyderabad- India | Employment Type: Full-Time
                  </p>
                  <p className="mb-2 text-black">
                    <span className="text-primary">Special Requirements:</span>
                    Ability to work independently and collaboratively in a
                    fast-paced R&D environment | Analytical and problem-solving
                    skills with a strong attention to detail | Willingness to
                    travel occasionally for deployments or collaborative
                    projects
                  </p>
                  <p className="mb-2 text-black">
                    <span className="text-primary">Qualification:</span>B.E.,
                    B.Tech, M.Tech ( Preferred departments: EEE, ECE,
                    Mechatronics, AI & Data Science)
                  </p>
                </div>

                <div className="btn-two d-none d-lg-inline-block mt-3">
                  {/* Apply Now Button */}
                  <a
                    href="#"
                    className="btn-inner"
                    data-bs-toggle="modal"
                    data-bs-target="#careerModal"
                  >
                    <span className="btn-text">Apply Now</span>
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="mt-20">
                <h3
                  className="wow fadeInUp"
                  data-wow-delay="00ms"
                  data-wow-duration="1500ms"
                >
                  Job Information:
                </h3>
              </div>

              <div className="mt-4">
                <p className="text-black">
                  <b>Country</b>
                </p>
                <h6
                  className="wow fadeInUp"
                  data-wow-delay="200ms"
                  data-wow-duration="1500ms"
                >
                  India
                </h6>
              </div>

              <div className="mt-3">
                <p className="text-black">
                  <b>Industry</b>
                </p>
                <h6
                  className="wow fadeInUp"
                  data-wow-delay="300ms"
                  data-wow-duration="1500ms"
                >
                  Technology
                </h6>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
