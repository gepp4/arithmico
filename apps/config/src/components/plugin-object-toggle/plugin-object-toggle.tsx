import React from "react";
import { Switch as HeadlessuiSwitch } from "@headlessui/react";
import classNames from "classnames";

interface PluginObjectToggleProps {
  onChange: (enabled: boolean) => void;
  enabled: boolean;
  label: string;
}

export default function PluginObjectToggle({
  label,
  enabled,
  onChange,
}: PluginObjectToggleProps) {
  return (
    <div
      className={classNames(
        "flex",
        "items-center",
        "p-4",
        "my-2",
        "theme-dark:bg-neutral-800",
        "theme-light:bg-neutral-200"
      )}
    >
      <HeadlessuiSwitch.Group>
        <HeadlessuiSwitch.Label className={classNames("text-2xl")}>
          {label}
        </HeadlessuiSwitch.Label>
        <HeadlessuiSwitch
          checked={enabled}
          onChange={onChange}
          className={classNames(
            {
              "bg-blue-800": enabled,
              "theme-dark:bg-neutral-700": !enabled,
              "theme-light:bg-neutral-900": !enabled,
            },
            "ml-auto",
            "relative",
            "inline-flex",
            "items-center",
            "h-[38px]",
            "w-[74px]",
            "shrink-0",
            "cursor-pointer",
            "rounded-full",
            "border-2",
            "border-transparent",
            "transition-colors",
            "duration-200",
            "ease-in-out",
            "focus:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-white",
            "focus-visible:ring-opacity-75"
          )}
        >
          <span className="sr-only">Use setting</span>
          <span
            aria-hidden="true"
            className={classNames(
              {
                "translate-x-9": enabled,
                "translate-x-0": !enabled,
              },
              "pointer-events-none",
              "inline-block",
              "h-[34px]",
              "w-[34px]",
              "transform",
              "rounded-full",
              "bg-white",
              "shadow-lg",
              "transition",
              "duration-200",
              "ease-in-out"
            )}
          />
        </HeadlessuiSwitch>
      </HeadlessuiSwitch.Group>
    </div>
  );
}
