# Scenario Test Commands

Run these from repo root while server is running on `http://localhost:8080`.

## 1. List scenarios

```bash
curl -sS http://localhost:8080/api/scenarios | jq '.scenarios | map({id, title, summary})'
```

## 2. Run each scenario and validate timeline stages

```bash
for id in aiops-trace maturity-assessment financial-services; do
  echo "=== $id ==="
  curl -sS -X POST "http://localhost:8080/api/scenarios/$id/run" \
    | jq '{id: .scenario.id, provider: .provider, stages: [.timeline[].stage], policy: .policyVerdict}'
done
```

Expected stages:

1. `trigger`
2. `context_retrieval`
3. `reasoning`
4. `policy_check`
5. `action_execution`
6. `outcome`

## 3. Copilot smoke for scenario context

```bash
curl -sS -X POST http://localhost:8080/api/copilot/chat \
  -H 'content-type: application/json' \
  -d '{"scenarioId":"aiops-trace","question":"What happened?","history":[]}' \
  | jq '{provider, citationsCount:(.citations|length), answer:(.answer|.[0:180])}'
```

## 4. Full automated smoke

```bash
BASE_URL=http://localhost:8080 npm run smoke:server
```
