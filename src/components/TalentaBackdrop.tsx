export function TalentaBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-32 top-[-10%] h-[46rem] w-[46rem] rounded-full bg-brand-2/25 blur-[120px]" />
      <div className="absolute right-[-12rem] top-[10%] h-[38rem] w-[38rem] rounded-full bg-brand-1/20 blur-[120px]" />
      <div className="absolute bottom-[-14rem] left-[30%] h-[40rem] w-[40rem] rounded-full bg-brand-3/20 blur-[130px]" />
    </div>
  );
}
