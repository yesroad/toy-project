---
name: commit
description: staged 변경사항으로 커밋 메시지 생성 후 커밋.
---

**참조 규칙**: `@../skills/commit-helper/SKILL.md`

**[즉시 실행]** commit-helper 스킬을 실행하여 staged 변경사항을 분석하고 커밋 메시지를 생성한다.

**옵션**: $ARGUMENTS

| 옵션        | 설명                  |
| ----------- | --------------------- |
| `--push`    | 커밋 후 바로 push     |
| `--no-gate` | 출시 게이트 점검 스킵 |
