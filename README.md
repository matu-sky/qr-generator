# 🎯 QR 코드 생성기

전문적인 QR 코드 생성 웹 애플리케이션입니다. 다양한 종류의 QR 코드를 쉽고 빠르게 생성할 수 있습니다.

## ✨ 주요 기능

- 🔐 **사용자 인증**: Supabase를 활용한 안전한 로그인/회원가입
- 🔗 **URL QR 코드**: 웹사이트 링크를 QR 코드로 변환
- 📝 **텍스트 QR 코드**: 일반 텍스트를 QR 코드로 변환
- 💬 **SMS QR 코드**: 전화번호와 메시지를 포함한 QR 코드
- 👤 **명함 QR 코드**: vCard 형식의 연락처 정보
- 📶 **Wi-Fi QR 코드**: Wi-Fi 연결 정보
- 💳 **계좌이체 QR 코드**: 은행 계좌 정보
- 🍽️ **메뉴 QR 코드**: 식당/카페 메뉴 정보
- 💾 **다운로드**: 생성된 QR 코드를 PNG 이미지로 다운로드

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 설정에서 API URL과 anon key 확인
3. `.env.example` 파일을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

4. `.env` 파일에 실제 Supabase 정보 입력:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 🏗️ 프로젝트 구조

```
qr-generator/
├── src/
│   ├── main.js           # 메인 애플리케이션 로직
│   ├── style.css         # 디자인 시스템 및 스타일
│   ├── supabase.js       # Supabase 클라이언트 설정
│   ├── qrGenerator.js    # QR 코드 생성 유틸리티
│   └── components.js     # UI 컴포넌트 및 폼 핸들러
├── index.html            # HTML 엔트리 포인트
├── .env.example          # 환경 변수 템플릿
└── package.json          # 프로젝트 의존성
```

## 🎨 기술 스택

- **Frontend**: Vanilla JavaScript + Vite
- **Styling**: Vanilla CSS (모던 디자인 시스템)
- **Backend**: Supabase (인증 + 데이터베이스)
- **QR 생성**: qrcode 라이브러리
- **Typography**: Inter 폰트

## 📱 사용 방법

1. **회원가입/로그인**: 이메일과 비밀번호로 계정 생성
2. **QR 타입 선택**: 상단 탭에서 원하는 QR 코드 종류 선택
3. **정보 입력**: 각 QR 코드 타입에 맞는 정보 입력
4. **생성**: "QR 코드 생성" 버튼 클릭
5. **다운로드**: 생성된 QR 코드를 PNG 파일로 다운로드

## 🔧 Supabase 데이터베이스 설정 (선택사항)

생성된 QR 코드를 저장하고 관리하려면 다음 테이블을 생성하세요:

```sql
-- QR 코드 저장 테이블
create table qr_codes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  type text not null,
  data jsonb not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) 활성화
alter table qr_codes enable row level security;

-- 사용자는 자신의 QR 코드만 볼 수 있음
create policy "Users can view own QR codes"
  on qr_codes for select
  using (auth.uid() = user_id);

-- 사용자는 자신의 QR 코드를 생성할 수 있음
create policy "Users can create QR codes"
  on qr_codes for insert
  with check (auth.uid() = user_id);

-- 사용자는 자신의 QR 코드를 삭제할 수 있음
create policy "Users can delete own QR codes"
  on qr_codes for delete
  using (auth.uid() = user_id);
```

## 🌐 배포

### Cloudflare Pages

1. GitHub에 프로젝트 푸시
2. Cloudflare Pages에서 프로젝트 연결
3. 빌드 설정:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. 환경 변수 설정 (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

### Vercel

```bash
npm install -g vercel
vercel
```

## 📄 라이선스

MIT License

## 🤝 기여

이슈와 풀 리퀘스트는 언제나 환영합니다!

---

Made with ❤️ using Vite + Supabase
