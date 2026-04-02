import { cn } from "@/lib/utils";

interface GlassProps {
  children: React.ReactNode;
  className?: string;
  intense?: boolean;
  glow?: boolean;
  hover?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

export function Glass({
  children,
  className,
  intense = false,
  glow = false,
  hover = false,
  as: Tag = "div",
}: GlassProps) {
  return (
    <Tag
      className={cn(
        "rounded-2xl",
        intense ? "glass-intense" : "glass",
        glow && "glow-blue",
        hover && "glass-hover cursor-pointer",
        className
      )}
    >
      {children}
    </Tag>
  );
}
