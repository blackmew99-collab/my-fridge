# 🧊 My Fridge — 설치 & 배포 가이드

## 📦 이 폴더에 들어있는 것
```
my-fridge-deploy/
├── src/
│   ├── App.js         ← 앱 전체 코드
│   └── index.js       ← 진입점
├── public/
│   ├── index.html     ← HTML 템플릿
│   ├── manifest.json  ← 앱 이름·아이콘 설정
│   ├── favicon.ico    ← 브라우저 탭 아이콘
│   ├── logo192.png    ← 홈 화면 아이콘 (소)
│   └── logo512.png    ← 홈 화면 아이콘 (대)
├── package.json       ← 프로젝트 설정
└── 배포하기.bat        ← 자동 배포 스크립트
```

---

## 🚀 처음 설치할 때 (한 번만)

### 1. 이 폴더 내용을 기존 my-fridge 폴더에 복사

탐색기에서 이 폴더의 모든 파일을 `C:\Users\black\Desktop\my-fridge` 에 붙여넣기
(덮어쓰기 허용)

### 2. PowerShell에서 실행
```powershell
cd C:\Users\black\Desktop\my-fridge
npm install
git add .
git commit -m "아이콘 및 설정 업데이트"
git push
```

### 3. Vercel 자동 재배포 확인
vercel.com 대시보드에서 배포 완료 확인 후 핸드폰으로 접속!

---

## 🔄 나중에 코드 수정 후 배포할 때

`배포하기.bat` 파일을 **더블클릭** 하면 자동으로 업로드 & 배포돼요!

---

## 📱 핸드폰 홈 화면에 추가

| iPhone (Safari) | Android (Chrome) |
|---|---|
| 공유 버튼 탭 | 메뉴(⋮) 탭 |
| "홈 화면에 추가" | "앱 설치" 또는 "홈 화면에 추가" |

> 기존에 이미 추가했다면 삭제 후 다시 추가해야 새 아이콘이 반영돼요!
