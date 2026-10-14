import { SiteImage } from "@/components/frontend/site-image";
import { asset } from "@/lib/site";

export default function OurTeamPage() {
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
            Our <span>Teams</span>
          </h2>
        </div>
      </section>

      <section className="counter-area pt-30 pb-30">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center pb-20">
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
                  Meet Our Core Team
                </h2>
                <p>
                  Missioned with a Vision, the newly amalgamated Core Team is very dynamic, diverse, directional, dedicated and determined in translating new world ideas into action, driven by an intrinsic motivating factor of being a catalyst in architecting the 21st century world.
                </p>
              </div>
            </div>
            <div className="col-lg-6 py-2">
              <div className="section-header team_card text-justify card p-4">
                <div className="d-flex gap-2 align-items-start mob_team_card">
                  <div>
                    <SiteImage targetWidth={828} src={asset("assets/frontend/images/home/devaraj1.png")} alt="image" width="200px" height="250px" className="" />
                  </div>
                  <div>
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
                      Mr. Devaraj Natrajan
                    </h4>

                    <p className="mt-0" style={{ fontSize: "0.9rem" }}>
                      <small>Founder cum Director</small>
                    </p>
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
                      <small>With passion of&nbsp;‘creating young minds’&nbsp;Devaraj is graduated in BE (CSC). He Has over 4 years of experience as a STEM Educator</small>
                    </p>

                    <div className="socials d-flex gap-2 mt-3 justify-content-baseline">
                      <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
                        <i className="fa-brands fa-facebook-f"></i>
                      </a>
                      <a href="https://instagram.com/" target="_blank" rel="noreferrer">
                        <i className="fa-brands fa-instagram"></i>
                      </a>
                      <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
                        <i className="fa-brands fa-linkedin"></i>
                      </a>
                    </div>
                  </div>
                </div>
                <div> </div>
              </div>
            </div>

            <div className="col-lg-6 py-2">
              <div className="section-header team_card text-justify card p-4">
                <div className="d-flex gap-2 align-items-start mob_team_card">
                  <div>
                    <SiteImage targetWidth={828} src={asset("assets/frontend/images/home/dinesh.png")} alt="image" width="200px" height="250px" className="" />
                  </div>
                  <div>
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
                      Mr. Dinesh Raju
                    </h4>
                    <p className="mt-0" style={{ fontSize: "0.9rem" }}>
                      <small>Founder cum Director</small>
                    </p>

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
                      <small>Founder cum Director– With passion of ‘Making our younger generation to Lead the Future’ Devaraj is graduated in BE</small>
                    </p>

                    <div className="socials d-flex gap-2 mt-3 justify-content-baseline">
                      <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
                        <i className="fa-brands fa-facebook-f"></i>
                      </a>
                      <a href="https://instagram.com/" target="_blank" rel="noreferrer">
                        <i className="fa-brands fa-instagram"></i>
                      </a>
                      <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
                        <i className="fa-brands fa-linkedin"></i>
                      </a>
                    </div>
                  </div>
                </div>
                <div> </div>
              </div>
            </div>

            <div className="col-lg-6 py-2">
              <div className="section-header team_card text-justify card p-4">
                <div className="d-flex gap-2 align-items-start mob_team_card">
                  <div>
                    <SiteImage targetWidth={828} src={asset("assets/frontend/images/home/anbazhagan.png")} alt="image" width="200px" height="250px" className="" />
                  </div>
                  <div>
                    <h4
                      className="wow fadeInUp"
                      data-wow-delay="200ms"
                      data-wow-duration="1500ms"
                      style={{
                        visibility: "hidden",
                        animationDuration: "1500ms",
                        animationDelay: "200ms",
                        animationName: "none",
                      }}
                    >
                      Mr. Anbazhagan Selvaraj
                    </h4>
                    <p className="mt-0" style={{ fontSize: "0.9rem" }}>
                      <small>Executive Director</small>
                    </p>

                    <p
                      className="wow fadeInUp mt-2"
                      data-wow-delay="400ms"
                      data-wow-duration="1500ms"
                      style={{
                        visibility: "hidden",
                        animationDuration: "1500ms",
                        animationDelay: "400ms",
                        animationName: "none",
                      }}
                    >
                      <small>Executive Director– With passion of ‘Exploring new technologies’ Anbazhagan is graduated in BE. He Has over 4 years of experience</small>
                    </p>
                    <div className="socials d-flex gap-2 mt-3 justify-content-baseline">
                      <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
                        <i className="fa-brands fa-facebook-f"></i>
                      </a>
                      <a href="https://instagram.com/" target="_blank" rel="noreferrer">
                        <i className="fa-brands fa-instagram"></i>
                      </a>
                      <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
                        <i className="fa-brands fa-linkedin"></i>
                      </a>
                    </div>
                  </div>
                </div>
                <div> </div>
              </div>
            </div>

            <div className="col-lg-6 py-2">
              <div className="section-header team_card text-justify card p-4">
                <div className="d-flex gap-2 align-items-start mob_team_card">
                  <div>
                    <SiteImage targetWidth={828} src={asset("assets/frontend/images/home/dhivya.png")} alt="image" width="200px" height="250px" className="" />
                  </div>
                  <div>
                    <h4
                      className="wow fadeInUp"
                      data-wow-delay="200ms"
                      data-wow-duration="1500ms"
                      style={{
                        visibility: "hidden",
                        animationDuration: "1500ms",
                        animationDelay: "200ms",
                        animationName: "none",
                      }}
                    >
                      Ms. Divya Bharathi
                    </h4>
                    <p className="mt-0" style={{ fontSize: "0.9rem" }}>
                      <small>CEO</small>
                    </p>

                    <p
                      className="wow fadeInUp mt-2"
                      data-wow-delay="400ms"
                      data-wow-duration="1500ms"
                      style={{
                        visibility: "hidden",
                        animationDuration: "1500ms",
                        animationDelay: "400ms",
                        animationName: "none",
                      }}
                    >
                      <small>CEO (Chief Executive Officer)– With passion ‘to inspire and educate young girls and boys to learn to code and develop real-</small>
                    </p>
                    <div className="socials d-flex gap-2 mt-3 justify-content-baseline">
                      <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
                        <i className="fa-brands fa-facebook-f"></i>
                      </a>
                      <a href="https://instagram.com/" target="_blank" rel="noreferrer">
                        <i className="fa-brands fa-instagram"></i>
                      </a>
                      <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
                        <i className="fa-brands fa-linkedin"></i>
                      </a>
                    </div>
                  </div>
                </div>
                <div> </div>
              </div>
            </div>

            <div className="col-lg-6 py-2">
              <div className="section-header team_card text-justify card p-4">
                <div className="d-flex gap-2 align-items-start mob_team_card">
                  <div>
                    <SiteImage targetWidth={828} src={asset("assets/frontend/images/home/hariharasudhan.png")} alt="image" width="200px" height="250px" className="" />
                  </div>
                  <div>
                    <h4
                      className="wow fadeInUp"
                      data-wow-delay="200ms"
                      data-wow-duration="1500ms"
                      style={{
                        visibility: "hidden",
                        animationDuration: "1500ms",
                        animationDelay: "200ms",
                        animationName: "none",
                      }}
                    >
                      Mr. Hariharasudhan
                    </h4>
                    <p className="mt-0" style={{ fontSize: "0.9rem" }}>
                      <small>R&amp;D Executive Director</small>
                    </p>

                    <p
                      className="wow fadeInUp mt-2"
                      data-wow-delay="400ms"
                      data-wow-duration="1500ms"
                      style={{
                        visibility: "hidden",
                        animationDuration: "1500ms",
                        animationDelay: "400ms",
                        animationName: "none",
                      }}
                    >
                      <small>As R&amp;D Executive Director at BCTLABS STEM Academy, Mr.Hariharasudhan drives innovative research and development strategies, ensuring the creation of groundbreaking solutions that shape our future.</small>
                    </p>
                    <div className="socials d-flex gap-2 mt-3 justify-content-baseline">
                      <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
                        <i className="fa-brands fa-facebook-f"></i>
                      </a>
                      <a href="https://instagram.com/" target="_blank" rel="noreferrer">
                        <i className="fa-brands fa-instagram"></i>
                      </a>
                      <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
                        <i className="fa-brands fa-linkedin"></i>
                      </a>
                    </div>
                  </div>
                </div>
                <div> </div>
              </div>
            </div>

            <div className="col-lg-6 py-2">
              <div className="section-header team_card text-justify card p-4">
                <div className="d-flex gap-2 align-items-start mob_team_card">
                  <div>
                    <SiteImage targetWidth={828} src={asset("assets/frontend/images/home/dhanasekharan.png")} alt="image" width="200px" height="250px" className="" />
                  </div>
                  <div>
                    <h4
                      className="wow fadeInUp"
                      data-wow-delay="200ms"
                      data-wow-duration="1500ms"
                      style={{
                        visibility: "hidden",
                        animationDuration: "1500ms",
                        animationDelay: "200ms",
                        animationName: "none",
                      }}
                    >
                      Mr. Dhanasekharan Srinivasan
                    </h4>
                    <p className="mt-0" style={{ fontSize: "1rem" }}>
                      <small>Business Development Manager</small>
                    </p>

                    <p
                      className="wow fadeInUp mt-2"
                      data-wow-delay="400ms"
                      data-wow-duration="1500ms"
                      style={{
                        visibility: "hidden",
                        animationDuration: "1500ms",
                        animationDelay: "400ms",
                        animationName: "none",
                      }}
                    >
                      <small>With passion of ‘Building the client needs’ Dhanasekaran is graduated in Business Management. He Has over 4 years of experience as a Business Development Management of BCTLABS STEM Academy.  His strategic planning, sales management, and prospecting for new clients helped to grow our organization.</small>
                    </p>
                    <div className="socials d-flex gap-2 mt-3 justify-content-baseline">
                      <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
                        <i className="fa-brands fa-facebook-f"></i>
                      </a>
                      <a href="https://instagram.com/" target="_blank" rel="noreferrer">
                        <i className="fa-brands fa-instagram"></i>
                      </a>
                      <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
                        <i className="fa-brands fa-linkedin"></i>
                      </a>
                    </div>
                  </div>
                </div>
                <div> </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
@media(max-width:600px)
{
    .teams .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 10px;
}
}
    .teams .grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 10px;
}
`}</style>

      <section className="blog-area pt-30 pb-30">
        <div className="container">
          <div className="section-header mb-60 text-center">
            <h2 className="wow fadeInUp" data-wow-delay="00ms" data-wow-duration="1500ms">
              Our Teams
            </h2>
          </div>
          <div className="row">
            <div className="col-lg-12 teams">
              <div className="grid">
                <div className="card wow fadeInUp" data-wow-delay="00ms" data-wow-duration="1500ms">
                  <div className="blog__item bg-white card rounded">
                    <div className="image p-3">
                      <SiteImage targetWidth={828} className="rounded" width="100%" height="auto" src={asset("assets/frontend/images/home/sangeetha.jpg")} alt="image" />
                    </div>
                    <div className="blog__content p-0  text-center">
                      <h4>
                        <small>Mrs. Sangeetha</small>
                      </h4>

                      <p
                        className="wow fadeInUp text-black text-center"
                        data-wow-delay="400ms"
                        data-wow-duration="1500ms"
                        style={{
                          visibility: "visible",
                          animationDuration: "1500ms",
                          animationDelay: "400ms",
                          animationName: "fadeInUp",
                          fontSize: "14px",
                        }}
                      >
                        <b className="text-black">Human Resource Manager</b>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card wow fadeInUp" data-wow-delay="00ms" data-wow-duration="1500ms">
                  <div className="blog__item bg-white card rounded">
                    <div className="image p-3">
                      <SiteImage targetWidth={828} className="rounded" width="100%" height="auto" src={asset("assets/frontend/images/home/sharath.png")} alt="image" />
                    </div>
                    <div className="blog__content p-0  text-center">
                      <h4>
                        <small>Mr.Sharath Kumar</small>
                      </h4>

                      <p
                        className="wow fadeInUp text-black text-center"
                        data-wow-delay="400ms"
                        data-wow-duration="1500ms"
                        style={{
                          visibility: "visible",
                          animationDuration: "1500ms",
                          animationDelay: "400ms",
                          animationName: "fadeInUp",
                          fontSize: "14px",
                        }}
                      >
                        <b className="text-black">Senior Technical Coordinator</b>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card wow fadeInUp" data-wow-delay="00ms" data-wow-duration="1500ms">
                  <div className="blog__item bg-white card rounded">
                    <div className="image p-3">
                      <SiteImage targetWidth={828} className="rounded" width="100%" height="auto" src={asset("assets/frontend/images/home/agilan.png")} alt="image" />
                    </div>
                    <div className="blog__content p-0  text-center">
                      <h4>
                        <small>Mr. Agilan</small>
                      </h4>

                      <p
                        className="wow fadeInUp text-black text-center"
                        data-wow-delay="400ms"
                        data-wow-duration="1500ms"
                        style={{
                          visibility: "visible",
                          animationDuration: "1500ms",
                          animationDelay: "400ms",
                          animationName: "fadeInUp",
                          fontSize: "14px",
                        }}
                      >
                        <b className="text-black">Technical Head</b>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card wow fadeInUp" data-wow-delay="00ms" data-wow-duration="1500ms">
                  <div className="blog__item bg-white card rounded">
                    <div className="image p-3">
                      <SiteImage targetWidth={828} className="rounded" width="100%" height="auto" src={asset("assets/frontend/images/home/cibie.png")} alt="image" />
                    </div>
                    <div className="blog__content p-0  text-center">
                      <h4>
                        <small>Mr. Cibie Charan</small>
                      </h4>

                      <p
                        className="wow fadeInUp text-black text-center"
                        data-wow-delay="400ms"
                        data-wow-duration="1500ms"
                        style={{
                          visibility: "visible",
                          animationDuration: "1500ms",
                          animationDelay: "400ms",
                          animationName: "fadeInUp",
                          fontSize: "14px",
                        }}
                      >
                        <b className="text-black">R&amp;D Associate</b>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card wow fadeInUp" data-wow-delay="00ms" data-wow-duration="1500ms">
                  <div className="blog__item bg-white card rounded">
                    <div className="image p-3">
                      <SiteImage targetWidth={828} className="rounded" width="100%" height="auto" src={asset("assets/frontend/images/home/monisha.png")} alt="image" />
                    </div>
                    <div className="blog__content p-0  text-center">
                      <h4>
                        <small>Ms. Monisha</small>
                      </h4>

                      <p
                        className="wow fadeInUp text-black text-center"
                        data-wow-delay="400ms"
                        data-wow-duration="1500ms"
                        style={{
                          visibility: "visible",
                          animationDuration: "1500ms",
                          animationDelay: "400ms",
                          animationName: "fadeInUp",
                          fontSize: "14px",
                        }}
                      >
                        <b className="text-black">Associate STEM Trainer</b>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card wow fadeInUp" data-wow-delay="00ms" data-wow-duration="1500ms">
                  <div className="blog__item bg-white card rounded">
                    <div className="image p-3">
                      <SiteImage targetWidth={828} className="rounded" width="100%" height="auto" src={asset("assets/frontend/images/home/shakthi.png")} alt="image" />
                    </div>
                    <div className="blog__content p-0  text-center">
                      <h4>
                        <small>Ms. Shakthi</small>
                      </h4>

                      <p
                        className="wow fadeInUp text-black text-center"
                        data-wow-delay="400ms"
                        data-wow-duration="1500ms"
                        style={{
                          visibility: "visible",
                          animationDuration: "1500ms",
                          animationDelay: "400ms",
                          animationName: "fadeInUp",
                          fontSize: "14px",
                        }}
                      >
                        <b className="text-black">Associate STEM Trainer</b>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card wow fadeInUp" data-wow-delay="00ms" data-wow-duration="1500ms">
                  <div className="blog__item bg-white card rounded">
                    <div className="image p-3">
                      <SiteImage targetWidth={828} className="rounded" width="100%" height="auto" src={asset("assets/frontend/images/home/lavanya.png")} alt="image" />
                    </div>
                    <div className="blog__content p-0  text-center">
                      <h4>
                        <small>Ms. Lavanya</small>
                      </h4>

                      <p
                        className="wow fadeInUp text-black text-center"
                        data-wow-delay="400ms"
                        data-wow-duration="1500ms"
                        style={{
                          visibility: "visible",
                          animationDuration: "1500ms",
                          animationDelay: "400ms",
                          animationName: "fadeInUp",
                          fontSize: "14px",
                        }}
                      >
                        <b className="text-black">Associate STEM Trainer</b>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card wow fadeInUp" data-wow-delay="00ms" data-wow-duration="1500ms">
                  <div className="blog__item bg-white card rounded">
                    <div className="image p-3">
                      <SiteImage targetWidth={828} className="rounded" width="100%" height="auto" src={asset("assets/frontend/images/home/soundhar.png")} alt="image" />
                    </div>
                    <div className="blog__content p-0  text-center">
                      <h4>
                        <small>Mr. Soundar Wattson</small>
                      </h4>

                      <p
                        className="wow fadeInUp text-black text-center"
                        data-wow-delay="400ms"
                        data-wow-duration="1500ms"
                        style={{
                          visibility: "visible",
                          animationDuration: "1500ms",
                          animationDelay: "400ms",
                          animationName: "fadeInUp",
                          fontSize: "14px",
                        }}
                      >
                        <b className="text-black">Marketing Head Chennai</b>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card wow fadeInUp" data-wow-delay="00ms" data-wow-duration="1500ms">
                  <div className="blog__item bg-white card rounded">
                    <div className="image p-3">
                      <SiteImage targetWidth={828} className="rounded" width="100%" height="auto" src={asset("assets/frontend/images/home/anil.png")} alt="image" />
                    </div>
                    <div className="blog__content p-0  text-center">
                      <h4>
                        <small>Mr. Anil Kumar</small>
                      </h4>

                      <p
                        className="wow fadeInUp text-black text-center"
                        data-wow-delay="400ms"
                        data-wow-duration="1500ms"
                        style={{
                          visibility: "visible",
                          animationDuration: "1500ms",
                          animationDelay: "400ms",
                          animationName: "fadeInUp",
                          fontSize: "14px",
                        }}
                      >
                        <b className="text-black"> Marketing Head Hyderabad </b>
                      </p>
                    </div>
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
