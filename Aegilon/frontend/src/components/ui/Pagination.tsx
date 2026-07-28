import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

export function Pagination({
  skip,
  limit,
  count,
  hasNext,
  onPrev,
  onNext,
}: {
  skip: number;
  limit: number;
  count: number;
  hasNext?: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const page = Math.floor(skip / limit) + 1;
  const hasPrev = skip > 0;
  const isNextEnabled = hasNext !== undefined ? hasNext : count === limit;

  return (
    <div className="flex items-center justify-between border-t border-border pt-4">
      <p className="text-xs text-text-muted">
        Page {page} &middot; showing {count} item{count === 1 ? "" : "s"} ({limit} per page)
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onPrev} disabled={!hasPrev}>
          <ChevronLeft size={14} /> Prev
        </Button>
        <Button variant="secondary" onClick={onNext} disabled={!isNextEnabled}>
          Next <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}
