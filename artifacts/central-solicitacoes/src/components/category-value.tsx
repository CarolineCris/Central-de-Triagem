import { createElement } from "react";

type CategoryValueProps = {
  value: string;
};

export function CategoryValue({ value }: CategoryValueProps) {
  return createElement(
    "p",
    { className: "result-value", "data-testid": "text-result-category" },
    value,
  );
}
