import EnquiriesInbox from "@/components/admin/EnquiriesInbox";
import { getEnquiries, getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminEnquiriesPage() {
  const [enquiries, settings] = await Promise.all([getEnquiries(), getSettings()]);
  const unread = enquiries.filter((enquiry) => enquiry.status === "new").length;

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">
          {enquiries.length} total · {unread} new
        </p>
        <h1 className="type-display mt-3 text-[clamp(1.6rem,4vw,2.4rem)] text-bone">Enquiries</h1>
        <p className="mt-3 max-w-2xl text-[0.92rem] leading-relaxed text-fog">
          Every website submission — private bookings, artist collaborations, brand partnerships,
          sponsorships and general enquiries — lands here with a reference number.
        </p>
      </header>

      <EnquiriesInbox enquiries={enquiries} contactEmail={settings.contactEmail} />
    </div>
  );
}
