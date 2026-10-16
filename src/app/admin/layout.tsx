import type { Metadata } from "next";

import AdminShell from "@/components/admin/AdminShell";
import LoginForm from "@/components/admin/LoginForm";
import { getAdminSession } from "@/lib/api-guard";
import { getAdminAccount, getEnquiries } from "@/lib/store";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * The SHUNYA studio (admin) is gated in one place: this layout. Anything under
 * /admin renders the sign-in screen until a valid session cookie is present,
 * and every mutation also re-checks the session server-side.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  if (!session) {
    return (
      <div className="relative min-h-[100svh] bg-void">
        <div className="pointer-events-none absolute left-1/2 top-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-ember/10 blur-[130px]" />
        <LoginForm />
      </div>
    );
  }

  const [account, enquiries] = await Promise.all([getAdminAccount(), getEnquiries()]);
  const unread = enquiries.filter((enquiry) => enquiry.status === "new").length;

  return (
    <div className="min-h-[100svh] bg-void">
      <AdminShell
        username={session.username}
        unread={unread}
        mustChangePassword={account.mustChangePassword}
      >
        {children}
      </AdminShell>
    </div>
  );
}
