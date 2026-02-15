# MCP OpenAI Extended

Extended Model Context Protocol (MCP) server for OpenAI with GPT-5 family support, including specialized Codex models.

## Features

- ✅ GPT-5 family support (gpt-5, gpt-5.1, gpt-5.2, chat-latest/pro/mini/nano/codex variants)
- ✅ GPT-4o and o1 series support
- ✅ **Responses API support** for Codex models (`*codex*`)
- ✅ Automatic API endpoint selection (Responses API for codex, Chat Completions for others)
- ✅ Works with Claude Desktop, Claude Code, and any MCP-compatible client

## Supported Models

### GPT-5 Family
- `gpt-5-codex` - **Specialized for code and design reviews** (default, uses Responses API)
- `gpt-5.3-codex`
- `gpt-5.3-codex-spark`
- `gpt-5.2-chat-latest`
- `gpt-5.2-pro`
- `gpt-5.2`
- `gpt-5.2-codex`
- `gpt-5.1-chat-latest`
- `gpt-5.1-codex`
- `gpt-5.1-codex-mini`
- `gpt-5.1-codex-max`
- `gpt-5.1`
- `gpt-5-chat-latest`
- `codex-mini-latest`
- `gpt-5-pro`
- `gpt-5`
- `gpt-5-mini`
- `gpt-5-nano`

Note: Newer Codex model IDs may require account-level access before they work in API requests.

### GPT-4 Series
- `gpt-4o` - GPT-4 Omni
- `gpt-4o-mini` - Smaller GPT-4o

### o1 Series
- `o1` - Reasoning model
- `o1-preview` - Reasoning model preview
- `o1-mini` - Smaller reasoning model

## Installation

### NPM (Recommended)

```bash
npm install -g @kent013/mcp-openai-extended
```

### Via npx (GitHub)

```bash
npx github:kent013/mcp-openai-extended
```

### Local Development

```bash
git clone https://github.com/kent013/mcp-openai-extended.git
cd mcp-openai-extended
npm install
npm run build
```

## Configuration

### ⚠️ Security Warning

**NEVER commit your API key to version control!**

- Keep your `OPENAI_API_KEY` in environment variables or secure configuration files
- Add configuration files containing API keys to `.gitignore`
- If you accidentally commit an API key, **revoke it immediately** at https://platform.openai.com/api-keys
- Rotate your API keys regularly

### Claude Desktop / Claude Code

Add to your `.mcp.json` or `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "openai": {
      "command": "npx",
      "args": ["-y", "@kent013/mcp-openai-extended"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key-here"
      }
    }
  }
}
```

### Local Development

```json
{
  "mcpServers": {
    "openai": {
      "command": "node",
      "args": ["/path/to/mcp-openai-extended/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key-here"
      }
    }
  }
}
```

## Usage

The server provides a single tool: `openai_chat`

Default model is `gpt-5-codex` (automatically uses Responses API).

### Example: Design Review with GPT-5.2 Codex (Default)

```javascript
{
  "name": "openai_chat",
  "arguments": {
    "messages": [
      {
        "role": "system",
        "content": "You are an experienced system architect."
      },
      {
        "role": "user",
        "content": "Review this code:\n\n```php\n$user = User::find($id);\nMail::to($user->email)->send(new TestMail());\n```"
      }
    ]
    // model defaults to "gpt-5-codex"
  }
}
```

### Example: General Reasoning with GPT-5 Chat Latest

```javascript
{
  "name": "openai_chat",
  "arguments": {
    "messages": [
      {
        "role": "user",
        "content": "Explain quantum computing in simple terms"
      }
    ],
    "model": "gpt-5-chat-latest"
  }
}
```

## API Endpoints

This server automatically selects the appropriate OpenAI API endpoint:

- **Responses API** (`/v1/responses`): For Codex models (`*codex*`)
- **Chat Completions API** (`/v1/chat/completions`): For all other models (gpt-4o, gpt-5-chat-latest, etc.)

## Environment Variables

- `OPENAI_API_KEY` (required): Your OpenAI API key

### Getting Your API Key

1. Visit https://platform.openai.com/api-keys
2. Create a new API key
3. Store it securely - **never share or commit it to version control**
4. Set appropriate usage limits to prevent unexpected charges

### Best Practices

- Use environment-specific API keys (development, staging, production)
- Enable usage alerts in your OpenAI account
- Regularly review API usage and rotate keys
- Use OpenAI's API key restrictions feature to limit key permissions

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run locally
node dist/index.js
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Credits

Based on [mcp-openai](https://github.com/mzxrai/mcp-openai) by mzxrai.

Extended to support GPT-5 family and specialized models.
