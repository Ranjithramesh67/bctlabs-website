/**
 * Public site navigation, ported from
 * `resources/views/frontend/layouts/header.blade.php`.
 *
 * Each item mirrors one `<li>`: `href` is the link target, `activeOn` lists the
 * paths that highlight it (Laravel used `request()->routeIs(...)`), and an
 * optional `children` reproduces the `<ul class="sub-menu">` block.
 */

export type NavItem = {
  label: string;
  href: string;
  activeOn: string[];
  children?: NavItem[];
};

export const SITE_NAV: NavItem[] = [
  {
    label: "Home",
    href: "/",
    activeOn: ["/"],
  },
  {
    label: "About Us",
    href: "javascript:void(0);",
    activeOn: ["/who_we_are", "/our_team"],
    children: [
      { label: "Who We Are", href: "/who_we_are", activeOn: ["/who_we_are"] },
      { label: "Our Teams", href: "/our_team", activeOn: ["/our_team"] },
    ],
  },
  {
    label: "What we do",
    href: "/what_we_do",
    activeOn: [
      "/what_we_do",
      "/atal_tinkering_labs",
      "/stem_labs",
      "/advanced_innovation_lab",
      "/csr_stem_solutions",
      "/stem_learning_programs",
      "/stem_workshops",
    ],
    children: [
      {
        label: "ATAL Tinkering Labs",
        href: "/atal_tinkering_labs",
        activeOn: ["/atal_tinkering_labs"],
      },
      { label: "STEM LAB", href: "/stem_labs", activeOn: ["/stem_labs"] },
      {
        label: "Advanced Innovation Lab",
        href: "/advanced_innovation_lab",
        activeOn: ["/advanced_innovation_lab"],
      },
      {
        label: "CSR STEM Solutions",
        href: "/csr_stem_solutions",
        activeOn: ["/csr_stem_solutions"],
      },
      {
        label: "STEM Learning Programs",
        href: "/stem_learning_programs",
        activeOn: ["/stem_learning_programs"],
      },
      {
        label: "STEM Workshops",
        href: "/stem_workshops",
        activeOn: ["/stem_workshops"],
      },
    ],
  },
  { label: "Products", href: "/product", activeOn: ["/product"] },
  { label: "Achievements", href: "/achievements", activeOn: ["/achievements"] },
  { label: "Events", href: "/events/list", activeOn: ["/events/list"] },
  { label: "News", href: "/news", activeOn: ["/news"] },
  { label: "Blog", href: "/blog", activeOn: ["/blog"] },
  { label: "Career", href: "/career-list", activeOn: ["/career-list"] },
];

/** External shop link shown in the header/sidebar buttons. */
export const SHOP_URL = "https://mybillbook.in/store/bctlabs";

/** Asset helper equivalent of Laravel's `asset()`. */
export function asset(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export function isActive(pathname: string, item: NavItem): boolean {
  const normalize = (value: string) => value.replace(/\/+$/, "") || "/";
  const current = normalize(pathname);
  return item.activeOn.some((path) => normalize(path) === current);
}
