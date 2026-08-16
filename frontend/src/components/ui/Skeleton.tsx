interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width = "100%", height = 16, radius, style }: SkeletonProps) {
  return <div className="skeleton" style={{ width, height, borderRadius: radius, ...style }} />;
}

export function SkeletonRows({ rows = 5, height = 44 }: { rows?: number; height?: number }) {
  return (
    <div className="stack gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={height} radius="12px" />
      ))}
    </div>
  );
}
