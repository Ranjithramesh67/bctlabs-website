import { asset } from "@/lib/site";
import { SiteImage } from "@/components/frontend/site-image";
import { getEventWithStyledContent } from "@/lib/content";
import { formatLongDate } from "@/lib/date";
import { connection } from "next/server";

export const instant = false;

const PAGE_TITLES: Record<string, string> = {
  event: "Events",
  blog: "Blogs",
  news: "News & Updates",
  achievements: "ACHIEVEMENTS & AWARDS",
  career: "JOIN OUR TEAM",
  products: "Products",
};

const PAGE_BANNERS: Record<string, string> = {
  achievements: "assets/frontend/images/banner/achievements_banner.png",
  event: "assets/frontend/images/banner/event_banner.png",
  news: "assets/frontend/images/banner/news_banner.png",
  blog: "assets/frontend/images/banner/news_banner.png",
  career: "assets/frontend/images/banner/banner-inner-page.jpg",
};

/**
 * Port of `resources/views/frontend/sub_page/single_event.blade.php`
 * (`FrontendController::single_event`, the generic `/single_details?id=` route).
 */
export default async function SingleDetailsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  // The query param + DB lookup are request-time (Cache Components).
  await connection();
  const { id } = await searchParams;
  const numericId = id && /^\d+$/.test(id) ? Number(id) : null;
  const event =
    numericId === null ? null : await getEventWithStyledContent(numericId);

  const page = event?.type ?? "event";
  const pageTitle = PAGE_TITLES[page] ?? "Events & Workshops";
  const bannerImage = asset(
    PAGE_BANNERS[page] ?? "assets/frontend/images/banner/banner-inner-page.jpg",
  );

  const dateLine =
    event === null || page === "product" ? null : page === "blog" ? (
      <>
        Date : {formatLongDate(event.createdAt)} | Written by{" "}
        {event.authorName ?? "BCTLABS"}
      </>
    ) : page === "news" ? (
      <>Date : {formatLongDate(event.createdAt)}</>
    ) : (
      <>
        Date : {formatLongDate(event.createdAt)} | Venue :{" "}
        {event.venue ?? "BCTLABS"}
      </>
    );

  // `['middle_image', 'image_4', 'image_5', 'image_6']` with the Blade's
  // `ucfirst(str_replace('_', ' ', $imgField))` alt text.
  const subImages = [
    { src: event?.middleImage, alt: "Middle image" },
    { src: event?.image4, alt: "Image 4" },
    { src: event?.image5, alt: "Image 5" },
    { src: event?.image6, alt: "Image 6" },
  ];

  return (
    <>
      <section
        className="banner__inner-page bg-image pt-50 pb-50 bg-image"
        data-background={bannerImage}
      >
        <div className="overlay"></div>
        <div className="container banner">
          <div
            className="breadcrumb-list wow fadeInUp"
            data-wow-delay="200ms"
            data-wow-duration="1500ms"
          >
            <h6 className="text-white normal">
              <b>BCTLABS</b>
            </h6>
          </div>
          <h2
            className="wow fadeInUp"
            data-wow-delay="00ms"
            data-wow-duration="1500ms"
          >
            {pageTitle.toUpperCase()}
          </h2>
        </div>
      </section>

      <section className="blog-area pt-30 pb-30">
        <div className="container">
          <div className="col-lg-12 text-center mb-4">
            <h2
              className="wow fadeInUp"
              data-wow-delay="0ms"
              data-wow-duration="1500ms"
              style={{
                visibility: "visible",
                animationDuration: "1500ms",
                animationDelay: "0ms",
                animationName: "fadeInUp",
              }}
            >
              {event?.title ?? "Title Not Found"}
            </h2>
            <p>
              {dateLine ? <b>{dateLine}</b> : null}
            </p>
          </div>

          <div className="row mb-4">
            {/* Main image full width */}
            <div className="col-lg-12">
              <div className="my-3">
                {event?.mainImage ? (
                  <SiteImage
                    src={asset(event.mainImage)}
                    alt="Main Image"
                    className="img-fluid w-100 rounded"
                    targetWidth={1200}
                    priority
                  />
                ) : null}
              </div>
            </div>
          </div>

          <div className="row">
            {/* Loop through sub images */}
            {subImages.map((image) => (
              <div className="col-lg-4 col-md-6 mb-4" key={image.alt}>
                <div className="my-3">
                  {image.src ? (
                    <SiteImage
                      src={asset(image.src)}
                      alt={image.alt}
                      className="img-fluid rounded shadow-sm"
                      targetWidth={828}
                      style={{
                        width: "100%",
                        maxHeight: "250px",
                        objectFit: "cover",
                      }}
                    />
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="row mt-4">
            <div className="col-lg-12">
              {/* Event content with HTML */}
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    event?.styledContent ??
                    "<p>Event content not available.</p>",
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
