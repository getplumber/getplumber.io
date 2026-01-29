/**
 * * Simple preview component for the keystatic editor
 */

// style import
import "@/styles/keystatic.css";

interface Props {
  variant: "tip" | "caution" | "danger" | "info";
}

const KeystaticAdmonition = ({ variant, children }: Props & { children: React.ReactNode }) => {
  let color;
  if (variant === "tip") {
    color = "#6ee7b7";
  } else if (variant === "caution") {
    color = "#fcd34d";
  } else if (variant === "danger") {
    color = "#fca5a5";
  } else {
    color = "#7dd3fc";
  }

  return (
    <div className="ks-admonition" style={{ borderColor: color }}>
      <h5 className="ks-admonition__variant">{variant}</h5>
      <div>{children}</div>
    </div>
  );
};

export default KeystaticAdmonition;
