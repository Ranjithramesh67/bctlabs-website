import { asset } from "@/lib/site";

/** Port of `resources/views/frontend/sub_page/internship_trainee.blade.php`. */
export default function InternshipTraineePage() {
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
            INTERNSHIP TRAINEE
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
                  We are looking for enthusiastic and curious-minded Robotics
                  Internship Trainees to join our team and gain practical
                  experience in robotics, embedded systems, and STEM education.
                  This internship offers hands-on learning through real-world
                  projects, workshops, and collaboration with experienced
                  trainers and engineers. It’s an excellent opportunity for
                  individuals looking to kickstart their career in the robotics
                  and automation domain.
                </p>

                <ul className="py-3 px-lg-4 job_items">
                  <li>
                    <p className="text-black">
                      Assist in the assembly, testing, and debugging of robotic
                      systems and components
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Support the development and delivery of STEM-based training
                      sessions and workshops
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Participate in building and programming simple robotic
                      projects using platforms like Arduino or Raspberry Pi
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Collaborate with the R&D team in creating training kits,
                      project documentation, and technical reports
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Help set up and manage tools, lab equipment, and materials
                      for practical sessions
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Learn and apply basic concepts of electronics, sensors,
                      actuators, and microcontrollers
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Observe and contribute to train-the-trainer sessions,
                      competitions, or student events as part of the training
                      team
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Complete assigned project work and present findings at the
                      end of the internship
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
                    salem, Ranipet, Hyderabad-India | Employment Type: Full-Time
                    / Part time
                  </p>
                  <p className="mb-2 text-black">
                    <span className="text-primary">Special Requirements:</span>
                    Strong willingness to learn and work in a hands-on
                    environment | Good team collaboration and communication
                    skills
                  </p>
                  <p className="mb-2 text-black">
                    <span className="text-primary">Qualification:</span>
                    Pursuing or recently completed diploma/B.E./B.Tech/B.Sc in
                    Electronics, Mechatronics, ECE, EEE, CSE, Mechanical, or
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
