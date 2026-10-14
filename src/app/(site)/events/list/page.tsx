import { asset } from "@/lib/site";
import { SiteImage } from "@/components/frontend/site-image";
import { getEventsByType } from "@/lib/content";
import { connection } from "next/server";

export const instant = false;

const EVENT_CSS = `
    .btn-two_know {
        position: absolute;
        bottom: 8px;
        left: 0;
        right: 0;
        margin: 0 auto;
        width: fit-content;
    }

    .image {
        position: relative;
    }

    .image-date {
        position: absolute;
        top: 10px;
        left: 10px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: bold;
    }

    .event-meta {

        padding: 12px;
        border-radius: 8px;
        margin-bottom: 15px;
    }


    .venue-info {
        display: flex;
        align-items: center;
        gap: 10px;
        /* background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%); */
        padding: 6px;
        border-radius: 10px;
        margin-bottom: 15px;
        border-left: 3px solid #e74c3c;
        box-shadow: 0 3px 5px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
    }

    .venue-info:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }

    .venue-icon {
        background: #e74c3c;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.2rem;
        flex-shrink: 0;
    }

    .venue-details {
        text-align: left;
    }

    .venue-title {
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 4px;
        font-size: 1rem;
    }

    .venue-address {
        color: #7f8c8d;
        font-size: 0.9rem;
        line-height: 1.4;
    }

    .venue-link {
        margin-left: auto;
        color: #e74c3c;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 5px;
        text-decoration: none;
        font-weight: 600;
    }

    .venue-link i {
        transition: transform 0.3s ease;
    }

    .venue-link:hover i {
        transform: translateX(3px);
    }
`;

/** Laravel `Str::limit()`: appends `...` when the text exceeds `limit`. */
function strLimit(value: string | null, limit: number): string {
  const text = value ?? "";
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, limit).replace(/\s+$/, "")}...`;
}

/**
 * Port of `resources/views/frontend/main_menu/events.blade.php`
 * (`FrontendController::events`).
 */
export default async function EventsListPage() {
  await connection();
  const events = await getEventsByType("event");

  return (
    <>
      <section
        className="banner__inner-page bg-image pt-50 pb-50 bg-image"
        data-background={asset(
          "assets/frontend/images/banner/cover/events.jpeg",
        )}
      >
        <div className="overlay"></div>
        <div className="container banner">
          <h2
            className="wow fadeInUp"
            data-wow-delay="00ms"
            data-wow-duration="1500ms"
          >
            Events <span>&</span> Workshops
          </h2>
        </div>
      </section>

      <section className="blog-area pt-30 pb-30">
        <div className="container">
          <div className="section- mb-60 text-center">
            <h2
              className="wow fadeInUp mb-20"
              data-wow-delay="00ms"
              data-wow-duration="1500ms"
            >
              Innovation Camps <span>&</span> Skill Sessions
            </h2>
            <p>
              At BCTLABS, students gain hands-on experience through internships,
              industrial visits, workshops, and events, applying theoretical
              knowledge to real-world scenarios and fostering growth and
              innovation.
            </p>
          </div>
          <div className="row g-4">
            <style dangerouslySetInnerHTML={{ __html: EVENT_CSS }} />

            {events.map((event) => (
              <div
                key={event.id}
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
                      alt="Event image"
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

                    <div className="event-meta"></div>

                    <div className="btn-two btn-two_know  d-lg-inline-block mt-3">
                      <a
                        href={`/single_details?id=${event.id}`}
                        className="btn-inner"
                      >
                        <span className="btn-text">Know More</span>
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
