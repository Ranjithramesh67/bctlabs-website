import { asset } from "@/lib/site";
import {
  SiteImage,
  optimizedImageSrc,
} from "@/components/frontend/site-image";
import { getCategoryNames, getEventWithStyledContent } from "@/lib/content";
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

const PRODUCT_CSS = `
    .thumb-img {
      cursor: pointer;
      border: 2px solid transparent;
      border-radius: 4px;
      transition: all 0.2s;
    }
    .thumb-img:hover {
      border-color: #e77600;
    }
    .thumb-img.active {
      border-color: #e77600;
      box-shadow: 0 0 3px 2px rgba(228,121,17,.5);
    }
    .main-img {
      width: 100%;
      height: auto;
      cursor: zoom-in;
      border-radius: 4px;
    }
    .thumbs {
      max-height: 450px;
      overflow-y: auto;
      padding-right: 8px;
    }
    .price {
      font-size: 1.8rem;
      color: #B12704;
      font-weight: 400;
    }
    .offer-box {
      border: 1px solid #DDD;
      padding: 14px 18px;
      border-radius: 8px;
      margin-bottom: 15px;
      font-size: 14px;
      background-color: #f7f7f7;
    }
    .limited-deal {
      background-color: #CC0C39;
      color: white;
      font-size: 12px;
      font-weight: bold;
      padding: 3px 8px;
      border-radius: 3px;
      display: inline-block;
    }
    .text-muted {
      font-size: 14px;
      color: #565959 !important;
    }
    .delivery-message {
      color: #067D62;
      font-size: 14px;
      font-weight: 400;
    }
    .highlight-text {
      color: #0F1111;
      font-weight: 700;
    }
    .btn-amazon {
      background: #FFD814;
      border-color: #FCD200;
      color: #0F1111;
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 13px;
    }
    .btn-amazon:hover {
      background: #F7CA00;
      border-color: #F2C200;
    }
    .btn-buy {
      background: #FFA41C;
      border-color: #FF8F00;
      color: #0F1111;
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 13px;
    }
    .btn-buy:hover {
      background: #FA8900;
      border-color: #E37A00;
    }
    .nav-tabs .nav-link {
      color: #0F1111;
      font-size: 14px;
    }
    .nav-tabs .nav-link.active {
      color: #0F1111;
      font-weight: 700;
      border-bottom: 3px solid #e47911;
    }
    .breadcrumb {
      font-size: 12px;
      background-color: transparent;
      padding-left: 0;
    }
    .breadcrumb a {
      color: #007185;
      text-decoration: none;
    }
    .breadcrumb a:hover {
      color: #C7511F;
      text-decoration: underline;
    }
    .product-title {
      font-size: 24px;
      font-weight: 400;
      line-height: 1.2;
    }
    .star-rating {
      background-image: linear-gradient(to bottom, #f4c14b, #f4c14b);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .highlight-box {
      border-left: 3px solid #e0e0e0;
      padding-left: 14px;
      margin: 15px 0;
    }
    .feature-bullets {
      margin-left: 18px;
    }
    .feature-bullets li {
      margin-bottom: 8px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .compare-similar {
      color: #007185;
      text-decoration: none;
      font-size: 13px;
    }
    .compare-similar:hover {
      color: #C7511F;
      text-decoration: underline;
    }
    .scrollspy-container {
      position: relative;
      height: 300px;
      overflow-y: auto;
    }
    .add-to-list {
      color: #007185;
      text-decoration: none;
      font-size: 13px;
    }
    .add-to-list:hover {
      color: #C7511F;
      text-decoration: underline;
    }
    .quantity-select {
      background-color: #F0F2F2;
      border-radius: 7px;
      padding: 3px;
      border: 1px solid #D5D9D9;
      box-shadow: 0 2px 5px rgba(15,17,17,.15);
    }
    .sold-by {
      color: #007185;
      text-decoration: none;
    }
    .sold-by:hover {
      color: #C7511F;
      text-decoration: underline;
    }
    .ship-to-selector {
      color: #007185;
      text-decoration: none;
      font-size: 13px;
    }
    .ship-to-selector:hover {
      color: #C7511F;
      text-decoration: underline;
    }
    .payment-icon {
      height: 20px;
      margin-right: 5px;
    }
    .secure-icon {
      color: #007600;
      font-size: 12px;
    }
    .returns-info {
      font-size: 14px;
      color: #007185;
    }
    .returns-info:hover {
      color: #C7511F;
      text-decoration: underline;
    }
    .share-dropdown .dropdown-toggle::after {
      display: none;
    }
    .share-dropdown .dropdown-menu {
      min-width: 300px;
      padding: 10px;
    }
    .share-icon {
      font-size: 18px;
      margin-right: 8px;
      color: #565959;
    }

   .tab-content .active {
    background-color: #ffffff;
}

  `;

const PRODUCT_SCRIPT = `
      document.addEventListener('DOMContentLoaded', () => {
        const thumbnails = document.querySelectorAll('.thumb-img');
        const mainImage = document.getElementById('mainImage');
        const modalImage = document.getElementById('modalImage');
        const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
    
        thumbnails.forEach(img => {
          img.addEventListener('click', () => {
            thumbnails.forEach(i => i.classList.remove('active'));
            img.classList.add('active');
            const newSrc = img.getAttribute('data-large');
            mainImage.src = newSrc;
          });
        });
    
        mainImage.addEventListener('click', () => {
          modalImage.src = mainImage.src;
          imageModal.show();
        });
      });
    `;

/** Laravel `ucfirst()` for a single ASCII-cased title. */
function ucfirst(value: string): string {
  return value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1);
}

/** Laravel `number_format($value, 2)` for the default locale grouping. */
function formatPrice(value: string): string {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Port of `resources/views/frontend/sub_page/single_product.blade.php`
 * (`FrontendController::single_product`).
 *
 * `discount_price` is not part of the source table, so the Blade's non-discount
 * price branch is always the one taken.
 */
export default async function ProductDetailsPage({
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

  const categoryNames = await getCategoryNames(
    event?.categoryId == null ? [] : [event.categoryId],
  );
  const categoryName = ucfirst(
    (event?.categoryId != null
      ? categoryNames.get(event.categoryId)
      : undefined) ?? "Microcontroller",
  );

  // `['start_image', 'middle_image', 'image_4', 'image_5', 'image_6']`
  const thumbnails = [
    event?.startImage,
    event?.middleImage,
    event?.image4,
    event?.image5,
    event?.image6,
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRODUCT_CSS }} />

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
          <div className="row py-5">
            {/* Left Column: Thumbnails */}
            <div className="col-md-1 col-xs-2 thumbs d-flex flex-column gap-2 pe-0">
              {thumbnails.map((image) =>
                image ? (
                  <SiteImage
                    key={image}
                    src={asset(image)}
                    targetWidth={128}
                    className="thumb-img img-fluid"
                    data-large={optimizedImageSrc(asset(image), 1200)}
                    alt={event?.title ?? ""}
                  />
                ) : null,
              )}
            </div>

            {/* Middle Column: Main Image */}
            <div className="col-md-5 col-xs-10 text-center mb-3 ps-0">
              <SiteImage
                src={asset(event?.mainImage ?? "")}
                targetWidth={828}
                id="mainImage"
                className="main-img img-fluid"
                alt={event?.title ?? ""}
              />
            </div>

            {/* Right Column: Product Info */}
            <div className="col-md-6 ps-4">
              <h1 className="product-title mb-2">
                {event ? ucfirst(event.title) : ""}
              </h1>

              <div className="mb-2">
                <span className="text-muted mb-2">{categoryName}</span>
              </div>

              <div className="mb-2">
                <span className="price">
                  ₹{formatPrice(event?.price ?? "0")}
                </span>
              </div>

              <div
                dangerouslySetInnerHTML={{
                  __html:
                    event?.styledContent ??
                    "<p>Product content not available.</p>",
                }}
              />

              <div className="btn-two btn-two_know  d-lg-inline-block mt-10">
                <a
                  href="https://mybillbook.in/store/bctlabs"
                  target="_blank"
                  className="btn-inner"
                >
                  <span className="btn-text">Buy Now</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      <div
        className="modal fade"
        id="imageModal"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content bg-transparent border-0">
            <div className="modal-header border-0">
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body p-0 text-center">
              <SiteImage targetWidth={828}
                src=""
                id="modalImage"
                className="img-fluid"
                style={{ maxHeight: "80vh" }}
                alt="Large View"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bootstrap JS (includes Popper) */}
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
      <script dangerouslySetInnerHTML={{ __html: PRODUCT_SCRIPT }} />
    </>
  );
}
