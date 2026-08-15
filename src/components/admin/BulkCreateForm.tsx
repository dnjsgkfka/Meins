import { useState } from 'react';
import { bulkCreateTags, AdminApiError } from '../../api/admin';
import type { BulkCreateBody, BulkCreateResult } from '../../api/admin';
import { useAdminKeyReset } from './AdminKeyGate';
import { useToast } from '../../lib/toast';

const FIELD_CLASS =
  'w-full h-11 px-3 rounded-lg border border-[var(--color-icon-inactive)] bg-[var(--color-bg)] text-sm text-[var(--color-fg)] outline-none focus:border-[var(--color-accent)]';
const LABEL_CLASS = 'flex flex-col gap-1 text-xs text-[var(--color-muted)]';

export default function BulkCreateForm({ onCreated }: { onCreated?: () => void }) {
  const resetKey = useAdminKeyReset();
  const { showToast } = useToast();

  const [form, setForm] = useState<Record<string, string>>({
    productName: '', modelCode: '', manufacturedYm: '', material: '', color: '',
    saleRegisteredYm: '', widthCm: '', depthCm: '', heightCm: '',
    imageUrl: '', thumbnailImageUrl1: '', thumbnailImageUrl2: '', thumbnailImageUrl3: '',
    productPageUrl: '', quantity: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<BulkCreateResult | null>(null);
  const [copied, setCopied] = useState(false);

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.productName.trim()) {
      setError('제품명은 필수입니다.');
      return;
    }
    setError('');
    setResult(null);
    setIsSubmitting(true);

    const body: BulkCreateBody = {
      productName: form.productName.trim(),
      ...(form.modelCode        && { modelCode: form.modelCode }),
      ...(form.manufacturedYm   && { manufacturedYm: form.manufacturedYm }),
      ...(form.material         && { material: form.material }),
      ...(form.color            && { color: form.color }),
      ...(form.saleRegisteredYm && { saleRegisteredYm: form.saleRegisteredYm }),
      ...(form.widthCm          && { widthCm: Number(form.widthCm) }),
      ...(form.depthCm          && { depthCm: Number(form.depthCm) }),
      ...(form.heightCm         && { heightCm: Number(form.heightCm) }),
      ...(form.imageUrl         && { imageUrl: form.imageUrl }),
      ...(form.thumbnailImageUrl1 && { thumbnailImageUrl1: form.thumbnailImageUrl1 }),
      ...(form.thumbnailImageUrl2 && { thumbnailImageUrl2: form.thumbnailImageUrl2 }),
      ...(form.thumbnailImageUrl3 && { thumbnailImageUrl3: form.thumbnailImageUrl3 }),
      ...(form.productPageUrl   && { productPageUrl: form.productPageUrl }),
      ...(form.quantity         && { quantity: Number(form.quantity) }),
    };

    try {
      const res = await bulkCreateTags(body);
      setResult(res);
      onCreated?.();
    } catch (err) {
      if (err instanceof AdminApiError && err.code === 'ADMIN_KEY_INVALID') {
        showToast('관리자 키가 유효하지 않습니다. 다시 입력해주세요.');
        resetKey();
      } else {
        setError(err instanceof Error ? err.message : '생성에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    const text = result.tags
      .map((t) => `${t.tagCode}\t${t.authCode}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('복사에 실패했습니다. 직접 선택해 주세요.');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* 2열 그리드 (모바일 1열) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 제품명 — 전체 너비 */}
          <label className={`${LABEL_CLASS} sm:col-span-2`}>
            제품명 <span className="text-[var(--color-danger)]">*</span>
            <input className={FIELD_CLASS} value={form.productName} onChange={set('productName')} placeholder="MCM 클래식 백팩" />
          </label>

          <label className={LABEL_CLASS}>
            모델 코드
            <input className={FIELD_CLASS} value={form.modelCode} onChange={set('modelCode')} placeholder="MUK AAVI03" />
          </label>

          <label className={LABEL_CLASS}>
            수량 (1~1000)
            <input className={FIELD_CLASS} type="number" min={1} max={1000} value={form.quantity} onChange={set('quantity')} placeholder="1" />
          </label>

          <label className={LABEL_CLASS}>
            제조연월 (YYYY-MM)
            <input className={FIELD_CLASS} value={form.manufacturedYm} onChange={set('manufacturedYm')} placeholder="2024-03" />
          </label>

          <label className={LABEL_CLASS}>
            판매 등록연월 (YYYY-MM)
            <input className={FIELD_CLASS} value={form.saleRegisteredYm} onChange={set('saleRegisteredYm')} placeholder="2024-05" />
          </label>

          <label className={LABEL_CLASS}>
            소재
            <input className={FIELD_CLASS} value={form.material} onChange={set('material')} placeholder="모노그램 코팅 캔버스" />
          </label>

          <label className={LABEL_CLASS}>
            색상
            <input className={FIELD_CLASS} value={form.color} onChange={set('color')} placeholder="코냑" />
          </label>

          <label className={LABEL_CLASS}>
            가로 (cm)
            <input className={FIELD_CLASS} type="number" step="0.1" value={form.widthCm} onChange={set('widthCm')} placeholder="30" />
          </label>

          <label className={LABEL_CLASS}>
            세로 (cm)
            <input className={FIELD_CLASS} type="number" step="0.1" value={form.depthCm} onChange={set('depthCm')} placeholder="14" />
          </label>

          <label className={LABEL_CLASS}>
            높이 (cm)
            <input className={FIELD_CLASS} type="number" step="0.1" value={form.heightCm} onChange={set('heightCm')} placeholder="42" />
          </label>

          <label className={`${LABEL_CLASS} sm:col-span-2`}>
            제품 대표 이미지 URL
            <input className={FIELD_CLASS} value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." />
          </label>

          <label className={LABEL_CLASS}>
            썸네일 1 URL
            <input className={FIELD_CLASS} value={form.thumbnailImageUrl1} onChange={set('thumbnailImageUrl1')} placeholder="https://..." />
          </label>

          <label className={LABEL_CLASS}>
            썸네일 2 URL
            <input className={FIELD_CLASS} value={form.thumbnailImageUrl2} onChange={set('thumbnailImageUrl2')} placeholder="https://..." />
          </label>

          <label className={`${LABEL_CLASS} sm:col-span-2`}>
            썸네일 3 URL
            <input className={FIELD_CLASS} value={form.thumbnailImageUrl3} onChange={set('thumbnailImageUrl3')} placeholder="https://..." />
          </label>

          <label className={`${LABEL_CLASS} sm:col-span-2`}>
            제품 상세 페이지 URL
            <input className={FIELD_CLASS} value={form.productPageUrl} onChange={set('productPageUrl')} placeholder="https://..." />
          </label>
        </div>

        {error && <p className="m-0 text-xs text-[var(--color-danger)]">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={[
            'h-11 rounded-full text-sm border-none transition-colors',
            isSubmitting
              ? 'bg-[var(--color-icon-inactive)] text-[var(--color-bg)] cursor-not-allowed'
              : 'bg-[var(--color-accent)] text-[var(--color-bg)] cursor-pointer',
          ].join(' ')}
        >
          {isSubmitting ? '생성 중...' : '태그 일괄 생성'}
        </button>
      </form>

      {/* 생성 결과 */}
      {result && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="m-0 text-sm text-[var(--color-fg)] font-medium">
              생성 완료 — productId: {result.productId} · {result.tags.length}개 태그
            </p>
            <button
              onClick={handleCopy}
              className="h-9 px-4 rounded-full text-xs bg-[var(--color-accent)] text-[var(--color-bg)] border-none cursor-pointer"
            >
              {copied ? '복사됨 ✓' : '전체 복사'}
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--color-tint)]">
                  <th className="text-left px-3 py-2 font-normal text-[var(--color-muted)] border-b border-[var(--color-border)]">#</th>
                  <th className="text-left px-3 py-2 font-normal text-[var(--color-muted)] border-b border-[var(--color-border)]">태그 코드</th>
                  <th className="text-left px-3 py-2 font-normal text-[var(--color-muted)] border-b border-[var(--color-border)]">인증 코드</th>
                </tr>
              </thead>
              <tbody>
                {result.tags.map((tag, i) => (
                  <tr key={tag.tagCode} className="bg-[var(--color-bg)]">
                    <td className="px-3 py-2 text-[var(--color-muted)] border-b border-[var(--color-border)]">{i + 1}</td>
                    <td className="px-3 py-2 text-[var(--color-fg)] font-mono border-b border-[var(--color-border)] whitespace-nowrap">{tag.tagCode}</td>
                    <td className="px-3 py-2 text-[var(--color-fg)] font-mono border-b border-[var(--color-border)] whitespace-nowrap">{tag.authCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
