/**
 * Static brand and marketing content for the BCTLABS store.
 *
 * The company details mirror bctlabsedu.com (the sibling site) so both
 * properties present a single, consistent brand: same registered office,
 * phone number, support email and social presence.
 */

export const BRAND = {
  name: "BCTLABS",
  tagline: "Electronic components & STEM kits",
  legalName: "BCTLABS",
  founded: 2013,
  description:
    "Genuine electronic components, development boards, sensors and STEM kits for makers, students and industry, dispatched fast across India.",
  address: {
    line1: "5/3, Nehruji 8th Street",
    line2: "Arakkonam, Vellore",
    city: "Arakkonam",
    state: "Tamil Nadu",
    postcode: "631001",
    country: "India",
  },
  phone: "+91 95431 00296",
  phoneHref: "tel:+919543100296",
  phoneAlt: "+91 95431 00296",
  whatsapp: "919543100296",
  email: "bctlabs@gmail.com",
  emailHref: "mailto:bctlabs@gmail.com",
  hours: "Mon - Sat, 10:00 AM to 7:00 PM IST",
  socials: [
    { label: "Facebook", href: "https://www.facebook.com/", icon: "facebook" as const },
    { label: "Instagram", href: "https://www.instagram.com/", icon: "instagram" as const },
    { label: "LinkedIn", href: "https://www.linkedin.com/", icon: "linkedin" as const },
    { label: "YouTube", href: "https://www.youtube.com/", icon: "youtube" as const },
  ],
} as const;

export type Feature = { title: string; description: string; icon: string };

export const WHY_US: Feature[] = [
  {
    title: "Genuine, tested components",
    description: "Every module is sourced from trusted suppliers and checked before it ships.",
    icon: "shield",
  },
  {
    title: "Same-day dispatch",
    description: "Orders placed before 3 PM on working days leave the warehouse the same day.",
    icon: "truck",
  },
  {
    title: "GST invoices",
    description: "Compliant tax invoices for every order, ideal for schools and businesses.",
    icon: "receipt",
  },
  {
    title: "Expert maker support",
    description: "Stuck on wiring or code? Our team has been shipping hobby electronics since 2013.",
    icon: "headset",
  },
];

export type CategoryTile = { name: string; slug: string; blurb: string };

export const CATEGORY_HIGHLIGHTS: CategoryTile[] = [
  { name: "Microcontrollers", slug: "microcontroller", blurb: "Arduino, ESP32, UNO and more" },
  { name: "Sensors", slug: "sensors", blurb: "Distance, temperature, motion" },
  { name: "Power", slug: "power", blurb: "Regulators, converters, supplies" },
  { name: "Drivers", slug: "drivers", blurb: "Motor and relay driver boards" },
  { name: "Display Modules", slug: "display-modules", blurb: "LCD, OLED and TFT screens" },
  { name: "Input Module", slug: "input-module", blurb: "Buttons, keypads, switches" },
  { name: "Output Module", slug: "output-module", blurb: "Relays, buzzers, indicators" },
  { name: "Cable & Connectors", slug: "cableconnectors", blurb: "Jumpers, headers, adapters" },
];

export type Testimonial = { name: string; role: string; quote: string };

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Dr. G. S. Ayyappan",
    role: "STEM Lab Coordinator",
    quote:
      "BCTLABS is our go-to supplier for lab components. The parts are genuine, well packed and always reach us before our sessions begin.",
  },
  {
    name: "Rishan",
    role: "Maker & Hobbyist",
    quote:
      "Great range of modules at fair prices. The relay and sensor boards worked perfectly on the first try, and dispatch was genuinely same-day.",
  },
  {
    name: "Dr. S. Vijay Kumar",
    role: "Robotics Trainer",
    quote:
      "We order in bulk for our robotics workshops. The GST invoicing and reliable stock make BCTLABS an easy choice for our academy.",
  },
];

export type Faq = { question: string; answer: string };

export const FAQS: Faq[] = [
  {
    question: "How soon will my order be dispatched?",
    answer:
      "Orders confirmed before 3 PM on a working day are dispatched the same day. Orders placed later or on holidays go out on the next working day.",
  },
  {
    question: "Do you provide GST invoices?",
    answer:
      "Yes. Every order includes a GST-compliant tax invoice. Add your GSTIN in the order notes if you need it printed on the invoice.",
  },
  {
    question: "Which payment methods do you accept?",
    answer:
      "You can pay securely online through Cashfree (cards, UPI, net banking and wallets) or choose cash on delivery for eligible PIN codes.",
  },
  {
    question: "What is your shipping charge?",
    answer:
      "Shipping is free on orders above the free-shipping threshold. Smaller orders carry a flat delivery charge shown at checkout.",
  },
  {
    question: "Can I return a component?",
    answer:
      "Unused items in original packaging can be returned within 7 days of delivery. Get in touch with our support team to arrange a pickup.",
  },
];

export const PAYMENT_BADGES = ["UPI", "Visa", "Mastercard", "RuPay", "Net Banking", "COD"] as const;

export type StaticPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
};

/**
 * Written in-house articles shown on /blog, merged with any genuine posts from
 * the database. The old theme's Lorem Ipsum demo posts are filtered out.
 */
export const BLOG_POSTS: StaticPost[] = [
  {
    id: -1,
    slug: "choosing-the-right-sensor-module",
    title: "How to choose the right sensor module for your project",
    excerpt:
      "Distance, temperature, light or touch - a quick guide to picking the sensor module that fits your build and your budget.",
    date: "2026-02-18",
    content: `
<p>Almost every beginner project starts with a sensor. Before you add one to your cart, work out what you are actually trying to measure and how precise the answer needs to be. That single question narrows the catalogue down fast.</p>
<h2>Measure the right thing</h2>
<ul>
  <li><strong>Distance and presence:</strong> ultrasonic modules such as the HC-SR04 are cheap and easy, while IR reflective sensors like the TCRT-5000 are better for line following and short-range detection.</li>
  <li><strong>Temperature and humidity:</strong> the DHT-11 covers basic rooms and enclosures, and the class of digital modules around it suits most hobby builds.</li>
  <li><strong>Light:</strong> an LDR module gives a simple analogue reading, and a dedicated light sensor suits low-light or automated lighting projects.</li>
  <li><strong>Touch and gas:</strong> touch modules add a button without moving parts, and MQ-series gas sensors handle smoke and air-quality detection.</li>
</ul>
<h2>Check the interface</h2>
<p>Most modules are analogue, digital or I2C. Digital outputs are the simplest to read, analogue give you more detail, and I2C lets several devices share just two pins. Match the interface to the pins your board can spare.</p>
<h2>Confirm the supply voltage</h2>
<p>Many modules run happily at 3.3 V or 5 V, but some are 5 V only. Check the label before you connect anything to a 3.3 V board so you do not damage it.</p>
<h2>Start simple, then specialise</h2>
<p>Pick one sensor, get a reliable reading, and only then add a second. If you are unsure which module fits your project, our team is happy to point you in the right direction.</p>
`,
  },
  {
    id: -2,
    slug: "beginners-guide-to-breadboards-and-breakout-boards",
    title: "A beginner's guide to breadboards and breakout boards",
    excerpt:
      "Breadboards and breakout boards let you prototype without soldering. Here is how they work and when to use each one.",
    date: "2026-02-10",
    content: `
<p>If you are new to electronics, two pieces of hardware will save you more time than anything else: the breadboard and the breakout board. Neither needs a soldering iron, and both let you change your circuit the moment an idea changes.</p>
<h2>How a breadboard works</h2>
<p>A breadboard is a grid of sockets. The two rows at the top and bottom are power rails, and the five holes in the middle of each column are connected together. Push a component leg into one hole and it shares that column's connection.</p>
<ul>
  <li>Keep power and ground on the rails to avoid crossing wires.</li>
  <li>Use short jumper wires and keep signal wires away from the power rails.</li>
  <li>Test one block of the circuit at a time before adding the next.</li>
</ul>
<h2>What a breakout board adds</h2>
<p>Tiny surface-mount chips are hard to work with directly. A breakout board mounts that chip on a small PCB with friendly pins, and often adds the resistors or regulators the chip needs. It turns a fiddly part into something you can plug into a breadboard.</p>
<h2>When to move off the breadboard</h2>
<p>Breadboards are for prototyping, not for finished products. Once the circuit is stable, move it to perfboard or design a PCB so the connections cannot work loose.</p>
<p>Build the prototype, break it, fix it, and keep going. That is the fastest way to learn.</p>
`,
  },
  {
    id: -3,
    slug: "powering-your-electronics-project-safely",
    title: "Powering your electronics project safely",
    excerpt:
      "5 V, 12 V and everything in between - how to power your build without frying a board or browning out a motor.",
    date: "2026-01-29",
    content: `
<p>Power is the part of a project that beginners underestimate the most. A board that resets at random, a motor that stutters or a chip that gets hot usually comes down to the supply, not the code.</p>
<h2>Match the voltage</h2>
<p>Most microcontroller boards expect a regulated 5 V, while many modules and motors run from 12 V. Use a converter or regulator to give each part the voltage it expects instead of feeding everything from one source.</p>
<h2>Give the current room to breathe</h2>
<p>A power supply should be able to deliver more current than your project draws at peak. Motors draw a large surge the moment they start, so pick a supply with headroom and add a capacitor near the load.</p>
<h2>Share a common ground</h2>
<p>When you use more than one supply or regulator, connect all the ground lines together. Without a common reference, signals between boards become unreliable.</p>
<h2>Protect the build</h2>
<ul>
  <li>Add a fuse or a resettable polyfuse on the input.</li>
  <li>Keep polarity consistent, and mark the positive line.</li>
  <li>Test with a multimeter before connecting anything expensive.</li>
</ul>
<p>A clean, well-planned supply is the difference between a project that works once and one that works every time. Our shop stocks converters, regulators and adapters to help you get there.</p>
`,
  },
  {
    id: -4,
    slug: "reading-a-7-segment-display",
    title: "Reading a 7-segment display: wiring, resistors and code",
    excerpt:
      "Seven LEDs, one decimal point and a lot of wiring. Here is the simple way to drive a 7-segment display from your board.",
    date: "2026-01-15",
    content: `
<p>A 7-segment display is one of the most satisfying first projects, because you can see your code working immediately. The trick is understanding that each segment is really just an LED.</p>
<h2>Common anode or common cathode</h2>
<p>In a common-cathode display all the segment cathodes are tied to ground, so a high signal lights a segment. In a common-anode display the segments share a positive rail, so a low signal lights them. Check your part's datasheet and set the logic accordingly.</p>
<h2>Never skip the resistors</h2>
<p>Each segment needs a current-limiting resistor, usually between 220 ohm and 470 ohm. Driving an LED directly from a pin will eventually damage both the segment and the pin.</p>
<h2>Map the pins first</h2>
<p>Number the segments a through g plus the decimal point, then note which board pin drives each one. Write the mapping down before you wire it - it saves a lot of confusion later.</p>
<h2>Then write the loop</h2>
<p>Once the wiring is confirmed, cycling through the digits is a small lookup table in your sketch. Multi-digit displays add a refresh loop, but the principle is identical.</p>
<p>From clocks to counters, the 7-segment display is a great way to practise both hardware and software at once.</p>
`,
  },
];
