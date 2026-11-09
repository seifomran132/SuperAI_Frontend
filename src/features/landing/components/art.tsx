import type { ReactNode } from 'react';
import { cn } from '~/lib/utils';

// Illustrations from the approved S13 design. Colors are brand and mode tokens,
// so a white-label brand recolors them; they carry no text or brand name.
function Art({
  viewBox,
  className,
  children,
}: {
  viewBox: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox={viewBox}
      aria-hidden="true"
      focusable="false"
      className={cn(
        'block fill-none [stroke-linecap:round] [stroke-linejoin:round]',
        className,
      )}
    >
      {children}
    </svg>
  );
}

export function HeroArt({ className }: { className?: string }) {
  return (
    <Art viewBox="0 0 600 500" className={className}>
      <rect
        x="70"
        y="52"
        width="470"
        height="390"
        rx="70"
        fill="var(--color-mode-2-border)"
        transform="rotate(5 305 247)"
      />
      <rect
        x="56"
        y="40"
        width="478"
        height="396"
        rx="70"
        fill="var(--color-mode-2-container)"
        transform="rotate(-4 295 238)"
      />
      <circle
        cx="52"
        cy="46"
        r="30"
        fill="var(--color-mode-1-container)"
        stroke="var(--color-mode-1-border)"
        strokeWidth="3"
      />

      <ellipse
        cx="300"
        cy="444"
        rx="262"
        ry="13"
        fill="var(--color-mode-2-border)"
      />
      <rect
        x="70"
        y="50"
        width="460"
        height="346"
        rx="20"
        fill="var(--color-brand)"
      />
      <rect
        x="84"
        y="64"
        width="432"
        height="318"
        rx="9"
        fill="var(--color-surface)"
      />
      <circle cx="300" cy="57" r="2.5" fill="var(--color-border-control)" />
      <path
        d="M40 396H560Q566 396 563 406Q557 426 532 428H68Q43 426 37 406Q34 396 40 396Z"
        fill="var(--color-surface-muted)"
        stroke="var(--color-border-control)"
        strokeWidth="2"
      />
      <rect
        x="252"
        y="396"
        width="96"
        height="10"
        rx="5"
        fill="var(--color-border-control)"
      />

      <g transform="translate(6 0) rotate(-6 56 190)">
        <rect
          x="14"
          y="100"
          width="100"
          height="184"
          rx="10"
          fill="var(--color-mode-2-border)"
        />
        <rect
          x="6"
          y="90"
          width="100"
          height="184"
          rx="10"
          fill="var(--color-surface)"
          stroke="var(--color-mode-2)"
          strokeWidth="2.5"
        />
        <path
          d="M22 112h58M22 127h68M22 142h50"
          stroke="var(--color-border-subtle)"
          strokeWidth="5"
        />
        <rect
          x="15"
          y="156"
          width="82"
          height="48"
          rx="6"
          fill="var(--color-mode-1-border)"
        />
        <path
          d="M23 170h66M23 186h46"
          stroke="var(--color-mode-1)"
          strokeWidth="5"
        />
        <path
          d="M22 220h66M22 235h60M22 250h38"
          stroke="var(--color-border-subtle)"
          strokeWidth="5"
        />
      </g>

      <circle cx="64" cy="378" r="32" fill="var(--color-mode-2-border)" />
      <path
        d="M30 334l-8-8M58 322v-12M88 334l8-8"
        stroke="var(--color-mode-1-border)"
        strokeWidth="5"
      />
      <circle
        cx="58"
        cy="370"
        r="32"
        fill="var(--color-surface)"
        stroke="var(--color-mode-1)"
        strokeWidth="2.5"
      />
      <circle cx="58" cy="368" r="17" fill="var(--color-mode-1-border)" />
      <path
        d="M51 382v-9a7 7 0 0 1 14 0v9"
        stroke="var(--color-mode-1)"
        strokeWidth="2.5"
      />
      <rect
        x="44"
        y="400"
        width="28"
        height="9"
        rx="3"
        fill="var(--color-mode-1)"
      />
      <rect
        x="49"
        y="409"
        width="18"
        height="7"
        rx="3"
        fill="var(--color-mode-1)"
      />

      <rect
        x="506"
        y="14"
        width="90"
        height="54"
        rx="14"
        fill="var(--color-mode-2-border)"
      />
      <path
        d="M498 8h86a14 14 0 0 1 14 14v28a14 14 0 0 1-14 14h-60l-14 14v-14h-12a14 14 0 0 1-14-14V22a14 14 0 0 1 14-14z"
        fill="var(--color-mode-2)"
        transform="translate(-6 0)"
      />
      <rect
        x="528"
        y="44"
        width="68"
        height="46"
        rx="14"
        fill="var(--color-mode-2-border)"
        transform="translate(5 6)"
      />
      <rect
        x="526"
        y="42"
        width="68"
        height="46"
        rx="14"
        fill="var(--color-surface)"
        stroke="var(--color-mode-1)"
        strokeWidth="2.5"
      />
      <path
        d="M560 88v12l12-12"
        fill="var(--color-surface)"
        stroke="var(--color-mode-1)"
        strokeWidth="2.5"
      />
      <path d="M562 89h8" stroke="var(--color-surface)" strokeWidth="4" />

      <g transform="translate(-8 0) rotate(5 545 350)">
        <rect
          x="508"
          y="296"
          width="92"
          height="122"
          rx="10"
          fill="var(--color-mode-2-border)"
          transform="translate(6 8)"
        />
        <rect
          x="500"
          y="288"
          width="92"
          height="122"
          rx="10"
          fill="var(--color-surface)"
          stroke="var(--color-mode-2)"
          strokeWidth="2.5"
        />
        <path
          d="M516 312h58M516 328h58M516 344h40"
          stroke="var(--color-border-subtle)"
          strokeWidth="5"
        />
        <path d="M516 364h26" stroke="var(--color-mode-1)" strokeWidth="5" />
      </g>
      <g transform="translate(-8 0) rotate(38 560 350)">
        <rect
          x="560"
          y="270"
          width="16"
          height="96"
          rx="5"
          fill="var(--color-mode-1)"
        />
        <rect
          x="560"
          y="270"
          width="16"
          height="16"
          rx="5"
          fill="var(--color-mode-1-border)"
        />
        <path
          d="M560 366h16l-8 22z"
          fill="var(--color-surface)"
          stroke="var(--color-mode-1)"
          strokeWidth="2.5"
        />
      </g>
    </Art>
  );
}

export function FastArt({ className }: { className?: string }) {
  return (
    <Art viewBox="0 0 200 110" className={className}>
      <rect
        x="20"
        y="100"
        width="160"
        height="4"
        rx="2"
        fill="var(--color-mode-1-border)"
      />
      <path
        d="M30 70h26v18a8 8 0 0 1-8 8H38a8 8 0 0 1-8-8zM56 74h4a6 6 0 0 1 0 12h-4"
        fill="var(--color-surface)"
        stroke="var(--color-mode-1)"
        strokeWidth="2"
      />
      <path
        d="M38 60c-4-5 4-7 0-12M48 60c-4-5 4-7 0-12"
        stroke="var(--color-mode-1-border)"
        strokeWidth="2.5"
      />
      <rect
        x="84"
        y="8"
        width="58"
        height="92"
        rx="10"
        fill="var(--color-surface)"
        stroke="var(--color-mode-1)"
        strokeWidth="2.5"
      />
      <path
        d="M105 15h16"
        stroke="var(--color-mode-1-border)"
        strokeWidth="3"
      />
      <rect
        x="108"
        y="28"
        width="28"
        height="14"
        rx="6"
        fill="var(--color-mode-1-container)"
        stroke="var(--color-mode-1-border)"
        strokeWidth="1.5"
      />
      <rect
        x="90"
        y="48"
        width="42"
        height="22"
        rx="7"
        fill="var(--color-mode-1)"
      />
      <path
        d="M97 55h28M97 62h18"
        stroke="var(--color-surface)"
        strokeWidth="3"
      />
      <rect
        x="108"
        y="76"
        width="28"
        height="12"
        rx="6"
        fill="var(--color-mode-1-container)"
        stroke="var(--color-mode-1-border)"
        strokeWidth="1.5"
      />
      <rect
        x="152"
        y="20"
        width="38"
        height="24"
        rx="8"
        fill="var(--color-surface)"
        stroke="var(--color-mode-1-border)"
        strokeWidth="2"
      />
      <path
        d="M162 28h18M162 36h10"
        stroke="var(--color-mode-1)"
        strokeWidth="3"
        opacity=".5"
      />
    </Art>
  );
}

export function ProArt({ className }: { className?: string }) {
  return (
    <Art viewBox="0 0 200 110" className={className}>
      <rect
        x="110"
        y="4"
        width="64"
        height="92"
        rx="6"
        fill="var(--color-mode-2-container)"
        stroke="var(--color-mode-2-border)"
        strokeWidth="2"
      />
      <rect
        x="98"
        y="10"
        width="64"
        height="94"
        rx="6"
        fill="var(--color-surface)"
        stroke="var(--color-mode-2)"
        strokeWidth="2.5"
      />
      <path
        d="M108 26h44M108 36h44M108 46h30M108 82h44M108 92h28"
        stroke="var(--color-mode-2)"
        strokeWidth="3"
        opacity=".4"
      />
      <rect
        x="106"
        y="54"
        width="48"
        height="20"
        rx="3"
        fill="var(--color-mode-2-container)"
      />
      <path
        d="M110 60h40M110 68h26"
        stroke="var(--color-mode-2)"
        strokeWidth="3"
      />
      <rect
        x="16"
        y="34"
        width="62"
        height="44"
        rx="11"
        fill="var(--color-mode-2)"
      />
      <path d="M78 50l10 6-10 6z" fill="var(--color-mode-2)" />
      <path
        d="M28 48h38M28 57h38M28 66h22"
        stroke="var(--color-surface)"
        strokeWidth="3"
      />
      <path
        d="M172 20l14 14-26 26-14 2 2-14z"
        fill="var(--color-surface)"
        stroke="var(--color-mode-2)"
        strokeWidth="2"
      />
    </Art>
  );
}

export function ImageArt({ className }: { className?: string }) {
  return (
    <Art viewBox="0 0 200 110" className={className}>
      <rect
        x="64"
        y="20"
        width="100"
        height="80"
        rx="8"
        fill="var(--color-mode-3-border)"
      />
      <rect
        x="56"
        y="10"
        width="100"
        height="80"
        rx="8"
        fill="var(--color-surface)"
        stroke="var(--color-mode-3)"
        strokeWidth="2.5"
      />
      <rect
        x="65"
        y="19"
        width="82"
        height="62"
        rx="4"
        fill="var(--color-mode-3-container)"
      />
      <circle
        cx="130"
        cy="36"
        r="8"
        fill="var(--color-surface)"
        stroke="var(--color-mode-3)"
        strokeWidth="2"
      />
      <path
        d="M65 81l24-30 18 22 12-12 28 20z"
        fill="var(--color-mode-3-border)"
        stroke="var(--color-mode-3)"
        strokeWidth="2"
      />
      <g transform="rotate(24 172 50)">
        <rect
          x="165"
          y="4"
          width="14"
          height="52"
          rx="6"
          fill="var(--color-surface)"
          stroke="var(--color-mode-3)"
          strokeWidth="2.5"
        />
        <rect
          x="165"
          y="52"
          width="14"
          height="10"
          fill="var(--color-mode-3)"
        />
        <path
          d="M165 62h14l-7 20z"
          fill="var(--color-mode-3-border)"
          stroke="var(--color-mode-3)"
          strokeWidth="2"
        />
      </g>
      <circle cx="22" cy="78" r="10" fill="var(--color-mode-3)" />
      <circle cx="38" cy="94" r="8" fill="var(--color-mode-1)" />
      <circle cx="16" cy="98" r="6" fill="var(--color-mode-2)" />
    </Art>
  );
}

export function BalanceArt({ className }: { className?: string }) {
  return (
    <Art viewBox="0 0 480 320" className={className}>
      <g stroke="var(--color-on-brand)" strokeWidth="3">
        <path d="M240 204V134" />
        <path d="M80 150V134M400 150V134" />
        <path d="M80 150Q80 176 106 176H374Q400 176 400 150" />
      </g>
      <g fill="var(--color-on-brand)">
        <path d="M80 118l-9 14h18zM240 118l-9 14h18zM400 118l-9 14h18z" />
      </g>
      <circle
        cx="80"
        cy="64"
        r="52"
        fill="var(--color-mode-3-container)"
        stroke="var(--color-mode-3-border)"
        strokeWidth="3"
      />
      <rect
        x="62"
        y="28"
        width="36"
        height="30"
        rx="4"
        fill="var(--color-surface)"
        stroke="var(--color-mode-3)"
        strokeWidth="2"
      />
      <path d="M66 54l9-12 8 9 5-4 6 7z" fill="var(--color-mode-3-border)" />
      <circle cx="90" cy="36" r="3" fill="var(--color-mode-3)" />
      <circle
        cx="240"
        cy="64"
        r="52"
        fill="var(--color-mode-2-container)"
        stroke="var(--color-mode-2-border)"
        strokeWidth="3"
      />
      <rect
        x="225"
        y="26"
        width="30"
        height="36"
        rx="4"
        fill="var(--color-surface)"
        stroke="var(--color-mode-2)"
        strokeWidth="2"
      />
      <path
        d="M231 36h18M231 44h18M231 52h10"
        stroke="var(--color-mode-2)"
        strokeWidth="2.5"
      />
      <circle
        cx="400"
        cy="64"
        r="52"
        fill="var(--color-mode-1-container)"
        stroke="var(--color-mode-1-border)"
        strokeWidth="3"
      />
      <rect
        x="383"
        y="28"
        width="34"
        height="24"
        rx="9"
        fill="var(--color-surface)"
        stroke="var(--color-mode-1)"
        strokeWidth="2"
      />
      <path
        d="M409 52l6 9 1-9"
        fill="var(--color-surface)"
        stroke="var(--color-mode-1)"
        strokeWidth="2"
      />
      <path
        d="M391 37h18M391 44h10"
        stroke="var(--color-mode-1)"
        strokeWidth="2.5"
      />
      <rect
        x="150"
        y="204"
        width="180"
        height="108"
        rx="20"
        fill="var(--color-surface)"
      />
      <g
        fill="var(--color-mode-1-container)"
        stroke="var(--color-mode-1)"
        strokeWidth="2.5"
      >
        <path d="M212 248v-10M268 248v-10" />
        <ellipse cx="240" cy="248" rx="28" ry="8" />
        <ellipse cx="240" cy="238" rx="28" ry="8" />
        <ellipse cx="240" cy="228" rx="28" ry="8" />
      </g>
    </Art>
  );
}

export function SignUpArt({ className }: { className?: string }) {
  return (
    <Art viewBox="0 0 120 84" className={className}>
      <rect
        x="14"
        y="8"
        width="88"
        height="68"
        rx="8"
        fill="var(--color-surface)"
        stroke="var(--color-brand)"
        strokeWidth="2"
      />
      <path d="M14 22h88" stroke="var(--color-brand)" strokeWidth="2" />
      <circle
        cx="58"
        cy="38"
        r="8"
        fill="var(--color-mode-1-container)"
        stroke="var(--color-mode-1)"
        strokeWidth="2"
      />
      <rect
        x="32"
        y="52"
        width="52"
        height="8"
        rx="4"
        fill="var(--color-surface-muted)"
        stroke="var(--color-border-control)"
        strokeWidth="1.5"
      />
      <circle cx="96" cy="64" r="12" fill="var(--color-mode-1)" />
      <path
        d="M96 58v12M90 64h12"
        stroke="var(--color-surface)"
        strokeWidth="2.5"
      />
    </Art>
  );
}

export function EmailArt({ className }: { className?: string }) {
  return (
    <Art viewBox="0 0 120 84" className={className}>
      <rect
        x="18"
        y="20"
        width="76"
        height="52"
        rx="6"
        fill="var(--color-surface)"
        stroke="var(--color-brand)"
        strokeWidth="2"
      />
      <path
        d="M18 26l38 27 38-27"
        stroke="var(--color-brand)"
        strokeWidth="2"
      />
      <circle cx="96" cy="22" r="13" fill="var(--color-mode-2)" />
      <path
        d="M101 22H91M95 17l-5 5 5 5"
        stroke="var(--color-surface)"
        strokeWidth="2.5"
      />
    </Art>
  );
}

export function ActivatedArt({ className }: { className?: string }) {
  return (
    <Art viewBox="0 0 120 84" className={className}>
      <rect
        x="14"
        y="34"
        width="88"
        height="42"
        rx="8"
        fill="var(--color-surface)"
        stroke="var(--color-brand)"
        strokeWidth="2"
      />
      <path
        d="M26 48h32M26 60h20"
        stroke="var(--color-border-control)"
        strokeWidth="3"
      />
      <g
        fill="var(--color-mode-1-container)"
        stroke="var(--color-mode-1)"
        strokeWidth="2"
      >
        <ellipse cx="72" cy="22" rx="13" ry="4" />
        <ellipse cx="72" cy="14" rx="13" ry="4" />
        <ellipse cx="72" cy="6" rx="13" ry="4" />
      </g>
      <circle cx="92" cy="62" r="11" fill="var(--color-mode-1)" />
      <path
        d="M87 62l4 4 7-8"
        stroke="var(--color-surface)"
        strokeWidth="2.5"
      />
    </Art>
  );
}
