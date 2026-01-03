export const HISTOLOGY = [
  "PTC and variants",
  "FTC + IEFVPTC",
  "Oncocytic (OTC)",
] as const;

export const T_GROUP = [
  "T1–T2 (intrathyroidal)",
  "T3a (intrathyroidal)",
  "T3b–T4 (gross ETE)",
] as const;

export const NODAL = [
  "N0/Nx OR N1a (≤2 mm and all ≤5 LNs)",
  "N1a >2 mm OR >5 LNs",
  "cN1b <3 cm",
  "N1b ≥3 cm OR ENE+",
] as const;

export const M_STATUS = ["M0", "M1"] as const;

export const MARGIN = [
  "R0 / Negative",
  "R1 / Microscopic (anterior)",
  "R1 / Microscopic (posterior)",
  "R2 / Gross positive margin",
] as const;

export const YES_NO = ["No", "Yes"] as const;

// Multifocality only meaningful for PTC group in your rules
export const MULTIFOCALITY_PTC = [
  "None",
  "Unilateral",
  "Bilateral ≥1 cm",
] as const;

// Vascular invasion
export const VI_PTC = ["None", "Present (Yes)"] as const;
export const VI_FTC_OTC = [
  "Minimally invasive (capsular only)",
  "Limited angioinvasive (<4 vessels)",
  "Extensive angioinvasive (≥4 vessels)",
  "Widely invasive (extracapsular)",
] as const;
