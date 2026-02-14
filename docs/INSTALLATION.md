# ServiceNow MCP Server - Installation Guide

Complete setup instructions for integrating the ServiceNow MCP server with Claude Desktop or Claude CLI.

**Estimated Time**: 20-30 minutes
**Difficulty**: Beginner-friendly

---

## Table of Contents

- [Introduction](#introduction)
- [Claude Desktop/CLI Installation](#claude-desktopcli-installation)
- [System Prerequisites](#system-prerequisites)
- [ServiceNow OAuth 2.0 Setup](#servicenow-oauth-20-setup)
- [Repository Installation](#repository-installation)
- [Claude Desktop Configuration](#claude-desktop-configuration)
- [Verification and Testing](#verification-and-testing)
- [Troubleshooting](#troubleshooting)
- [Alternative: Using .env File](#alternative-using-env-file)
- [Next Steps](#next-steps)

---

## Introduction

This guide will walk you through:

1. Installing Claude Desktop or Claude CLI (if you're a first-time user)
2. Setting up Node.js and required dependencies
3. Creating an OAuth application in ServiceNow
4. Installing and building the ServiceNow MCP server
5. Configuring Claude Desktop to use the MCP server
6. Testing and verifying the integration

Whether you're new to Claude Desktop or an experienced user, this guide has you covered.

---

## Claude Desktop/CLI Installation

### First-Time Users

If you don't have Claude Desktop or Claude CLI installed yet, choose one of the following options:

### Option A: Claude Desktop (Recommended for Most Users)

**Step 1: Download Claude Desktop**

Visit: **https://claude.ai/download**

Choose your platform:
- **macOS**: Download the `.dmg` installer
- **Windows**: Download the `.exe` installer
- **Linux**: Download AppImage or `.deb` package

**Step 2: Install Claude Desktop**

- **macOS**:
  1. Open the downloaded `.dmg` file
  2. Drag Claude to your Applications folder
  3. Launch Claude from Applications

- **Windows**:
  1. Run the `.exe` installer
  2. Follow the installation wizard
  3. Launch Claude from Start menu

- **Linux**:
  1. Make AppImage executable: `chmod +x Claude-*.AppImage`
  2. Or install `.deb`: `sudo dpkg -i claude_*.deb`
  3. Launch from applications menu

**Step 3: First Launch**

1. Open Claude Desktop application
2. Sign in with your Anthropic account
3. Complete the initial setup wizard

**Step 4: Locate Configuration Directory**

The configuration file location varies by platform:

- **macOS**: `~/Library/Application Support/Claude/`
- **Windows**: `%APPDATA%\Claude\`
- **Linux**: `~/.config/Claude/`

**Step 5: Create Configuration File**

1. Navigate to the configuration directory
2. Create a file named `claude_desktop_config.json`
3. Start with: `{}`

You'll populate this file later in the [Claude Desktop Configuration](#claude-desktop-configuration) section.

---

### Option B: Claude CLI (For Terminal Users)

**Step 1: Install Claude CLI via npm**

```bash
npm install -g @anthropics/claude-cli
```

**Step 2: Initialize Configuration**

```bash
claude init
```

**Step 3: Authenticate**

```bash
claude auth login
```

**Step 4: Configuration File Location**

The configuration file is located at:
- **All platforms**: `~/.claude/config.json`

---

## System Prerequisites

Before installing the ServiceNow MCP server, ensure you have the following:

### Required Software

1. **Node.js 20.0.0 or higher**
   - Download: https://nodejs.org/
   - Verify installation:
     ```bash
     node --version  # Should output v20.0.0 or higher
     npm --version   # Should output 9.0.0 or higher
     ```

2. **ServiceNow Instance**
   - Active ServiceNow instance (dev, test, or prod)
   - Admin access for OAuth configuration
   - Instance URL (e.g., `https://dev12345.service-now.com`)

3. **Text Editor**
   - VS Code, Sublime Text, Notepad++, or any text editor
   - For editing JSON configuration files

### Platform-Specific Notes

- **macOS**: Node.js can also be installed via Homebrew: `brew install node`
- **Windows**: Use the official Node.js installer
- **Linux**: Use your distribution's package manager or download from nodejs.org

---

## ServiceNow OAuth 2.0 Setup

OAuth 2.0 is the recommended authentication method for secure, token-based access to ServiceNow.

**For detailed OAuth setup instructions**, see: **[ServiceNow OAuth Setup Guide](SERVICENOW_OAUTH_SETUP.md)**

### Quick OAuth Setup

**Step 1: Create OAuth Application**

1. Log in to your ServiceNow instance as admin
2. Navigate to: **System OAuth > Application Registry**
3. Click **New** → Select **"Create an OAuth API endpoint for external clients"**
4. Configure:
   - **Name**: `ServiceNow MCP Server`
   - **Active**: ✓ Checked
   - **Accessible from**: All application scopes
   - **Refresh Token Lifespan**: 8640000 (100 days)
   - **Access Token Lifespan**: 1800 (30 minutes)
5. Click **Submit**

**Step 2: Copy Credentials**

**IMPORTANT**: After creating the application, immediately copy:
- **Client ID** (looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)
- **Client Secret** (long secret string - shown only once!)

**Step 3: Enable Grant Types**

1. Open the OAuth application you just created
2. Scroll to **OAuth Grant Types** section
3. Ensure these are enabled:
   - ✓ **Password Grant**
   - ✓ **Refresh Token**
4. Click **Update**

### Test OAuth Configuration (Optional)

Verify OAuth is working:

```bash
curl -X POST "https://YOUR-INSTANCE.service-now.com/oauth_token.do" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "username=YOUR_USERNAME" \
  -d "password=YOUR_PASSWORD"
```

Expected response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "dGhpc2lzYXJlZnJlc2h0b2tlbmV4YW1wbGU...",
  "scope": "useraccount",
  "token_type": "Bearer",
  "expires_in": 1800
}
```

---

## Repository Installation

### Step 1: Clone Repository

```bash
cd ~/Downloads  # Or your preferred directory
git clone https://github.com/habenani-p/servicenow-mcp.git
cd servicenow-mcp
```

### Step 2: Install Dependencies

```bash
npm install
```

**Expected output**: Dependencies installed successfully (may take 1-2 minutes)

### Step 3: Build TypeScript

```bash
npm run build
```

This compiles `src/server.ts` → `dist/server.js`

**Expected output**:
```
> servicenow-mcp@1.0.0 build
> tsc
```

### Step 4: Verify Build Output

```bash
ls -la dist/
```

You should see:
- `server.js` (compiled entry point)
- `server.d.ts` (TypeScript declarations)
- Other compiled files

### Step 5: Get Absolute Path

```bash
pwd
```

**Copy this path** - you'll need it for Claude Desktop configuration.

Example output: `/Users/hardikbenani/Downloads/servicenow-mcp`

---

## Claude Desktop Configuration

### Step 1: Locate Configuration File

Find your Claude Desktop configuration file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**macOS Quick Access**:
```bash
open ~/Library/Application\ Support/Claude/
```

**Windows Quick Access**:
```
%APPDATA%\Claude\
```

### Step 2: Edit Configuration File

Open `claude_desktop_config.json` in your text editor.

**If the file is empty or doesn't exist**, create this structure:

```json
{
  "mcpServers": {
    "servicenow": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/servicenow-mcp/dist/server.js"],
      "env": {
        "SERVICENOW_INSTANCE_URL": "https://dev12345.service-now.com",
        "SERVICENOW_AUTH_METHOD": "oauth",
        "SERVICENOW_CLIENT_ID": "your_client_id_here",
        "SERVICENOW_CLIENT_SECRET": "your_client_secret_here",
        "SERVICENOW_USERNAME": "admin",
        "SERVICENOW_PASSWORD": "your_password",
        "WRITE_ENABLED": "false",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**If the file already has other MCP servers**, add to the `mcpServers` object:

```json
{
  "mcpServers": {
    "existing-server": {
      "command": "...",
      "args": ["..."]
    },
    "servicenow": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/servicenow-mcp/dist/server.js"],
      "env": {
        "SERVICENOW_INSTANCE_URL": "https://dev12345.service-now.com",
        "SERVICENOW_AUTH_METHOD": "oauth",
        "SERVICENOW_CLIENT_ID": "your_client_id_here",
        "SERVICENOW_CLIENT_SECRET": "your_client_secret_here",
        "SERVICENOW_USERNAME": "admin",
        "SERVICENOW_PASSWORD": "your_password",
        "WRITE_ENABLED": "false",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### Step 3: Replace Placeholder Values

Update these fields with your actual values:

| Placeholder | Replace With | Example |
|------------|--------------|---------|
| `/ABSOLUTE/PATH/TO/servicenow-mcp/dist/server.js` | Full path from Repository Installation Step 5 | `/Users/hardikbenani/Downloads/servicenow-mcp/dist/server.js` |
| `https://dev12345.service-now.com` | Your ServiceNow instance URL | `https://yourcompany.service-now.com` |
| `your_client_id_here` | Client ID from OAuth setup | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` |
| `your_client_secret_here` | Client Secret from OAuth setup | (long secret string) |
| `admin` | Your ServiceNow username | `john.doe` |
| `your_password` | Your ServiceNow password | (your actual password) |

### Step 4: Validate JSON Syntax

**Important**: Ensure your JSON is valid:
- No trailing commas after the last item in objects or arrays
- All strings use double quotes (not single quotes)
- All brackets and braces are properly closed

You can validate JSON at: https://jsonlint.com/

### Step 5: Save Configuration File

Save and close the editor.

---

## Verification and Testing

### Step 1: Restart Claude Desktop

**Completely quit and restart** Claude Desktop application.

- **macOS**: Cmd+Q to quit, then relaunch
- **Windows**: Right-click taskbar icon → Quit, then relaunch
- **Linux**: Exit application, then relaunch

### Step 2: Check MCP Server Status

In Claude Desktop:
1. Look for the MCP server indicator (usually in settings or status bar)
2. Verify "servicenow" server shows as connected

### Step 3: Test Basic Tool Call

Try this prompt in Claude Desktop:

```
Can you get the schema for the incident table in ServiceNow?
```

**Expected behavior**:
- Claude should use the `get_table_schema` tool
- Returns incident table structure with fields like:
  - `number` (String)
  - `short_description` (String)
  - `priority` (Integer)
  - `state` (Integer)
  - `assigned_to` (Reference)

### Step 4: Test Record Query

```
Show me 5 high-priority active incidents
```

**Expected behavior**:
- Claude should use `query_records` tool
- Returns list of incidents with priority=1 and active=true
- Shows fields like number, short description, state, assigned to

### Step 5: Test User Lookup

```
Find user details for admin
```

**Expected behavior**:
- Claude should use `get_user` tool
- Returns user information including name, email, roles, department

### Step 6: Verify Read-Only Mode

```
Create a test incident
```

**Expected behavior**:
- Error: "Write operation 'create_change_request' not allowed. Enable WRITE_ENABLED=true"
- This confirms read-only protection is working correctly

---

## Troubleshooting

### Issue 1: "Cannot find module 'dist/server.js'"

**Cause**: Incorrect path or build not completed

**Solution**:
1. Navigate to repository:
   ```bash
   cd /path/to/servicenow-mcp
   ```
2. Rebuild:
   ```bash
   npm run build
   ```
3. Get absolute path:
   ```bash
   pwd
   ```
4. Update `args` in configuration with correct absolute path

### Issue 2: "AUTHENTICATION_FAILED"

**Cause**: Invalid OAuth credentials

**Solution**:
1. Verify Client ID and Client Secret are correct
2. Test OAuth with curl command (see OAuth Setup section)
3. Check username and password are correct
4. Verify OAuth application is **Active** in ServiceNow
5. Ensure **Password Grant** is enabled in OAuth application

### Issue 3: "TABLE_NOT_ALLOWED"

**Cause**: Table not in default allowlist

**Solution**:

**Option A**: Allow any table (use with caution)
```json
"env": {
  ...
  "ALLOW_ANY_TABLE": "true"
}
```

**Option B**: Add specific table to allowlist
```json
"env": {
  ...
  "ALLOWED_TABLES": "incident,change_request,cmdb_ci"
}
```

### Issue 4: MCP Server Not Showing in Claude Desktop

**Cause**: Configuration file syntax error or wrong location

**Solution**:
1. **Validate JSON syntax**: Use https://jsonlint.com/
2. **Check file location**: Ensure `claude_desktop_config.json` is in correct directory
3. **Check for trailing commas**: JSON doesn't allow trailing commas
4. **Restart completely**: Fully quit and relaunch Claude Desktop
5. **Check logs**: Look for error messages in Claude Desktop console

### Issue 5: "WRITE_NOT_ENABLED" When Creating Records

**Cause**: Write operations disabled by default (expected behavior)

**Solution**:
- This is **expected** for read-only mode
- To enable write operations: Set `WRITE_ENABLED=true` in configuration
- **Warning**: Only use in dev/test environments, not production

### Issue 6: "Request timeout" or Slow Responses

**Cause**: Network latency or complex queries

**Solution**:
```json
"env": {
  ...
  "REQUEST_TIMEOUT_MS": "60000",  // Increase to 60 seconds
  "MAX_RETRIES": "5"               // Increase retry attempts
}
```

---

## Alternative: Using .env File

Instead of inline environment variables, you can use a `.env` file for easier management.

### Step 1: Create .env File

```bash
cd /path/to/servicenow-mcp
cp .env.example .env
```

### Step 2: Edit .env File

Open `.env` in your text editor and configure:

```bash
# ServiceNow Instance
SERVICENOW_INSTANCE_URL=https://dev12345.service-now.com
SERVICENOW_AUTH_METHOD=oauth

# OAuth Credentials
SERVICENOW_CLIENT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
SERVICENOW_CLIENT_SECRET=long_secret_string_here
SERVICENOW_USERNAME=admin
SERVICENOW_PASSWORD=your_password

# Security Settings
WRITE_ENABLED=false
LOG_LEVEL=info

# Optional: Advanced Configuration
MAX_RETRIES=3
RETRY_DELAY_MS=1000
REQUEST_TIMEOUT_MS=30000
ALLOW_ANY_TABLE=false
```

### Step 3: Update Claude Desktop Configuration

When using `.env` file, your configuration is simpler:

```json
{
  "mcpServers": {
    "servicenow": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/servicenow-mcp/dist/server.js"]
    }
  }
}
```

**Note**: No `env` section needed - variables are loaded from `.env` file automatically.

### Benefits of .env File

- Easier to manage multiple configurations
- Keep sensitive credentials out of config file
- Switch between environments (dev/test/prod) easily
- .env file is gitignored by default (not committed to repository)

---

## Next Steps

Congratulations! You've successfully set up the ServiceNow MCP server.

### Explore Available Tools

Review the comprehensive examples:
- **[Usage Examples](../EXAMPLES.md)** - 16+ detailed examples and workflows
  - Core Platform tools (get_table_schema, query_records, get_record)
  - CMDB tools (search_cmdb_ci, list_relationships)
  - ITOM tools (list_discovery_schedules, list_mid_servers, list_active_events)
  - ITSM tools (create_change_request)
  - Natural language tools

### Security Best Practices

Review security guidelines:
- **[Security Policy](../SECURITY.md)** - Production security recommendations
  - Keep `WRITE_ENABLED=false` for read-only access
  - Use service accounts with minimal permissions
  - Rotate OAuth credentials every 90 days
  - Enable table allowlisting
  - Monitor API usage in ServiceNow

### Enable Advanced Features (Optional)

**Enable Write Operations** (use with caution):
```json
"WRITE_ENABLED": "true"
```

**Adjust Logging Level** for troubleshooting:
```json
"LOG_LEVEL": "debug"  // Options: debug, info, warn, error
```

**Configure Retry Behavior**:
```json
"MAX_RETRIES": "5",
"RETRY_DELAY_MS": "2000",
"REQUEST_TIMEOUT_MS": "60000"
```

### Common Use Cases

- **Incident Investigation**: Query incidents, check related CIs, review events
- **Change Management**: Create change requests, assess impact
- **CMDB Health**: Monitor CI completeness, check relationships
- **Discovery Status**: Verify MID servers, check discovery schedules

### Get Help

- **Issues**: Report bugs at https://github.com/habenani-p/servicenow-mcp/issues
- **OAuth Setup**: See detailed guide at [SERVICENOW_OAUTH_SETUP.md](SERVICENOW_OAUTH_SETUP.md)
- **Examples**: Browse [EXAMPLES.md](../EXAMPLES.md) for usage patterns

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SERVICENOW_INSTANCE_URL` | ServiceNow instance URL | `https://dev12345.service-now.com` |
| `SERVICENOW_AUTH_METHOD` | Authentication method | `oauth` or `basic` |

### OAuth Authentication (when AUTH_METHOD=oauth)

| Variable | Description | Example |
|----------|-------------|---------|
| `SERVICENOW_CLIENT_ID` | OAuth Client ID | `a1b2c3d4e5f6g7h8i9j0...` |
| `SERVICENOW_CLIENT_SECRET` | OAuth Client Secret | `long_secret_string` |
| `SERVICENOW_USERNAME` | ServiceNow username | `admin` or `john.doe` |
| `SERVICENOW_PASSWORD` | ServiceNow password | `your_password` |

### Basic Authentication (when AUTH_METHOD=basic)

| Variable | Description | Example |
|----------|-------------|---------|
| `SERVICENOW_BASIC_USERNAME` | ServiceNow username | `admin` |
| `SERVICENOW_BASIC_PASSWORD` | ServiceNow password | `your_password` |

### Optional Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `WRITE_ENABLED` | `false` | Enable write operations (create, update) |
| `LOG_LEVEL` | `info` | Logging level (debug, info, warn, error) |
| `MAX_RETRIES` | `3` | Number of API retry attempts |
| `RETRY_DELAY_MS` | `1000` | Delay between retries (milliseconds) |
| `REQUEST_TIMEOUT_MS` | `30000` | Request timeout (milliseconds) |
| `ALLOW_ANY_TABLE` | `false` | Bypass table allowlist |
| `REDACT_SENSITIVE_DATA` | `true` | Redact credentials in logs |

---

**Need help?** Check the [Troubleshooting](#troubleshooting) section or file an issue on GitHub.
