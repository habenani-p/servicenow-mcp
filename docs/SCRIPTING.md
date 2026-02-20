# Scripting Management Guide (Zurich Release)

This guide covers the 16 scripting tools available when `SCRIPTING_ENABLED=true`. These tools provide direct access to business rules, script includes, client scripts, and changeset management.

## Prerequisites

```env
WRITE_ENABLED=true
SCRIPTING_ENABLED=true
```

## Tool Overview

| Domain | Tools | Table |
|--------|-------|-------|
| Business Rules | list, get, create, update | `sys_script` |
| Script Includes | list, get, create, update | `sys_script_include` |
| Client Scripts | list, get, create, update | `sys_script_client` |
| Changesets | list, get, commit, publish | `sys_update_set` |

## Zurich Scripting Notes

### ES2021 Support
ServiceNow Zurich fully supports ES2021 (ES12) features in server-side scripts:
- `async`/`await` in business rules and script includes
- Optional chaining (`?.`)
- Nullish coalescing (`??`)
- Promise-based patterns

### GlideEncrypter Deprecation
`GlideEncrypter` is deprecated in Zurich. Use `GlideEncryptionUtils` instead:
```javascript
// Deprecated (Zurich)
var enc = new GlideEncrypter();

// Recommended
var enc = new GlideEncryptionUtils();
```

### ML API
Scripts can now call Predictive Intelligence directly:
```javascript
var result = new sn_ml.Predictor(solutionId).predict(inputData);
```

## Common Workflows

### Review and Update a Business Rule

```
1. List business rules for a table
   → list_business_rules table="incident"

2. Get full script body
   → get_business_rule sys_id="<sys_id>"

3. Update the script
   → update_business_rule sys_id="<sys_id>" fields={script: "...updated..."}
```

### Manage Changesets

```
1. List in-progress changesets
   → list_changesets state="in progress"

2. Review changeset contents
   → get_changeset identifier="<sys_id>"

3. Commit the changeset
   → commit_changeset sys_id="<sys_id>"

4. Publish to target
   → publish_changeset sys_id="<sys_id>"
```

## Configuration Example

```env
WRITE_ENABLED=true
SCRIPTING_ENABLED=true
MCP_TOOL_PACKAGE=platform_developer
```
