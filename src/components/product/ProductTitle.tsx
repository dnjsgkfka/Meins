interface Props {
  name: string;
  modelCode: string;
  as?: 'h1' | 'h2';
}

export default function ProductTitle({ name, modelCode, as: Tag = 'h1' }: Props) {
  return (
    <div className="flex flex-col gap-0.5">
      <Tag className="m-0 text-2xl font-normal leading-tight text-[var(--color-fg)]">{name}</Tag>
      <p className="m-0 text-xs text-[var(--color-muted)] tracking-[0.04em]"># {modelCode}</p>
    </div>
  );
}
