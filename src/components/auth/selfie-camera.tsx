"use client";

import { CircleCheck, LoaderCircle, RotateCcw, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { nextWelcomeStep } from "./onboarding";

type Phase = "starting" | "live" | "blocked" | "captured" | "checking" | "done";

const HINT: Record<Phase, string> = {
  starting: "Opening your camera…",
  live: "Fit your face in the oval and look straight ahead.",
  blocked: "We couldn't open your camera. Allow it in your browser, or upload a selfie instead.",
  captured: "Is your whole face clear and well lit?",
  checking: "Checking your photo…",
  done: "You're verified. Thanks for keeping Maza-Maza safe.",
};

/**
 * The selfie step of the face check: a live front-camera view in an oval, then retake or use the photo.
 * UI only for now: the photo stays on this page and is never saved or sent. The backend will pass it to a
 * verification provider.
 */
export function SelfieCamera() {
  const router = useRouter();
  const markFaceVerified = useStore((s) => s.markFaceVerified);
  const video = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("starting");
  const [shot, setShot] = useState("");
  const [attempt, setAttempt] = useState(0);

  // The camera runs only while there's no photo; taking one (or leaving the page) switches it off.
  useEffect(() => {
    if (shot) return;
    let cancelled = false;
    let stream: MediaStream | null = null;
    const open = navigator.mediaDevices?.getUserMedia
      ? navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 960 } }, audio: false })
      : Promise.reject(new Error("No camera"));
    open
      .then((ms) => {
        if (cancelled) return ms.getTracks().forEach((t) => t.stop());
        stream = ms;
        if (video.current) {
          video.current.srcObject = ms;
          video.current.play().catch(() => {});
        }
        setPhase("live");
      })
      .catch(() => {
        if (!cancelled) setPhase("blocked");
      });
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [attempt, shot]);

  const capture = () => {
    const v = video.current;
    if (!v || !v.videoWidth) return;
    // Crop the middle of the frame to the oval's 4:5 shape, mirrored like the preview.
    const aspect = 4 / 5;
    let sw = v.videoWidth;
    let sh = v.videoHeight;
    if (sw / sh > aspect) sw = sh * aspect;
    else sh = sw / aspect;
    const c = document.createElement("canvas");
    c.width = 480;
    c.height = 600;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, (v.videoWidth - sw) / 2, (v.videoHeight - sh) / 2, sw, sh, 0, 0, c.width, c.height);
    setShot(c.toDataURL("image/jpeg", 0.85));
    setPhase("captured");
  };

  const upload = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setShot(String(reader.result));
      setPhase("captured");
    };
    reader.readAsDataURL(file);
  };

  const retake = () => {
    setShot("");
    setPhase("starting");
  };

  const confirmPhoto = () => {
    setPhase("checking");
    setTimeout(() => {
      markFaceVerified();
      setPhase("done");
    }, 1500);
  };

  const uploadButton = (
    <label className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-full bg-danfo text-[1.05rem] font-bold text-on-danfo hover:brightness-95">
      <Upload size={20} aria-hidden /> Upload a selfie
      <input type="file" accept="image/*" capture="user" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
    </label>
  );

  return (
    <div className="on-hero flex min-h-dvh flex-col bg-hero pt-[env(safe-area-inset-top)] text-on-hero">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6">
        <div className="flex h-14 flex-none items-center justify-between">
          <h1 className="text-[1.05rem] font-bold">Take a selfie</h1>
          {phase !== "done" && (
            <button type="button" aria-label="Close" onClick={() => router.push("/welcome/verify")} className="-mr-2 grid size-11 place-items-center rounded-full hover:bg-hero-2">
              <X size={26} />
            </button>
          )}
        </div>

        <div className="grid flex-1 content-center justify-items-center gap-6 py-6">
          <div
            className={`relative aspect-[4/5] w-[min(76vw,320px)] overflow-hidden rounded-[50%] bg-hero-2 ring-4 transition-shadow ${
              phase === "done" ? "ring-accept" : phase === "checking" ? "animate-pulse ring-danfo" : "ring-danfo"
            }`}
          >
            {shot ? (
              // A data URL from the camera or a file, so next/image has nothing to optimise.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shot} alt="Your selfie" className="size-full object-cover" />
            ) : (
              <video ref={video} playsInline muted className="size-full -scale-x-100 object-cover" aria-label="Camera preview" />
            )}
            {phase === "starting" && (
              <span className="absolute inset-0 grid place-items-center">
                <LoaderCircle size={32} className="animate-spin text-on-hero-muted" aria-hidden />
              </span>
            )}
            {phase === "done" && (
              <span className="absolute inset-0 grid place-items-center bg-black/35">
                <CircleCheck size={64} className="text-danfo" aria-hidden />
              </span>
            )}
          </div>
          <p className="max-w-[18rem] text-center text-[1rem] text-on-hero-muted" aria-live="polite">
            {HINT[phase]}
          </p>
        </div>
      </div>

      <div className="pb-[calc(20px+env(safe-area-inset-bottom))]">
        <div className="mx-auto grid w-full max-w-md gap-3 px-6 pt-2">
          {phase === "live" && (
            <button
              type="button"
              onClick={capture}
              aria-label="Take photo"
              className="mx-auto grid size-[76px] place-items-center rounded-full border-4 border-on-hero transition-transform active:scale-95"
            >
              <span className="size-[58px] rounded-full bg-on-hero" />
            </button>
          )}
          {phase === "blocked" && (
            <>
              {uploadButton}
              <button type="button" onClick={() => setAttempt((a) => a + 1)} className="min-h-14 rounded-full bg-hero-2 text-[1.05rem] font-bold">
                Try the camera again
              </button>
            </>
          )}
          {phase === "captured" && (
            <>
              <button type="button" onClick={confirmPhoto} className="min-h-14 rounded-full bg-danfo text-[1.05rem] font-bold text-on-danfo hover:brightness-95">
                Use this photo
              </button>
              <button type="button" onClick={retake} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-hero-2 text-[1.05rem] font-bold">
                <RotateCcw size={18} aria-hidden /> Retake
              </button>
            </>
          )}
          {phase === "done" && (
            <button
              type="button"
              onClick={() => router.push(nextWelcomeStep("verify"))}
              className="min-h-14 rounded-full bg-danfo text-[1.05rem] font-bold text-on-danfo hover:brightness-95"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
