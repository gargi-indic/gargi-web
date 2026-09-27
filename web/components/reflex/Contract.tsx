import { REFLEX_CONTENT } from "@/content/reflex";

export function Contract() {
  const { contract } = REFLEX_CONTENT;

  return (
    <section className="reflex-contract-section">
      <div className="reflex-container">
        <div className="contract-eyebrow">{contract.eyebrow}</div>
        <p className="contract-statement">{contract.statement}</p>
        <div className="contract-caveat">{contract.caveat}</div>
      </div>
    </section>
  );
}
