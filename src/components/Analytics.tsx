import Script from "next/script";

/**
 * Google Analytics 4 — loaded only when NEXT_PUBLIC_GA_ID is present, so the
 * site ships with zero third-party requests until the brand opts in.
 */
export default function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();
  if (!gaId || !/^G-[A-Z0-9]+$/i.test(gaId)) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="shunya-ga4" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { anonymize_ip: true, send_page_view: true });
        `}
      </Script>
    </>
  );
}
