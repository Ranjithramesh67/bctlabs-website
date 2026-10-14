import { asset } from "@/lib/site";

const CARD_STYLE = {
  visibility: "visible",
  animationDuration: "1500ms",
  animationDelay: "0ms",
  animationName: "fadeInUp",
} as const;

const JOBS = [
  {
    title: "Business Development Associative",
    href: "/business_development_associative",
    description: `As a Business Development Associative, you’ll work at the intersection of education and technology, connecting
with schools, colleges, and industry partners to promote our robotics training programs and products. You’ll play a key role in expanding our impact,
building strong relationships, and creating opportunities for students and professionals to engage with the future of learning.
`,
  },
  {
    title: "R&D Associative",
    href: "/randd",
    description: `As a R&D Associative, you’ll dive into the research, design, and testing of robotic systems and components. You’ll work closely with engineers, trainers,
and product teams to develop prototypes, explore new technologies, and contribute to the creation of cutting-edge educational tools. If you love solving
technical challenges and turning ideas into working models, this is the perfect opportunity.
`,
  },
  {
    title: "Technical Head",
    href: "/technical_head",
    description: `As a Technical Head, you’ll define the technical roadmap, lead a multidisciplinary team of engineers and trainers, and oversee the development of
robotics solutions and learning platforms. You will play a strategic role in shaping the future of our technology offerings, from concept to deployment,
ensuring quality, scalability, and innovation at every step.
`,
  },
  {
    title: "Senior STEM Trainer",
    href: "/senior_stem_trainer",
    description: `:As a Senior STEM Trainer, you’ll be at the forefront of STEM education, delivering impactful training sessions, mentoring
learners, and designing real-world robotics projects that ignite curiosity and creativity. You’ll work closely with a dynamic team to shape innovative
learning experiences and drive technical excellence across our programs.
`,
  },
  {
    title: "STEM Trainer",
    href: "/stem_trainer",
    description: `As a STEM Trainer, you’ll deliver interactive training sessions, guide students through real-world robotics and STEM projects, and foster a love for
problem-solving and innovation. You’ll work with a team of educators and technologists to make cutting-edge STEM education accessible, engaging,
and impactful.`,
  },
  {
    title: "Internship Trainee",
    href: "/internship_trainee",
    description: `As a Internship Trainee, you'll work alongside experienced engineers and trainers to develop technical skills, explore robotics hardware and software,
and contribute to exciting projects that shape the future of STEM education. This is your opportunity to learn by doing—and launch your career in the
tech space.`,
  },
];

/**
 * Port of `resources/views/frontend/main_menu/career.blade.php`
 * (`FrontendController::career`). The controller passes no data, so the page is
 * static markup only.
 */
export default function CareerListPage() {
  return (
    <>
      <section
        className="banner__inner-page bg-image pt-50 pb-50 bg-image"
        data-background={asset(
          "assets/frontend/images/banner/cover/careers.jpeg",
        )}
      >
        <div className="container banner">
          <div
            className="breadcrumb-list wow fadeInUp"
            data-wow-delay="200ms"
            data-wow-duration="1500ms"
          >
            <h4 className="text-white normal">
              <b>Careers</b>
            </h4>
          </div>
          <h2
            className="wow fadeInUp"
            data-wow-delay="00ms"
            data-wow-duration="1500ms"
          >
            GREETINGS FROM BCTLABS
          </h2>
        </div>
      </section>

      {/* Blog area start here */}
      <section className="blog-area pt-30 pb-30">
        <div className="container">
          <div className="col-lg-12 text-center">
            <div className="section-">
              <h2
                className="wow fadeInUp mb-20"
                data-wow-delay="00ms"
                data-wow-duration="1500ms"
                style={CARD_STYLE}
              >
                Join Our Team
              </h2>
              <p>
                <small>
                  BCTLABS STEM Academy is one of the top 10 STEM education
                  organizations in India. Our track record of excellence goes
                  with 8+years of service. With the vision of ‘Together We Can
                  create a young Innovators’, By joining hands with us we can
                  create a world where science and technology walk hand in hand
                  with humanity. We are happy to announce that our extension of
                  the team is in progress effectively and we are hunting for
                  fresh talents, skills, and credentials. At this juncture we
                  welcome Professionals, Freshers and Intern who look for career
                  growth.
                </small>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="blog-area pt-30 pb-30">
        <div className="container">
          <div className="row g-4">
            {JOBS.map((job) => (
              <div
                key={job.title}
                className="col-xl-4 col-md-4 wow fadeInUp"
                data-wow-delay="00ms"
                data-wow-duration="1500ms"
                style={CARD_STYLE}
              >
                <div className="blog__item card rounded p-3">
                  <div className="blog__content text-center p-1">
                    <h4>{job.title}</h4>
                    <p className="mt-2">
                      <small>{job.description}</small>
                    </p>
                    <div className="btn-two d-none d-lg-inline-block mt-2">
                      <a href={job.href} className="btn-inner">
                        <span className="btn-text">JOIN US</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
