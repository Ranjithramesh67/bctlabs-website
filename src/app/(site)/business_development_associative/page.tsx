import { asset } from "@/lib/site";

/** Port of `resources/views/frontend/sub_page/business_development_associative.blade.php`. */
export default function BusinessDevelopmentAssociativePage() {
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
            Business Development Associative
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
                  We are seeking a proactive and results-driven Business
                  Development Associate to support our growth in the robotics
                  and STEM education sector. This role involves identifying new
                  business opportunities, building client relationships, and
                  promoting our training programs, workshops, and robotics
                  products to educational institutions, training centers, and
                  corporate partners. You will play a key role in expanding our
                  market presence and driving strategic partnerships.
                </p>

                <ul className="py-3 px-lg-4 job_items">
                  <li>
                    <p className="text-black">
                      Identify and pursue new business opportunities in schools,
                      colleges, and corporate sectors for robotics/STEM training
                      programs
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Develop and maintain strong client relationships, ensuring
                      regular communication and engagement.
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Promote and present our robotics kits, training modules,
                      workshops, and educational solutions to potential clients.
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Conduct market research and competitor analysis to identify
                      trends and new sales strategies
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Collaborate with the marketing team to develop sales
                      presentations, proposals, and promotional campaigns
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Support end-to-end sales processes including lead
                      generation, negotiation, closing, and onboarding
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      Participate in exhibitions, tech fairs, and educational
                      events to showcase our offerings
                    </p>
                  </li>
                  <li>
                    <p className="text-black">
                      {" "}
                      Provide regular updates and reports on sales pipeline,
                      client feedback, and market performance
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
                    Marketing / Client Management / Sales / Digital Marketing /
                    Project management / Tele calling
                  </p>
                  <p className="mb-2 text-black">
                    <span className="text-primary">Qualification:</span>
                    Bachelor’s degree in Business Administration, Marketing,
                    Engineering, or related fields, MBA is a plus
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
