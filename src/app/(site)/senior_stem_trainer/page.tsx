import { asset } from "@/lib/site";

/** Port of `resources/views/frontend/sub_page/senior_stem_trainer.blade.php`. */
export default function SeniorStemTrainerPage() {
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
            SENIOR STEM TRAINER
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
                  We are seeking a passionate and experienced Senior STEM Trainer
                  to join our dynamic team. In this role, you will lead the
                  design and delivery of engaging, hands-on training programs in
                  Science, Technology, Engineering, and Mathematics (STEM), with
                  a strong focus on robotics and real-world STEM applications.
                  You will mentor learners, facilitate workshops, and drive
                  innovation through practical, project-based learning
                  experiences.
                </p>

                <ul className="py-3 px-lg-4 job_items">
                  <li>
                    <p className="text-black">
                      Deliver robotics curriculum content aligned with assigned
                      projects, organizational goals, and 21st-century STEM
                      learning outcomes.
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Design and facilitate interactive, hands-on robotics
                      training sessions, integrating concepts from mechanical,
                      electrical, and software engineering.
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Foster a collaborative and innovative learning environment
                      through robotics competitions, group challenges, and
                      peer-driven projects.
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Mentor and guide students in the design, development, and
                      troubleshooting of robotics projects, supporting practical
                      application of theoretical knowledge.
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Plan and lead workshops on robotics fundamentals,
                      including sensors, actuators, microcontrollers, and
                      control systems.
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Demonstrate and train students in the use of robotics
                      kits, tools, and platforms (e.g., Arduino, IoT, Raspberry
                      Pi, 3D Printing, Drone Technology) to build technical
                      proficiency.
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Conduct assessments and evaluations to measure learner
                      progress and performance; incorporate feedback to enhance
                      training materials and teaching strategies.
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Stay up to date with emerging technologies and trends in
                      robotics and STEM education to continuously improve
                      program delivery and content.
                    </p>
                  </li>
                </ul>

                <div
                  className="desc wow fadeInUp text-black"
                  data-wow-delay="300ms"
                  data-wow-duration="1500ms"
                >
                  <p className="mb-2 text-black">
                    <span className="text-primary">Location:</span> Salem,
                    Hyderabad- India | Employment Type: Full-Time
                  </p>
                  <p className="mb-2 text-black">
                    <span className="text-primary">Special Requirements:</span>
                    Marketing / Client Management / Sales / Digital Marketing /
                    Project management / Tele calling
                  </p>
                  <p className="mb-2 text-black">
                    <span className="text-primary">Qualification:</span>B.E.,
                    B.Tech, B.Sc (Electronics), M.Tech ( Preferred departments:
                    Mechanical, EEE, ECE, Mechatronics, CSE, AI & Data Science)
                  </p>
                  <p className="mb-2 text-black">
                    <span className="text-primary">Experience:</span>Proven
                    expertise in robotics systems, components, and programming
                    (e.g., Arduino, IoT, Raspberry Pi, 3D printing, Drone
                    Technology )| Familiarity with current trends in STEM
                    education and emerging robotics technologies
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
