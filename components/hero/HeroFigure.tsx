import Image from "next/image";

const DEFAULT_SIZE =
  "h-[52vh] w-auto max-h-[560px] object-contain object-bottom drop-shadow-[0_0_40px_rgba(0,0,0,0.6)]";

export default function HeroFigure({ sizeClassName = DEFAULT_SIZE }: { sizeClassName?: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] flex justify-center">
      <Image
        src="/hero-assets/figure-cutout.png"
        alt=""
        width={432}
        height={1000}
        priority
        className={sizeClassName}
      />
    </div>
  );
}
