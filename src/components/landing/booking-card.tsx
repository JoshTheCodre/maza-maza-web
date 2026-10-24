"use client";

import Link from "next/link";
import { useState } from "react";
import { BikeIcon, CarIcon, ChevronRightIcon, SearchIcon } from "./icons";

type Mode = "ride" | "send";

/** Hero card that starts a booking in the app. Its only state is the Ride / Send tab. */
export function BookingCard() {
  const [mode, setMode] = useState<Mode>("ride");

  return (
    <div className="book">
      <p className="book-title">Let&apos;s go</p>
      <div className="tabs" role="group" aria-label="Service">
        <button type="button" className="tab" aria-pressed={mode === "ride"} onClick={() => setMode("ride")}>
          <CarIcon />
          Ride
        </button>
        <button type="button" className="tab" aria-pressed={mode === "send"} onClick={() => setMode("send")}>
          <BikeIcon />
          Send
        </button>
      </div>
      <Link className="where" href={`/ride/search?mode=${mode}`}>
        <span className="where-ico">
          <SearchIcon />
        </span>
        <span className="where-text">{mode === "ride" ? "Where to?" : "Where should it go?"}</span>
        <ChevronRightIcon />
      </Link>
      <Link className="btn btn-primary btn-lg btn-block" href={`/ride?mode=${mode}`}>
        Book now
      </Link>
    </div>
  );
}
