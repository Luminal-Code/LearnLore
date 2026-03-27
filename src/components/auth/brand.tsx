import { dmSerif } from "./fonts";
import { LogoMark } from "./logo-mark";

export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-16 w-16 overflow-hidden rounded-full border border-stone-200/80 bg-white/90 p-1 shadow-sm dark:border-[#2f3425] dark:bg-[#23271b]">
        <LogoMark />
      </div>

      <div className="min-w-0">
        <p className={`${dmSerif.className} text-3xl leading-none text-[#5b7a4a] dark:text-[#c6ddb4]`}>
          LearnLore
        </p>
        <span className="text-sm text-stone-600 dark:text-stone-300/75">
          Turn notes into stories you remember
        </span>
      </div>
    </div>
  );
}
