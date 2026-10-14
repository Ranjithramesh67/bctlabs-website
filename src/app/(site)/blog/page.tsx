import { asset } from "@/lib/site";
import { SiteImage } from "@/components/frontend/site-image";
import {
  getBlogCategories,
  getBlogPosts,
  getRecentBlogPosts,
} from "@/lib/content";
import { formatShortDate } from "@/lib/date";
import { connection } from "next/server";

export const instant = false;

const BLOG_CSS = `
    .post-meta {
        margin-top: 10px;
        font-size: 0.9rem;
        position: relative;
    }

    .premium-badge {
        position: absolute;
        top: -10px;
        right: 10px;
        background: linear-gradient(135deg, #ffd700, #c5a000);
        color: #000;
        padding: 3px 10px;
        border-radius: 15px;
        font-size: 0.7rem;
        font-weight: bold;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        z-index: 1;
        text-transform: uppercase;
    }

    .premium-author {
        color: #c5a000;
        font-weight: bold;
    }

    /* Added styles for consistent button positioning */
    .blog__item {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .blog__content {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }

    .btn-container {
        margin-top: auto;
        padding-top: 15px;
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

/** PHP `ucfirst()`. */
function ucfirst(value: string): string {
  return value.length ? value[0].toUpperCase() + value.slice(1) : value;
}

/**
 * Port of `resources/views/frontend/main_menu/blog.blade.php`
 * (`FrontendController::blog`).
 *
 * The sidebar date renders `created_at`, matching the Blade.
 */
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ cat_id?: string }>;
}) {
  const { cat_id } = await searchParams;
  const categoryId = cat_id ? Number(cat_id) : undefined;

  await connection();
  const [categories, events, recentBlog] = await Promise.all([
    getBlogCategories(),
    getBlogPosts(categoryId),
    getRecentBlogPosts(),
  ]);

  return (
    <>
      <section
        className="banner__inner-page bg-image pt-50 pb-50 bg-image"
        data-background={asset("assets/frontend/images/banner/cover/blogs.jpeg")}
      >
        <div className="overlay"></div>
        <div className="container banner">
          <h2
            className="wow fadeInUp"
            data-wow-delay="00ms"
            data-wow-duration="1500ms"
          >
            Blogs
          </h2>
        </div>
      </section>

      <section className="blog-single-area pt-30 pb-30">
        <div className="container">
          <div className="section- mb-60 text-center">
            <h2
              className="wow fadeInUp mb-20"
              data-wow-delay="00ms"
              data-wow-duration="1500ms"
            >
              <span className="text-black">Blogs</span>
            </h2>
            <p>
              Welcome to the official blog of BCTLABS STEM Academy, where we
              share updates on our initiatives, student achievements, and
              advancements in STEM education. Explore thought leadership on
              emerging technologies, hands-on learning methodologies, and how
              BCTLABS is driving innovation and excellence in schools across the
              nation.
            </p>
          </div>
          <div className="row g-2">
            <div className="col-lg-12 order-2 order-lg-1">
              <style dangerouslySetInnerHTML={{ __html: BLOG_CSS }} />

              <div className="row g-2">
                <div className="col-lg-8 order-2 order-lg-1">
                  <div className="row">
                    {events.map((event) => (
                      <div key={event.id} className="col-lg-6 mb-4">
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
                            <h4
                              className="mt-10 pb-15"
                              style={{ fontWeight: "bold" }}
                            >
                              <a
                                href={`/single_details?id=${event.id}`}
                                className="primary-color"
                              >
                                {event.title}
                              </a>
                            </h4>
                            <p>{strLimit(event.mainContent, 150)}</p>

                            <div className="btn-container">
                              <div className="btn-two d-none d-lg-inline-block">
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
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-lg-4 order-1 order-lg-2">
                  <div className="blog-single__right-item">
                    <div className="item shadow mb-30">
                      <h5 className="title">Category</h5>
                      <ul className="category">
                        {categories.map((cData) => (
                          <li key={cData.id}>
                            <a href={`/blog?cat_id=${cData.id}`}>
                              {ucfirst(cData.name)}
                            </a>{" "}
                            <span>({cData.totalCount})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="item shadow mb-30">
                      <h5 className="title">Resent Post</h5>
                      <ul className="single-post">
                        {recentBlog.map((rData) => (
                          <li key={rData.id}>
                            <SiteImage
                              width="50"
                              height="50"
                              src={asset(rData.startImage)}
                              targetWidth={96}
                              alt="image"
                            />
                            <div className="con">
                              <p>
                                <a
                                  href={`/single_details?id=${rData.id}`}
                                  className="primary-hover"
                                >
                                  {strLimit(ucfirst(rData.title), 30)}
                                </a>
                              </p>
                              <span>{formatShortDate(rData.createdAt)}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
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
