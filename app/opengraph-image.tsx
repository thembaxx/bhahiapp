import { ImageResponse } from "next/og";

export const alt = "BahiApp – Offline Spaza Shop Book, CRM & Multi-Language SMS Ledger";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        backgroundColor: "#FBF8F3",
        backgroundImage:
          "radial-gradient(circle at 15% 20%, #BDEBE3 0%, transparent 50%), radial-gradient(circle at 85% 30%, #E6F58B 0%, transparent 55%), radial-gradient(circle at 50% 95%, #F6C4C0 0%, transparent 50%)",
        color: "#13222B",
        fontFamily: "sans-serif",
      }}
    >
      {/* Top Brand Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 28,
              backgroundColor: "#0B0B0C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 24,
                top: 16,
                width: 18,
                height: 64,
                borderRadius: 9,
                backgroundColor: "#FFFFFF",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 42,
                top: 38,
                width: 36,
                height: 36,
                borderRadius: 18,
                border: "10px solid #DDF24E",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 54,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#13222B",
              }}
            >
              BahiApp
            </span>
            <span style={{ fontSize: 22, color: "#1F5F63", fontWeight: 600 }}>
              Every sale, in the book.
            </span>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#13222B",
            color: "#DDF24E",
            padding: "14px 28px",
            borderRadius: 999,
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          Offline-First PWA · EN · ZU · ST
        </div>
      </div>

      {/* Middle Headline & Metric Showcase */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 32,
          marginTop: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 680,
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              color: "#13222B",
            }}
          >
            Digital Credit Book, CRM & Stock Till for Spaza Shops
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#5A6570",
              lineHeight: 1.4,
            }}
          >
            Track stock, record buy-now-pay-later customer credit without data, and send polite SMS
            reminders in English, isiZulu & Sesotho.
          </div>
        </div>

        {/* Right Card Preview */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 40,
            padding: 36,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            minWidth: 340,
            boxShadow: "0 24px 60px rgba(19, 34, 43, 0.14)",
          }}
        >
          <span style={{ fontSize: 18, color: "#78808A" }}>Today’s takings</span>
          <span
            style={{
              fontSize: 52,
              fontWeight: 900,
              color: "#13222B",
              letterSpacing: "-0.02em",
            }}
          >
            R2,845.50
          </span>
          <div
            style={{
              height: 14,
              width: "100%",
              borderRadius: 99,
              background: "linear-gradient(90deg, #DDF24E, #74C2F6 35%, #F5B83D 68%, #E8453C)",
              marginTop: 10,
            }}
          />
          <span
            style={{
              fontSize: 18,
              color: "#1F5F63",
              fontWeight: 700,
              marginTop: 4,
            }}
          >
            Collected 65% · R3,120 repaid
          </span>
        </div>
      </div>

      {/* Bottom Spectrum Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 20,
          color: "#13222B",
          fontWeight: 600,
          borderTop: "2px solid rgba(19,34,43,0.1)",
          paddingTop: 20,
        }}
      >
        <span>Spaza & Duka Micro-ERP</span>
        <span>Customer CRM & Purchase History</span>
        <span>Daily / Weekly / Monthly Analytics</span>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
