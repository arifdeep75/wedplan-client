// Static placeholder for the service details page — shown while route params
// stream in and again while the service itself is loading on the client.
export default function ServiceDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14 lg:px-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
        <div>
          <div className="aspect-[16/10] w-full animate-pulse bg-[#f4f4f2]" />
          <div className="mt-8 space-y-4">
            <div className="h-3 w-32 animate-pulse bg-[#f4f4f2]" />
            <div className="h-10 w-3/4 animate-pulse bg-[#f4f4f2]" />
            <div className="h-3 w-40 animate-pulse bg-[#f4f4f2]" />
            <div className="h-24 w-full animate-pulse bg-[#f4f4f2]" />
          </div>
        </div>

        <div className="h-80 animate-pulse border border-[#e9e7e4] bg-white" />
      </div>
    </div>
  );
}
