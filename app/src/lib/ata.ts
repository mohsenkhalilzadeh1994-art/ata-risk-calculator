import {
  HISTOLOGY,
  T_GROUP,
  NODAL,
  M_STATUS,
  MARGIN,
  YES_NO,
  MULTIFOCALITY_PTC,
  VI_PTC,
  VI_FTC_OTC,
} from "./options";

export type Histology = (typeof HISTOLOGY)[number];
export type TGroup = (typeof T_GROUP)[number];
export type Nodal = (typeof NODAL)[number];
export type MStatus = (typeof M_STATUS)[number];
export type Margin = (typeof MARGIN)[number];
export type YesNo = (typeof YES_NO)[number];
export type MultifocalityPTC = (typeof MULTIFOCALITY_PTC)[number];
export type ViPTC = (typeof VI_PTC)[number];
export type ViFtcOtc = (typeof VI_FTC_OTC)[number];

export type RiskCategory =
  | "Low"
  | "Low-Intermediate"
  | "High-Intermediate"
  | "High";

export type Inputs = {
  histology: Histology;
  tGroup: TGroup;
  nodal: Nodal;
  m: MStatus;
  margin: Margin;

  aggressiveHistology: YesNo; // tall/hobnail/columnar etc.
  poorDiffHighGrade: YesNo;

  multifocalityPTC: MultifocalityPTC; // only used if histology is PTC group
  microscopicETE: YesNo;

  // vascular invasion depends on histology group
  viPTC: ViPTC;
  viFtcOtc: ViFtcOtc;

  // ONLY for FTC/OTC group
  encapsulatedAngioinvasive_FtcOtc: YesNo;
};

export type Result = {
  category: RiskCategory;
  rationale: string[];
  recommendedRAI: string;
};

/** helper */
const isYes = (x: YesNo) => x === "Yes";

/**
 * Margin parsing: options.ts'deki yazım farklı olsa bile
 * "R2", "posterior", "anterior", "microscopic" kelimeleriyle yakalar.
 */
function marginKind(m: string): "R0" | "R1_ANT" | "R1_POST" | "R2" | "OTHER" {
  const s = (m || "").toLowerCase();

  if (s.includes("r2")) return "R2";

  // R1 posterior (microscopic + posterior margin)
  if (s.includes("r1") && s.includes("posterior")) return "R1_POST";
  if (s.includes("microscopic") && s.includes("posterior")) return "R1_POST";

  // R1 anterior (microscopic + anterior margin)
  if (s.includes("r1") && s.includes("anterior")) return "R1_ANT";
  if (s.includes("microscopic") && s.includes("anterior")) return "R1_ANT";

  if (s.includes("r0") || s.includes("negative")) return "R0";

  return "OTHER";
}

function calcLowIntermediateCount(i: Inputs): {
  count: number;
  reasons: string[];
} {
  let c = 0;
  const r: string[] = [];

  // 1) cN1a/pN1a >2mm OR >5 LNs  => LI factor
  if (i.nodal === "N1a >2 mm OR >5 LNs") {
    c++;
    r.push("N1a >2 mm or >5 LNs → Low-Intermediate risk factor");
  }

  // 2) Unilateral multifocality (PTC) => LI factor
  if (
    i.histology === "PTC and variants" &&
    i.multifocalityPTC === "Unilateral"
  ) {
    c++;
    r.push("PTC unilateral multifocality → Low-Intermediate risk factor");
  }

  // 3) Microscopic ETE => LI factor
  // (Not: T3a + microscopic ETE zaten HIGH trigger olarak ele alınıyor aşağıda)
  if (isYes(i.microscopicETE)) {
    c++;
    r.push("Microscopic ETE → Low-Intermediate risk factor");
  }

  // 4) Margin: R1 posterior => LI factor
  const mk = marginKind(i.margin);
  if (mk === "R1_POST") {
    c++;
    r.push(
      "Microscopic + posterior margin (R1 posterior) → Low-Intermediate risk factor"
    );
  }

  // R1 anterior: şemada Low tarafında kalabiliyor -> faktör saymıyoruz
  if (
    i.histology !== "PTC and variants" &&
    i.viFtcOtc === "Limited angioinvasive (<4 vessels)"
  ) {
    c++;
    r.push(
      "FTC/OTC limited angioinvasion (<4 vessels) → Low-Intermediate risk factor"
    );
  }
  return { count: c, reasons: r };
}

export function calculateRisk(i: Inputs): Result {
  const rationale: string[] = [];

  // --- HIGH triggers ---
  const highTriggers: string[] = [];

  // M1
  if (i.m === "M1") highTriggers.push("Distant metastasis (M1)");

  // T3b/T4 gross ETE
  if (i.tGroup === "T3b–T4 (gross ETE)")
    highTriggers.push("Gross ETE (T3b–T4 group)");

  // bulky/ENE+ N1b
  if (i.nodal === "N1b ≥3 cm OR ENE+")
    highTriggers.push("Bulky N1b (≥3 cm) or ENE+");

  // R2 gross incomplete resection
  if (marginKind(i.margin) === "R2")
    highTriggers.push("Gross incomplete resection (R2)");

  // Poor differentiation / high grade
  if (isYes(i.poorDiffHighGrade))
    highTriggers.push("Poor differentiation / high grade");

  // Non-PTC: extensive VI → High
  // FTC / IEFVPTC / OTC invasion logic
  // FTC / IEFVPTC / OTC: invasion rule
  // Minimally invasive -> Low (no trigger)
  // Limited angioinvasion -> handled as LI factor in calcLowIntermediateCount()
  // Extensive angioinvasion OR Widely invasive -> High
  if (i.histology !== "PTC and variants") {
    if (
      i.viFtcOtc === "Extensive angioinvasive (≥4 vessels)" ||
      i.viFtcOtc === "Widely invasive (extracapsular)"
    ) {
      highTriggers.push("FTC/OTC: Extensive angioinvasion or widely invasive");
    }
  }

  // 5) FTC/OTC: Limited angioinvasion => LI factor

  // ✅ Critical rule (şemadaki gibi): T3a + microscopic ETE → HIGH
  if (i.tGroup === "T3a (intrathyroidal)" && isYes(i.microscopicETE)) {
    highTriggers.push("T3a + microscopic ETE → High");
  }

  if (highTriggers.length > 0) {
    rationale.push(...highTriggers.map((s) => `High trigger: ${s}`));
    return {
      category: "High",
      rationale,
      recommendedRAI: recommendRAI("High", i),
    };
  }

  // --- HIGH-INTERMEDIATE triggers ---
  const hiTriggers: string[] = [];

  // 1) Bilateral multifocality >1 cm (PTC)
  if (
    i.histology === "PTC and variants" &&
    i.multifocalityPTC === "Bilateral ≥1 cm"
  ) {
    hiTriggers.push("PTC bilateral multifocality ≥1 cm");
  }

  // 2) Clinically evident lateral LN mets (cN1b) <3 cm
  if (i.nodal === "cN1b <3 cm") {
    hiTriggers.push("Clinically evident lateral LN mets (cN1b) <3 cm");
  }

  // 3) Aggressive histology (şemada HI)
  if (isYes(i.aggressiveHistology)) {
    hiTriggers.push("Aggressive histology subtype");
  }

  // 4) Vascular invasion (PTC) (şemada HI)
  if (i.histology === "PTC and variants" && i.viPTC === "Present (Yes)") {
    hiTriggers.push("PTC vascular invasion present");
  }

  // 5) ✅ 2+ Low-Intermediate risk factors => High-Intermediate
  const li = calcLowIntermediateCount(i);
  if (li.count >= 2) {
    hiTriggers.push(`2+ Low-Intermediate risk factors (count=${li.count})`);
  }

  if (hiTriggers.length > 0) {
    rationale.push(...hiTriggers.map((s) => `High-Intermediate trigger: ${s}`));
    if (li.count > 0) rationale.push(...li.reasons);
    return {
      category: "High-Intermediate",
      rationale,
      recommendedRAI: recommendRAI("High-Intermediate", i),
    };
  }

  // --- LOW-INTERMEDIATE triggers ---
  const liTriggers: string[] = [];

  // T3a alone -> Low-Intermediate (şemada var)
  if (i.tGroup === "T3a (intrathyroidal)") {
    liTriggers.push("T3a alone → Low-Intermediate");
  }

  // 1+ LI factor -> Low-Intermediate
  if (li.count >= 1) {
    liTriggers.push(`≥1 Low-Intermediate risk factor (count=${li.count})`);
  }

  if (liTriggers.length > 0) {
    rationale.push(...liTriggers.map((s) => `Low-Intermediate trigger: ${s}`));
    rationale.push(...li.reasons);
    return {
      category: "Low-Intermediate",
      rationale,
      recommendedRAI: recommendRAI("Low-Intermediate", i),
    };
  }

  // --- LOW ---
  rationale.push("No triggers met → Low");
  return { category: "Low", rationale, recommendedRAI: recommendRAI("Low", i) };
}

export function recommendRAI(category: RiskCategory, i: Inputs): string {
  // Metastatic override
  if (i.m === "M1") {
    return "100–200 mCi (3.7–7.4 GBq) or consider dosimetry (M1).";
  }

  switch (category) {
    case "Low":
      return "RAI generally not given; if considered: ~30–50 mCi (1.1–1.85 GBq).";
    case "Low-Intermediate":
      return "30–100 mCi (1.1–3.7 GBq).";
    case "High-Intermediate":
      return "30–100 mCi (1.1–3.7 GBq).";
    case "High":
      return "100–150 mCi (3.7–5.55 GBq).";
  }
}
