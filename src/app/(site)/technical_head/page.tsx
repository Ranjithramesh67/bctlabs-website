import { asset } from "@/lib/site";

/** Port of `resources/views/frontend/sub_page/technical_head.blade.php`. */
export default function TechnicalHeadPage() {
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
            TECHNICAL HEAD
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
                  We are looking for an experienced and visionary Technical Head
                  – Robotics to lead the design, development, and implementation
                  of advanced robotics and automation solutions. This leadership
                  role will oversee technical strategy, mentor engineering teams,
                  and ensure the successful execution of R&D projects, training
                  frameworks, and product development initiatives in alignment
                  with organizational goals.
                </p>

                <ul className="py-3 px-lg-4 job_items">
                  <li>
                    <p className="text-black">
                      Define and lead the technical vision, architecture, and
                      roadmap for robotics projects and solutions
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Oversee the design, prototyping, and development of
                      robotic systems, integrating hardware and software
                      components
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Guide and mentor R&D teams, trainers, and engineers in the
                      development of robotics curriculum, training modules, and
                      products
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Ensure the implementation of industry best practices,
                      standards, and safety protocols in all robotics
                      initiatives
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Evaluate emerging technologies and tools in robotics, AI,
                      and automation, and drive innovation and continuous
                      improvement
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Review and approve technical documentation, test plans,
                      and deployment procedures for products and training
                      solutions
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Represent the organization in external technical forums,
                      industry conferences, and strategic partnerships
                    </p>
                  </li>
                </ul>

                <div
                  className="desc wow fadeInUp text-black"
                  data-wow-delay="300ms"
                  data-wow-duration="1500ms"
                >
                  <p className="mb-2 text-black">
                    <span className="text-primary">Location:</span> Hyderabad-
                    India | Employment Type: Full-Time
                  </p>
                  <p className="mb-2 text-black">
                    <span className="text-primary">Special Requirements:</span>{" "}
                    Strong leadership, project management, and team mentoring
                    skills | Ability to align technical work with educational
                    and commercial applications
                  </p>
                  <p className="mb-2 text-black">
                    <span className="text-primary">Qualification:</span>M.Tech,
                    B.E., B.Tech in Robotics, Mechatronics, EEE, ECE, CSE, or
                    related fields
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
