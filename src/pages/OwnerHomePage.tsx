import { useParams } from 'react-router';

export default function OwnerHomePage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  return (
    <div style={{ padding: '2rem' }}>
      <p>OwnerHomePage — tagCode: {tagCode}</p>
    </div>
  );
}
