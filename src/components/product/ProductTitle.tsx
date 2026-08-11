export default function ProductTitle({ name }: { name: string }) {
  return (
    <h1
      style={{
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        margin: 0,
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
      }}
    >
      {name}
    </h1>
  );
}
