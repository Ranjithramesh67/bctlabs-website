import { redirect } from "next/navigation";

/**
 * Laravel: `Route::get('/signin', fn () => Redirect::to('/login'))`.
 */
export default function SigninPage() {
  redirect("/login");
}
