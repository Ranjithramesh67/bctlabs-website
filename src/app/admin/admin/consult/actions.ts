"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { setFlash } from "@/lib/admin/flash";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Laravel `CareerApplicationController::consult_destroy`. */
export async function deleteConsultApplication(
  formData: FormData,
): Promise<void> {
  await getCurrentUser();

  const id = Number(formData.get("id"));
  if (Number.isInteger(id) && id > 0) {
    const application = await prisma.consultations.findUnique({
      where: { id },
    });
    if (application) {
      await prisma.consultations.delete({ where: { id } });
      await setFlash("success", "Application deleted successfully");
    }
  }

  revalidatePath("/admin/admin/consult");
  redirect("/admin/admin/consult");
}
