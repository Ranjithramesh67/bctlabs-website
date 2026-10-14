import { SiteImage } from "@/components/frontend/site-image";
import { asset } from "@/lib/site";

/**
 * Port of `resources/views/frontend/sub_page/single_blog.blade.php`.
 *
 * `FrontendController::single_blog` passes no data, so the page is static.
 */
export default function SingleBlogPage() {
  return (
    <>
      {/* Blog area start here */}
      <section className="blog-area pt-30 pb-30">
        <div className="container">
          <div className="mt-20 mb-20">
            <h2
              className="wow fadeInUp"
              data-wow-delay="00ms"
              data-wow-duration="1500ms"
            >
              How Cartoons Fuel STEM Learning in Kids
            </h2>
            <div className="blog__content p-2">
              <ul className="justify-content-start gap-2">
                <li>
                  <b className="primary-hover transition">
                    Posted On March 29, 2025
                  </b>
                </li>
                <li>|</li>
                <li>
                  <a href="#">
                    <span>By Salman N</span>
                  </a>
                </li>
              </ul>
            </div>
            <div className="featured_image">
              <SiteImage targetWidth={828}
                src={asset("assets/frontend/images/home/slide.webp")}
                width="100%"
                alt="post_featured_image"
              />
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <p
                className="wow fadeInUp"
                data-wow-delay="300ms"
                data-wow-duration="1500ms"
              >
                With the increasing prevalence of robotics in recent years, the
                benefits of this subject are becoming more and more evident. As
                our day-to-day life grows increasingly technological, it makes
                sense to introduce innovative methods that allow students to
                harness exciting, contemporary skills.
              </p>

              <h3
                className="wow fadeInUp mt-20 mb-10"
                data-wow-delay="400ms"
                data-wow-duration="1500ms"
              >
                How Cartoons Fuel STEM Learning in Kids
              </h3>
              <p
                className="wow fadeInUp"
                data-wow-delay="300ms"
                data-wow-duration="1500ms"
              >
                With children in early education, it can be difficult to get
                them interested in programming as a subject. An easy way to
                approach this is through robotics. It takes the almost
                intangible process of programming code and provides immediate
                results that students can physically see for themselves.
              </p>
              <p
                className="wow fadeInUp"
                data-wow-delay="300ms"
                data-wow-duration="1500ms"
              >
                Simply with some lines of code, their robot is able to move
                right before their eyes. Setting this foundation of
                understanding is an effective springboard that will pave the way
                for more complicated functions. And this is all done in a fun,
                entertaining way, perfect for younger children. Coding is
                exciting, but it needs to be introduced in a palatable way.
              </p>

              <h3
                className="wow fadeInUp mt-20 mb-10"
                data-wow-delay="400ms"
                data-wow-duration="1500ms"
              >
                Soft Skills Are Nurtured
              </h3>
              <p
                className="wow fadeInUp"
                data-wow-delay="300ms"
                data-wow-duration="1500ms"
              >
                Introducing robotics to young children can help them develop a
                range of soft skills, such as critical thinking and
                problem-solving skills. Robotics is a hands-on activity that
                requires children to think critically about how to make their
                robot perform a certain task. For example, a child may have to
                figure out how to make their robot move in a specific way or how
                to make it respond to certain inputs. This type of
                problem-solving can help children develop their cognitive skills
                and improve their ability to think critically.
              </p>

              <h3
                className="wow fadeInUp mt-20 mb-10"
                data-wow-delay="400ms"
                data-wow-duration="1500ms"
              >
                Preparing For A Future Reliant On Technology
              </h3>
              <p
                className="wow fadeInUp"
                data-wow-delay="300ms"
                data-wow-duration="1500ms"
              >
                Even if certain children are less inclined to invest themselves
                in robotics, there are still valuable lessons to be taken from
                the subject. Society is more technologically-driven than ever
                before. Becoming computer literate is no longer a choice, but a
                necessity for many professions. In fact, many fields are
                incorporating 3D printing, drones, and different variations of
                advanced machinery or devices in their working environments.
                This is true even in the service industry, as many servers are
                required to carry a device such as a tablet to carry out their
                work.
              </p>

              <h3
                className="wow fadeInUp mt-20 mb-10"
                data-wow-delay="400ms"
                data-wow-duration="1500ms"
              >
                Soft Skills Are Nurtured
              </h3>
              <p
                className="wow fadeInUp"
                data-wow-delay="300ms"
                data-wow-duration="1500ms"
              >
                Introducing robotics to young children can help them develop a
                range of soft skills, such as critical thinking and
                problem-solving skills. Robotics is a hands-on activity that
                requires children to think critically about how to make their
                robot perform a certain task. For example, a child may have to
                figure out how to make their robot move in a specific way or how
                to make it respond to certain inputs. This type of
                problem-solving can help children develop their cognitive skills
                and improve their ability to think critically.
              </p>

              <h3
                className="wow fadeInUp mt-20 mb-10"
                data-wow-delay="400ms"
                data-wow-duration="1500ms"
              >
                Preparing For A Future Reliant On Technology
              </h3>
              <p
                className="wow fadeInUp"
                data-wow-delay="300ms"
                data-wow-duration="1500ms"
              >
                Even if certain children are less inclined to invest themselves
                in robotics, there are still valuable lessons to be taken from
                the subject. Society is more technologically-driven than ever
                before. Becoming computer literate is no longer a choice, but a
                necessity for many professions. In fact, many fields are
                incorporating 3D printing, drones, and different variations of
                advanced machinery or devices in their working environments.
                This is true even in the service industry, as many servers are
                required to carry a device such as a tablet to carry out their
                work.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
