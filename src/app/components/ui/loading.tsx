import { Spinner } from "@/app/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}