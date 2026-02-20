# Reporting & Analytics Guide (Zurich Release)

This guide covers the 8 reporting and analytics tools. All are read-only and require no special flags beyond read access.

## Tool Overview

| Tool | Description | API Used |
|------|-------------|----------|
| `list_reports` | List saved reports | Table API (`sys_report`) |
| `get_report` | Get report definition | Table API |
| `run_aggregate_query` | GROUP BY query with COUNT/SUM | Stats API (`/api/now/stats/{table}`) |
| `trend_query` | Monthly trend data | Stats API (date bucketing) |
| `get_performance_analytics` | PA widget data | PA API (`/api/now/pa/widget/{sys_id}`) |
| `export_report_data` | Structured data export | Table API |
| `get_sys_log` | System log entries | Table API (`sys_log`) |
| `list_scheduled_jobs` | Scheduled jobs list | Table API (`sys_trigger`) |

## Common Use Cases

### Incident Trend by Priority (Last 6 Months)

```
run trend_query:
  table: incident
  date_field: opened_at
  group_by: priority
  periods: 6
```

Returns monthly counts grouped by priority level.

### SLA Compliance Rate

```
run_aggregate_query:
  table: task_sla
  group_by: has_breached
  aggregate: COUNT
```

Returns count of breached vs. compliant SLAs.

### Top Teams by Open Incidents

```
run_aggregate_query:
  table: incident
  group_by: assignment_group
  query: state!=6
  aggregate: COUNT
```

### Performance Analytics Widget

```
get_performance_analytics:
  widget_sys_id: <PA widget sys_id>
  time_range: last_30_days
```

Uses the Zurich Performance Analytics API: `GET /api/now/pa/widget/{sys_id}`

## Zurich Reporting APIs

| API | Endpoint | Notes |
|-----|----------|-------|
| Stats (Aggregate) | `GET /api/now/stats/{table}` | GROUP BY, SUM, COUNT, AVG |
| Performance Analytics | `GET /api/now/pa/widget/{sys_id}` | PA scorecard data |
| Reporting | `GET /api/now/reporting` | Saved report search (Zurich) |
| Table (for sys_report) | `GET /api/now/table/sys_report` | Report definitions |
