// Welcome-step illustrations: bold black line art over torn chartreuse shapes.
// Colours are fixed so they read the same in light and dark mode; lines that sit on the page itself use currentColor.

const K = "#0f100d";
const L = "#d5f02a";
const W = "#ffffff";
const line = { fill: "none", stroke: K, strokeWidth: 3.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const outlined = { stroke: K, strokeWidth: 3.5, strokeLinejoin: "round" } as const;

/** A passenger giving a thumbs-up next to a smiling driver at the wheel. */
export function RideTogetherArt() {
  return (
    <svg viewBox="0 0 300 240" className="h-auto w-full max-w-[320px]" aria-hidden>
      <path d="M26 94 L132 52 L160 150 L56 188 Z" fill={L} />
      <path d="M140 70 L264 40 L288 150 L168 178 Z" fill={L} />
      <path d="M96 152 L252 128 L274 222 L112 234 Z" fill={L} />

      {/* Passenger */}
      <path d="M74 112 C62 96 70 72 84 70 C86 56 106 50 116 60 C128 56 140 70 134 82 C144 94 136 112 126 116 Z" fill={K} />
      <path d="M62 190 C62 152 76 130 104 126 C132 130 146 152 146 190" fill={W} {...outlined} />
      <path d="M98 116 L97 128 M110 116 L111 128" {...line} />
      <ellipse cx="104" cy="98" rx="16" ry="19" fill={W} {...outlined} />
      <path d="M88 92 C92 78 114 76 121 90 C112 85 98 85 88 92 Z" fill={K} />
      <circle cx="98" cy="99" r="2" fill={K} />
      <circle cx="110" cy="99" r="2" fill={K} />
      <path d="M98 107 Q104 112 110 107" {...line} strokeWidth={2.6} />
      <path d="M94 128 L104 141 L114 128" {...line} />
      <path d="M138 136 L88 190" stroke={K} strokeWidth={8} strokeLinecap="round" />
      <path d="M71 152 L70 134 C70 127 80 127 80 134 L81 150" fill={W} {...outlined} />
      <rect x="63" y="148" width="28" height="25" rx="8" fill={W} {...outlined} />
      <path d="M68 157 H86 M68 164 H86" {...line} strokeWidth={2.4} />

      {/* Driver */}
      <path d="M160 198 C160 152 176 126 204 122 C234 126 250 152 252 198" fill={W} {...outlined} />
      <path d="M197 108 L196 124 M211 108 L212 124" {...line} />
      <path d="M186 89 C179 87 179 98 187 99" fill={W} {...outlined} />
      <ellipse cx="204" cy="88" rx="19" ry="22" fill={W} {...outlined} />
      <path d="M184 84 C181 62 196 54 208 56 C223 56 232 67 226 82 C219 73 209 71 199 73 C191 75 187 79 184 84 Z" fill={K} />
      <path d="M187 95 C189 114 219 116 223 95 C216 106 194 106 187 95 Z" fill={K} />
      <path d="M197 100 Q205 106 213 100" fill="none" stroke={W} strokeWidth={2.6} strokeLinecap="round" />
      <circle cx="197" cy="86" r="2" fill={K} />
      <circle cx="211" cy="86" r="2" fill={K} />
      <path d="M194 124 L204 137 L214 124" {...line} />
      <path d="M242 132 L184 198" stroke={K} strokeWidth={8} strokeLinecap="round" />
      <path d="M182 228 C194 178 266 166 290 210" fill="none" stroke={K} strokeWidth={11} strokeLinecap="round" />
      <ellipse cx="230" cy="188" rx="12" ry="9" fill={W} {...outlined} />
    </svg>
  );
}

/** A face inside a camera's focus corners. */
export function FaceCheckArt() {
  return (
    <svg viewBox="0 0 240 240" className="h-auto w-full max-w-[260px] text-ink" aria-hidden>
      <path d="M44 80 V58 C44 50 50 44 58 44 H80 M160 44 H182 C190 44 196 50 196 58 V80 M44 160 V182 C44 190 50 196 58 196 H80 M196 160 V182 C196 190 190 196 182 196 H160" fill="none" stroke="currentColor" strokeWidth={7} strokeLinecap="round" />
      <path d="M58 152 L94 140 L150 148 L186 138 L184 196 L58 196 Z" fill={L} />
      <path d="M72 188 C82 168 100 162 120 162 C140 162 158 168 168 188" {...line} />
      <path d="M108 140 V160 M132 140 V160" {...line} />
      <path d="M86 100 C78 98 78 113 87 114 M154 100 C162 98 162 113 153 114" fill={W} {...outlined} />
      <path d="M86 98 C86 72 100 60 120 60 C140 60 154 72 154 98 C154 126 138 148 120 148 C102 148 86 126 86 98 Z" fill={W} {...outlined} />
      <path d="M84 100 C77 66 96 46 122 46 C147 46 163 63 157 92 C152 80 146 74 136 72 C121 82 101 80 92 75 C88 82 86 90 84 100 Z" fill={K} />
      <path d="M100 94 Q106 90 112 94 M128 94 Q134 90 140 94" {...line} strokeWidth={2.8} />
      <circle cx="106" cy="103" r="2.3" fill={K} />
      <circle cx="134" cy="103" r="2.3" fill={K} />
      <path d="M121 106 L116 121 L123 122" {...line} strokeWidth={2.8} />
      <path d="M110 131 Q120 136 130 131" {...line} strokeWidth={2.8} />
    </svg>
  );
}

/** A phone with a new offer, and a ringing bell. */
export function NotifyArt() {
  return (
    <svg viewBox="0 0 260 230" className="h-auto w-full max-w-[290px]" aria-hidden>
      <path d="M36 66 L150 32 L178 128 L60 160 Z" fill={L} />
      <path d="M116 116 L220 96 L234 194 L126 206 Z" fill={L} />
      <rect x="82" y="34" width="92" height="166" rx="18" fill={W} {...outlined} />
      <path d="M114 49 H142" {...line} />
      <rect x="93" y="68" width="70" height="34" rx="9" fill={K} />
      <path d="M102 80 H140 M102 90 H124" fill="none" stroke={L} strokeWidth={3.4} strokeLinecap="round" />
      <rect x="93" y="114" width="70" height="10" rx="5" fill="#e6e6df" />
      <rect x="93" y="132" width="48" height="10" rx="5" fill="#e6e6df" />
      <path d="M48 108 C48 87 60 76 73 76 C86 76 98 87 98 108 L103 121 H43 Z" fill={L} {...outlined} />
      <path d="M64 127 Q73 136 82 127" {...line} />
      <circle cx="73" cy="71" r="4.5" fill={K} />
      <path d="M38 88 L29 83 M35 104 H25 M108 84 L116 78" {...line} />
      <rect x="140" y="150" width="96" height="38" rx="13" fill={K} />
      <path d="M158 188 L152 200 L170 188 Z" fill={K} />
      <text x="188" y="175" textAnchor="middle" fontFamily="var(--font-martian), monospace" fontWeight="700" fontSize="14" fill={L}>
        ₦2,800 ✓
      </text>
    </svg>
  );
}

/** A naira note and a phone showing a finished transfer. */
export function PayArt() {
  return (
    <svg viewBox="0 0 270 200" className="h-auto w-full max-w-[280px]" aria-hidden>
      <path d="M28 72 L140 40 L170 142 L52 172 Z" fill={L} />
      <path d="M124 92 L240 70 L252 172 L136 184 Z" fill={L} />
      <g transform="rotate(-12 100 112)">
        <rect x="38" y="80" width="124" height="66" rx="9" fill={W} {...outlined} />
        <circle cx="100" cy="113" r="17" fill="none" stroke={K} strokeWidth={3} />
        <text x="100" y="120" textAnchor="middle" fontFamily="var(--font-figtree), sans-serif" fontWeight="800" fontSize="20" fill={K}>
          ₦
        </text>
        <path d="M50 93 H64 M136 133 H150" {...line} strokeWidth={3} />
      </g>
      <rect x="156" y="52" width="66" height="122" rx="13" fill={K} />
      <rect x="164" y="64" width="50" height="90" rx="7" fill={W} />
      <circle cx="189" cy="100" r="15" fill={L} stroke={K} strokeWidth={3} />
      <path d="M182 100 L187 105 L196 95" {...line} />
      <path d="M173 128 H205 M177 139 H201" fill="none" stroke="#c9c9c1" strokeWidth={3.4} strokeLinecap="round" />
    </svg>
  );
}
