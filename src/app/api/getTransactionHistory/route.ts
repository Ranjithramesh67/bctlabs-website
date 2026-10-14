import { NextResponse } from "next/server";

import type { Prisma } from "@/generated/prisma/client";
import {
  isFilled,
  isValidDate,
  laravelAttr,
  readCommerceInput,
  serializeCommerce,
  validationMsg,
} from "@/lib/api-commerce";
import { requireApiUser } from "@/lib/api-token";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * ANY /api/getTransactionHistory
 *
 * Laravel `OrderController::getTransactionHistory`. Validation errors return
 * HTTP 422 with the full `errors` bag (not the usual 200 "first error" shape).
 */
async function getTransactionHistory(request: Request) {
  const auth = await requireApiUser(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const input = await readCommerceInput(request);
    const errors: Record<string, string[]> = {};
    const addError = (attr: string, message: string) => {
      (errors[attr] ??= []).push(message);
    };

    const fromFilled = isFilled(input.from_date);
    const toFilled = isFilled(input.to_date);

    if (fromFilled && !isValidDate(input.from_date)) {
      addError("from_date", validationMsg.date("from_date"));
    }
    if (toFilled) {
      if (!isValidDate(input.to_date)) {
        addError("to_date", validationMsg.date("to_date"));
      } else if (
        !fromFilled ||
        !isValidDate(input.from_date) ||
        Date.parse(String(input.to_date)) < Date.parse(String(input.from_date))
      ) {
        addError(
          "to_date",
          validationMsg.afterOrEqual("to_date", laravelAttr("from_date")),
        );
      }
    }
    if (isFilled(input.customer_id)) {
      const customerId = /^-?\d+$/.test(String(input.customer_id))
        ? Number(input.customer_id)
        : null;
      if (
        customerId === null ||
        !(await prisma.customers.findUnique({ where: { id: customerId } }))
      ) {
        addError("customer_id", validationMsg.exists("customer_id"));
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { status: false, message: "Invalid parameters.", errors },
        { status: 422 },
      );
    }

    const where: Prisma.transactionsWhereInput = {
      user_id: BigInt(auth.user.id),
    };
    if (isFilled(input.from_date)) {
      where.created_at = { gte: new Date(String(input.from_date)) };
    }
    if (isFilled(input.to_date)) {
      where.created_at = {
        ...(where.created_at as Prisma.DateTimeNullableFilter | undefined),
        lte: new Date(String(input.to_date)),
      };
    }
    if (isFilled(input.customer_id)) {
      where.customer_id = Number(input.customer_id);
    }

    const transactions = await prisma.transactions.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    let totalCredit = 0;
    let totalDebit = 0;
    for (const transaction of transactions) {
      if (transaction.type === "credit") {
        totalCredit += Number(transaction.amount);
      } else if (transaction.type === "debit") {
        totalDebit += Number(transaction.amount);
      }
    }

    return NextResponse.json({
      status: true,
      message: "Transaction history retrieved successfully.",
      data: serializeCommerce(transactions),
      total_credit: totalCredit,
      total_debit: totalDebit,
    });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Failed to fetch transaction history.",
    });
  }
}

export const GET = getTransactionHistory;
export const POST = getTransactionHistory;
export const PUT = getTransactionHistory;
export const PATCH = getTransactionHistory;
export const DELETE = getTransactionHistory;
