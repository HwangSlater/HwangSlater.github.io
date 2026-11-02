---
status: approved
updated: 2026-11-02
design_md_version: 0.1
build_target: static-html (GitHub Pages)
---

# Pages
| ID | Surface | Page type | Job | Primary action | Content | States | Priority | Layout | Mockup | Code |
|---|---|---|---|---|---|---|---|---|---|---|
| home | read | 한 페이지 소개 | 30초 안에 「백엔드+AX 하는 사람」인지 판단 | 오픈채팅으로 연락 | 있음(팀 모집 댓글 초안을 바탕으로 사이트용으로 다시 씀) | 긴 제목·좁은 폭 | core | approved(3 두 갈래 나란히) | approved | done |
| 404 | read | 오류 | 잘못 온 사람을 첫 화면으로 | 첫 화면으로 | 짧은 문장 | — | secondary | approved(가운데 한 줄) | approved | done |

# Flows
1. 모집자: 게시판 댓글 링크 → home 첫 화면(이름·한 줄·연락 단추) → 해 온 것·맡을 수 있는 것 훑기 → 오픈채팅. 이탈 위험: 첫 화면에서 무엇을 하는 사람인지 안 보일 때 → 첫 화면에 역할 한 줄과 근거가 보여야 한다.
2. 깊이 보려는 사람: home → 카드의 GitHub·App Store 링크(새 창).

# Navigation
위쪽 탭 메뉴 = 구역 바로가기(소개·해 온 것·맡을 수 있는 것·연락). 휴대폰도 같은 탭(글자 줄임). 맨 아래 「위로」.

# Decision log
- 2026-11-02 — approved — 한 페이지 + 404 — 「한페이지로해줘」(사용자). 「한눈에 보여야 한다」는 지인 피드백과 맞음.
- 2026-11-02 — approved — home 배치 3번(해 온 것을 AX | 백엔드 두 열, 연락 단추 아래 고정) — 「배치는 3번째로 하자」(사용자). 사이트 글은 댓글을 따르지 않고 사이트에 맞게 더 자세히 써도 됨(사용자).
- 2026-11-02 — approved — 완성 시안 승인, 코드로 옮김 — 「이걸로 하자」(사용자)
