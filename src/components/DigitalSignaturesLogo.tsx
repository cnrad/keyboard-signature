import { SVGProps } from "react";

export default function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="650"
      height="200"
      viewBox="0 0 650 200"
      {...props}
    >
      <defs />
      <path
        d="M 193 100 C 216.75 95, 468 40, 478 40 C 488 40, 313 100, 313 100 C 313 100, 479.25 45, 478 40 C 476.75 35, 331.75 35, 298 40 C 264.25 45, 51.75 95, 73 100 C 94.25 105, 548 100, 553 100 C 558 100, 139.25 105, 133 100 C 126.75 95, 463 40, 478 40 C 493 40, 319.25 90, 313 100 C 306.75 110, 423 160, 403 160 C 383 160, 81.75 110, 73 100 C 64.25 90, 269.25 45, 298 40 C 326.75 35, 423 40, 418 40 C 413 40, 258 40, 238 40 C 218 40, 186.75 35, 178 40 C 169.25 45, 136.75 95, 133 100"
        stroke="#ffffff"
        stroke-width="3"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
