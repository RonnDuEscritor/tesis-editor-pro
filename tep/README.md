# TesisEditor Pro
**Editor académico profesional con backend PocketBase**
by RonnDu Corp.

## Stack
- **Frontend**: React 18 + Vite + TypeScript + Tiptap + Tailwind
- **Backend**: PocketBase (binario único, SQLite embebido)
- **IA**: Anthropic Claude API (streaming)
- **Deploy**: Railway (backend) + Vercel (frontend)

## Estructura del proyecto
```
tep/
├── frontend/          ← React + Vite app
│   └── src/
│       ├── components/
│       │   ├── editor/       ← Editor Tiptap A4
│       │   ├── sidebar/      ← Estructura + navegación
│       │   ├── references/   ← Gestor bibliográfico
│       │   ├── revision/     ← Panel de revisión académica
│       │   ├── ai/           ← Panel IA con streaming
│       │   ├── export/       ← PDF + Word
│       │   └── ui/           ← Componentes base
│       ├── pages/            ← Login, Dashboard, Editor
│       ├── hooks/            ← useAuth, useProject, etc.
│       ├── store/            ← Zustand global store
│       ├── lib/              ← pb client, utils, formatters
│       └── types/            ← TypeScript interfaces
└── backend/
    ├── pb_migrations/        ← Schema de colecciones PocketBase
    ├── pb_hooks/             ← Lógica server-side (JS hooks)
    └── Dockerfile            ← Para Railway deploy
```

## Setup rápido (desarrollo local)

### 1. Backend — PocketBase
```bash
cd backend

# Descargar PocketBase (elige tu OS)
# macOS ARM:
curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.22.14/pocketbase_0.22.14_darwin_arm64.zip -o pb.zip
# macOS Intel:
curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.22.14/pocketbase_0.22.14_darwin_amd64.zip -o pb.zip
# Linux:
curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.22.14/pocketbase_0.22.14_linux_amd64.zip -o pb.zip

unzip pb.zip
chmod +x pocketbase

# Iniciar PocketBase (primera vez)
./pocketbase serve
# → Abre http://127.0.0.1:8090/_/
# → Crea cuenta admin: admin@tesiseditor.com / tu-password
# → Luego importa el schema desde pb_migrations/schema.json
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edita .env con tu URL de PocketBase y API key de Anthropic
npm run dev
# → http://localhost:5173
```

## Deploy en producción

### Backend en Railway
```bash
# 1. Sube el Dockerfile de backend/ a Railway
# 2. Railway detecta el Dockerfile automáticamente
# 3. Variables de entorno en Railway:
#    PB_ADMIN_EMAIL=admin@tudominio.com
#    PB_ADMIN_PASSWORD=password-seguro
# URL resultante: https://tu-proyecto.railway.app
```

### Frontend en Vercel
```bash
cd frontend
vercel deploy
# Variables de entorno en Vercel:
# VITE_PB_URL=https://tu-proyecto.railway.app
# VITE_ANTHROPIC_KEY=sk-ant-...
```

## Colecciones PocketBase
| Colección    | Descripción                                  |
|-------------|----------------------------------------------|
| `projects`  | Proyectos de tesis por usuario               |
| `sections`  | Secciones del documento (contenido Tiptap)   |
| `references`| Fuentes bibliográficas                       |
| `citations` | Citas en el texto (con orden de aparición)   |
| `versions`  | Snapshots automáticos de versión             |

## Variables de entorno
```env
# frontend/.env
VITE_PB_URL=http://127.0.0.1:8090       # o URL de Railway en producción
VITE_ANTHROPIC_KEY=sk-ant-...            # Anthropic API key para el panel IA
```
