"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { setFlash } from "@/lib/admin/flash";
import { deleteUpload } from "@/lib/admin/upload";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Laravel `CareerApplicationController::destroy`. */
export async function deleteCareerApplication(
  formData: FormData,
): Promise<void> {
  await getCurrentUser();

  const id = Number(formData.get("id"));
  if (Number.isInteger(id) && id > 0) {
    const application = await prisma.career_applications.findUnique({
      where: { id: BigInt(id) },
    });
    if (application) {
      // The resume lives under `public/career` (see the public store route).
      await deleteUpload(`career/${application.resume_path}`);
      await prisma.career_applications.delete({ where: { id: BigInt(id) } });
      await setFlash("success", "Application deleted successfully");
    }
  }

  revalidatePath("/admin/admin/careers");
  redirect("/admin/admin/careers");
}
