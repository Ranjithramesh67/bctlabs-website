import { asset } from "@/lib/site";
import { SiteImage } from "@/components/frontend/site-image";
import { getEventsByType } from "@/lib/content";
import { connection } from "next/server";

export const instant = false;

/** Laravel `Str::limit()`: appends `...` when the text exceeds `limit`. */
function strLimit(value: string | null, limit: number): string {
  const text = value ?? "";
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, limit).replace(/\s+$/, "")}...`;
}

/**
 * Port of `resources/views/frontend/main_menu/news.blade.php`
 * (`FrontendController::news`).
 */
export default async function NewsPage() {
  await connection();
  const events = await getEventsByType("news");

  return (
    <>
      <section
        className="banner__inner-page bg-image pt-50 pb-50 bg-image"
        data-background={asset(
          "assets/frontend/images/banner/news_banner.png",
        )}
      >
        <div className="overlay"></div>
        <div className="container banner">
          <h2
            className="wow fadeInUp"
            data-wow-delay="00ms"
            data-wow-duration="1500ms"
          >
            NEWS
          </h2>
        </div>
      </section>

      {/* Blog area start here */}
      <section className="blog-area pt-30 pb-30">
        <div className="container">
          <div className="section- mb-60 text-center">
            <h2
              className="wow fadeInUp mb-20"
              data-wow-delay="00ms"
              data-wow-duration="1500ms"
            >
              Our News and Articals
            </h2>
            <p>
              Stay informed about our innovative projects, student achievements,
              and breakthroughs in STEM education. Discover how we&apos;re
              shaping the future of robotics and technology, one milestone at a
              time.
            </p>
          </div>
          <div className="row g-4">
            {events.map((event) => (
              <div
                key={event.id}
                style={{ height: "625px" }}
                className="col-xl-4 col-md-6 wow fadeInUp"
                data-wow-delay="00ms"
                data-wow-duration="1500ms"
              >
                <div className="blog__item card rounded p-3 text-center">
                  <div className="image">
                    <SiteImage
                      className="rounded"
                      src={asset(event.startImage)}
                      targetWidth={828}
                      alt={event.title}
                    />
                  </div>
                  <div className="blog__content p-1">
                    <h4 className="mt-10 pb-15" style={{ fontWeight: "bold" }}>
                      <a
                        href={`/single_details?id=${event.id}`}
                        className="primary-color"
                      >
                        {event.title}
                      </a>
                    </h4>
                    <p>{strLimit(event.mainContent, 150)}</p>
                    <p className="mt-2 text-center">
                      <small className="text-black">
                        <b></b>
                      </small>
                    </p>
                    <div className="btn-two btn-two_know d-none d-lg-inline-block mt-3">
                      <a
                        href={`/single_details?id=${event.id}`}
                        className="btn-inner"
                      >
                        <span className="btn-text">Know More</span>
                      </a>
                      <br />
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
