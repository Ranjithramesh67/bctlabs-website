import { asset } from "@/lib/site";
import { SiteImage } from "@/components/frontend/site-image";
import { getEventsByType } from "@/lib/content";
import { connection } from "next/server";

export const instant = false;

const CARD_BORDER_CSS = `
    .blog__item
 {
     border-radius: 15px !important;
       border: 1px solid #d7d7d7;
}
`;

const CARD_LAYOUT_CSS = `
    /* Add this CSS to your stylesheet */
    .blog__item {
        display: flex;
        flex-direction: column;
        height: 100%; /* Ensure card takes full height */
    }

    .blog__content {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding-bottom: 60px; /* Space for the button */
        position: relative; /* For absolute positioning of button */
    }

    .btn-two_know {
        position: absolute;
        bottom: 20px;
        left: 0;
        right: 0;
        margin: 0 auto;
        width: fit-content;
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
 * Port of `resources/views/frontend/main_menu/achievements.blade.php`
 * (`FrontendController::achievements`).
 *
 * The banner heading carried two invisible zero-width spaces (U+200B) before
 * the trailing space; they are dropped here as they have no rendering effect.
 */
export default async function AchievementsPage() {
  await connection();
  const events = await getEventsByType("achievements");

  return (
    <>
      <section
        className="banner__inner-page bg-image pt-50 pb-50 bg-image"
        data-background={asset(
          "assets/frontend/images/banner/cover/achievements.jpeg",
        )}
      >
        <div className="overlay"></div>
        <div className="container banner">
          <h2
            className="wow fadeInUp"
            data-wow-delay="00ms"
            data-wow-duration="1500ms"
          >
            ACHIEVEMENTS & AWARDS{" "}
          </h2>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: CARD_BORDER_CSS }} />

      {/* Blog area start here */}
      <section className="blog-area pt-30 pb-30">
        <div className="container">
          <div className="section- mb-60 text-center">
            <h2
              className="wow fadeInUp mb-20"
              data-wow-delay="00ms"
              data-wow-duration="1500ms"
            >
              <span className="text-black">At BCTLABS STEM Academy</span>,
              innovation is more than a goal, it&apos;s our foundation
            </h2>
            <p>
              Our events spark young minds, and our awards recognize
              breakthroughs in STEM education. Together, they reflect our
              journey of empowering the next generation of tech leaders.
            </p>
          </div>
          <div className="row g-4">
            <style dangerouslySetInnerHTML={{ __html: CARD_LAYOUT_CSS }} />

            {/* Updated HTML with fixed button position */}
            {events.map((event) => (
              <div
                key={event.id}
                className="col-xl-4 col-md-6 wow fadeInUp"
                data-wow-delay="00ms"
                data-wow-duration="1500ms"
              >
                <div className="blog__item bg-white rounded">
                  <div className="image p-3">
                    <SiteImage
                      className="rounded"
                      src={asset(event.startImage)}
                      targetWidth={828}
                      alt="image"
                    />
                  </div>
                  <div className="blog__content pt-0 text-center">
                    <h4 className="mt-10 pb-15" style={{ fontWeight: "bold" }}>
                      <a
                        href={`/single_details?id=${event.id}`}
                        className="primary-color"
                      >
                        {event.title}
                      </a>
                    </h4>
                    <p style={{ fontWeight: "bold" }}>
                      <small>{strLimit(event.mainContent, 150)}</small>
                    </p>

                    {/* Know More Button */}
                    <div className="btn-two btn-two_know">
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
