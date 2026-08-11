export default function ProductTitle({ name }: { name: string }) {
  return (
    <h1 className="m-0 text-xl font-semibold leading-snug line-clamp-2 text-[var(--color-fg)]">
      {name}
    </h1>
  );
}
