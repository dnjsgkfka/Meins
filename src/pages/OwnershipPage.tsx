import { useParams } from 'react-router';

export default function OwnershipPage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  return (
    <div style={{ padding: '2rem' }}>
      <p>OwnershipPage — tagCode: {tagCode}</p>
    </div>
  );
}
