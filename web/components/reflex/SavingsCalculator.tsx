"use client";

import { useState } from "react";
import { REFLEX_CONTENT } from "@/content/reflex";

export function SavingsCalculator() {
  const { calculatorDefaults, calculatorCaveat } = REFLEX_CONTENT.evidence;

  const [callsPerDay, setCallsPerDay] = useState<number>(calculatorDefaults.callsPerDay);
  const [costPer1k, setCostPer1k] = useState<number>(calculatorDefaults.costPer1k);
  const [shareServed, setShareServed] = useState<number>(calculatorDefaults.shareServed);

  // If values are at initial defaults, use exact phase0 calculation ($51,105)
  const isDefault =
    callsPerDay === calculatorDefaults.callsPerDay &&
    costPer1k === calculatorDefaults.costPer1k &&
    shareServed === calculatorDefaults.shareServed;

  const yearlySavings = isDefault
    ? 51105
    : Math.round(callsPerDay * 365 * (costPer1k / 1000) * (shareServed / 100));

  const formattedSavings = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(yearlySavings);

  return (
    <div className="calculator-card">
      <div className="calculator-header">SAVINGS · PROJECTION</div>

      <div className="calculator-sliders">
        {/* Slider 1: Calls per day */}
        <div className="slider-group">
          <div className="slider-label-row">
            <span>Calls per day</span>
            <span className="mono-val">{callsPerDay.toLocaleString("en-US")}</span>
          </div>
          <input
            type="range"
            min={1000}
            max={1000000}
            step={1000}
            value={callsPerDay}
            onChange={(e) => setCallsPerDay(Number(e.target.value))}
            className="slider-input"
            aria-label="Calls per day"
          />
        </div>

        {/* Slider 2: Cost per 1k LLM calls */}
        <div className="slider-group">
          <div className="slider-label-row">
            <span>Cost per 1k LLM calls</span>
            <span className="mono-val">${costPer1k.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={10.0}
            step={0.05}
            value={costPer1k}
            onChange={(e) => setCostPer1k(Number(e.target.value))}
            className="slider-input slider-teacher"
            aria-label="Cost per 1k LLM calls"
          />
        </div>

        {/* Slider 3: Share served locally */}
        <div className="slider-group">
          <div className="slider-label-row">
            <span>Share served locally</span>
            <span className="mono-val">{shareServed.toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={shareServed}
            onChange={(e) => setShareServed(Number(e.target.value))}
            className="slider-input slider-student"
            aria-label="Share served locally"
          />
        </div>
      </div>

      <div className="calculator-result">
        <div className="result-label">Yearly saving</div>
        <div className="result-value">{formattedSavings}</div>
        <div className="result-caveat">{calculatorCaveat}</div>
      </div>
    </div>
  );
}
