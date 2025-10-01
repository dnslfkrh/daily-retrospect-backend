<p align="center">
  <img src="https://github.com/user-attachments/assets/2a23e902-290b-454c-8456-7aa787f63325" alt="Image" width="414" height="417" />
</p>

# Daily Retrospect (일일회고)

**Daily Retrospect (일일회고)**는 사용자가 매일의 활동과 생각을 질문을 기반으로 돌아보고, 설정한 목표와 연계하여 진행 상황을 추적할 수 있도록 돕는 PWA(Progressive Web App) 서비스.  
AI가 사용자의 회고 내용을 분석하여 자연스러운 문장 형태로 요약해주는 기능을 제공.

---

## ✨ 주요 기능

- **사용자 인증**: AWS Cognito 기반 사용자 인증 및 데이터 관리  
- **AI 기반 회고**: 질문 기반 회고 작성, AI 자동 요약 및 분석  
- **목표 관리**: 목표 생성, 수정, 삭제(CRUD), 회고 질문과 연동된 진행도 추적  
- **데일리 이미지**: 하루를 대표하는 이미지 업로드, 갤러리 뷰 제공  
- **데이터 시각화**: 캘린더와 그래프를 통한 회고 및 목표 데이터 시각화  
- **자동화**: AI 회고 분석 및 비활성 사용자 대상 리마인드 메일 발송 (Cron)  
- **PWA 지원**: 웹 브라우저 설치 및 네이티브 앱과 유사한 경험 제공  

---

## 🛠️ 기술 스택

### Frontend
- Next.js (TypeScript)  
- Tailwind CSS  
- Zustand  
- Framer Motion  
- Axios  
- next-pwa  

### Backend
- NestJS (TypeScript)  
- MySQL + TypeORM  
- JWT, AWS Cognito  
- OpenAI API  
- AWS S3  
- Swagger  
- AWS CloudWatch  

---

## ⚙️ 시스템 아키텍처

<img width="1122" height="626" alt="Image" src="https://github.com/user-attachments/assets/75fcb9aa-3927-4806-8ccb-d9669d7d61aa" />

### 인프라 아키텍처 및 데이터 흐름
1. 사용자는 웹 또는 PWA를 통해 회고 작성, 목표 설정 등 요청 수행  
2. 프론트엔드는 Axios로 백엔드에 요청 전달, 인증 요청 시 JWT 포함  
3. 백엔드는 DB, S3 등을 활용해 처리 후 JSON 반환  
4. 프론트엔드는 응답 JSON으로 UI 렌더링  

---

## 🎯 핵심 비즈니스 로직

### 회고 질문 구성 알고리즘
다양한 회고 경험 제공을 위해 가중치 기반 질문 선택 알고리즘 구현.  
최근 사용 이력과 질문 빈도를 고려하여 특정 질문만 반복되지 않도록 설계.

- 사용자 설정(컨셉, 볼륨)에 따른 질문 비율 결정  
- 최근 사용된 질문 제외  
- 마지막 사용일이 오래되거나 사용 빈도가 낮을수록 높은 가중치 부여  
- 가중치 기반 룰렛 휠 방식으로 질문 선택  
- 질문 사용 이력 업데이트 (사용 횟수, 마지막 사용일)  

---

### AI 회고 요약 로직
사용자가 작성한 회고 데이터를 AI가 요약 문장으로 변환.

- NestJS Cron 작업을 통해 매일 새벽 실행  
- 전날 작성된 회고 데이터를 일괄 조회  
- OpenAI GPT API를 활용해 자연어 기반 요약 생성  
- `Promise.all()`을 통한 병렬 처리로 성능 최적화  
- 생성된 요약 결과를 세션별 데이터베이스에 저장  

---

### 데일리 이미지 관리 로직
하루를 대표하는 이미지를 최대 3장 업로드 및 관리.

- 클라이언트가 Presigned URL 요청 → 백엔드가 생성 후 반환  
- 클라이언트는 Presigned URL을 통해 직접 S3 업로드  
- 이미지 추가, 삭제, 유지 작업을 단일 API로 일괄 처리  
- 불필요한 이미지 데이터를 즉시 정리하여 S3와 DB 최적화  

---

### 실행 영상
```
https://youtube.com/shorts/_pWCBhqHqSs?si=ZRzhE_K8qJSE1lPw
```

---
