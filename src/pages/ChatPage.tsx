import { useParams } from 'react-router';

export default function ChatPage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  return (
    <div style={{ padding: '2rem' }}>
      <p>ChatPage — tagCode: {tagCode}</p>
    </div>
  );
}
