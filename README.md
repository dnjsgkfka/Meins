<div align="center">

# Meins

**대화형 디지털 제품 여권에서 시작되는 럭셔리 경험 혁신**

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white" alt="Deploy">
</p>

</div>

---

<img width="8000" height="4500" alt="MCM 어시스턴트_page-0003" src="https://github.com/user-attachments/assets/1a5f17b9-a847-4701-9841-12bb5397d50d" />

---

## 🔗[Meins Link](https://meins-five.vercel.app)

- [게스트 뷰(guest view)](https://meins-five.vercel.app/t/BSKL-3Y77)

---

## Why?

현재의 디지털 제품 여권(DPP)은 개체에 사양·소재·지속가능성 문서를 붙이는 데 그칩니다. 지금 누가 소유하는지 알 수 없고, 판매·재유통 시점마다 브랜드 여정이 끊깁니다. EU 레지스트리 역시 식별자와 여권 위치만 등록할 뿐, 소유 데이터를 누가 쥐는지는 규제가 정해 주지 않습니다.

**Meins는 기존 NFC·QR 태그 위에 소유권 레이어를 얹어 이 문제를 해결합니다.** 개체에 지금의 소유자가 연결되고, 중고 거래 시 소유권이 이전되며, 케어·수선 이력은 개체에 누적되어 다음 소유자에게 승계됩니다.

<img width="8000" height="4500" alt="서울과학기술대학교_이얏호_Meins_page-0007" src="https://github.com/user-attachments/assets/922587e2-60f7-4707-be9b-b7daaaf5eb7a" />


---

## 주요 기능

<img width="8000" height="4500" alt="MCM 어시스턴트_page-0010" src="https://github.com/user-attachments/assets/bffbe9be-061f-4035-9285-e36fd84ebe12" />

### 게스트 뷰
- 태그 스캔 시 제품 정보 및 소유 등록 여부 즉시 확인
- 미등록 제품 소유자 등록 진입점 제공

### 오너 뷰
- 이메일 코드 인증 후 소유자 등록
- **AI 컨시어지**: 제품별 소재·소유 이력·컬렉션 헤리티지를 컨텍스트로 주입한 LLM 실시간 스트리밍 답변
- 소유권 이전 (양도 코드 발급 → 수령자 코드 입력)

### 관리자 페이지
- 태그 일괄 생성, 상태 강제 변경, QR 일괄 내보내기

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React 19 + TypeScript 6 |
| 빌드 | Vite 8 + Rolldown (Babel React Compiler) |
| 스타일 | Tailwind CSS v4 |
| 라우팅 | React Router v8 |
| 서버 상태 | TanStack Query v5 |
| 배포 | Vercel (프론트) / Railway (백엔드) |
| AI | OpenAI API (SSE 스트리밍) |

---

## Getting Started

### 설치
```bash
# Clone the repository
git clone [https://github.com/dnjsgkfka/Meins.git](https://github.com/dnjsgkfka/Meins.git)

# Install dependencies
npm install

# Run development server
npm run dev
