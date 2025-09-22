import { cn } from "@/util/cn";
import { HTMLProps } from "react";

interface ButtonProps extends HTMLProps<HTMLButtonElement> {
  variant: "blue" | "black";
  type?: "submit" | "reset" | "button" | undefined;
  outerClassName?: string;
}

export const Button = ({
  variant,
  children,
  className,
  outerClassName,
  ...props
}: ButtonProps) => {
  return (
    <div
      className={cn(
        "group hover:brightness-120 duration-100 ease-out transition-all active:scale-98",
        outerClassName
      )}
    >
      <button
        className={cn(
          "rounded-[12px] bg-gradient-to-b p-0.25 cursor-pointer w-full",
          {
            "from-[#0072FE] to-[#00469A] drop-shadow-[0_2px_10px_-2px_#298AFF]":
              variant === "blue",
            "from-[#2e2e2e] to-[#0d0d0d] drop-shadow-[0_2px_10px_-2px_#343434]":
              variant === "black",
          }
        )}
        {...props}
      >
        <div
          className={cn("bg-gradient-to-b p-0.25 rounded-[11px]", {
            "from-[#97C6FF] to-[#0161D8]": variant === "blue",
            "from-[#6f6f6f] to-[#131313]": variant === "black",
          })}
        >
          <div
            className={cn(
              "bg-gradient-to-b rounded-[10px] px-3.5 py-2 font-medium flex flex-row items-center justify-center gap-2",
              {
                "from-[#2888FE] to-[#0362D8]  text-white text-shadow-[0_1px_5px_#0007]":
                  variant === "blue",
                "from-[#0f0f0f] to-[#0d0d0d] text-white/50 group-hover:text-white/70 duration-150 ease-out transition-colors text-shadow-[0_2px_10px_-2px_#000b] text-shadow-black":
                  variant === "black",
              },
              className
            )}
          >
            {children}
          </div>
        </div>
      </button>
    </div>
  );
};
