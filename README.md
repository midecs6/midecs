# MIDECS 체질 진단 설문지 (PWA)

나의 비만 원인을 **6가지 체질(M·I·D·E·C·S)**로 정밀 분석하는 자가진단 설문 웹앱입니다.

## 🚀 배포 방법 (3가지)

### 방법 1: Vercel (가장 쉬움, 무료)

1. [GitHub](https://github.com) 계정 생성 후 이 폴더를 새 저장소(Repository)로 업로드
2. [Vercel](https://vercel.com)에 GitHub 계정으로 로그인
3. "Import Project" → 방금 만든 저장소 선택
4. 설정 변경 없이 "Deploy" 클릭
5. 약 1분 후 `https://프로젝트명.vercel.app` 주소로 배포 완료!

### 방법 2: Netlify (무료)

1. [Netlify](https://www.netlify.com) 로그인
2. "Sites" 탭 → 이 폴더의 `dist` 폴더를 드래그 앤 드롭
   (먼저 `npm run build` 실행 필요)
3. 자동 배포 완료

### 방법 3: 자체 서버

```bash
npm install        # 의존성 설치
npm run build      # 빌드 (dist 폴더 생성)
npm run preview    # 로컬에서 미리보기
```

`dist` 폴더의 내용을 아무 웹서버에 업로드하면 됩니다.

## 📱 PWA 설치 안내 (사용자용)

### 안드로이드
1. Chrome으로 사이트 접속
2. 주소창 아래 "홈 화면에 추가" 배너 터치
3. 또는 ⋮ 메뉴 → "앱 설치"

### 아이폰 (iOS)
1. Safari로 사이트 접속
2. 하단 공유 버튼(□↑) 터치
3. "홈 화면에 추가" 선택

## 📁 프로젝트 구조

```
midecs-pwa/
├── public/
│   ├── favicon.svg          # 브라우저 탭 아이콘
│   ├── icon-192.png         # PWA 아이콘 (작은)
│   ├── icon-512.png         # PWA 아이콘 (큰)
│   └── apple-touch-icon.png # iOS 홈 아이콘
├── src/
│   ├── main.jsx             # 앱 진입점
│   └── MIDECSApp.jsx        # 메인 설문 컴포넌트
├── index.html               # HTML 템플릿 (PWA 메타 태그 포함)
├── vite.config.js           # Vite + PWA 플러그인 설정
├── package.json             # 의존성 목록
└── README.md                # 이 파일
```

## ✏️ 커스터마이징

- **설문 문항 수정**: `src/MIDECSApp.jsx`의 `CATEGORIES` 배열
- **타입별 상세 정보**: `TYPE_DETAILS` 객체
- **추천 식품/보조제**: `TYPE_NUTRITION` 객체
- **색상 변경**: 각 카테고리의 `color`, `gradient` 속성
- **앱 이름 변경**: `vite.config.js`의 manifest 섹션

## 🔗 링크 연결

결과 화면에 외부 링크(미덱스몰, 단비단 한의원 등)를 추가하려면
`TYPE_DETAILS` 또는 `TYPE_NUTRITION` 데이터에 URL을 추가하고
해당 컴포넌트에서 `<a href="...">` 태그로 연결하면 됩니다.
