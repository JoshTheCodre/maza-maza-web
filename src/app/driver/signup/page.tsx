"use client";

import { Bike, Car, CircleCheck, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/controls";
import { Logo } from "@/components/ui/display";
import { Toaster } from "@/components/ui/toaster";
import { CITY } from "@/lib/city";
import { naira } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { VehicleType } from "@/lib/types";

const STEPS = ["Vehicle", "About you", "Your vehicle", "Documents", "Guarantor", "Review"];
const DOCS = [
  { key: "nin", label: "NIN slip or card", hint: "Front side, all four corners visible" },
  { key: "licence", label: "Driver's licence", hint: "Class A for bikes, Class B for cars" },
  { key: "vehicle_papers", label: "Vehicle papers", hint: "Registration and road-worthiness" },
  { key: "selfie", label: "Selfie", hint: "Face the camera in good light" },
  { key: "vehicle_photo", label: "Vehicle photo", hint: "Show the plate number clearly" },
];

const phoneOk = (p: string) => p.replace(/\D/g, "").length >= 10;

export default function DriverSignup() {
  const router = useRouter();
  const submit = useStore((s) => s.submitApplication);
  const settings = useStore((s) => s.settings);
  const status = useStore((s) => s.driver.status);
  const accountName = useStore((s) => s.customer.profile.name);
  const accountPhone = useStore((s) => s.customer.phone);
  const TICKET_PRICE = { car: settings.ticketCar, bike: settings.ticketBike };
  const [step, setStep] = useState(0);
  const [type, setType] = useState<VehicleType>("car");
  const [f, setF] = useState({ name: accountName, phone: accountPhone, nin: "", licence: "", vehicle: "", plate: "", gName: "", gPhone: "", gRel: "" });
  const [files, setFiles] = useState<Record<string, string>>({});
  const [agree, setAgree] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const valid = [
    true,
    f.name.trim().split(" ").length >= 2 && phoneOk(f.phone) && /^\d{11}$/.test(f.nin) && f.licence.trim().length >= 6,
    f.vehicle.trim().length >= 4 && f.plate.trim().length >= 6,
    DOCS.every((d) => files[d.key]),
    f.gName.trim().length >= 3 && phoneOk(f.gPhone) && f.gRel.trim().length >= 2,
    agree,
  ][step];

  useEffect(() => {
    if (status === "pending" || status === "approved") router.replace("/driver");
  }, [status, router]);

  const finish = () => {
    submit({
      name: f.name.trim(),
      phone: f.phone.trim(),
      city: CITY.name,
      vehicleType: type,
      vehicle: f.vehicle.trim(),
      plate: f.plate.trim().toUpperCase(),
      guarantor: { name: f.gName.trim(), phone: f.gPhone.trim(), relationship: f.gRel.trim() },
      files,
    });
    router.push("/driver");
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="on-hero bg-hero pt-[env(safe-area-inset-top)] text-on-hero">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" aria-label="Maza-Maza home">
            <Logo />
          </Link>
          <span className="text-[0.84rem] text-on-hero-muted">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
        <ol className="mx-auto grid max-w-xl grid-cols-6 gap-1 px-4 pb-3" aria-label="Sign-up steps">
          {STEPS.map((label, i) => (
            <li key={label} aria-current={i === step ? "step" : undefined} className={`h-1.5 rounded-full ${i <= step ? "bg-danfo" : "bg-hero-2"}`}>
              <span className="sr-only">{label}</span>
            </li>
          ))}
        </ol>
      </header>

      <main className="mx-auto grid w-full max-w-xl flex-1 content-start gap-4 px-4 py-5">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="font-display text-[1.3rem] font-bold tracking-tight">{["Sign up to drive", "About you", "Your vehicle", "Upload documents", "Your guarantor", "Check and send"][step]}</h1>
        </div>

        {step === 0 && (
          <>
            <p className="text-muted">Choose how you&apos;ll work. You buy a day ticket only on the days you go out, and keep every fare.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                ["car", Car, "Car driver", "Rides for up to 4 people"],
                ["bike", Bike, "Dispatch rider", "Parcels, food and documents. No passengers."],
              ] as const).map(([v, Icon, label, sub]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={type === v}
                  onClick={() => setType(v)}
                  className={`grid gap-2 rounded-2xl border-2 p-4 text-left ${type === v ? "border-brand bg-brand-soft" : "border-line bg-surface hover:border-ink"}`}
                >
                  <Icon size={28} aria-hidden />
                  <b>{label}</b>
                  <span className="text-[0.84rem] text-muted">{sub}</span>
                  <span className="font-display text-[1.2rem] font-bold">
                    {naira(TICKET_PRICE[v])} <small className="font-sans text-[0.8rem] font-semibold text-muted">/ day you work</small>
                  </span>
                </button>
              ))}
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="city" className="text-[0.85rem] font-bold">
                City
              </label>
              <select id="city" className="min-h-11 rounded-xl border-[1.5px] border-line bg-surface px-3 font-semibold" defaultValue={CITY.name}>
                <option>{CITY.name}</option>
                <option disabled>Lagos (coming soon)</option>
                <option disabled>Abuja (coming soon)</option>
              </select>
            </div>
            <p className="text-[0.84rem] text-muted">You&apos;ll need: your NIN, driver&apos;s licence, vehicle papers, a selfie, a photo of your vehicle and a guarantor.</p>
          </>
        )}

        {step === 1 && (
          <>
            <Field id="name" label="Full name" value={f.name} onChange={set("name")} placeholder="As it appears on your ID" autoComplete="name" />
            <Field id="phone" label="Phone number" type="tel" inputMode="tel" value={f.phone} onChange={set("phone")} placeholder="0803 000 0000" hint="We send trip offers and your login code here." />
            <Field id="nin" label="NIN" inputMode="numeric" value={f.nin} onChange={(e) => setF({ ...f, nin: e.target.value.replace(/\D/g, "").slice(0, 11) })} placeholder="11 digits" error={f.nin && f.nin.length !== 11 ? "Your NIN has 11 digits." : undefined} />
            <Field id="licence" label="Driver's licence number" value={f.licence} onChange={set("licence")} placeholder="e.g. LAG12345AA01" />
          </>
        )}

        {step === 2 && (
          <>
            <Field id="vehicle" label={type === "car" ? "Car (colour, make, model, year)" : "Bike (make and model)"} value={f.vehicle} onChange={set("vehicle")} placeholder={type === "car" ? "e.g. silver Toyota Corolla 2012" : "e.g. Bajaj Boxer with delivery box"} />
            <Field id="plate" label="Plate number" value={f.plate} onChange={set("plate")} placeholder="e.g. KJA 482 DX" hint="Customers check this before they get in or hand over a parcel." />
            {type === "bike" && <p className="rounded-xl bg-danfo-soft p-3 text-[0.86rem]">Dispatch bikes on Maza-Maza carry parcels only. Carrying passengers gets your account closed.</p>}
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-[0.88rem] text-muted">Clear photos or PDFs. Our team checks them before you can buy your first ticket.</p>
            <ul className="grid gap-2">
              {DOCS.map((d) => (
                <li key={d.key}>
                  <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] p-3 ${files[d.key] ? "border-brand bg-brand-soft" : "border-line bg-surface hover:border-ink"}`}>
                    <span className="grid size-10 flex-none place-items-center rounded-xl bg-surface-2">
                      {files[d.key] ? <CircleCheck size={20} className="text-brand" aria-hidden /> : <Upload size={18} aria-hidden />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <b className="block text-[0.92rem]">{d.label}</b>
                      <small className="block truncate text-[0.78rem] text-muted">{files[d.key] ?? d.hint}</small>
                    </span>
                    <span className="text-[0.82rem] font-bold text-brand">{files[d.key] ? "Change" : "Upload"}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setFiles({ ...files, [d.key]: file.name });
                      }}
                    />
                  </label>
                </li>
              ))}
            </ul>
            <p className="text-[0.76rem] text-muted">Files are only seen by the Maza-Maza review team.</p>
          </>
        )}

        {step === 4 && (
          <>
            <p className="text-[0.88rem] text-muted">Someone who knows you well and agrees to vouch for you. We&apos;ll call them to confirm.</p>
            <Field id="g-name" label="Guarantor's full name" value={f.gName} onChange={set("gName")} />
            <Field id="g-phone" label="Guarantor's phone number" type="tel" inputMode="tel" value={f.gPhone} onChange={set("gPhone")} placeholder="0802 000 0000" />
            <Field id="g-rel" label="How do you know them?" value={f.gRel} onChange={set("gRel")} placeholder="e.g. Uncle, former employer" />
          </>
        )}

        {step === 5 && (
          <>
            <dl className="divide-y divide-line rounded-2xl border-[1.5px] border-line bg-surface">
              {[
                ["Working as", type === "car" ? "Car driver" : "Dispatch rider"],
                ["Name", f.name],
                ["Phone", f.phone],
                ["NIN", f.nin ? `•••••••${f.nin.slice(-4)}` : ""],
                ["Vehicle", f.vehicle],
                ["Plate", f.plate.toUpperCase()],
                ["Documents", `${Object.keys(files).length} of ${DOCS.length} uploaded`],
                ["Guarantor", `${f.gName} (${f.gRel})`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-3.5 py-2.5">
                  <dt className="text-[0.86rem] text-muted">{k}</dt>
                  <dd className="text-right font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <label className="flex items-start gap-3 text-[0.88rem]">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 size-4 accent-[var(--brand)]" />
              <span>
                These details are true. I agree to the driver terms, including that fares are agreed with customers in the app and can&apos;t be changed on the road
                {type === "bike" ? ", and that I never carry passengers on a dispatch bike" : ""}.
              </span>
            </label>
          </>
        )}
      </main>

      <footer className="sticky bottom-0 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-xl grid-cols-[auto_minmax(0,1fr)] gap-2 px-4 py-3">
          {step === 0 ? (
            <Link href="/account" className="inline-flex min-h-[52px] items-center rounded-full border-[1.5px] border-line px-5 font-bold">
              Cancel
            </Link>
          ) : (
            <Button variant="ghost" size="lg" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button size="lg" disabled={!valid} onClick={() => (step === 5 ? finish() : setStep(step + 1))}>
            {step === 5 ? "Send application" : "Continue"}
          </Button>
        </div>
      </footer>
      <Toaster audience="driver" />
    </div>
  );
}
