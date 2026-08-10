import { useParams } from 'react-router';

export default function VerifyPage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  return (
    <div style={{ padding: '2rem' }}>
      <p>VerifyPage — tagCode: {tagCode}</p>
    </div>
  );
}
