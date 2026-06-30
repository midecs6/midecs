import { useState, useEffect, useRef, Fragment } from "react";

/* ════════════════════════════════════════════════════════════
   MIDECS 체질 진단 설문지 — Interactive Self-Test v2
   타입별 상세 설명 + 챌린지 + 추천 식품/보조제 포함
   ════════════════════════════════════════════════════════════ */

const CATEGORIES = [
  {
    key: "M", title: "Metabolism", subtitle: "혈당형", icon: "🔥",
    color: "#C4956A", gradient: "linear-gradient(135deg, #A07850, #C4956A)",
    coreIssue: "인슐린 저항성, 혈당 스파이크, 대사 호르몬 불균형",
    questions: [
      "식후 1–2시간이 지나면 심한 졸음이나 멍함이 와서 집중하기 어렵다.",
      "식사 간격이 4–5시간 이상 길어지면 손 떨림·식은땀·극심한 허기를 느낀다.",
      "예전보다 같은 양을 먹어도 체중이 더 잘 늘고 잘 빠지지 않는다.",
      "특별히 많이 먹지 않아도 허리둘레·복부비만이 점점 늘어나는 편이다.",
      "혈액검사에서 공복혈당·당화혈색소·중성지방·LDL 콜레스테롤 이상을 지적받은 적이 있다.",
      "평소 손발이 차고 추위를 많이 타며, 남들보다 옷을 더 껴입는 편이다.",
      "이유 없이 피로감이 지속되고, 아침에 일어나도 개운하지 않은 날이 많다.",
      "과거 또는 현재 갑상선 기능 이상(저하나 항진) 진단을 받았거나 약을 복용한 적이 있다.",
      "여성의 경우 생리불순·다낭성난소증후군, 남성의 경우 복부비만·성욕 저하를 지적받은 적이 있다.",
      "가까운 가족(부모·형제) 중에 당뇨병, 지방간, 심근경색, 뇌졸중 환자가 있다."
    ],
    interpretations: {
      green: { label: "대사 엔진은 비교적 안정", text: "현재로서는 인슐린·혈당·갑상선이 살이 찌는 주범일 가능성은 낮습니다." },
      yellow: { label: "대사 엔진 경고등 ON", text: "혈당 스파이크, 복부비만, 피로 등이 서서히 나타나는 단계입니다.", exam: "공복혈당, HbA1c, 인슐린, 중성지방, 갑상선(TSH, Free T4)" },
      red: { label: "\"혈당형\"이 핵심 Driver", text: "인슐린 저항성·복부비만·대사증후군과 관련된 위험이 높습니다.", exam: "공복혈당, HbA1c, 인슐린, 갑상선 정밀검사(Free T3, 항체), 성호르몬 검사" }
    },
    checklist: ["공복혈당·HbA1c·인슐린 검사 예약", "매 끼니 탄수화물 섭취 기준 정하기", "식사 순서 변경 (채소 → 단백질 → 탄수화물)", "혈당 스파이크 유발 음식 제거"]
  },
  {
    key: "I", title: "Impulse & Dopamine", subtitle: "식욕형", icon: "🧠",
    color: "#7B6B8B", gradient: "linear-gradient(135deg, #5B4B6B, #8B7B9B)",
    coreIssue: "도파민 보상회로, 감정적 폭식, 음식 중독",
    questions: [
      "배가 부른데도 디저트·과자·빵은 별도로 더 먹고 싶어지는 일이 잦다.",
      "과자·빵·치킨·야식을 먹기 시작하면, 멈추기 힘들어 끝까지 다 먹는 편이다.",
      "스트레스·우울·짜증이 날 때, 단 음식·자극적인 음식으로 기분을 달래는 일이 많다.",
      "며칠 동안 빵·라면·단 음식을 끊으면 안절부절못하거나 집중이 잘 안 된다.",
      "예전보다 더 맵고 짜고 강한 맛을 찾아야 만족감을 느끼는 것 같다.",
      "배달앱·먹방·푸드 콘텐츠를 자주 보며, 보는 것만으로도 대리 만족을 느낀다.",
      "배불리 먹고 나서 강한 죄책감을 느끼지만, 며칠 뒤 비슷한 패턴을 반복한다.",
      "누구 없을 때, 혹은 혼자 있을 때 더 많이·더 빠르게 먹는 습관이 있다.",
      "다이어트를 수차례 시도했지만, 폭식·야식·간식 때문에 무너진 경험이 여러 번 있다.",
      "식사 자체보다, \"맛있는 걸 먹는 순간\"에 대한 기대감이 훨씬 크게 느껴진다."
    ],
    interpretations: {
      green: { label: "도파민·보상 회로는 건강", text: "식욕 조절이 비교적 잘 작동하고 있습니다." },
      yellow: { label: "감정 폭식 신호", text: "도파민·보상 회로에 약간의 불균형이 나타나고 있습니다.", exam: "스트레스 호르몬 검사(코르티솔), 신경전달물질 대사체 검사" },
      red: { label: "식욕형이 핵심 Driver", text: "폭식·야식, 감정 조절 부족이 비만의 주된 원인입니다.", exam: "코르티솔 검사, 신경전달물질 대사체 검사" }
    },
    checklist: ["배달앱 삭제하기", "먹방·푸드 콘텐츠 구독 해제", "도파민 디톡스 2주 계획 세우기", "보상 대체활동 3가지 정하기"]
  },
  {
    key: "D", title: "Digestion & Gut", subtitle: "대장형", icon: "🦠",
    color: "#4A7C59", gradient: "linear-gradient(135deg, #3A6B48, #5A8C69)",
    coreIssue: "장내 미생물 불균형, 장누수, 소화기 민감성",
    questions: [
      "식이섬유(채소·고구마·콩류)를 먹으면 가스가 심하게 차고 배가 빵빵해지는 편이다.",
      "변비와 설사가 번갈아 오거나, 배변 후에도 잔변감·불완전 배출감이 자주 남는다.",
      "밀가루·유제품을 먹은 뒤 속이 더부룩하거나, 다음 날 몸이 무겁고 피곤하다.",
      "식사 후 위가 더부룩하고 더디게 내려가는 느낌이 자주 든다.",
      "스트레스를 받으면 바로 복통·설사·변비 변화가 나타나는 편이다.",
      "평소 방귀·대변 냄새가 유독 심하거나 지독하게 느껴진다.",
      "장염·위염·과민성장증후군 등 소화기 질환 진단을 받은 적이 있다.",
      "피부 트러블·여드름·피부염이, 먹는 것(밀가루·유제품·튀긴 음식)과 연관된 것 같다고 느낀다.",
      "과거에 항생제·소염제·위장약을 2주 이상 장기복용한 경험이 있다.",
      "하루 중 대부분 시간에 배(특히 배꼽 주변 아랫배)가 항상 부풀어 있는 느낌이 든다."
    ],
    interpretations: {
      green: { label: "장 기능은 비교적 건강", text: "소화·장내 환경이 비교적 건강합니다." },
      yellow: { label: "장 기능 저하 신호", text: "장내 미생물 불균형·소화 불편이 쌓이고 있습니다.", exam: "대변 미생물 검사, 소변 유기산 검사, 식이민감성 검사(IgG)" },
      red: { label: "대장형이 핵심 문제", text: "장 기능 회복이 선행되지 않으면 어떤 다이어트도 효과가 제한적입니다.", exam: "대변 미생물 검사, 소변 유기산 검사, FODMAP 민감성 검사" }
    },
    checklist: ["대변 미생물 검사 예약", "2주간 FODMAP 제거식 시작", "프로바이오틱스 선택 (전문가 상담)", "음식 일지 작성"]
  },
  {
    key: "E", title: "Edema & Inflammation", subtitle: "염증형", icon: "💧",
    color: "#C75B5B", gradient: "linear-gradient(135deg, #A04545, #D47070)",
    coreIssue: "만성 저등급 염증, 부종, 림프 순환 장애",
    questions: [
      "아침에 일어나면 얼굴·눈두덩·손이 붓고, 저녁엔 양말 자국이 깊게 남는 편이다.",
      "살이 찐 것과 별개로, 몸이 물 먹은 솜처럼 무겁고 붓는 느낌이 자주 든다.",
      "특별한 이유 없이 근육통·관절통·두통이 자주 반복된다.",
      "자고 일어나도 몸이 개운하기보다 온몸이 쑤시고 더 피곤한 느낌이 든다.",
      "피부를 긁으면 쉽게 붉게 부어오르거나, 두드러기·가려움이 반복된다.",
      "건강검진에서 고혈압·지방간·혈중 염증수치(hs-CRP 등) 상승을 지적받은 적이 있다.",
      "튀긴 음식·가공식품·야식·술을 먹은 다음 날, 얼굴·손발이 더 붓고 컨디션이 급격히 떨어진다.",
      "잇몸에서 피가 잘 나거나, 입안 궤양·염증이 자주 생긴다.",
      "체중은 큰 변화가 없어도, 다리·발·손가락이 꽉 끼는 느낌이 자주 든다.",
      "류마티스·자가면역질환·만성염증질환(예: 만성 비염·피부염)을 진단받았거나 의심받은 적이 있다."
    ],
    interpretations: {
      green: { label: "일상적 피로·붓기 수준", text: "예방 차원에서 식습관 개선을 추천합니다." },
      yellow: { label: "만성 저등급 염증 신호", text: "항염 식단·수면·스트레스 관리를 시작하면 몸이 가벼워집니다.", exam: "hs-CRP, ESR, 호모시스테인" },
      red: { label: "염증형이 우선 과제", text: "염증·부종이 체중보다 먼저 해결해야 할 \"몸의 불\"입니다.", exam: "hs-CRP, ESR, 호모시스테인, 오메가 지방산 비율" }
    },
    checklist: ["hs-CRP, ESR 검사 예약", "항염 식품 리스트 만들기", "수면 시간 30분 늘리기", "스트레스 완화 활동 3가지 정하기"]
  },
  {
    key: "C", title: "Circadian & Cortisol", subtitle: "수면형", icon: "🌙",
    color: "#5B7B8B", gradient: "linear-gradient(135deg, #4A6B7B, #6B8B9B)",
    coreIssue: "생체리듬 교란, 코르티솔 불균형, 만성 스트레스",
    questions: [
      "자려고 누워도 생각이 많아져 30분 이상 뒤척이는 날이 많다.",
      "밤중에 자주 깨거나(소변·각성), 깨고 나면 다시 잠들기 어렵다.",
      "아침에 일어날 때 기상 자체가 너무 힘들고, 오전 내내 머리가 멍한 날이 많다.",
      "낮에는 피곤하다가 밤 10시 이후가 되면 오히려 말똥말똥해지는 패턴이 자주 나타난다.",
      "늦은 밤(21–24시)에 야식·과식을 하는 빈도가 높다.",
      "교대근무, 잦은 야근, 늦은 회식 등으로 수면 시간·패턴이 불규칙한 생활을 오래 해왔다.",
      "사소한 일에도 짜증·분노가 쉽게 치밀거나, 기분이 급격히 가라앉는 경험이 잦다.",
      "스트레스를 받으면 단 것보다 짠 국물·자극적인 음식이 당긴다.",
      "최근 몇 년 사이에 체중이 늘면서, 특히 윗배·옆구리·뒷목 아래(버팔로 험프)에 지방이 붙는 느낌이다.",
      "건강검진·의사가 코르티솔·부신 기능·스트레스 관리에 대해 언급한 적이 있다."
    ],
    interpretations: {
      green: { label: "수면·생체리듬은 비교적 정상", text: "수면·스트레스가 비만의 주된 원인일 가능성은 낮습니다." },
      yellow: { label: "생체리듬 교란 초기", text: "빛·카페인·운동 타이밍 조절로 개선 가능합니다.", exam: "타액 코르티솔 (4회 측정), 수면다원검사" },
      red: { label: "수면형이 우선 과제", text: "수면과 스트레스 관리 없이는 다른 모든 노력이 반감됩니다.", exam: "타액 코르티솔, DHEA-S, 24시간 코르티솔 프로필" }
    },
    checklist: ["타액 코르티솔 검사 예약", "수면 시간표 정하고 2주간 고수", "저녁 카페인 섭취 시간 앞당기기", "아침 산책·명상 30분 시작"]
  },
  {
    key: "S", title: "Structure & Muscle", subtitle: "근감소형", icon: "💪",
    color: "#8B7355", gradient: "linear-gradient(135deg, #6B5540, #A08565)",
    coreIssue: "활동량 부족, 근육감소, 기초대사 저하",
    questions: [
      "하루 대부분을 앉아서 보내는 생활(사무·운전·컴퓨터·스마트폰)을 몇 년 이상 지속해왔다.",
      "숨이 차지 않을 정도의 가벼운 계단·오르막도 힘들게 느껴지고 다리가 쉽게 풀린다.",
      "예전에 비해 근육량·체력이 눈에 띄게 떨어졌고, 같은 활동에도 더 쉽게 피곤해진다.",
      "별로 많이 먹지 않아도, 나이가 들면서 배·허벅지·엉덩이 살이 서서히 쪘다.",
      "1주일에 30분 이상 땀나는 운동을 2회 이상 하는 주가 거의 없다.",
      "장시간 걷거나 서 있으면, 무릎·허리·발목 통증 때문에 활동을 줄이게 된다.",
      "의사에게서 근감소증·골다공증·관절염·허리디스크 관련 진단 또는 주의 이야기를 들은 적이 있다.",
      "체중을 줄이려고 식사량만 줄이는 다이어트를 반복해 왔고, 그 후 더 쉽게 피곤해졌다.",
      "몸무게는 비슷하지만, 예전보다 옷맵시·체형(탄력·라인)이 확실히 망가졌다고 느낀다.",
      "\"운동을 시작해야지\"라는 생각은 자주 하지만, 막상 실천이 잘 안 되고 미루는 패턴이 오래되고 있다."
    ],
    interpretations: {
      green: { label: "활동·근육량은 비교적 건강", text: "현재 활동 수준을 유지하며 다른 영역에 집중하세요." },
      yellow: { label: "근육 손실 신호", text: "고단백 식단과 점진적 근력 운동으로 개선 가능합니다.", exam: "DEXA, 생체임피던스, 기초대사량 측정" },
      red: { label: "근육·활동 재건이 우선", text: "근감소·기초대사 저하가 악순환을 만들고 있습니다.", exam: "DEXA, 생체임피던스, 기초대사량 측정" }
    },
    checklist: ["신체 구성 분석(체지방률) 측정", "고단백 식단 전환 (매 끼 20–30g 단백질)", "주 3회 근력 운동 계획", "하루 만보 이상 걷기"]
  }
];

// ─── 타입별 상세 정보 (구글 문서 1) ─────────────────────────
const TYPE_DETAILS = {
  M: {
    cause: "인슐린 저항성, 갑상선 기능저하, 성호르몬 감소로 인해 몸의 대사 엔진이 꺼진 상태입니다. 같은 양을 먹어도 에너지로 태우지 못하고 지방으로 저장되며, 특히 복부와 내장에 집중적으로 쌓입니다. 혈당이 급격히 오르내리면서 인슐린이 과다 분비되고, 세포가 인슐린에 둔감해져 지방 저장 모드에 고착됩니다.",
    symptoms: ["식후 30분~1시간 뒤 극심한 졸음","단 음식, 탄수화물이 자꾸 당김","배·허리·엉덩이부터 살이 찜","아침에 얼굴·손이 붓고 부기가 안 빠짐","추위를 유난히 많이 타고 손발이 차가움","만성 피로, 아침에 일어나기 힘듦","변비가 심하고 소화가 느림","생리불순, 성욕 감소, 갱년기 증상","집중력 저하, 머리가 무겁고 뿌연 느낌","건강검진에서 공복혈당·중성지방·콜레스테롤 경고"],
    solutions: ["거꾸로 식사법: 채소 → 단백질 → 탄수화물 순서","흰쌀밥 대신 저항성 전분(식힌 밥, 고구마) 활용","간헐적 단식 12:12 → 16:8로 점진적 적용","식후 20~30분 가벼운 걷기로 혈당 스파이크 방지","단백질 섭취 늘리기 (체중 1kg당 1~1.2g)","갑상선 의심 시 TSH, Free T4 검사 필수","정제 탄수화물·설탕·액상과당 최소화","오메가3, 비타민D, 마그네슘 보충","충분한 수면 (최소 7시간)"],
    challenge: { title: "21일 혈당 안정 챌린지", weeks: ["1주차: 매 끼니 \"채소 먼저\" 실천, 식후 혈당 체크","2주차: 저녁 탄수화물 절반으로 줄이기, 식후 10분 걷기","3주차: 간헐적 단식 14:10 도전, 아침 공복혈당 기록"], daily: "식곤증 정도 0~10점 기록", weekly: "허리둘레 측정 (체중보다 중요!)", goal: "\"탄수화물 먹어도 졸리지 않은 나\" 경험" }
  },
  I: {
    cause: "뇌의 보상 회로와 식욕 조절 시스템이 망가진 상태입니다. 도파민, 렙틴, 그렐린 불균형으로 \"배는 안 고픈데 입이 심심한\" 상태가 지속됩니다. 스트레스·우울·불안을 음식으로 해소하는 패턴이 반복되면서 뇌가 음식을 \"유일한 보상\"으로 인식합니다. 고당·고지방 가공식품은 중독을 유발하며 폭식 후 죄책감과 다시 폭식하는 악순환이 생깁니다.",
    symptoms: ["배고프지 않은데도 계속 먹고 싶음","스트레스받으면 자동으로 음식 생각","야식·폭식 후 극심한 자책과 우울감","먹방·쿡방 보면서 대리만족","배달 앱을 하루에 여러 번 확인","특정 음식(치킨·피자·과자)을 참기 힘듦","혼자 있을 때 더 많이 먹음","감정 기복이 크고 충동적","다이어트 시작→실패 반복 (요요 多)","음식 말고는 스트레스 해소법이 없음"],
    solutions: ["환경 설계: 배달 앱 삭제, 집에 간식 안 두기","감정 일기: \"왜 먹고 싶은지\" 3초 멈춤 훈련","음식 외 보상 리스트 만들기 (산책, 음악, 목욕)","도파민 단식: 2주간 가공식품·SNS 차단","마음챙김 식사: 천천히 씹으며 맛 음미","단백질·식이섬유 늘려 진짜 포만감 만들기","사과식초 물 한 잔으로 가짜 식욕 억제","수면 부족 개선 (수면 부족 = 그렐린 증가)","필요 시 폭식장애 전문 상담","자책 대신 \"내일 다시 시작\" 마인드셋"],
    challenge: { title: "28일 도파민 리셋 챌린지", weeks: ["1주차: 자극 차단 (배달앱·SNS·먹방 끊기)","2주차: 금단 관리 (산책 30분, 명상 5분, 물 2L)","3주차: 미각 소생 (자연 식재료 본연의 맛 훈련)","4주차: 새 보상 루틴 정착 (음악·독서·운동)"], daily: "\"왜 먹고 싶었나?\" 감정 일기 3줄", weekly: "폭식 없는 날 개수 세기", goal: "\"음식 말고 나를 위로한 방법\" 리스트 10개 완성" }
  },
  D: {
    cause: "장내 미생물 불균형과 장누수로 인해 영양 흡수는 안 되고 염증만 쌓이는 상태입니다. \"뚱보균\"이 많고 \"날씬균\"이 적으면 같은 음식에서 더 많은 칼로리를 흡수하고, 장 점막이 약해지면 독소가 혈액으로 유입돼 전신 염증을 유발합니다. 만성 염증은 인슐린 저항성을 악화시키고, 소화 장애로 인한 복부 팽만은 \"배만 나온\" 체형을 만듭니다.",
    symptoms: ["식사 후 더부룩함, 가스 차는 느낌","변비와 설사가 반복됨","복부 팽만감으로 옷이 답답함","밀가루·유제품 먹으면 증상 악화","피부 트러블 (여드름, 건조, 아토피)","원인 모를 두통, 만성 피로","입 냄새, 설태가 자주 낌","속쓰림, 역류성 식도염","항생제 복용 이력 多","과민성 대장 증후군 진단 경험"],
    solutions: ["저포드맵 식단: 밀가루·유제품·마늘·양파 2주간 제한","음식 일기로 \"장이 싫어하는 음식\" 파악","프로바이오틱스 복용 (락토바실러스·비피더스균)","프리바이오틱스 섭취 (양배추, 바나나, 귀리)","사골국물, 글루타민으로 장 점막 회복","발효식품 적정량 섭취 (김치, 된장, 요거트)","식전 사과식초로 소화효소 활성화","천천히 씹기, 과식 피하기","스트레스 관리 (장-뇌 축 연결)","필요 시 대장내시경, SIBO 검사"],
    challenge: { title: "4주 장 회복 프로젝트", weeks: ["Week 1: Remove (저포드맵 식단, 장 자극원 제거)","Week 2: Replace (소화효소·사과식초 활용)","Week 3: Reinoculate (프로바이오틱스 증량)","Week 4: Repair (사골국물·글루타민 섭취)"], daily: "변 상태 기록 (브리스톨 척도)", weekly: "복부 둘레·팽만감 0~10점 평가", goal: "\"속 편한 음식\" 리스트 완성" }
  },
  E: {
    cause: "만성 저등급 염증이 온몸에 퍼져 있어 지방 조직 자체가 염증 공장이 된 상태입니다. 사이토카인이 인슐린 저항성을 악화시키고, 림프 순환이 막혀 독소·노폐물이 배출되지 못해 부종이 생깁니다. 내장지방이 많을수록 염증이 더 심해지는 악순환이 발생하며, 고혈압·지방간·자가면역질환으로 이어질 위험이 큽니다.",
    symptoms: ["아침·저녁으로 얼굴·손·발이 심하게 부음","양말 자국이 오래 남고 신발이 꽉 낌","몸이 무겁고 찌뿌둥함","관절·근육통이 자주 발생","피부가 칙칙하고 다크서클 심함","두통, 브레인포그 (머리 무거움)","알레르기 반응 (비염, 두드러기)","고혈압, 지방간 진단","hs-CRP (염증 수치) 높음","자가면역질환 (류마티스, 갑상선염 등)"],
    solutions: ["항염 식단: 오메가3 생선·견과류·베리류 늘리기","염증 유발 음식 제거 (튀김·가공육·설탕·트랜스지방)","저염식 + 칼륨·마그네슘 섭취","수분 섭취 2L 이상 (독소 배출)","림프 마사지·반신욕으로 순환 개선","강황(커큐민), 생강차, 녹차 섭취","충분한 수면 (7~8시간)","스트레스 관리 (코르티솔 ↓)","필요 시 hs-CRP, 간 기능 검사","고혈압·지방간 관리 병행"],
    challenge: { title: "21일 붓기 제로 챌린지", weeks: ["1주차: 배제 식이 (글루텐·설탕·유제품 중단 & 저염)","2주차: 칼륨/마그네슘 집중 (바나나·시금치·견과류)","3주차: 림프 마사지 루틴 & 반신욕 주 3회"], daily: "아침 부기 사진 찍기", weekly: "체중 대신 \"부종 정도\" 자가 평가", goal: "\"양말 자국 안 남는 발목\" 달성" }
  },
  C: {
    cause: "수면 부족과 만성 스트레스로 코르티솔이 과다 분비되어 복부 지방이 쌓입니다. 수면이 부족하면 그렐린은 증가하고 렙틴은 감소해 식욕이 폭발하며, 밤 사이 지방 분해(오토파지)가 일어나지 못합니다. 불규칙한 수면 패턴은 생체 리듬을 무너뜨려 인슐린 저항성·식욕 증가·대사 저하를 동시에 유발합니다.",
    symptoms: ["하루 평균 수면 6시간 미만","자주 깨거나 아침에 개운하지 않음","낮에 졸리고 집중력 저하","밤늦게까지 스마트폰 사용","교대근무, 야간 업무","스트레스 받으면 폭식·야식","코르티솔 복부 (배·허리 집중 비만)","불안·우울·짜증 증가","수면무호흡, 코골이","카페인 과다 섭취 (하루 3잔 이상)"],
    solutions: ["수면 시간표: 취침·기상 시각 매일 일정하게","자기 전 2시간 스마트폰·블루라이트 차단","오후 2시 이후 카페인 금지","저녁 식사는 취침 3시간 전 완료","침실 환경: 어둡고 서늘하게 (18~20도)","취침 전 루틴 (명상, 스트레칭, 따뜻한 물)","마그네슘 보충제 (수면의 질 개선)","낮 햇빛 쐬기 (세로토닌 → 멜라토닌)","스트레스 해소: 음식 외 방법 찾기","수면무호흡 의심 시 수면다원검사"],
    challenge: { title: "30일 숙면 다이어트", weeks: ["1주차: 수면 시간 기록, 취침 시각 30분 앞당기기","2주차: 오후 카페인 제로, 야식 금지","3주차: 취침 전 루틴 만들기 (명상 5분)","4주차: 수면 7시간 이상 유지, 기상 시각 고정"], daily: "수면 시간·질 0~10점 기록", weekly: "아침 피로도·식욕 변화 체크", goal: "4주 후 \"아침에 개운한 나\" 달성" }
  },
  S: {
    cause: "근육량 감소와 활동 부족으로 기초대사량이 떨어진 상태입니다. 근육은 가만히 있어도 칼로리를 소모하는 \"대사 엔진\"인데, 나이·다이어트·운동 부족으로 근육이 빠지면 같은 양을 먹어도 살이 찝니다. 앉아 있는 시간이 긴 현대인은 NEAT(일상 활동 대사)마저 낮아지고, 요요 다이어트를 반복할수록 근육만 빠지고 지방은 늘어나는 \"마른 비만\"이 됩니다.",
    symptoms: ["하루 8시간 이상 앉아서 생활","계단 오르기 힘들고 숨참","근력 운동 경험 거의 없음","다이어트 반복으로 근육 감소","체중은 정상인데 체지방률 높음 (마른 비만)","팔다리는 가는데 배만 나옴","쉽게 피로하고 무기력함","관절·허리 통증","40대 이상 살 더 잘 찜","단백질 섭취 부족 (하루 50g 미만)"],
    solutions: ["NEAT 늘리기: 1시간마다 3분 일어나 걷기","계단 이용, 가까운 거리 걷기","식후 10~20분 산책","주 2~3회 근력 운동 (스쿼트·플랭크·덤벨)","단백질 섭취 늘리기 (체중 1kg당 1~1.5g)","아침·점심·저녁 골고루 단백질 배분","헬스장 부담되면 홈트·맨몸 운동","운동 전후 단백질 섭취 (근육 합성)","극단적 저칼로리 다이어트 금지","40대 이상: 고기·생선·달걀 필수"],
    challenge: { title: "8주 근육 지킴이 프로젝트", weeks: ["1~2주차: 하루 1만 보 걷기, 계단 오르기","3~4주차: 맨몸 스쿼트 50개/플랭크 30초 챌린지","5~6주차: 주 3회 20분 근력 루틴 시작","7~8주차: 근력 운동 + 단백질 체중×1.2g 유지"], daily: "움직임 시간 기록", weekly: "체지방률·골격근량 측정", goal: "8주 후 근육량 1kg 증가" }
  }
};

// ─── 타입별 추천 식품/보조제 (구글 문서 2) ──────────────────
const TYPE_NUTRITION = {
  M: {
    foods: ["현미, 귀리, 퀴노아, 통밀 등 통곡물","브로콜리, 잎채소, 파프리카 등 비전분 채소","연어, 고등어, 꽁치, 참치 등 등푸른 생선","닭가슴살, 달걀, 콩·렌틸·병아리콩","아보카도, 올리브유, 견과류(호두, 아몬드, 치아씨)"],
    supplements: ["오메가3 (혈당·중성지방·염증 개선 보조)","마그네슘·비타민D (인슐린 감수성·대사 지원)","알파리포산, 크롬 등 혈당 보조 성분"]
  },
  I: {
    foods: ["단백질·섬유질 간식: 삶은 달걀, 그릭요거트, 견과류","저당 과일: 베리류, 사과, 키위","통곡물 크래커 + 땅콩버터, 에다마메 스낵","따뜻한 허브티(카모마일, 루이보스), 무가당 탄산수","식전 사과식초 희석 음료 (식욕·혈당 보조)"],
    supplements: ["마그네슘·비타민B군 (스트레스·신경계 안정)","L-테아닌, GABA 등 이완·수면 보조 성분","프로바이오틱스 (장-뇌 축을 통한 식욕 서포트)"]
  },
  D: {
    foods: ["발효식품: 김치, 된장, 요구르트, 케피어","프리바이오틱스: 양파, 마늘, 대파, 바나나, 귀리","저포드맵 채소·과일 (개인 민감도에 따라 선택)","사골국물, 젤라틴, 콜라겐 함유 식품","충분한 수분과 소량씩 자주 먹는 식사 패턴"],
    supplements: ["멀티 스트레인 프로바이오틱스 (유산균·비피더스)","프리바이오틱스 (이눌린, FOS, GOS)","소화효소 (소화 어려운 경우)","L-글루타민 (장 점막 보호·회복 보조)"]
  },
  E: {
    foods: ["베리류, 체리, 포도, 토마토 등 항산화 과일·채소","브로콜리, 케일, 시금치 등 십자화과 야채","연어, 고등어, 정어리 등 오메가3 생선","올리브유, 아마씨·치아씨, 호두 등 좋은 지방","강황, 생강, 마늘, 계피 등 항염 향신료"],
    supplements: ["오메가3 (항염·중성지방·심혈관 보조)","커큐민 (강황 추출물) 항염 보조","비타민D·C·셀레늄·아연 등 항산화·면역 보조"]
  },
  C: {
    foods: ["마그네슘 풍부: 시금치, 케일, 견과류, 콩, 통곡물","트립토판·단백질: 달걀, 칠면조, 두부, 우유","따뜻한 허브티 (카모마일, 패션플라워)","복합탄수화물(현미, 귀리) – 저녁 소량은 수면 보조","카페인·알코올·고당 간식은 저녁 이후 제한"],
    supplements: ["마그네슘 글리시네이트/시트레이트 (수면 보조)","멜라토닌 (단기 수면 리셋, 의료진 상담 후)","L-테아닌, GABA, 글리신 등 이완 성분","B군·오메가3 (스트레스·뇌 기능 서포트)"]
  },
  S: {
    foods: ["고품질 단백질: 살코기, 생선, 달걀, 두부, 그릭요거트","류신·BCAA 풍부 육류·유청 단백질 (근합성 보조)","칼슘·비타민D 풍부: 멸치, 유제품, 두부","통곡물·채소·과일 – 운동 에너지 공급","충분한 수분과 전해질 (운동 전후)"],
    supplements: ["유청단백/WPI·WPC (단백질 보충)","비타민D·칼슘 (근육·뼈 유지 보조)","크레아틴 (근력운동 병행 시 근력 보조)"]
  }
};

const RED_FLAGS = [
  "최근 3개월 이내에 의도 없이 체중이 5kg 이상 급격히 빠졌다.",
  "조금만 움직여도 숨이 차거나 가슴 통증, 심한 두근거림이 있다.",
  "밤에 소변 때문에 3회 이상 깬다. (심한 야간뇨)",
  "물을 하루 4L 이상 마셔도 갈증이 해소되지 않는다.",
  "대변에 검붉은 피가 섞여 나오거나 검은 변을 본다.",
  "이유를 알 수 없는 미열이 3주 이상 지속된다."
];

const SCORE_LABELS = ["전혀\n그렇지\n않다","드물게\n그렇다","가끔\n그렇다","자주\n그렇다","거의\n항상"];

function getLevel(s) { return s <= 9 ? "green" : s <= 19 ? "yellow" : "red"; }
const LE = { green: "🟢", yellow: "🟡", red: "🔴" };
const LL = { green: "안정", yellow: "주의", red: "핵심 Driver" };
const LC = { green: "#4A7C59", yellow: "#B8923A", red: "#C75B5B" };

// ═══════════════════════════════════════════════════════════
// Accordion Section
// ═══════════════════════════════════════════════════════════
function Accordion({ title, icon, children, open: initOpen }) {
  const [open, setOpen] = useState(initOpen || false);
  return (
    <div style={{ marginBottom: 12 }}>
      <div onClick={() => setOpen(!open)} style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 18px", borderRadius: 12, background: "#F5F1EB",
        cursor: "pointer", border: "1px solid #EDE8E0", transition: "all .2s"
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#2D3B2D" }}>{icon} {title}</span>
        <span style={{ fontSize: 20, color: "#9BA89B", transition: "transform .3s", transform: open ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
      </div>
      {open && <div style={{ padding: "16px 18px 8px" }}>{children}</div>}
    </div>
  );
}

// ─── 단비단 삽입 설정 (타입별) ────────────────────────────
const DANBIDAN = {
  M: { desc: "대사량 개선, 식욕 안정", beforeIdx: 7 },
  I: { desc: "가짜 식욕 안정, 대사량 개선", beforeIdx: 6 }
};

// ═══════════════════════════════════════════════════════════
// TypeDetailCard — 타입 상세 분석 카드
// ═══════════════════════════════════════════════════════════
function TypeDetailCard({ catIdx, scores, checkedItems, toggleCheck }) {
  const cat = CATEGORIES[catIdx];
  const s = scores[catIdx];
  const lv = getLevel(s);
  const interp = cat.interpretations[lv];
  const det = TYPE_DETAILS[cat.key];
  const nutr = TYPE_NUTRITION[cat.key];
  const ch = det.challenge;

  return (
    <div style={{
      background: "#fff", borderRadius: 20, borderLeft: "5px solid " + cat.color,
      boxShadow: "0 1px 3px rgba(15,23,42,.06), 0 8px 32px rgba(15,23,42,.04)",
      marginBottom: 24, overflow: "hidden"
    }}>
      <div style={{ padding: "24px 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 36 }}>{cat.icon}</span>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: cat.color, margin: 0 }}>{cat.key} – {cat.subtitle}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 18, fontWeight: 800 }}>{s}점</span>
              <span style={{ padding: "3px 10px", borderRadius: 50, background: LC[lv] + "18", color: LC[lv], fontSize: 12, fontWeight: 700 }}>{LE[lv]} {LL[lv]}</span>
            </div>
          </div>
        </div>

        {/* Interpretation banner */}
        <div style={{
          padding: "16px 20px", borderRadius: 14, marginBottom: 20,
          background: lv === "red" ? "#FDF2EF" : lv === "yellow" ? "#FDF8F0" : "#f0fdf4",
          border: "1px solid " + (lv === "red" ? "#E8C5BF" : lv === "yellow" ? "#E8D5B0" : "#bbf7d0")
        }}>
          <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{LE[lv]} {interp.label}</p>
          <p style={{ fontSize: 14, color: "#5A6B5A", lineHeight: 1.7, margin: 0 }}>{interp.text}</p>
          {interp.exam && <p style={{ fontSize: 13, color: "#4A7C59", marginTop: 8, fontWeight: 600 }}>🔬 권장 검사: {interp.exam}</p>}
        </div>

        {/* 살찌는 원인 */}
        <Accordion title="살찌는 원인" icon="🔥" open={true}>
          <p style={{ fontSize: 14, color: "#5A6B5A", lineHeight: 1.8 }}>{det.cause}</p>
        </Accordion>

        {/* 증상 */}
        <Accordion title="생활에서 나타나는 증상" icon="💡">
          {det.symptoms.map((sy, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 14, color: "#5A6B5A", lineHeight: 1.6, marginBottom: 4 }}>
              <span style={{ color: cat.color, fontWeight: 700, flexShrink: 0 }}>•</span><span>{sy}</span>
            </div>
          ))}
        </Accordion>

        {/* 해결 방법 */}
        <Accordion title="해결 방법" icon="✅">
          {det.solutions.map((sol, i) => {
            const db = DANBIDAN[cat.key];
            return (
              <div key={i}>
                {db && i === db.beforeIdx && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 14, color: "#5A6B5A", lineHeight: 1.6, marginBottom: 6 }}>
                      <span style={{ color: "#4A7C59", fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <span>남창우 원장의 단비단 한약 처방 ({db.desc})</span>
                    </div>
                    <a href="https://www.danbidiet.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block", marginLeft: 16 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 6, background: "#4A7C59", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>단비단 바로가기 →</span>
                    </a>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 14, color: "#5A6B5A", lineHeight: 1.6, marginBottom: 4 }}>
                  <span style={{ color: "#4A7C59", fontWeight: 700, flexShrink: 0 }}>✓</span><span>{sol}</span>
                </div>
              </div>
            );
          })}
        </Accordion>

        {/* 챌린지 */}
        <Accordion title={"실생활 챌린지: " + ch.title} icon="🎯">
          <div style={{ background: "linear-gradient(135deg, #1A2E1A, #2D4A2D)", borderRadius: 14, padding: 20, marginBottom: 12 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{ch.title}</p>
            {ch.weeks.map((w, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                <span style={{ background: "rgba(122,184,138,.2)", color: "#9DCBA8", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>W{i + 1}</span>
                <span style={{ fontSize: 14, color: "rgba(200,220,200,.9)", lineHeight: 1.6 }}>{w}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 8 }}>
            <div style={{ padding: "12px 16px", borderRadius: 10, background: "#E8F0E5", border: "1px solid #C5D9C0" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#3A5B3A", marginBottom: 4 }}>📅 매일 체크</p>
              <p style={{ fontSize: 13, color: "#5A8C69", margin: 0, lineHeight: 1.5 }}>{ch.daily}</p>
            </div>
            <div style={{ padding: "12px 16px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#4A7C59", marginBottom: 4 }}>📊 주 1회</p>
              <p style={{ fontSize: 13, color: "#5A8C69", margin: 0, lineHeight: 1.5 }}>{ch.weekly}</p>
            </div>
          </div>
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "#FDF8F0", border: "1px solid #E8D5B0" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#8B7355", margin: 0 }}>🏆 목표: {ch.goal}</p>
          </div>
        </Accordion>

        {/* 추천 식품 */}
        <Accordion title="추천 식품" icon="🥗">
          {nutr.foods.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 14, color: "#5A6B5A", lineHeight: 1.6, marginBottom: 4 }}>
              <span style={{ flexShrink: 0 }}>🍽️</span><span>{f}</span>
            </div>
          ))}
        </Accordion>

        {/* 추천 보조제 */}
        <Accordion title="추천 보조제" icon="💊">
          {DANBIDAN[cat.key] && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 14, color: "#5A6B5A", lineHeight: 1.6, marginBottom: 6 }}>
                <span style={{ flexShrink: 0 }}>💊</span>
                <span>남창우 원장의 단비단 한약 처방 ({DANBIDAN[cat.key].desc})</span>
              </div>
              <a href="https://www.danbidiet.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block", marginLeft: 16 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 6, background: "#4A7C59", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>단비단 바로가기 →</span>
              </a>
            </div>
          )}
          {nutr.supplements.map((sp, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 14, color: "#5A6B5A", lineHeight: 1.6, marginBottom: 4 }}>
              <span style={{ flexShrink: 0 }}>💊</span><span>{sp}</span>
            </div>
          ))}
          <p style={{ fontSize: 12, color: "#9BA89B", marginTop: 12, lineHeight: 1.6, fontStyle: "italic" }}>
            ※ 추천 식품과 보조제는 일반 건강 보조 목적이며, 특정 질환이 있거나 약 복용 중이시면 담당 주치의 상담이 필요합니다.
          </p>
        </Accordion>

        {/* 실행 체크리스트 */}
        {s >= 20 && (
          <Accordion title="실행 체크리스트" icon="📋" open={true}>
            {cat.checklist.map((item, idx) => {
              const k = cat.key + "-" + idx;
              const checked = !!checkedItems[k];
              return (
                <div key={idx} onClick={() => toggleCheck(cat.key, idx)} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 16px", borderRadius: 10,
                  background: checked ? "#E8F0E5" : "#F5F1EB",
                  border: checked ? "1px solid #C5D9C0" : "1px solid #EDE8E0",
                  marginBottom: 8, cursor: "pointer", transition: "all .2s",
                  fontSize: 14, color: checked ? "#3A5B3A" : "#5A6B5A", fontWeight: checked ? 600 : 400
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    border: checked ? "none" : "2px solid #C5BDB0",
                    background: checked ? "linear-gradient(135deg, #4A7C59, #5A8C69)" : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 13, fontWeight: 700
                  }}>{checked ? "✓" : ""}</div>
                  <span style={{ textDecoration: checked ? "line-through" : "none" }}>{item}</span>
                </div>
              );
            })}
          </Accordion>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// INTRO SCREEN
// ═══════════════════════════════════════════════════════════
function IntroScreen({ onStart }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F7F4EF", color: "#2D3B2D", lineHeight: 1.65 }}>
      <div style={{
        background: "linear-gradient(160deg, #1A2E1A 0%, #2D4A2D 40%, #3A6B4A 70%, #4A7C59 100%)",
        padding: "48px 16px 40px", textAlign: "center", position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 20%, rgba(122,184,138,.12) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-block", padding: "6px 18px", borderRadius: 50, background: "rgba(122,184,138,.15)", border: "1px solid rgba(122,184,138,.3)", color: "#9DCBA8", fontSize: 13, fontWeight: 600 }}>MIDECS Self-Test</div>
          <h1 style={{ fontSize: "clamp(28px,5vw,42px)", fontWeight: 800, color: "#fff", letterSpacing: "-.02em", margin: "20px 0 12px" }}>MIDECS 체질 진단</h1>
          <p style={{ fontSize: "clamp(14px,2.5vw,17px)", color: "rgba(200,220,200,.9)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>당신의 비만 원인을 6가지 체질로 정밀 분석합니다.<br />60문항으로 나만의 MIDECS 코드를 찾아보세요.</p>
        </div>
      </div>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ background: "#fff", borderRadius: 20, marginTop: -24, marginBottom: 24, boxShadow: "0 1px 3px rgba(15,23,42,.06), 0 8px 32px rgba(15,23,42,.04)" }}>
          <div style={{ padding: "24px 20px" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📘 설문 안내</h2>
            <p style={{ fontSize: 14, color: "#5A6B5A", marginBottom: 16, lineHeight: 1.75 }}>이 설문지는 비만의 <strong>'원인 경향'</strong>을 파악하기 위한 자기 점검 도구이며, 특정 질환을 진단하는 검사가 아닙니다.</p>
            <div style={{ background: "#F7F4EF", borderRadius: 14, padding: 20, marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#3A5B3A", marginBottom: 12 }}>📝 점수 기준</p>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 16px", fontSize: 14, color: "#5A6B5A" }}>
                {["전혀 그렇지 않다", "드물게 그렇다 (월 1–2회)", "가끔 그렇다 (주 1–2회)", "자주 그렇다 (주 3–4회)", "거의 항상 그렇다 (매일)"].map((t, i) => (
                  <Fragment key={i}><span style={{ fontWeight: 700, color: "#3A5B3A" }}>{i}점</span><span>{t}</span></Fragment>
                ))}
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#9BA89B", lineHeight: 1.7 }}>지난 1개월간의 상태를 기준으로 솔직하게 선택하세요.</p>
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: 20, marginBottom: 24, boxShadow: "0 1px 3px rgba(15,23,42,.06), 0 8px 32px rgba(15,23,42,.04)" }}>
          <div style={{ padding: "24px 20px" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#C75B5B", marginBottom: 16 }}>🚨 설문 전 RED FLAG 체크</h2>
            <p style={{ fontSize: 14, color: "#5A6B5A", marginBottom: 16, lineHeight: 1.7 }}>다음 중 <strong>하나라도 해당</strong>된다면 <strong>의료 전문가의 진료가 우선</strong>입니다.</p>
            {RED_FLAGS.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 14px", borderRadius: 10, background: i % 2 === 0 ? "#FDF2EF" : "#fff", marginBottom: 4, fontSize: 14, color: "#6B3535", lineHeight: 1.6 }}>
                <span style={{ color: "#C75B5B", fontSize: 16, flexShrink: 0 }}>⚠</span><span>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: "8px 0 40px" }}>
          <button onClick={onStart} style={{ width: "100%", padding: "16px 24px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #3A5B3A, #5A8C69)", color: "#fff", fontSize: 17, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(74,124,89,.25)" }}>설문 시작하기 →</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// QUESTION SCREEN
// ═══════════════════════════════════════════════════════════
function QuestionScreen({ answers, setAnswers, onFinish }) {
  const [catIdx, setCatIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const topRef = useRef(null);
  const cat = CATEGORIES[catIdx];
  const gQ = catIdx * 10 + qIdx;
  const cnt = answers.filter(a => a !== undefined).length;
  const pct = (cnt / 60) * 100;
  const catTot = Array.from({ length: 10 }, (_, i) => answers[catIdx * 10 + i] || 0).reduce((a, b) => a + b, 0);
  const st = () => topRef.current && topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });

  const pick = (v) => {
    const n = [...answers]; n[gQ] = v; setAnswers(n);
    setTimeout(() => {
      if (qIdx < 9) { setQIdx(qIdx + 1); st(); }
      else if (catIdx < 5) { setCatIdx(catIdx + 1); setQIdx(0); st(); }
    }, 280);
  };

  const prev = () => { if (qIdx > 0) { setQIdx(qIdx - 1); st(); } else if (catIdx > 0) { setCatIdx(catIdx - 1); setQIdx(9); st(); } };
  const next = () => { if (qIdx < 9) { setQIdx(qIdx + 1); st(); } else if (catIdx < 5) { setCatIdx(catIdx + 1); setQIdx(0); st(); } else { onFinish(); } };
  const allOk = answers.every(a => a !== undefined);
  const curOk = answers[gQ] !== undefined;
  const isLast = catIdx === 5 && qIdx === 9;

  return (
    <div ref={topRef} style={{ minHeight: "100vh", background: "#F7F4EF", color: "#2D3B2D", lineHeight: 1.65 }}>
      {/* Sticky Progress */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(15,23,42,.06)", padding: "16px 20px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ height: 6, borderRadius: 3, background: "#DDD6CB", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 3, width: pct + "%", background: "linear-gradient(90deg, #3A5B3A, #5A8C69, #7AB88A)", transition: "width .5s cubic-bezier(.4,0,.2,1)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6B7B6B", marginTop: 8, fontWeight: 500 }}>
            <span>{cat.icon} {cat.key} – {cat.subtitle} ({catTot}/40)</span>
            <span style={{ fontWeight: 700, color: "#4A7C59" }}>{cnt}/60</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 20px 40px" }}>
        {/* Question Card */}
        <div key={gQ} style={{ background: "#fff", borderRadius: 20, boxShadow: "0 1px 3px rgba(15,23,42,.06), 0 8px 32px rgba(15,23,42,.04)", marginBottom: 24, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid #EDE8E0" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 50, background: cat.gradient, color: "#fff", fontSize: 13, fontWeight: 700 }}>{cat.icon} {cat.key} – {cat.title}</div>
            <p style={{ fontSize: 14, color: "#9BA89B", marginTop: 8, fontWeight: 500 }}>핵심 이슈: {cat.coreIssue}</p>
          </div>
          <div style={{ padding: "20px 20px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 4 }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: "50%", background: "#E8F0E5", color: "#4A7C59", fontSize: 14, fontWeight: 700, marginRight: 12, flexShrink: 0 }}>{qIdx + 1}</span>
              <p style={{ fontSize: "clamp(15px,2.5vw,17px)", fontWeight: 600, lineHeight: 1.7, margin: 0 }}>{cat.questions[qIdx]}</p>
            </div>
            <p style={{ fontSize: 12, color: "#9BA89B", margin: "4px 0 24px 42px" }}>문항 {gQ + 1} / 60</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[0, 1, 2, 3, 4].map(v => {
                const a = answers[gQ] === v;
                return (
                  <button key={v} onClick={() => pick(v)} style={{
                    flex: "1 1 0", minWidth: 56, padding: "14px 4px", borderRadius: 14,
                    border: a ? "2px solid #4A7C59" : "2px solid #DDD6CB",
                    background: a ? "linear-gradient(135deg, #4A7C59, #5A8C69)" : "#fff",
                    color: a ? "#fff" : "#6B7B6B", fontSize: 13, fontWeight: a ? 700 : 500,
                    cursor: "pointer", transition: "all .2s",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                    whiteSpace: "pre-line", textAlign: "center", lineHeight: 1.35
                  }}>
                    <span style={{ fontSize: 20, fontWeight: 700 }}>{v}</span>
                    <span style={{ fontSize: 10, opacity: .75 }}>{SCORE_LABELS[v]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <button onClick={prev} disabled={gQ === 0} style={{
            flex: 1, padding: "14px 24px", borderRadius: 14, border: "2px solid #C5BDB0",
            background: "#fff", color: "#5A6B5A", fontSize: 16, fontWeight: 600, cursor: "pointer",
            opacity: gQ === 0 ? .4 : 1, pointerEvents: gQ === 0 ? "none" : "auto"
          }}>← 이전</button>
          {isLast ? (
            <button onClick={onFinish} disabled={!allOk} style={{
              flex: 1, padding: "14px 24px", borderRadius: 14, border: "none",
              background: "linear-gradient(135deg, #3A5B3A, #5A8C69)", color: "#fff",
              fontSize: 16, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 16px rgba(74,124,89,.25)",
              opacity: allOk ? 1 : .4, pointerEvents: allOk ? "auto" : "none"
            }}>결과 보기 ✨</button>
          ) : (
            <button onClick={next} disabled={!curOk} style={{
              flex: 1, padding: "14px 24px", borderRadius: 14, border: "none",
              background: "linear-gradient(135deg, #3A5B3A, #5A8C69)", color: "#fff",
              fontSize: 16, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 16px rgba(74,124,89,.25)",
              opacity: curOk ? 1 : .4, pointerEvents: curOk ? "auto" : "none"
            }}>다음 →</button>
          )}
        </div>

        {/* Category dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
          {CATEGORIES.map((c, ci) => (
            <div key={ci} title={c.key + " – " + c.subtitle}
              onClick={() => { setCatIdx(ci); setQIdx(0); st(); }}
              style={{
                width: ci === catIdx ? 28 : 10, height: 10, borderRadius: 5,
                background: ci < catIdx ? "#4A7C59" : ci === catIdx ? "#5A8C69" : "#DDD6CB",
                transition: "all .3s", cursor: "pointer"
              }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// RESULT SCREEN
// ═══════════════════════════════════════════════════════════
function ResultScreen({ answers, onRestart }) {
  const [checkedItems, setCheckedItems] = useState({});
  const [activeTab, setActiveTab] = useState(null);
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 400); }, []);

  const scores = CATEGORIES.map((_, ci) => {
    let s = 0; for (let q = 0; q < 10; q++) s += (answers[ci * 10 + q] || 0); return s;
  });
  const sorted = scores.map((s, i) => ({ s, i })).sort((a, b) => b.s - a.s);
  const top1 = sorted[0] || { s: 0, i: 0 };
  const top2 = sorted[1] || { s: 0, i: 1 };
  const c1 = CATEGORIES[top1.i].key;
  const c2 = CATEGORIES[top2.i].key;
  const total = scores.reduce((a, b) => a + b, 0);

  const toggleCheck = (catKey, idx) => {
    const k = catKey + "-" + idx;
    setCheckedItems(prev => ({ ...prev, [k]: !prev[k] }));
  };

  useEffect(() => { setActiveTab(top1.i); }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#F7F4EF", color: "#2D3B2D", lineHeight: 1.65 }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(160deg, #1A2E1A 0%, #2D4A2D 40%, #3A6B4A 70%, #4A7C59 100%)",
        padding: "40px 16px 32px", textAlign: "center", position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 20%, rgba(122,184,138,.12) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-block", padding: "6px 18px", borderRadius: 50, background: "rgba(122,184,138,.15)", border: "1px solid rgba(122,184,138,.3)", color: "#9DCBA8", fontSize: 13, fontWeight: 600 }}>MIDECS Result</div>
          <h1 style={{ fontSize: "clamp(24px,5vw,36px)", fontWeight: 800, color: "#fff", margin: "20px 0 16px", letterSpacing: "-.02em" }}>나의 MIDECS 코드</h1>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6, padding: "14px 32px", borderRadius: 16,
            background: "rgba(122,184,138,.1)", border: "2px solid rgba(122,184,138,.3)"
          }}>
            <span style={{ fontSize: "clamp(32px,7vw,48px)", fontWeight: 900, color: "#fff", letterSpacing: ".08em" }}>{c1}{c2}</span>
            <span style={{ fontSize: "clamp(16px,3vw,20px)", fontWeight: 600, color: "rgba(255,255,255,.7)", marginLeft: 4 }}>타입</span>
          </div>
          <p style={{ fontSize: "clamp(13px,2.5vw,16px)", color: "rgba(200,220,200,.8)", margin: "16px auto 0", maxWidth: 400, lineHeight: 1.7 }}>
            {CATEGORIES[top1.i].subtitle} ({top1.s}점) + {CATEGORIES[top2.i].subtitle} ({top2.s}점)
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px" }}>
        {/* Score Overview */}
        <div style={{ background: "#fff", borderRadius: 20, marginTop: -20, marginBottom: 24, boxShadow: "0 1px 3px rgba(15,23,42,.06), 0 8px 32px rgba(15,23,42,.04)" }}>
          <div style={{ padding: "24px 20px" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📊 영역별 점수 요약</h2>
            {CATEGORIES.map((cat, ci) => {
              const s = scores[ci]; const lv = getLevel(s); const p = animated ? (s / 40) * 100 : 0;
              return (
                <div key={cat.key} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{cat.icon} {cat.key} – {cat.subtitle}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: cat.color }}>{s}</span>
                      <span style={{ fontSize: 12, color: "#9BA89B" }}>/40</span>
                      <span style={{ padding: "3px 10px", borderRadius: 50, background: LC[lv] + "18", color: LC[lv], fontSize: 12, fontWeight: 700 }}>{LE[lv]} {LL[lv]}</span>
                    </span>
                  </div>
                  <div style={{ height: 12, borderRadius: 6, background: "#DDD6CB", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 6, width: p + "%", background: "linear-gradient(90deg, " + cat.color + ", " + cat.color + "cc)", transition: "width 1s cubic-bezier(.4,0,.2,1)" }} />
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: 20, padding: "14px 18px", borderRadius: 12, background: "#F7F4EF", textAlign: "center" }}>
              <span style={{ fontSize: 14, color: "#6B7B6B" }}>총점 </span>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#3A5B3A" }}>{total}</span>
              <span style={{ fontSize: 14, color: "#6B7B6B" }}> / 240</span>
            </div>
          </div>
        </div>

        {/* Tab Section */}
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: "32px 0 16px", textAlign: "center" }}>🎯 나의 타입 상세 분석</h2>
        <p style={{ fontSize: 14, color: "#6B7B6B", textAlign: "center", marginBottom: 20, lineHeight: 1.7 }}>탭을 눌러 각 타입의 원인·증상·해결법·챌린지·추천 식품을 확인하세요.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 24 }}>
          {CATEGORIES.map((cat, ci) => {
            const s = scores[ci]; const lv = getLevel(s); const isActive = activeTab === ci;
            return (
              <button key={cat.key} onClick={() => setActiveTab(isActive ? null : ci)} style={{
                padding: "10px 8px", borderRadius: 12,
                border: isActive ? "2px solid " + cat.color : "2px solid #DDD6CB",
                background: isActive ? cat.color + "12" : "#fff",
                color: isActive ? cat.color : "#6B7B6B",
                fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all .2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5
              }}>
                <span>{cat.icon}</span>
                <span>{cat.key}</span>
                <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 6px", borderRadius: 6, background: LC[lv] + "18", color: LC[lv] }}>{s}</span>
              </button>
            );
          })}
        </div>

        {activeTab !== null && (
          <TypeDetailCard
            key={activeTab}
            catIdx={activeTab}
            scores={scores}
            checkedItems={checkedItems}
            toggleCheck={toggleCheck}
          />
        )}

        {/* MIDECS Code */}
        <div style={{ background: "#fff", borderRadius: 20, marginBottom: 24, boxShadow: "0 1px 3px rgba(15,23,42,.06), 0 8px 32px rgba(15,23,42,.04)" }}>
          <div style={{ padding: "24px 20px" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📚 나의 MIDECS 코드 해설</h2>
            <div style={{ background: "linear-gradient(135deg, #1A2E1A, #2D4A2D)", borderRadius: 14, padding: 24, textAlign: "center", marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "#9DCBA8", marginBottom: 8, fontWeight: 600 }}>나의 핵심 코드</p>
              <span style={{ fontSize: 36, fontWeight: 900, color: "#fff", letterSpacing: ".1em" }}>{c1}{c2} 타입</span>
              <p style={{ fontSize: 14, color: "rgba(200,220,200,.8)", marginTop: 12, lineHeight: 1.7 }}>
                {CATEGORIES[top1.i].subtitle} ({top1.s}점) + {CATEGORIES[top2.i].subtitle} ({top2.s}점)
              </p>
            </div>
            <p style={{ fontSize: 14, color: "#5A6B5A", lineHeight: 1.75 }}>
              가장 높은 점수 2개 영역이 핵심 MIDECS 코드입니다. 20점 이상인 영역의 해당 챕터를 우선적으로 읽으세요.
              {sorted.filter(x => x.s >= 20).length >= 3 && (
                <span style={{ color: "#C75B5B", fontWeight: 600 }}> 20점 이상인 영역이 3개 이상이므로 본인이 가장 불편함을 느끼는 영역을 우선하세요.</span>
              )}
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ background: "#FDF8F0", border: "1px solid #E8D5B0", borderRadius: 14, padding: "20px 24px", marginBottom: 24, fontSize: 14, color: "#6B5540", lineHeight: 1.7 }}>
          <strong>⚠️ 더 많은 도움이 필요할 때</strong><br /><br />
          점수가 모든 영역에서 20점 이상으로 높을 때, 기존 진단 질환이 있을 때, 약 복용 중일 때, 3개월 후에도 호전되지 않을 때 — 의료 전문가와 상담이 필수입니다.
          <br /><br /><strong>당신의 건강이 최우선입니다. 주저하지 말고 의료 전문가를 찾으세요.</strong>
        </div>

        <div style={{ padding: "8px 0 48px", textAlign: "center" }}>
          <button onClick={onRestart} style={{ padding: "14px 40px", borderRadius: 14, border: "2px solid #C5BDB0", background: "#fff", color: "#5A6B5A", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>🔄 다시 검사하기</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════
export default function MIDECSApp() {
  const [phase, setPhase] = useState("intro");
  const [answers, setAnswers] = useState(Array(60).fill(undefined));

  const safeScroll = () => { try { window.scrollTo(0, 0); } catch(e) {} };

  if (phase === "intro") return <IntroScreen onStart={() => { setPhase("quiz"); safeScroll(); }} />;
  if (phase === "quiz") return <QuestionScreen answers={answers} setAnswers={setAnswers} onFinish={() => { setPhase("result"); safeScroll(); }} />;
  return <ResultScreen answers={answers} onRestart={() => { setAnswers(Array(60).fill(undefined)); setPhase("intro"); safeScroll(); }} />;
}
