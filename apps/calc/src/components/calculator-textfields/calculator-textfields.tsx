import React, { useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { CalculatorRootState } from "@stores/calculator-store";
import {
  moveForwardInHistory,
  moveBackInHistory,
  setInput,
  resetInput,
  resetOutput,
} from "@stores/slices/calculator-session";
import useEvaluate from "../../hooks/use-evaluate";
import classNames from "classnames";

export default function CalculatorTextfields() {
  const dispatch = useDispatch();
  const evaluate = useEvaluate();
  const input = useSelector(
    (state: CalculatorRootState) => state.session.input
  );
  const output = useSelector(
    (state: CalculatorRootState) => state.session.output
  );
  const isError = useSelector(
    (state: CalculatorRootState) => state.session.error
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLInputElement>(null);
  const [t] = useTranslation();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  useHotkeys(
    "alt + i",
    () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
    { enableOnTags: ["INPUT"] }
  );

  useHotkeys(
    "alt + o",
    () => {
      if (outputRef.current) {
        outputRef.current.focus();
      }
    },
    { enableOnTags: ["INPUT"] }
  );

  useHotkeys(
    "ctrl + alt + i",
    () => {
      dispatch(resetInput());
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
    { enableOnTags: ["INPUT"] }
  );

  useHotkeys(
    "ctrl + alt + o",
    () => {
      dispatch(resetOutput());
    },
    { enableOnTags: ["INPUT"] }
  );

  const onInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.length > 0) {
      evaluate();

      if (outputRef.current) {
        outputRef.current.focus();
      }
    }
  };

  const onOutputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      dispatch(moveBackInHistory());
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      dispatch(moveForwardInHistory());
      e.preventDefault();
    }
  };

  return (
    <div
      className={classNames(
        "w-full",
        "h-full",
        "flex",
        "flex-col",
        "justify-center"
      )}
    >
      <input
        type="text"
        className={classNames(
          "w-full",
          "text-4xl",
          "outline-none",
          "border",
          "px-4",
          "py-6",
          "rounded-md",
          "bold-font:font-bold",
          "theme-light:border-neutral-400",
          "theme-light:focus:border-neutral-600",
          "theme-light:bg-neutral-100",
          "theme-dark:bg-neutral-800",
          "theme-dark:border-neutral-500",
          "theme-dark:focus:border-neutral-100"
        )}
        ref={inputRef}
        placeholder={t("common.input")}
        value={input}
        onChange={(e) => dispatch(setInput(e.target.value))}
        onKeyPress={onInputKeyPress}
        onKeyDown={(e) => handleKeyDown(e)}
      />

      <input
        type="text"
        className={classNames(
          "mt-4",
          "w-full",
          "text-4xl",
          "outline-none",
          "border",
          "px-4",
          "py-6",
          "rounded-md",
          "bold-font:font-bold",
          {
            "theme-dark:border-neutral-500": !isError,
            "theme-dark:focus:border-neutral-100": !isError,
            "theme-dark:bg-neutral-800": !isError,
            "theme-dark:bg-red-900": isError,
            "theme-dark:border-red-500": isError,
            "theme-dark:focus:border-red-400": isError,
          },
          {
            "theme-light:border-neutral-400": !isError,
            "theme-light:focus:border-neutral-600": !isError,
            "theme-light:bg-neutral-100": !isError,
            "theme-light:border-red-300": isError,
            "theme-light:focus:border-red-600": isError,
            "theme-light:text-red-700": isError,
            "theme-light:bg-red-100": isError,
          }
        )}
        ref={outputRef}
        placeholder={t("common.output")}
        readOnly
        value={output}
        onKeyPress={onOutputKeyPress}
      />
    </div>
  );
}
