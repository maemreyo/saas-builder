import { Sidebar } from "@/components/dashboard/sidebar";
import { EmailVerificationBanner } from "@/components/auth/email-verification-banner";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <EmailVerificationBanner />
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-4 py-8">{children}</div>
        </main>
      </div>
    </>
  );
}
