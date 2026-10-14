import { headers } from "next/headers";
import { connection } from "next/server";

import { AdminSection } from "@/components/admin/ui";
import { laravelFullName, profilePictureUrl } from "@/lib/api-users";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";

import { ProfileForm, type LanguageOption } from "./profile-form";

export const instant = false;

/**
 * `getLanguages()` reads the directories under `lang/`; the port ships the same
 * nine locales (English labels only, see report).
 */
const LANGUAGES: LanguageOption[] = [
  { code: "ar", label: "Arabic" },
  { code: "de", label: "German" },
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "tr", label: "Turkish" },
  { code: "zh", label: "Chinese" },
];

export default async function ProfilePage() {
  // Session/DB-backed page: render at request time (Cache Components).
  await connection();
  const currentUser = await getCurrentUser();

  const user = await prisma.users.findUnique({ where: { id: currentUser.id } });
  if (!user) {
    // `getCurrentUser()` already guarantees the row exists; keep a safe default.
    return (
      <AdminSection title={t("user.edit_profile")}>
        <div className="card">
          <div className="card-body" />
        </div>
      </AdminSection>
    );
  }

  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const imageUrl = await profilePictureUrl(
    new Request(`${protocol}://${host}/`),
    user,
  );

  return (
    <AdminSection title={t("user.edit_profile")}>
      <ProfileForm
        user={{
          id: user.id,
          fullName: laravelFullName(user.first_name, user.last_name),
          firstName: user.first_name ?? "",
          lastName: user.last_name ?? "",
          email: user.email ?? "",
          phone: user.phone ?? "",
          facebook: user.facebook ?? "",
          linkedin: user.linkedin ?? "",
          skype: user.skype ?? "",
          imageUrl,
          defaultLanguage: user.default_language ?? "",
        }}
        languages={LANGUAGES}
      />
    </AdminSection>
  );
}
