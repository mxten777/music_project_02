
# music_project_02

나만의 시를 입력하면 AI가 발라드/엔카풍 곡을 만들어주는 웹 서비스

## 주요 기술
- React (Vite)
- Tailwind CSS 3.3.3
- Firebase (Firestore, Storage, Functions) [추후 연동]

## 폴더 구조
- src/pages: 페이지 컴포넌트
- src/components: UI 컴포넌트
- src/utils: 유틸리티 함수

## 환경 변수
.env.example 참고

## 개발 실행
```
npm install
npm run dev
```

## Tailwind 적용법
- src/index.css에 @tailwind base; @tailwind components; @tailwind utilities; 선언
- tailwind.config.js의 content 경로 확인

---

Firebase 연동 및 AI 기능은 추후 추가 예정입니다.
