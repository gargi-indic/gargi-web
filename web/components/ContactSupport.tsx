import Image from "next/image";
import { CONTACT_LINE } from "@/content/lab";
import { ContactForm } from "@/components/ContactForm";

export function ContactSupport({ source = "indic" }: { source?: string }) {
  return (
    <section
      id="contact-support"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        borderTop: "2px solid var(--line)",
        borderBottom: "2px solid var(--line)",
        background: "var(--paper)",
      }}
    >
      {/* Left Column: Grayscale Portrait */}
      <div
        style={{
          position: "relative",
          minHeight: "360px",
          background: "var(--raised)",
          borderRight: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Image
          src="/access-portrait.png"
          alt=""
          width={1200}
          height={1600}
          priority={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "grayscale(1) contrast(1.08)",
          }}
        />
      </div>

      {/* Right Column: Signal Red Accent Panel */}
      <div
        style={{
          position: "relative",
          backgroundColor: "var(--accent)",
          color: "var(--on-accent)",
          padding: "clamp(32px, 5vw, 56px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Ghost mark - fully legible, not cropped */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "24px",
            fontSize: "clamp(120px, 16vw, 220px)",
            fontFamily: "var(--font-noto-malayalam, 'Noto Sans Malayalam', sans-serif)",
            fontWeight: 800,
            lineHeight: 1,
            opacity: 0.14,
            color: "var(--on-accent)",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 0,
          }}
          aria-hidden="true"
        >
          ഗ
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <h2
            style={{
              fontFamily: "var(--font-display, Archivo, sans-serif)",
              fontWeight: 800,
              fontSize: "clamp(22px, 2.6vw, 32px)",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              margin: "0 0 28px 0",
              color: "var(--on-accent)",
              maxWidth: "32ch",
            }}
          >
            {CONTACT_LINE}
          </h2>

          <ContactForm source={source} />
        </div>
      </div>
    </section>
  );
}
