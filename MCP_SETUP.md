# MCP (Model Context Protocol) セットアップガイド

## MCP接続に必要な情報

### 1. Supabase MCP接続の場合

**必要な情報:**
```json
{
  "supabase": {
    "url": "https://jepczzqulgibekmulamg.supabase.co",
    "service_role_key": "あなたのSUPABASE_SERVICE_ROLE_KEY"
  }
}
```

### 2. Claude Desktopでの設定方法

#### Mac/Linuxの場合:
1. 設定ファイルを作成:
```bash
mkdir -p ~/.config/Claude
touch ~/.config/Claude/claude_desktop_config.json
```

2. 以下の内容を追加:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-supabase",
        "https://jepczzqulgibekmulamg.supabase.co",
        "あなたのSUPABASE_SERVICE_ROLE_KEY"
      ]
    }
  }
}
```

#### Windowsの場合:
1. 設定ファイルを作成:
```
%APPDATA%\Claude\claude_desktop_config.json
```

2. 同じJSON内容を追加

### 3. 環境変数から取得する場合

`.env.local`から取得:
- `NEXT_PUBLIC_SUPABASE_URL`: https://jepczzqulgibekmulamg.supabase.co
- `SUPABASE_SERVICE_ROLE_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（あなたのキー）

### 4. MCPサーバーの種類

利用可能なMCPサーバー:
- **supabase**: Supabaseデータベース操作
- **filesystem**: ファイルシステム操作
- **github**: GitHub操作
- **postgres**: PostgreSQL直接接続
- **slack**: Slack連携

### 5. 完全な設定例

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-supabase",
        "https://jepczzqulgibekmulamg.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcGN6enF1bGdpYmVrbXVsYW1nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDIxODEyNCwiZXhwIjoyMDY5Nzk0MTI0fQ.oPqS9DKdg4yIf7fFFMrnYDxsnsZwPMcD3J8EDBJONBc"
      ]
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/sho/Desktop/makerting-app"
      ]
    }
  }
}
```

## セットアップ手順

1. **Claude Desktopを再起動**
2. **設定が反映されたか確認**
   - Claude Desktopの設定メニューで確認
   - MCPアイコンが表示される

## トラブルシューティング

- **MCPが接続されない場合**:
  - Claude Desktopを完全に終了して再起動
  - 設定ファイルのJSONが正しいか確認
  - サービスロールキーが正しいか確認

- **権限エラーの場合**:
  - サービスロールキーを使用しているか確認
  - Supabase URLが正しいか確認