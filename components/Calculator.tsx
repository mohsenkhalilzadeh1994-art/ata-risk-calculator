"use client";

import React, { useMemo, useState, useEffect } from "react";
import { calculateRisk, type Inputs } from "@/app/src/lib/ata";
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
} from "@/app/src/lib/options";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type YesNo = (typeof YES_NO)[number];

function Field({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="
      space-y-2
      rounded-xl
      border
      border-sky-200
      bg-sky-300/15
      p-4
    "
    >
      <div>
        <div className="text-sm font-semibold text-sky-900">{title}</div>
        {subtitle ? (
          <div className="text-xs text-sky-700">{subtitle}</div>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function YesNoSwitch({
  value,
  onChange,
  disabled,
}: {
  value: YesNo;
  onChange: (v: YesNo) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <Switch
        disabled={disabled}
        checked={value === "Yes"}
        onCheckedChange={(c) => onChange(c ? "Yes" : "No")}
      />
      <span className="text-sm">{value}</span>
    </div>
  );
}

export default function Calculator() {
  const [inputs, setInputs] = useState<Inputs>({
    histology: HISTOLOGY[0],
    tGroup: T_GROUP[0],
    nodal: NODAL[0],
    m: M_STATUS[0],
    margin: MARGIN[0],

    aggressiveHistology: "No",
    poorDiffHighGrade: "No",

    multifocalityPTC: MULTIFOCALITY_PTC[0],
    microscopicETE: "No",

    viPTC: VI_PTC[0],
    viFtcOtc: VI_FTC_OTC[0],

    // DİKKAT: ata.ts’de isim böyle:
    encapsulatedAngioinvasive_FtcOtc: "No",
  });

  const isPTC = inputs.histology === "PTC and variants";
  const isNonPTC = !isPTC;

  // Histology değişince karşı grubun alanlarını nötrle (yanlış trigger olmasın)
  useEffect(() => {
    if (isPTC) {
      setInputs((p) => ({
        ...p,
        viFtcOtc: VI_FTC_OTC[0],
        encapsulatedAngioinvasive_FtcOtc: "No",
      }));
    } else {
      setInputs((p) => ({
        ...p,
        multifocalityPTC: MULTIFOCALITY_PTC[0],
        viPTC: VI_PTC[0],
      }));
    }
  }, [isPTC]);

  const result = useMemo(() => calculateRisk(inputs), [inputs]);

  // ✅ 3) Risk badge renklendirme (senin istediğin hamle)
  const riskColor: Record<string, string> = {
    Low: "bg-emerald-100 text-emerald-800 border-emerald-300",
    "Low-Intermediate": "bg-amber-100 text-amber-800 border-amber-300",
    "High-Intermediate": "bg-orange-100 text-orange-800 border-orange-300",
    High: "bg-rose-100 text-rose-800 border-rose-300",
  };

  // ✅ 4) Cam gibi kart class’ları (tek yerden yönet)
  const glassCard =
    "bg-white/80 backdrop-blur border border-zinc-200/80 shadow-sm";

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* ✅ 5) Başlıkları renkle ayır */}
        <div className="mb-6 flex items-center justify-between">
          {/* Sol taraf: Başlık */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              ATA 2025 Risk Calculator
            </h1>
            <p className="text-sm text-zinc-600">
              Developed at Ege University, Department of Nuclear Medicine.
            </p>
          </div>

          {/* Sağ taraf: Logo */}
          <img
            src="/ege-logo.png"
            alt="Ege University"
            className="h-10 w-auto opacity-90"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* LEFT: Inputs */}
          <Card className={glassCard}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-indigo-700">
                Inputs
              </CardTitle>
              <CardDescription className="text-zinc-600"></CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <Field title="Histology">
                  <Select
                    value={inputs.histology}
                    onValueChange={(v) =>
                      setInputs((p) => ({
                        ...p,
                        histology: v as Inputs["histology"],
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select histology" />
                    </SelectTrigger>
                    <SelectContent>
                      {HISTOLOGY.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field title="Primary tumor extent (T)">
                  <Select
                    value={inputs.tGroup}
                    onValueChange={(v) =>
                      setInputs((p) => ({
                        ...p,
                        tGroup: v as Inputs["tGroup"],
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select T group" />
                    </SelectTrigger>
                    <SelectContent>
                      {T_GROUP.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field title="Nodal status">
                  <Select
                    value={inputs.nodal}
                    onValueChange={(v) =>
                      setInputs((p) => ({ ...p, nodal: v as Inputs["nodal"] }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select nodal" />
                    </SelectTrigger>
                    <SelectContent>
                      {NODAL.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field title="Distant metastasis (M)">
                  <Select
                    value={inputs.m}
                    onValueChange={(v) =>
                      setInputs((p) => ({ ...p, m: v as Inputs["m"] }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select M" />
                    </SelectTrigger>
                    <SelectContent>
                      {M_STATUS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field title="Resection / margin status">
                  <Select
                    value={inputs.margin}
                    onValueChange={(v) =>
                      setInputs((p) => ({
                        ...p,
                        margin: v as Inputs["margin"],
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select margin" />
                    </SelectTrigger>
                    <SelectContent>
                      {MARGIN.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <div className="hidden md:block" />
              </div>

              <Separator />

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  title="Aggressive histology"
                  subtitle="tall / hobnail / columnar etc."
                >
                  <YesNoSwitch
                    value={inputs.aggressiveHistology}
                    onChange={(v) =>
                      setInputs((p) => ({ ...p, aggressiveHistology: v }))
                    }
                  />
                </Field>

                <Field title="Poor differentiation / high grade">
                  <YesNoSwitch
                    value={inputs.poorDiffHighGrade}
                    onChange={(v) =>
                      setInputs((p) => ({ ...p, poorDiffHighGrade: v }))
                    }
                  />
                </Field>

                <Field title="Microscopic ETE">
                  <YesNoSwitch
                    value={inputs.microscopicETE}
                    onChange={(v) =>
                      setInputs((p) => ({ ...p, microscopicETE: v }))
                    }
                  />
                </Field>
                <Field
                  title="Multifocality (PTC)"
                  subtitle={isPTC ? "" : "Disabled for FTC/OTC"}
                >
                  <Select
                    value={inputs.multifocalityPTC}
                    onValueChange={(v) =>
                      setInputs((p) => ({
                        ...p,
                        multifocalityPTC: v as Inputs["multifocalityPTC"],
                      }))
                    }
                    disabled={!isPTC}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select multifocality" />
                    </SelectTrigger>
                    <SelectContent>
                      {MULTIFOCALITY_PTC.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field
                  title="Vascular invasion (PTC)"
                  subtitle={isPTC ? "" : "Disabled for FTC/OTC"}
                >
                  <Select
                    value={inputs.viPTC}
                    onValueChange={(v) =>
                      setInputs((p) => ({ ...p, viPTC: v as Inputs["viPTC"] }))
                    }
                    disabled={!isPTC}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select VI (PTC)" />
                    </SelectTrigger>
                    <SelectContent>
                      {VI_PTC.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field
                  title="Vascular invasion (FTC/OTC)"
                  subtitle={isNonPTC ? "" : "Disabled for PTC"}
                >
                  <Select
                    value={inputs.viFtcOtc}
                    onValueChange={(v) =>
                      setInputs((p) => ({
                        ...p,
                        viFtcOtc: v as Inputs["viFtcOtc"],
                      }))
                    }
                    disabled={!isNonPTC}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select VI (FTC/OTC)" />
                    </SelectTrigger>
                    <SelectContent>
                      {VI_FTC_OTC.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field
                  title="Encapsulated angioinvasive?"
                  subtitle={isNonPTC ? "FTC/OTC only" : "Disabled for PTC"}
                >
                  <YesNoSwitch
                    value={inputs.encapsulatedAngioinvasive_FtcOtc}
                    onChange={(v) =>
                      setInputs((p) => ({
                        ...p,
                        encapsulatedAngioinvasive_FtcOtc: v,
                      }))
                    }
                    disabled={!isNonPTC}
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT: Result */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <Card className={glassCard}>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-indigo-700">
                  Result
                </CardTitle>
                <CardDescription className="text-zinc-600"></CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-zinc-900">
                    Risk category
                  </div>

                  {/* ✅ RENKLİ BADGE: Badge component’i aynı, sadece className verdik */}
                  <Badge
                    className={[
                      "px-3 py-1 rounded-full border text-sm font-semibold",
                      riskColor[result.category] ??
                        "bg-zinc-100 text-zinc-800 border-zinc-300",
                    ].join(" ")}
                  >
                    {result.category}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-zinc-900">
                    Recommended RAI
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-white/60 p-3 text-sm text-zinc-800">
                    {result.recommendedRAI}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-zinc-900">
                    Rationale
                  </div>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {result.rationale.map((x, idx) => (
                      <li key={idx} className="text-zinc-600">
                        <span className="text-zinc-800">{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
