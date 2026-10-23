window.__META = { hudRight: "BCTLABS ADMIN / INTERNAL" };

window.__SCENES = [
  {
    id: "a1", label: "ADMIN CONSOLE", layout: "center", bg: "bl", ghost: "ADMIN", ghostSize: 400,
    ghostX: 900, ghostY: 640, glowX: 52, glowY: 40,
    copy: {
      eyebrow: "THE OTHER SIDE OF THE STORE",
      title: "OPERATIONS,<br>WITHOUT<br><em>GUESSWORK</em>",
      body: "Every order, customer and shipment, <b>in one console</b>. Built for the people who actually run the store.",
    },
    chips: [
      { x: 1420, y: 720, text: "Orders &#183; Products &#183; Customers", cls: "bl", at: 2.6 },
    ],
  },
  {
    id: "a2", label: "ACCESS", layout: "split-rev", bg: "bl", ghost: "01", ghostSize: 440,
    ghostX: 1160, ghostY: 560, glowX: 26,
    copy: {
      eyebrow: "ACCESS",
      title: "Staff only.<br>By design.",
      body: "A dedicated admin sign-in, separate from the storefront. Customers never see this area.",
      chips: ["Role-checked session", "Separate cookie"],
    },
    media: { src: "admin-login", url: "bctlabs.com/admin/login", vh: 560 },
    focus: [{ x: 380, y: 330, w: 700, h: 400, at: 2.6, hold: 3.0, cls: "bl" }],
    chips: [
      { x: 1150, y: 260, text: "Admin credentials only", cls: "bl", at: 2.4 },
    ],
    cursors: [{ path: [[1000, 980], [760, 600]], at: 3.2, span: 1.3, press: 4.5 }],
  },
  {
    id: "a3", label: "DASHBOARD", layout: "split", bg: "pu", ghost: "02", ghostSize: 450,
    ghostX: -70, ghostY: 640,
    copy: {
      eyebrow: "DASHBOARD",
      title: "Your morning<br>briefing.",
      body: "Revenue, open orders, customers and catalogue size, <b>one glance</b>, no report to run.",
      stats: [
        { v: 42, s: "Total orders" },
        { v: 29, s: "Customers" },
        { v: 66, s: "Products" },
      ],
    },
    media: { src: "admin-dashboard", url: "bctlabs.com/admin", vh: 620 },
    focus: [
      { x: 830, y: 250, w: 950, h: 240, at: 2.4, hold: 2.6 },
      { x: 830, y: 520, w: 950, h: 330, at: 4.9, hold: 2.4, cls: "pu" },
    ],
    chips: [
      { x: 1470, y: 168, text: "Revenue <b>&#8377;7,00,20,603</b>", cls: "", at: 2.7 },
      { x: 1290, y: 812, text: "Recent orders, live", cls: "pu", at: 5.4 },
    ],
    cursors: [{ path: [[1700, 980], [1420, 520]], at: 3.6, span: 1.3, press: 4.9 }],
  },
  {
    id: "a4", label: "ORDERS", layout: "split-rev", bg: "bl", ghost: "03", ghostSize: 460,
    ghostX: 1150, ghostY: 590, glowX: 24,
    copy: {
      eyebrow: "ORDERS",
      title: "Every order,<br>live.",
      body: "Processing, shipped, delivered, failed. Search by order number, or filter by <b>status and date</b>.",
      chips: ["Live statuses", "Search and filters"],
    },
    media: { src: "admin-orders", url: "bctlabs.com/admin/orders", vh: 620 },
    focus: [
      { x: 320, y: 400, w: 900, h: 380, at: 2.4, hold: 2.6, cls: "bl" },
      { x: 1290, y: 420, w: 130, h: 330, at: 4.8, hold: 2.2 },
    ],
    chips: [
      { x: 1190, y: 250, text: "Status changes save instantly", cls: "bl", at: 2.6 },
      { x: 1360, y: 330, text: "Processing &#8594; shipped", cls: "", at: 4.9 },
    ],
    cursors: [{ path: [[980, 980], [760, 560]], at: 3.2, span: 1.3, press: 4.6 }],
  },
  {
    id: "a5", label: "ORDER DETAIL", layout: "split", bg: "pu", ghost: "04", ghostSize: 430,
    ghostX: -80, ghostY: 660,
    copy: {
      eyebrow: "ORDER DETAIL",
      title: "One order.<br>The full story.",
      body: "Line items, payment, the shipping address and a <b>timeline of what happened</b>, all on one screen.",
      chips: ["Payment status", "Address", "Audit trail"],
    },
    media: { src: "admin-order-detail", url: "bctlabs.com/admin/orders/4419", vh: 640 },
    focus: [
      { x: 1370, y: 300, w: 420, h: 170, at: 2.4, hold: 2.4 },
      { x: 1000, y: 430, w: 790, h: 250, at: 4.7, hold: 2.4, cls: "pu" },
    ],
    chips: [
      { x: 1500, y: 232, text: "Order <b>#4419</b> &#183; &#8377;240.20", cls: "pu", at: 2.7 },
      { x: 1120, y: 806, text: "Items, totals and address", cls: "", at: 5.0 },
    ],
    cursors: [{ path: [[1760, 960], [1600, 520]], at: 3.4, span: 1.2, press: 4.7 }],
  },
  {
    id: "a6", label: "FULFILMENT", layout: "split-rev", bg: "bl", ghost: "05", ghostSize: 440,
    ghostX: 1160, ghostY: 610, glowX: 26,
    copy: {
      eyebrow: "FULFILMENT",
      title: "Book the AWB<br>without leaving.",
      body: "Serviceability and rates come from <b>NimbusPost</b>. The AWB is booked against the order, and the courier manifest follows.",
      extra: `<div class="mini-timeline" style="margin-top:34px">
        <div class="mt-step done"><span class="mt-line"><i></i></span><span class="mt-dot"></span><div><div class="mt-t">Address checked</div><div class="mt-s">Pincode serviceable</div></div></div>
        <div class="mt-step done"><span class="mt-line"><i></i></span><span class="mt-dot"></span><div><div class="mt-t">AWB booked</div><div class="mt-s">Courier assigned</div></div></div>
        <div class="mt-step now"><span class="mt-line"><i></i></span><span class="mt-dot"></span><div><div class="mt-t">Manifest ready</div><div class="mt-s">Pickup scheduled</div></div></div>
      </div>`,
    },
    special: "timeline",
    overlay: `<div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;gap:22px">
      <div class="glass" style="padding:24px 26px">
        <div class="row" style="justify-content:space-between">
          <div class="card-title">AWB booked</div>
          <div style="font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#6ee7a8">Ready</div>
        </div>
        <div class="awb-grid">
          <div><span>Order</span><b>#4419</b></div>
          <div><span>Courier</span><b>Delhivery</b></div>
          <div><span>AWB</span><b>8820 4419 7712</b></div>
          <div><span>Pickup</span><b>Today, 16:00</b></div>
        </div>
      </div>
      <div class="glass" style="padding:20px 26px;margin-left:52px">
        <div class="row" style="justify-content:space-between">
          <div class="card-title" style="font-size:16px">Serviceability</div>
          <div style="font-size:11px;color:rgba(255,255,255,.45)">Bengaluru 560038 &#8594; Mumbai 400001</div>
        </div>
        <div class="awb-grid">
          <div><span>Rate</span><b>&#8377;75.00</b></div>
          <div><span>EDD</span><b>2 days</b></div>
          <div><span>COD</span><b>Not required</b></div>
          <div><span>Manifest</span><b>Generated</b></div>
        </div>
      </div>
    </div>`,
    chips: [
      { x: 300, y: 780, text: "Manifest PDF, one click", cls: "bl", at: 3.6 },
    ],
    cursors: [{ path: [[1620, 980], [1180, 640]], at: 3.0, span: 1.3, press: 4.4 }],
  },
  {
    id: "a7", label: "PRODUCTS", layout: "split", bg: "pu", ghost: "06", ghostSize: 450,
    ghostX: -90, ghostY: 620,
    copy: {
      eyebrow: "CATALOGUE",
      title: "Catalogue and<br>stock, in sync.",
      body: "Edit price, variant, category and availability in place. <b>Low stock is flagged</b> before it becomes a problem.",
      stats: [
        { v: 66, s: "Live products" },
        { v: 12, s: "Categories" },
      ],
    },
    media: { src: "admin-products", url: "bctlabs.com/admin/products", vh: 620 },
    overlay: `<div class="glass table-card" style="right:-18px;bottom:-70px;width:600px">
      <div class="tc-head">Catalogue <span>66 products</span></div>
      <div class="tc-row"><span>UNO-16UZ</span><span>&#8377;1,400</span><em class="ok">In stock</em></div>
      <div class="tc-row"><span>POWER DISTRIBUTION BOARD</span><span>&#8377;100</span><em class="ok">In stock</em></div>
      <div class="tc-row"><span>SOIL MOISTURE SENSOR</span><span>&#8377;220</span><em class="warn">Low stock</em></div>
      <div class="tc-row"><span>L298N MOTOR DRIVER</span><span>&#8377;280</span><em class="ok">In stock</em></div>
      <div class="tc-row"><span>ESP8266 WITH OLED</span><span>&#8377;440</span><em class="ok">In stock</em></div>
    </div>`,
    focus: [
      { x: 830, y: 330, w: 930, h: 260, at: 2.4, hold: 2.4 },
      { x: 1470, y: 700, w: 380, h: 260, at: 4.7, hold: 2.6, cls: "pu" },
    ],
    chips: [
      { x: 1400, y: 232, text: "Price and stock inline", cls: "pu", at: 2.7 },
      { x: 1140, y: 792, text: "Stock badges per variant", cls: "", at: 5.2 },
    ],
    cursors: [{ path: [[1700, 980], [1460, 700]], at: 3.4, span: 1.3, press: 4.8 }],
  },
  {
    id: "a8", label: "CUSTOMERS", layout: "split-rev", bg: "bl", ghost: "07", ghostSize: 450,
    ghostX: 1150, ghostY: 600, glowX: 24,
    copy: {
      eyebrow: "CUSTOMERS",
      title: "Know who<br>you're serving.",
      body: "Contact details, saved addresses, order count and <b>lifetime value</b>, so support can answer without digging.",
      chips: ["Saved addresses", "Lifetime value"],
    },
    media: { src: "admin-customers", url: "bctlabs.com/admin/customers", vh: 620 },
    overlay: `<div class="glass table-card" style="left:-18px;bottom:-74px;width:620px">
      <div class="tc-head">Customers <span>30 accounts</span></div>
      <div class="tc-row"><span>Ananya Sharma</span><span>2 orders</span><em class="ok">&#8377;1,858</em></div>
      <div class="tc-row"><span>Rahul Verma</span><span>1 order</span><em class="ok">&#8377;429</em></div>
      <div class="tc-row"><span>Priya Nair</span><span>3 orders</span><em class="ok">&#8377;2,240</em></div>
      <div class="tc-row"><span>Karthik Rao</span><span>1 order</span><em class="ok">&#8377;1,400</em></div>
      <div class="tc-row"><span>Sneha Iyer</span><span>2 orders</span><em class="ok">&#8377;980</em></div>
    </div>`,
    focus: [
      { x: 320, y: 420, w: 980, h: 330, at: 2.4, hold: 2.8, cls: "bl" },
      { x: 1420, y: 660, w: 300, h: 230, at: 4.9, hold: 2.4 },
    ],
    chips: [
      { x: 1220, y: 250, text: "Every account, one table", cls: "bl", at: 2.6 },
      { x: 1330, y: 700, text: "Orders and spend per customer", cls: "", at: 5.2 },
    ],
    cursors: [{ path: [[1000, 980], [780, 600]], at: 3.2, span: 1.3, press: 4.6 }],
  },
  {
    id: "a9", label: "LOGISTICS", layout: "split", bg: "pu", ghost: "08", ghostSize: 430,
    ghostX: -80, ghostY: 640,
    copy: {
      eyebrow: "LOGISTICS",
      title: "Manifests,<br>ready for pickup.",
      body: "The day's shipments collected into a manifest, then a <b>signed webhook</b> carries tracking updates back to the order.",
    },
    media: { src: "admin-orders", url: "bctlabs.com/admin/logistics", vh: 580 },
    overlay: `<div class="glass" id="mf" style="position:absolute;right:-24px;bottom:-6px;width:640px;padding:8px 4px 4px">
      <div class="mf-row head"><span>Order</span><span>Courier / AWB</span><span>Status</span><span>Pickup</span></div>
      <div class="mf-row"><span class="mut">#4419</span><span>Delhivery &#183; AWB 8820 4419</span><span class="ok">READY</span><span class="mut">Today</span></div>
      <div class="mf-row"><span class="mut">#4418</span><span>Bluedart &#183; AWB 7712 4418</span><span class="ok">READY</span><span class="mut">Today</span></div>
      <div class="mf-row"><span class="mut">#4414</span><span>Pending assignment</span><span class="mut">QUEUED</span><span class="mut">Tomorrow</span></div>
    </div>`,
    special: "manifest",
    focus: [{ x: 830, y: 300, w: 960, h: 420, at: 2.4, hold: 2.8, cls: "pu" }],
    chips: [
      { x: 1450, y: 232, text: "Pickup <b>manifest</b>", cls: "pu", at: 2.7 },
      { x: 1080, y: 810, text: "Tracking syncs back automatically", cls: "", at: 4.8 },
    ],
    cursors: [{ path: [[1700, 980], [1500, 560]], at: 3.4, span: 1.3, press: 4.8 }],
  },
  {
    id: "a10", label: "PAYMENTS", layout: "split-rev", bg: "bl", ghost: "09", ghostSize: 440,
    ghostX: 1150, ghostY: 600, glowX: 26,
    copy: {
      eyebrow: "PAYMENTS",
      title: "Money,<br>reconciled.",
      body: "Cashfree posts to a signed webhook. The signature is checked against the <b>raw request body</b>, and the amount against the stored order.",
      chips: ["HMAC signature", "Constant-time compare", "Amount check"],
    },
    special: "webhook",
    overlay: `<div class="wk">
      <div class="wk-row">
        <div class="wk-node sm glass"><b>Gateway</b><span>Cashfree posts<br>the event</span></div>
        <div class="wk-wire sm"><i style="width:100%"></i></div>
        <div class="wk-node sm glass"><b>Verify</b><span>Raw-body HMAC<br>timing-safe compare</span></div>
        <div class="wk-wire sm"><i style="width:100%"></i></div>
        <div class="wk-node sm glass"><b>Reconcile</b><span>Amount matches<br>the stored order</span></div>
        <div class="wk-wire sm"><i style="width:100%"></i></div>
        <div class="wk-node sm glass"><b>Mark paid</b><span>Order moves<br>to processing</span></div>
        <i class="wk-packet" data-packet data-at="2.4" data-span="1.4" data-from="90" data-to="900"></i>
      </div>
      <div class="glass" style="margin-top:44px;width:100%;max-width:820px;padding:20px 24px">
        <div class="wk-code">
          <div class="ln"><span class="c">// verified before parsing</span></div>
          <div class="ln"><span class="k">const</span> expected = hmac(<span class="s">"sha256"</span>, secret, rawBody);</div>
          <div class="ln"><span class="k">if</span> (!timingSafeEqual(expected, signature)) <span class="k">return</span> unauthorized();</div>
          <div class="ln"><span class="k">if</span> (paidAmount !== order.total) <span class="k">return</span> reject(<span class="s">"amount mismatch"</span>);</div>
        </div>
      </div>
    </div>`,
    focus: [],
    chips: [
      { x: 300, y: 812, text: "Fails closed when no secret is configured", cls: "bl", at: 3.4 },
    ],
  },
  {
    id: "a11", label: "MESSAGES", layout: "split", bg: "pu", ghost: "10", ghostSize: 430,
    ghostX: -70, ghostY: 640,
    copy: {
      eyebrow: "MESSAGES",
      title: "Nothing<br>gets lost.",
      body: "Contact messages and enquiries land here with the sender, the subject and the time, so <b>nothing hides in an inbox</b>.",
    },
    media: { src: "admin-messages", url: "bctlabs.com/admin/messages", vh: 600 },
    focus: [{ x: 840, y: 340, w: 920, h: 340, at: 2.4, hold: 2.8, cls: "pu" }],
    chips: [
      { x: 1400, y: 232, text: "Sender, subject, timestamp", cls: "pu", at: 2.7 },
    ],
    cursors: [{ path: [[1700, 980], [1400, 480]], at: 3.2, span: 1.3, press: 4.5 }],
  },
  {
    id: "a12", label: "BCTLABS ADMIN", layout: "center", bg: "bl", ghost: "", glowX: 50, glowY: 42,
    copy: { title: "" },
    overlay: `<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;width:100%">
      <img src="assets/logo-mark.png" style="width:150px;display:block;margin:0 auto 30px">
      <div class="wordmark" style="font-size:88px">BCTLABS</div>
      <div class="tagline">Storefront, money and parcels. One console.</div>
      <div style="margin-top:38px;display:inline-flex;align-items:center;gap:12px;padding:15px 28px;border-radius:100px;border:1px solid rgba(255,255,255,.26);background:rgba(255,255,255,.07);font-size:13px;letter-spacing:.16em;text-transform:uppercase">admin.bctlabs.com</div>
      <div style="margin-top:24px;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:rgba(255,255,255,.34)">Bengaluru, India</div>
    </div>`,
  },
];
