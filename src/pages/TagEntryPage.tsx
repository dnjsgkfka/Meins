import { useParams } from 'react-router';

export default function TagEntryPage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  return (
    <div style={{ padding: '2rem' }}>
      <p>TagEntryPage — tagCode: {tagCode}</p>
    </div>
  );
}
