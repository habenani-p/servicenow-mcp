# ServiceNow MCP Server

A production-ready Model Context Protocol (MCP) server for ServiceNow platform integration. Built with TypeScript for Node.js 20+, this server enables LLMs and AI assistants to interact with ServiceNow instances through a standardized interface.

## Why This Exists

If you work with ServiceNow, you know these pain points:

1. **Integration complexity**: Every integration reinvents the wheel for authentication, error handling, and rate limiting
2. **Manual data gathering**: Pulling information from multiple tables and modules is time-consuming
3. **ITOM visibility**: Getting a quick view of Discovery status, MID servers, or CMDB health requires clicking through multiple dashboards
4. **Safe automation**: You want to automate reads but fear accidental writes
5. **Script maintenance**: Updating Script Includes or Business Rules through the UI is tedious

This server addresses these by providing:
- **Safe-by-default**: Read-only unless you explicitly enable writes
- **Battle-tested patterns**: OAuth + retry logic + input validation built in
- **ITOM-first**: Discovery, Event Management, Service Mapping, and CMDB health out of the box
- **Natural language**: Search and update records conversationally (experimental)
- **Allowlisting**: Table and Script Include access controls

## Any AI Provider or SDK

Works out of the box with every major AI interface — no custom connectors required:

| Client / Interface | Type | Notes |
|--------------------|------|-------|
| **Claude Desktop** | Desktop app | Native MCP support |
| **Claude Code** | CLI | Native MCP support |
| **Cursor** | AI code editor | MCP via settings |
| **Windsurf** (Codeium) | AI code editor | MCP via settings |
| **GitHub Copilot** (VS Code) | IDE extension | MCP via VS Code settings |
| **Continue.dev** | VS Code / JetBrains | MCP via config.json |
| **Cline** | VS Code extension | MCP via extension settings |
| **Zed** | AI editor | MCP via assistant panel |
| **Amazon Q Developer** | IDE / CLI | MCP via toolkit settings |
| **JetBrains AI Assistant** | IDE plugin | MCP via plugin settings |
| **Gemini CLI** | CLI | MCP via tool config |
| **OpenAI SDK / GPT-4o** | SDK / API | Via any MCP-to-OpenAI bridge |
| **Ollama + Llama 3** | Local models | Via any MCP-compatible host |

**OAuth 2.0 and Basic Auth** are supported for every client. **Role-based tool packages** let you expose exactly the right tools per persona — read-only for analysts, full ITSM tools for engineers, ITOM-only for ops teams.

## 🚀 Getting Started

**New to Claude Desktop or MCP servers?** Start with our comprehensive installation guide:

**📖 [Complete Installation Guide](docs/INSTALLATION.md)**

This guide covers everything from installing Claude Desktop for the first time to configuring and testing this MCP server.

## Features

### Core Platform
- Table schema discovery
- Query records with filtering, pagination, sorting
- Get individual records
- User and group lookups

### CMDB
- CI retrieval and search
- Relationship mapping
- Configuration item details

### ITOM
- Discovery schedule monitoring
- MID server status
- Event Management (events and alerts)
- Service Mapping summaries
- CMDB health metrics

### ITSM
- Change request creation (write-enabled)
- Script Include execution (high-risk, requires explicit enabling)

### Service Portal & Knowledge
- Portal and page information
- Knowledge base search and article retrieval

### Natural Language (Experimental)
- Search records using plain English
- Update records with natural instructions
- Script file updates

## Documentation

- **[Installation Guide](docs/INSTALLATION.md)** - Complete setup instructions
- **[OAuth Setup Guide](docs/SERVICENOW_OAUTH_SETUP.md)** - ServiceNow OAuth 2.0 configuration
- **[Usage Examples](EXAMPLES.md)** - 16+ detailed examples and workflows
- **[Security Policy](SECURITY.md)** - Security best practices
- **Full Documentation**: https://habenani-p.github.io/servicenow-mcp/

## Official ServiceNow Documentation References

This implementation follows official ServiceNow documentation:

- [Table API](https://docs.servicenow.com/bundle/washingtondc-api-reference/page/integrate/inbound-rest/concept/c_TableAPI.html)
- [OAuth 2.0](https://docs.servicenow.com/bundle/washingtondc-platform-security/page/administer/security/concept/c_OAuthApplications.html)
- [CMDB](https://docs.servicenow.com/bundle/washingtondc-servicenow-platform/page/product/configuration-management/concept/c_ITILConfigurationManagement.html)
- [Discovery](https://docs.servicenow.com/bundle/washingtondc-it-operations-management/page/product/discovery/concept/c_ITOMDiscovery.html)
- [Event Management](https://docs.servicenow.com/bundle/washingtondc-it-operations-management/page/product/event-management/concept/event-management.html)

## Security

- Read-only by default
- OAuth 2.0 support
- Credential redaction in logs
- Table access allowlisting
- Input validation

See [SECURITY.md](SECURITY.md) for full details.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE)

## Support

- Issues: [GitHub Issues](https://github.com/habenani-p/servicenow-mcp/issues)
- Documentation: https://habenani-p.github.io/servicenow-mcp/

**Note**: This is an open-source community project, not an official ServiceNow product.
