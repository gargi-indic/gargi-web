import { REFLEX_CONTENT } from "@/content/reflex";

export function Problem() {
  const { problem } = REFLEX_CONTENT;

  return (
    <section className="reflex-section reflex-problem-section">
      <div className="reflex-container">
        <div className="problem-grid">
          {problem.cards.map((card) => (
            <div key={card.num} className="problem-card">
              <span className="problem-num">{card.num}</span>
              <h3 className="problem-title">{card.title}</h3>
              <p className="problem-body">{card.body}</p>
              {card.caveat && <span className="problem-caveat">{card.caveat}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
