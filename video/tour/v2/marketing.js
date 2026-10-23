window.__META = { hudRight: "BENGALURU, IN / EST. 2013" };

window.__SCENES = [
  {
    id: "m1", label: "BCTLABS", layout: "center", bg: "pu", ghost: "2013", ghostSize: 520,
    ghostX: -120, ghostY: 210, glowX: 55, glowY: 42,
    pre: `<img class="hero-mark" src="assets/logo-mark.png" style="margin-bottom:30px">`,
    copy: {
      eyebrow: "TRUSTED BY MAKERS SINCE 2013",
      title: "COMPONENTS<br>THAT BUILD<br><em>THE FUTURE</em>",
      body: "<b>66 parts.</b> One warehouse. Microcontrollers, sensors and power modules, hand-checked and dispatched the same day.",
      stats: [
        { v: 66, s: "Products in stock", suffix: "+" },
        { v: 12, s: "Categories" },
        { v: 13, s: "Years of service", suffix: "+" },
      ],
    },
    chips: [
      { x: 1462, y: 168, text: "<b>Bengaluru</b> warehouse", cls: "pu", at: 2.4 },
    ],
    focus: [],
  },
  {
    id: "m2", label: "STOREFRONT", layout: "split", bg: "pu", ghost: "01", ghostSize: 430,
    ghostX: -60, ghostY: 640,
    copy: {
      eyebrow: "THE STOREFRONT",
      title: "One place for<br>every part.",
      body: "Sixty-six parts, twelve categories, and <b>live stock</b> on every listing. What you see is what is on the shelf.",
      chips: ["Live stock counts", "GST invoices"],
    },
    media: { src: "home", url: "bctlabs.com", vh: 640 },
    focus: [{ x: 830, y: 355, w: 500, h: 250, at: 2.9, hold: 2.6 }],
    chips: [
      { x: 1500, y: 148, text: "Hero, categories, featured parts", cls: "", at: 2.3 },
      { x: 1430, y: 812, text: "<b>66</b> products ready to ship", cls: "pu", at: 3.4 },
    ],
    cursors: [{ path: [[1600, 980], [1180, 520]], at: 3.6, span: 1.5, press: 4.9 }],
  },
  {
    id: "m3", label: "DISCOVERY", layout: "split-rev", bg: "pk", ghost: "02", ghostSize: 470,
    ghostX: 1180, ghostY: 480, glowX: 28,
    copy: {
      eyebrow: "FIND IT FAST",
      title: "Filter.<br>Find.<br>Add.",
      body: "Browse by category, then narrow it down by <b>price, availability and specification</b>. No dead ends, no guesswork.",
      stats: [
        { v: 12, s: "Categories" },
        { v: 4, s: "Filter dimensions" },
      ],
    },
    media: { src: "shop", url: "bctlabs.com/shop", vh: 620 },
    focus: [
      { x: 152, y: 300, w: 780, h: 110, at: 2.4, hold: 2.2, cls: "pu" },
      { x: 210, y: 470, w: 520, h: 380, at: 4.4, hold: 2.4 },
    ],
    chips: [
      { x: 1180, y: 250, text: "Category &#8594; subcategory", cls: "pu", at: 2.7 },
      { x: 1240, y: 848, text: "Stock shown per variant", cls: "", at: 4.7 },
    ],
    cursors: [{ path: [[900, 980], [700, 560]], at: 3.0, span: 1.4, press: 4.4 }],
  },
  {
    id: "m4", label: "PRODUCT", layout: "split", bg: "pu", ghost: "03", ghostSize: 460,
    ghostX: -80, ghostY: 700,
    copy: {
      eyebrow: "THE DETAIL THAT MATTERS",
      title: "Specs an<br>engineer can<br>trust.",
      body: "Exact variant, pinout, current rating, and <b>live stock</b>. Everything you need before it reaches your bench.",
      chips: ["Variant-accurate SKUs", "Same-day dispatch"],
    },
    media: { src: "product", url: "bctlabs.com/product/male-dc-to-split-dc-cable", vh: 640 },
    focus: [
      { x: 1390, y: 300, w: 400, h: 300, at: 2.4, hold: 2.6 },
      { x: 1160, y: 560, w: 300, h: 90, at: 4.9, hold: 2.0 },
    ],
    chips: [
      { x: 1430, y: 232, text: "Price and stock, live", cls: "pu", at: 2.7 },
      { x: 1190, y: 718, text: "<b>Add to cart</b> in one tap", cls: "", at: 5.2 },
    ],
    cursors: [{ path: [[1720, 960], [1300, 700]], at: 4.2, span: 1.3, press: 5.5 }],
  },
  {
    id: "m5", label: "CART", layout: "split-rev", bg: "pk", ghost: "04", ghostSize: 440,
    ghostX: 1180, ghostY: 560, glowX: 30,
    copy: {
      eyebrow: "THE CART",
      title: "Simple maths.<br>No surprises.",
      body: "Subtotal, delivery and any discount, <b>clear before you commit</b>. Change a quantity and the total follows instantly.",
      stats: [
        { v: 1, s: "Item in cart" },
        { v: 240.2, s: "Order total", inr: true, prefix: "\u20b9" },
      ],
    },
    media: { src: "cart", url: "bctlabs.com/cart", vh: 600 },
    focus: [{ x: 470, y: 430, w: 500, h: 330, at: 2.9, hold: 2.6, cls: "pu" }],
    chips: [
      { x: 1255, y: 300, text: "Line items and variants", cls: "", at: 2.4 },
      { x: 470, y: 900, text: "Totals update as you edit", cls: "pu", at: 3.6 },
    ],
    cursors: [{ path: [[1000, 960], [760, 620]], at: 3.4, span: 1.3, press: 4.8 }],
  },
  {
    id: "m6", label: "CHECKOUT", layout: "split", bg: "pu", ghost: "05", ghostSize: 450,
    ghostX: -90, ghostY: 620,
    copy: {
      eyebrow: "CHECKOUT",
      title: "Two taps<br>to the door.",
      body: "Guest checkout, or sign in. Enter the address once and we <b>save it to your book</b> for the next order.",
      chips: ["Guest or account", "Saved addresses"],
    },
    media: { src: "checkout", url: "bctlabs.com/checkout", vh: 640 },
    focus: [
      { x: 1410, y: 300, w: 380, h: 330, at: 2.5, hold: 2.3 },
      { x: 870, y: 502, w: 585, h: 78, at: 4.8, hold: 2.2, cls: "pu" },
    ],
    chips: [
      { x: 840, y: 930, text: "Address, saved or new", cls: "pu", at: 2.8 },
      { x: 1270, y: 930, text: "Saved to your book", cls: "", at: 5.1 },
    ],
    cursors: [{ path: [[1760, 980], [1520, 560]], at: 3.8, span: 1.4, press: 5.2 }],
  },
  {
    id: "m7", label: "PAYMENT", layout: "split-rev", bg: "pk", ghost: "06", ghostSize: 440,
    ghostX: 1150, ghostY: 600, glowX: 26,
    copy: {
      eyebrow: "PAYMENT",
      title: "Pay how<br>you want.",
      body: "UPI, cards, netbanking and wallets. Settled through <b>Cashfree</b> and confirmed on the server, never in the browser.",
      chips: ["PCI-DSS", "3D Secure"],
    },
    media: { src: "payment", url: "bctlabs.com/checkout", vh: 600 },
    focus: [
      { x: 330, y: 380, w: 620, h: 120, at: 2.3, hold: 2.2, cls: "pu" },
      { x: 330, y: 520, w: 620, h: 220, at: 4.4, hold: 2.4 },
    ],
    overlay: `<div class="glass" id="sec-card" style="position:absolute;right:-26px;top:-92px;width:430px;padding:26px 28px">
      <div class="card-title" style="display:flex;align-items:center;gap:10px">
        <span style="width:8px;height:8px;border-radius:50%;background:#f5177a;display:block;box-shadow:0 0 14px rgba(245,23,122,.9)"></span>
        Confirmed server-side
      </div>
      <div class="card-body" style="margin-top:10px">Raw-body HMAC, constant-time compare, and the amount checked against the stored order.</div>
    </div>`,
    chips: [
      { x: 1245, y: 238, text: "UPI first, cards next", cls: "pu", at: 2.6 },
      { x: 1240, y: 900, text: "Order marked paid only after verification", cls: "", at: 5.4 },
    ],
    cursors: [{ path: [[980, 960], [720, 500]], at: 3.4, span: 1.3, press: 4.7 }],
  },
  {
    id: "m8", label: "CONFIRMATION", layout: "split", bg: "pu", ghost: "07", ghostSize: 440,
    ghostX: -70, ghostY: 660,
    copy: {
      eyebrow: "CONFIRMATION",
      title: "Order<br>placed.",
      body: "An order number, a <b>GST invoice</b> and a tracking link, in the same breath. No account required.",
      chips: ["Order #4419", "GST invoice", "Live tracking"],
    },
    media: { src: "success", url: "bctlabs.com/checkout/success", vh: 640 },
    focus: [
      { x: 1590, y: 300, w: 210, h: 190, at: 2.5, hold: 2.6 },
      { x: 1520, y: 520, w: 340, h: 300, at: 4.8, hold: 2.2, cls: "pu" },
    ],
    chips: [
      { x: 1460, y: 232, text: "Order <b>#4419</b> &#183; &#8377;240.20", cls: "", at: 2.8 },
      { x: 1120, y: 806, text: "Invoice and tracking, instantly", cls: "pu", at: 5.2 },
    ],
    cursors: [{ path: [[1720, 980], [1660, 520]], at: 3.8, span: 1.2, press: 5.0 }],
  },
  {
    id: "m9", label: "ACCOUNT", layout: "center", bg: "pu", ghost: "08", ghostSize: 430,
    ghostX: -60, ghostY: 600, glowX: 55,
    copy: {
      eyebrow: "YOUR ACCOUNT",
      title: "Saved once.<br>Used forever.",
      body: "Your address book and order history in one place. Reorder in two taps.",
    },
    media: { src: "account-addresses", url: "bctlabs.com/account", vh: 620, scroll: { dist: 350, at: 1.6, span: 4.6 } },
    chips: [
      { x: 1245, y: 700, text: "Address book", cls: "pu", at: 4.4 },
    ],
    cursors: [{ path: [[1600, 960], [1290, 700]], at: 3.4, span: 1.3, press: 4.8 }],
  },
  {
    id: "m10", label: "TRACKING", layout: "split-rev", bg: "pk", ghost: "09", ghostSize: 460,
    ghostX: 1180, ghostY: 620, glowX: 28,
    copy: {
      eyebrow: "AFTER THE SALE",
      title: "Follow it<br>all the way.",
      body: "A tracking page that updates from the courier, so you always know where the parcel is.",
      extra: `<div class="mini-timeline" id="mt" style="margin-top:38px;position:relative">
        <div class="mt-step done"><span class="mt-line"><i></i></span><span class="mt-dot"></span><div><div class="mt-t">Order placed</div><div class="mt-s">Payment verified &#183; 10:24</div></div></div>
        <div class="mt-step done"><span class="mt-line"><i></i></span><span class="mt-dot"></span><div><div class="mt-t">Packed</div><div class="mt-s">Bengaluru warehouse &#183; 13:05</div></div></div>
        <div class="mt-step now"><span class="mt-line"><i></i></span><span class="mt-dot"></span><div><div class="mt-t">In transit</div><div class="mt-s">With courier &#183; out of hub</div></div></div>
        <div class="mt-step"><span class="mt-line"><i></i></span><span class="mt-dot"></span><div><div class="mt-t">Out for delivery</div><div class="mt-s">Expected today</div></div></div>
      </div>`,
    },
    special: "timeline",
    media: { src: "tracking", url: "bctlabs.com/order-tracking", vh: 620 },
    focus: [{ x: 400, y: 340, w: 560, h: 420, at: 2.8, hold: 3.0, cls: "pu" }],
    chips: [
      { x: 1265, y: 236, text: "Track by order number or email", cls: "", at: 2.5 },
    ],
  },
  {
    id: "m11", label: "BCTLABS", layout: "center", bg: "pu", ghost: "", glowX: 50, glowY: 40,
    copy: { title: "" },
    overlay: `<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;width:100%">
      <img src="assets/logo-mark.png" style="width:170px;display:block;margin:0 auto 34px">
      <div class="wordmark">BCTLABS</div>
      <div class="tagline">Components that bring your ideas to life.</div>
      <div style="margin-top:40px;display:inline-flex;align-items:center;gap:12px;padding:16px 30px;border-radius:100px;border:1px solid rgba(255,255,255,.26);background:rgba(255,255,255,.07);font-size:14px;letter-spacing:.16em;text-transform:uppercase">bctlabs.com</div>
      <div style="margin-top:26px;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:rgba(255,255,255,.34)">Bengaluru, India</div>
    </div>`,
    chips: [],
  },
];
