import PocketBase from 'pocketbase'

const pbUrl = import.meta.env.VITE_PB_URL as string

if (!pbUrl) {
  throw new Error(
    'Falta VITE_PB_URL en .env — copia .env.example a .env y completa la URL de PocketBase.'
  )
}

// Singleton — una sola instancia en toda la app
export const pb = new PocketBase(pbUrl)

// Mantener sesión entre recargas (PocketBase guarda en localStorage automáticamente)
pb.autoCancellation(false)

export default pb
