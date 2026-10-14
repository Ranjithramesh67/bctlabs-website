import { asset } from "@/lib/site";
import { SiteImage } from "@/components/frontend/site-image";
import { getCategoryNames, getEventsByType } from "@/lib/content";
import { connection } from "next/server";

export const instant = false;

const KNOW_BUTTON_CSS = `
    .btn-two_know {
        position: absolute;
        bottom: 8px;
        left: 0;
        right: 0;
        margin: 0 auto;
        width: fit-content;
    }
`;

const PRODUCT_CARD_CSS = `
    /* Product Card Styles */
    .product__item {
        transition: all 0.3s ease;
        border: 1px solid #eee;
        height: 100%;
    }
    .product__item:hover {
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        transform: translateY(-5px);
    }

    .product__image {
        overflow: hidden;
        position: relative;
    }
    .product__image img {
        transition: transform 0.5s ease;
    }
    .product__item:hover .product__image img {
        transform: scale(1.05);
    }

    .product__badge {
        position: absolute;
        top: 10px;
        left: 10px;
        padding: 3px 10px;
        color: white;
        font-size: 12px;
        border-radius: 3px;
    }

    .product__actions {
        position: absolute;
        bottom: -50px;
        left: 0;
        right: 0;
        text-align: center;
        transition: all 0.3s ease;
        opacity: 0;
    }
    .product__item:hover .product__actions {
        bottom: 10px;
        opacity: 1;
    }

    .product__buttons .btn {
        transition: all 0.3s ease;
    }
    .product__buttons .btn:hover {
        background: #333;
        border-color: #333;
    }

    .product__title {
        font-size: 16px;
        height: 40px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    /* Star Rating */
    .star-rating {
        color: #ffc107;
        font-size: 14px;
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

/** PHP `number_format($value, 2)`. */
function formatPrice(value: string): string {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** PHP `ucfirst()`. */
function ucfirst(value: string): string {
  return value.length ? value[0].toUpperCase() + value.slice(1) : value;
}

/**
 * Port of `resources/views/frontend/main_menu/product.blade.php`
 * (`FrontendController::product`).
 *
 * `discount_price` does not exist on the source table, so the non-discount
 * price branch is always the one taken.
 */
export default async function ProductPage() {
  await connection();
  const events = await getEventsByType("products");
  const categoryNames = await getCategoryNames(
    events.map((event) => event.categoryId).filter((id): id is number => id !== null),
  );

  return (
    <>
      <section
        className="banner__inner-page bg-image pt-50 pb-50 bg-image"
        data-background={asset(
          "assets/frontend/images/banner/cover/products.jpeg",
        )}
      >
        <div className="overlay"></div>
        <div className="container banner">
          <h2
            className="wow fadeInUp"
            data-wow-delay="00ms"
            data-wow-duration="1500ms"
          >
            Products
          </h2>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: KNOW_BUTTON_CSS }} />

      {/* Product area start here */}
      <section className="product-area pt-30 pb-30">
        <div className="container">
          <div className="section-header mb-60 text-center">
            <h2
              className="wow fadeInUp mb-20"
              data-wow-delay="00ms"
              data-wow-duration="1500ms"
            >
              Our Products
            </h2>
          </div>

          <div className="row g-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="col-xl-3 col-md-4 col-sm-6 wow fadeInUp"
                data-wow-delay="00ms"
                data-wow-duration="1500ms"
                style={{
                  visibility: "visible",
                  animationDuration: "1500ms",
                  animationDelay: "0ms",
                  animationName: "fadeInUp",
                }}
              >
                <div className="blog__item card rounded p-3 text-center">
                  <div className="image">
                    <SiteImage
                      className="rounded w-100"
                      src={asset(event.startImage)}
                      targetWidth={828}
                      alt={event.title}
                    />
                  </div>
                  <div className="blog__content px-1 pb-10">
                    {/* Event Title */}
                    <h4 className="mt-3 pb-2" style={{ fontWeight: "bold" }}>
                      <a href="javascript:void(0);" className="primary-color">
                        {event.title}
                      </a>
                    </h4>

                    {/* Category Name (clean and aligned) */}
                    <p className="mt-1 mb-0 text-start">
                      Category :{" "}
                      <small className="fw-bold text-black">
                        {ucfirst(
                          (event.categoryId !== null
                            ? categoryNames.get(event.categoryId)
                            : undefined) ?? "Microcontroller",
                        )}
                      </small>
                    </p>

                    {/* Event Description */}
                    <p className="mt-2">{strLimit(event.mainContent, 80)}</p>

                    {/* Pricing Section */}
                    <p className="pb-15">
                      <span className="fw-bold">₹{formatPrice(event.price)}</span>
                    </p>

                    {/* Know More Button */}
                    <div className="btn-two btn-two_know  d-lg-inline-block mt-10">
                      <a
                        href={`/product_details?id=${event.id}`}
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

      <style dangerouslySetInnerHTML={{ __html: PRODUCT_CARD_CSS }} />
    </>
  );
}
