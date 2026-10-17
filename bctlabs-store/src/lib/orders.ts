import "server-only";

import { randomBytes } from "crypto";
import { prisma } from "./prisma";
import { normalizeOrderStatus, toNumber } from "./format";

export type Address = {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
};

export type OrderItemInput = {
  productId: number;
  name: string;
  sku?: string;
  quantity: number;
  price: number;
};

export type CreateOrderInput = {
  billing: Address;
  shipping?: Address;
  items: OrderItemInput[];
  paymentMethod: string;
  paymentTitle: string;
  subtotal: number;
  taxTotal: number;
  shippingTotal: number;
  discountTotal: number;
  total: number;
  customerId?: number | null;
  customerNote?: string;
  status?: string;
};

export type OrderItem = {
  id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
  productId: number;
};

export type Order = {
  id: number;
  status: string;
  currency: string;
  total: number;
  tax: number;
  shipping: number;
  discount: number;
  subtotal: number;
  paymentMethod: string;
  paymentTitle: string;
  customerId: number | null;
  billingEmail: string;
  dateCreated: Date | null;
  customerNote: string;
  orderKey: string;
  transactionId: string;
  billing: Address | null;
  shippingAddress: Address | null;
  items: OrderItem[];
};

async function nextOrderId(): Promise<number> {
  const row = await prisma.wp_wc_orders.findFirst({ orderBy: { id: "desc" }, select: { id: true } });
  return toNumber(row?.id) + 1;
}

function orderKey(): string {
  return `wc_${randomBytes(16).toString("hex")}`;
}

export async function createOrder(input: CreateOrderInput): Promise<{ id: number; key: string }> {
  const id = await nextOrderId();
  const key = orderKey();
  const now = new Date();
  const billing = input.billing;
  const shipping = input.shipping ?? input.billing;

  await prisma.$transaction(async (tx) => {
    await tx.wp_wc_orders.create({
      data: {
        id: BigInt(id),
        status: input.status ?? "processing",
        currency: "INR",
        type: "shop_order",
        tax_amount: input.taxTotal,
        total_amount: input.total,
        customer_id: input.customerId ? BigInt(input.customerId) : BigInt(0),
        billing_email: billing.email || "",
        date_created_gmt: now,
        date_updated_gmt: now,
        parent_order_id: BigInt(0),
        payment_method: input.paymentMethod,
        payment_method_title: input.paymentTitle,
        transaction_id: "",
        ip_address: "",
        user_agent: "",
        customer_note: input.customerNote ?? "",
      },
    });

    await tx.wp_wc_order_addresses.createMany({
      data: [
        {
          order_id: BigInt(id),
          address_type: "billing",
          first_name: billing.firstName,
          last_name: billing.lastName,
          company: billing.company ?? "",
          address_1: billing.address1,
          address_2: billing.address2 ?? "",
          city: billing.city,
          state: billing.state,
          postcode: billing.postcode,
          country: billing.country,
          email: billing.email ?? billing.email ?? "",
          phone: billing.phone ?? "",
        },
        {
          order_id: BigInt(id),
          address_type: "shipping",
          first_name: shipping.firstName,
          last_name: shipping.lastName,
          company: shipping.company ?? "",
          address_1: shipping.address1,
          address_2: shipping.address2 ?? "",
          city: shipping.city,
          state: shipping.state,
          postcode: shipping.postcode,
          country: shipping.country,
          email: "",
          phone: "",
        },
      ],
    });

    await tx.wp_wc_order_operational_data.create({
      data: {
        order_id: BigInt(id),
        created_via: "bctlabs-store",
        woocommerce_version: "10.7.0",
        prices_include_tax: false,
        coupon_usages_are_counted: true,
        download_permission_granted: true,
        cart_hash: "",
        new_order_email_sent: false,
        order_key: key,
        order_stock_reduced: false,
        date_paid_gmt: null,
        date_completed_gmt: null,
        shipping_tax_amount: 0,
        shipping_total_amount: input.shippingTotal,
        discount_tax_amount: 0,
        discount_total_amount: input.discountTotal,
        recorded_sales: false,
      },
    });

    const meta: { order_id: bigint; meta_key: string; meta_value: string }[] = [
      ["_order_key", key],
      ["_order_currency", "INR"],
      ["_order_total", input.total.toFixed(8)],
      ["_order_tax", input.taxTotal.toFixed(8)],
      ["_order_shipping", input.shippingTotal.toFixed(8)],
      ["_cart_discount", input.discountTotal.toFixed(8)],
      ["_order_discount", input.discountTotal.toFixed(8)],
      ["_payment_method", input.paymentMethod],
      ["_payment_method_title", input.paymentTitle],
      ["_created_via", "bctlabs-store"],
      ["_order_version", "10.7.0"],
      ["_prices_include_tax", "no"],
      ["_customer_user", String(input.customerId ?? 0)],
      ["_billing_first_name", billing.firstName],
      ["_billing_last_name", billing.lastName],
      ["_billing_address_1", billing.address1],
      ["_billing_address_2", billing.address2 ?? ""],
      ["_billing_city", billing.city],
      ["_billing_state", billing.state],
      ["_billing_postcode", billing.postcode],
      ["_billing_country", billing.country],
      ["_billing_email", billing.email ?? ""],
      ["_billing_phone", billing.phone ?? ""],
      ["_shipping_first_name", shipping.firstName],
      ["_shipping_last_name", shipping.lastName],
      ["_shipping_address_1", shipping.address1],
      ["_shipping_address_2", shipping.address2 ?? ""],
      ["_shipping_city", shipping.city],
      ["_shipping_state", shipping.state],
      ["_shipping_postcode", shipping.postcode],
      ["_shipping_country", shipping.country],
    ].map(([meta_key, meta_value]) => ({
      order_id: BigInt(id),
      meta_key: meta_key as string,
      meta_value: meta_value as string,
    }));
    if (input.customerNote) meta.push({ order_id: BigInt(id), meta_key: "customer_note", meta_value: input.customerNote });
    await tx.wp_wc_orders_meta.createMany({ data: meta });

    let itemIdBase = toNumber(
      (await tx.wp_woocommerce_order_items.findFirst({ orderBy: { order_item_id: "desc" }, select: { order_item_id: true } }))
        ?.order_item_id,
    );

    for (const item of input.items) {
      itemIdBase += 1;
      const orderItemId = itemIdBase;
      await tx.wp_woocommerce_order_items.create({
        data: {
          order_item_id: BigInt(orderItemId),
          order_item_name: item.name,
          order_item_type: "line_item",
          order_id: BigInt(id),
        },
      });
      await tx.wp_woocommerce_order_itemmeta.createMany({
        data: [
          ["_product_id", String(item.productId)],
          ["_variation_id", "0"],
          ["_qty", String(item.quantity)],
          ["_tax_class", ""],
          ["_line_subtotal", (item.price * item.quantity).toFixed(8)],
          ["_line_subtotal_tax", "0"],
          ["_line_total", (item.price * item.quantity).toFixed(8)],
          ["_line_tax", "0"],
          ["_line_tax_data", 'a:2:{s:5:"total";a:0:{}s:8:"subtotal";a:0:{}}'],
        ].map(([meta_key, meta_value]) => ({
          order_item_id: BigInt(orderItemId),
          meta_key,
          meta_value,
        })),
      });
      await tx.wp_wc_order_product_lookup.upsert({
        where: { order_item_id_order_id: { order_item_id: BigInt(orderItemId), order_id: BigInt(id) } },
        create: {
          order_item_id: BigInt(orderItemId),
          order_id: BigInt(id),
          product_id: BigInt(item.productId),
          variation_id: BigInt(0),
          customer_id: input.customerId ? BigInt(input.customerId) : null,
          date_created: now,
          product_qty: item.quantity,
          product_net_revenue: item.price * item.quantity,
          product_gross_revenue: item.price * item.quantity,
          coupon_amount: 0,
          tax_amount: 0,
          shipping_amount: 0,
          shipping_tax_amount: 0,
        },
        update: {},
      });
    }

    await tx.wp_wc_order_stats.create({
      data: {
        order_id: BigInt(id),
        parent_id: BigInt(0),
        date_created: now,
        date_created_gmt: now,
        date_paid: null,
        date_completed: null,
        num_items_sold: input.items.reduce((sum, i) => sum + i.quantity, 0),
        total_sales: input.total,
        tax_total: input.taxTotal,
        shipping_total: input.shippingTotal,
        net_total: input.total - input.taxTotal,
        status: input.status ?? "processing",
        customer_id: input.customerId ? BigInt(input.customerId) : BigInt(0),
      },
    });
  });

  return { id, key };
}

function mapAddress(row: {
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  address_1: string | null;
  address_2: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  country: string | null;
  email: string | null;
  phone: string | null;
}): Address {
  return {
    firstName: row.first_name ?? "",
    lastName: row.last_name ?? "",
    company: row.company ?? "",
    address1: row.address_1 ?? "",
    address2: row.address_2 ?? "",
    city: row.city ?? "",
    state: row.state ?? "",
    postcode: row.postcode ?? "",
    country: row.country ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
  };
}

async function hydrateOrders(
  orders: {
    id: bigint;
    status: string | null;
    currency: string | null;
    tax_amount: unknown;
    total_amount: unknown;
    customer_id: bigint | null;
    billing_email: string | null;
    date_created_gmt: Date | null;
    payment_method: string | null;
    payment_method_title: string | null;
    transaction_id: string | null;
    customer_note: string | null;
  }[],
): Promise<Order[]> {
  if (!orders.length) return [];
  const ids = orders.map((o) => o.id);
  const [addresses, items, itemMetas, metas, operations] = await Promise.all([
    prisma.wp_wc_order_addresses.findMany({ where: { order_id: { in: ids } } }),
    prisma.wp_woocommerce_order_items.findMany({ where: { order_id: { in: ids } } }),
    prisma.wp_woocommerce_order_itemmeta.findMany({
      where: { meta_key: { in: ["_product_id", "_qty", "_line_total"] } },
    }),
    prisma.wp_wc_orders_meta.findMany({ where: { order_id: { in: ids }, meta_key: { in: ["_order_shipping", "_cart_discount", "_order_key"] } } }),
    // Older rows only keep the key in HPOS operational data.
    prisma.wp_wc_order_operational_data.findMany({
      where: { order_id: { in: ids } },
      select: { order_id: true, order_key: true },
    }),
  ]);

  const itemIds = new Set(items.map((i) => toNumber(i.order_item_id)));
  const metaByItem = new Map<number, Map<string, string>>();
  for (const m of itemMetas) {
    const iid = toNumber(m.order_item_id);
    if (!itemIds.has(iid)) continue;
    if (!metaByItem.has(iid)) metaByItem.set(iid, new Map());
    if (m.meta_key) metaByItem.get(iid)!.set(m.meta_key, m.meta_value ?? "");
  }
  const orderMeta = new Map<number, Map<string, string>>();
  for (const m of metas) {
    const oid = toNumber(m.order_id);
    if (!orderMeta.has(oid)) orderMeta.set(oid, new Map());
    if (m.meta_key) orderMeta.get(oid)!.set(m.meta_key, m.meta_value ?? "");
  }

  return orders.map((o) => {
    const oid = toNumber(o.id);
    const billing = addresses.find((a) => toNumber(a.order_id) === oid && a.address_type === "billing");
    const shipping = addresses.find((a) => toNumber(a.order_id) === oid && a.address_type === "shipping");
    const oItems: OrderItem[] = items
      .filter((i) => toNumber(i.order_id) === oid)
      .map((i) => {
        const m = metaByItem.get(toNumber(i.order_item_id)) ?? new Map<string, string>();
        const quantity = Number(m.get("_qty") || 1);
        const total = Number(m.get("_line_total") || 0);
        return {
          id: toNumber(i.order_item_id),
          name: i.order_item_name,
          quantity,
          price: quantity ? total / quantity : total,
          total,
          productId: Number(m.get("_product_id") || 0),
        };
      });
    const om = orderMeta.get(oid) ?? new Map<string, string>();
    const tax = Number(o.tax_amount ?? 0);
    const total = Number(o.total_amount ?? 0);
    const shippingTotal = Number(om.get("_order_shipping") || 0);
    return {
      id: oid,
      status: normalizeOrderStatus(o.status),
      currency: o.currency ?? "INR",
      total,
      tax,
      shipping: shippingTotal,
      discount: Number(om.get("_cart_discount") || 0),
      subtotal: total - tax - shippingTotal,
      paymentMethod: o.payment_method ?? "",
      paymentTitle: o.payment_method_title ?? "",
      customerId: o.customer_id ? toNumber(o.customer_id) : null,
      billingEmail: o.billing_email ?? "",
      dateCreated: o.date_created_gmt,
      customerNote: o.customer_note ?? "",
      orderKey:
        om.get("_order_key") ||
        operations.find((op) => toNumber(op.order_id) === oid)?.order_key ||
        "",
      transactionId: o.transaction_id || "",
      billing: billing ? mapAddress(billing) : null,
      shippingAddress: shipping ? mapAddress(shipping) : null,
      items: oItems,
    };
  });
}

export async function getOrders(opts: { status?: string; search?: string; limit?: number } = {}): Promise<Order[]> {
  const where: Record<string, unknown> = { type: "shop_order" };
  if (opts.status) {
    const normalized = normalizeOrderStatus(opts.status);
    // Honour both the HPOS spelling and legacy `wc-` rows.
    where.status = { in: [normalized, `wc-${normalized}`] };
  }
  if (opts.search) where.billing_email = { contains: opts.search };
  const rows = await prisma.wp_wc_orders.findMany({
    where,
    orderBy: { date_created_gmt: "desc" },
    take: opts.limit ?? 100,
  });
  return hydrateOrders(rows);
}

export async function getOrderById(id: number): Promise<Order | null> {
  if (!Number.isInteger(id) || id <= 0) return null;
  const row = await prisma.wp_wc_orders.findUnique({ where: { id: BigInt(id) } });
  if (!row) return null;
  const [order] = await hydrateOrders([row]);
  return order ?? null;
}

export async function getOrdersForCustomer(customerId: number): Promise<Order[]> {
  if (!Number.isInteger(customerId) || customerId <= 0) return [];
  const rows = await prisma.wp_wc_orders.findMany({
    where: { customer_id: BigInt(customerId), type: "shop_order" },
    orderBy: { date_created_gmt: "desc" },
  });
  return hydrateOrders(rows);
}

export async function findOrderForTracking(id: number, email: string): Promise<Order | null> {
  const order = await getOrderById(id);
  if (!order) return null;
  if (order.billingEmail.toLowerCase() !== email.trim().toLowerCase()) return null;
  return order;
}

export async function updateOrderStatus(id: number, status: string): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) return;
  const normalized = normalizeOrderStatus(status);
  await prisma.wp_wc_orders.update({
    where: { id: BigInt(id) },
    data: { status: normalized, date_updated_gmt: new Date() },
  });
  await prisma.wp_wc_order_stats.update({ where: { order_id: BigInt(id) }, data: { status: normalized } }).catch(() => undefined);
}

/** Read a single order meta value (HPOS `wp_wc_orders_meta`). */
export async function getOrderMeta(id: number, key: string): Promise<string | null> {
  const row = await prisma.wp_wc_orders_meta.findFirst({
    where: { order_id: BigInt(id), meta_key: key },
    select: { meta_value: true },
  });
  return row?.meta_value ?? null;
}

/** Insert or update a single order meta value. */
export async function setOrderMeta(id: number, key: string, value: string): Promise<void> {
  const existing = await prisma.wp_wc_orders_meta.findFirst({
    where: { order_id: BigInt(id), meta_key: key },
    select: { id: true },
  });
  if (existing) {
    await prisma.wp_wc_orders_meta.update({ where: { id: existing.id }, data: { meta_value: value } });
    return;
  }
  await prisma.wp_wc_orders_meta.create({
    data: { order_id: BigInt(id), meta_key: key, meta_value: value },
  });
}

/**
 * Mark an order as paid after a successful online payment: records the
 * transaction id, stamps the paid date and moves the order to "processing".
 */
export async function markOrderPaid(
  id: number,
  payment: { transactionId: string; paymentMethod?: string; paymentTitle?: string },
): Promise<void> {
  const now = new Date();
  await prisma.wp_wc_orders.update({
    where: { id: BigInt(id) },
    data: {
      status: "processing",
      transaction_id: payment.transactionId,
      date_updated_gmt: now,
      ...(payment.paymentMethod ? { payment_method: payment.paymentMethod } : {}),
      ...(payment.paymentTitle ? { payment_method_title: payment.paymentTitle } : {}),
    },
  });
  await prisma.wp_wc_order_operational_data
    .update({ where: { order_id: BigInt(id) }, data: { date_paid_gmt: now } })
    .catch(() => undefined);
  await prisma.wp_wc_order_stats
    .update({ where: { order_id: BigInt(id) }, data: { status: "processing", date_paid: now } })
    .catch(() => undefined);
  await setOrderMeta(id, "_transaction_id", payment.transactionId);
  await setOrderMeta(id, "_date_paid", String(Math.floor(now.getTime() / 1000)));
  await setOrderMeta(id, "_paid_date", now.toISOString());
}

export async function getOrderStats(): Promise<{
  totalOrders: number;
  revenue: number;
  pending: number;
  processing: number;
  completed: number;
  recent: Order[];
}> {
  const rows = await prisma.wp_wc_orders.findMany({
    where: { type: "shop_order" },
    orderBy: { date_created_gmt: "desc" },
  });
  const revenue = rows
    .filter((r) => {
      const status = normalizeOrderStatus(r.status);
      return status && !["cancelled", "refunded", "failed", "checkout-draft"].includes(status);
    })
    .reduce((sum, r) => sum + Number(r.total_amount ?? 0), 0);
  const countByStatus = (wanted: string) =>
    rows.filter((r) => normalizeOrderStatus(r.status) === wanted).length;
  return {
    totalOrders: rows.length,
    revenue,
    pending: countByStatus("pending"),
    processing: countByStatus("processing"),
    completed: countByStatus("completed"),
    recent: await hydrateOrders(rows.slice(0, 8)),
  };
}
