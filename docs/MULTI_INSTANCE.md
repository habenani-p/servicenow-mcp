# Multi-Instance Setup Guide

Connect to multiple ServiceNow instances (dev/staging/prod) from a single MCP session.

## Configuration

### Option 1: instances.json File

```bash
cp instances.example.json instances.json
```

Edit `instances.json`:
```json
{
  "instances": {
    "dev": {
      "instance_url": "https://yourcompany-dev.service-now.com",
      "auth_method": "basic",
      "username": "admin",
      "password": "your_dev_password"
    },
    "staging": {
      "instance_url": "https://yourcompany-stg.service-now.com",
      "auth_method": "oauth",
      "client_id": "your_client_id",
      "client_secret": "your_client_secret",
      "username": "svc_account",
      "password": "svc_password"
    },
    "prod": {
      "instance_url": "https://yourcompany.service-now.com",
      "auth_method": "oauth",
      "client_id": "your_client_id",
      "client_secret": "your_client_secret"
    }
  },
  "default_instance": "dev"
}
```

Set the config path:
```env
SN_INSTANCES_CONFIG=./instances.json
```

### Option 2: Environment Variables

```env
# Dev instance
SN_INSTANCE_DEV_URL=https://yourcompany-dev.service-now.com
SN_INSTANCE_DEV_AUTH=basic
SN_INSTANCE_DEV_USERNAME=admin
SN_INSTANCE_DEV_PASSWORD=password

# Prod instance
SN_INSTANCE_PROD_URL=https://yourcompany.service-now.com
SN_INSTANCE_PROD_AUTH=oauth
SN_INSTANCE_PROD_CLIENT_ID=client_id
SN_INSTANCE_PROD_CLIENT_SECRET=client_secret

SN_DEFAULT_INSTANCE=dev
```

## Usage

Once configured, use these tools:

- `list_instances` — Show all configured instances and their connection status
- `switch_instance(name)` — Change the active instance for the session
- `get_instance_info(name?)` — Get instance version, plugins, and details

Or pass `instance` parameter to any tool:
```
get_incident INC0001234 instance=prod
create_incident ... instance=dev
```

## Security Notes

- `instances.json` should be in `.gitignore` — it contains credentials
- Use OAuth for production instances rather than Basic Auth
- Write operations to non-default instances require `MULTI_INSTANCE_WRITE=true`
- The `instances.example.json` committed to the repo contains no real credentials

## Latest ReleaseOps

ServiceNow ReleaseOps for managing deployments across instances. Tools:

- `list_releaseops_deployments` — List deployment pipelines
- `get_releaseops_status(deployment_sys_id)` — Get pipeline status and quality gate results

These map to the `sys_deployment` table available in the latest release.
