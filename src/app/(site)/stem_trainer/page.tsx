import { asset } from "@/lib/site";

/** Port of `resources/views/frontend/sub_page/stem_trainer.blade.php`. */
export default function StemTrainerPage() {
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
            STEM Trainer
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
                  We are looking for an enthusiastic and knowledgeable STEM
                  Trainer to join our team and inspire the next generation of
                  innovators. In this role, you will design and deliver
                  engaging, hands-on training in Science, Technology,
                  Engineering, and Mathematics to students, educators, or
                  professionals. You’ll play a key part in fostering curiosity,
                  creativity, and problem-solving skills through dynamic
                  workshops, coding sessions, robotics, and real-world STEM
                  applications.
                </p>

                <ul className="py-3 px-lg-4 job_items">
                  <li>
                    <p className="text-black">
                      Deliver robotics curriculum content aligned with assigned
                      projects and learning agendas, ensuring alignment with
                      organizational objectives and STEM learning outcomes.
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Design and conduct interactive, hands-on robotics training
                      sessions, incorporating mechanical, electrical, and
                      programming concepts tailored to varied learning styles
                      and technical levels.
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Foster a collaborative and innovative student community
                      through robotics competitions, team challenges, and
                      peer-driven learning projects.
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Provide mentorship and technical guidance to students
                      during their robotics projects, helping them apply
                      theoretical knowledge to real-world applications.
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Organize and lead workshops focused on robotics
                      fundamentals (e.g., sensors, actuators, microcontrollers),
                      enhancing students’ technical skills and
                      industry-readiness.
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Demonstrate robotics kits, tools, and programming
                      platforms (such as Arduino, Raspberry Pi, Python, or ROS),
                      enabling students to gain hands-on proficiency in relevant
                      technologies.
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Assess student performance through quizzes, practical
                      tests, and project evaluations; use feedback data to
                      improve course materials and instructional strategies.
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Engage in continuous professional development by learning
                      emerging robotics technologies and integrating them into
                      the curriculum to maintain an up-to-date training
                      ecosystem.
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
                    Salem, Ranipet, Hyderabad- India | Employment Type:
                    Full-Time
                  </p>
                  <p className="mb-2 text-black">
                    <span className="text-primary">Special Requirements:</span>
                    Strong classroom management skills | Effective public
                    speaking and student engagement skills |Arduino knowledge is
                    an added advantage
                  </p>
                  <p className="mb-2 text-black">
                    <span className="text-primary">Qualification:</span>B.E,
                    B.Tech, B.Sc Electronics, M.Tech (Preferred departments:
                    Mechanical, EEE, ECE, Mechatronics, CSE, AI &Data Science)
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
