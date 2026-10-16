import SettingsForm from "@/components/admin/SettingsForm";
import ThemePicker from "@/components/admin/ThemePicker";
import { getAdminAccount, getSettings } from "@/lib/store";
import { getTheme } from "@/lib/themes";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [settings, account] = await Promise.all([getSettings(), getAdminAccount()]);

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-ash">
          Settings
        </p>
        <h1 className="type-display mt-3 text-[clamp(1.6rem,4vw,2.4rem)] text-bone">
          Theme, contact details & credentials
        </h1>
        <p className="mt-3 max-w-2xl text-[0.92rem] leading-relaxed text-fog">
          The theme changes the whole site for every visitor. Placeholders are fine while building —
          but the contact email, phone, WhatsApp number and Instagram URL are shown publicly, so
          replace them with verified details before launch.
        </p>
      </header>

      <ThemePicker activeTheme={getTheme(settings.theme).id} />

      <SettingsForm
        settings={settings}
        username={account.username}
        mustChangePassword={account.mustChangePassword}
      />
    </div>
  );
}
