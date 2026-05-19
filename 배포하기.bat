@echo off
chcp 65001 > nul
echo.
echo ╔══════════════════════════════════════════╗
echo ║     My Fridge - 자동 배포 스크립트       ║
echo ╚══════════════════════════════════════════╝
echo.

:: 현재 폴더 확인
echo [1/4] 현재 위치 확인 중...
cd /d "%~dp0"
echo 현재 위치: %cd%
echo.

:: npm install
echo [2/4] 패키지 설치 중... (처음 한 번만 시간이 걸려요)
call npm install
if errorlevel 1 (
    echo 오류: npm install 실패
    pause
    exit /b 1
)
echo.

:: git push
echo [3/4] GitHub에 업로드 중...
git add .
git commit -m "업데이트"
git push
if errorlevel 1 (
    echo 오류: git push 실패. git 설정을 확인해주세요.
    pause
    exit /b 1
)
echo.

echo [4/4] 완료!
echo.
echo ✅ GitHub 업로드 완료!
echo ✅ Vercel이 자동으로 재배포를 시작했어요.
echo ✅ 1~2분 후 vercel.com 대시보드에서 확인하세요.
echo.
pause
