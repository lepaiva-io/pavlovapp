import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { sb } from '../lib/supabase'
import type { Family, Pet } from '../lib/types'

interface Ctx {
  user: User | null
  authReady: boolean
  families: Family[]
  family: Family | null
  pets: Pet[]
  pet: Pet | null
  loading: boolean
  needsOnboarding: boolean
  setFamily: (f: Family) => void
  setPet: (p: Pet | null) => void
  reloadFamiliesAndPets: () => Promise<void>
  reloadPets: (selectId?: string) => Promise<void>
  toast: (msg: string) => void
  toastMsg: string
  openModal: (node: ReactNode) => void
  closeModal: () => void
  modalNode: ReactNode | null
  dataVersion: number
  bumpData: () => void
}

const AppCtx = createContext<Ctx | null>(null)

export function useApp(): Ctx {
  const c = useContext(AppCtx)
  if (!c) throw new Error('useApp fuera de AppProvider')
  return c
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [families, setFamilies] = useState<Family[]>([])
  const [family, setFamily] = useState<Family | null>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [modalNode, setModalNode] = useState<ReactNode | null>(null)
  const [dataVersion, setDataVersion] = useState(0)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toast = useCallback((msg: string) => {
    setToastMsg(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 2200)
  }, [])

  const openModal = useCallback((node: ReactNode) => setModalNode(node), [])
  const closeModal = useCallback(() => setModalNode(null), [])
  const bumpData = useCallback(() => setDataVersion((v) => v + 1), [])

  const reloadFamiliesAndPets = useCallback(async () => {
    setLoading(true)
    setNeedsOnboarding(false)
    const { data: fm } = await sb
      .from('family_members')
      .select('family_id, role, families(id,name)')
      .not('user_id', 'is', null)
    const fams: Family[] = (fm || [])
      .filter((x: any) => x.families)
      .map((x: any) => ({ id: x.families.id, name: x.families.name, role: x.role }))
    setFamilies(fams)
    if (fams.length === 0) {
      setLoading(false)
      setNeedsOnboarding(true)
      return
    }
    const fam = fams[0]
    setFamily(fam)
    const { data: petsData } = await sb.from('pets').select('*').order('created_at', { ascending: true })
    const list = (petsData || []) as Pet[]
    setPets(list)
    setPet(list[0] || null)
    setLoading(false)
  }, [])

  const reloadPets = useCallback(async (selectId?: string) => {
    const { data } = await sb.from('pets').select('*').order('created_at', { ascending: true })
    const list = (data || []) as Pet[]
    setPets(list)
    setPet(list.find((p) => p.id === selectId) || list[0] || null)
    bumpData()
  }, [bumpData])

  // Auth: sesión inicial + cambios
  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthReady(true)
    })
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      setAuthReady(true)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Cuando hay usuario, cargar datos
  useEffect(() => {
    if (user) reloadFamiliesAndPets()
    else {
      setFamilies([]); setFamily(null); setPets([]); setPet(null); setNeedsOnboarding(false)
    }
  }, [user, reloadFamiliesAndPets])

  const value = useMemo<Ctx>(() => ({
    user, authReady, families, family, pets, pet, loading, needsOnboarding,
    setFamily, setPet, reloadFamiliesAndPets, reloadPets,
    toast, toastMsg, openModal, closeModal, modalNode, dataVersion, bumpData,
  }), [user, authReady, families, family, pets, pet, loading, needsOnboarding,
    reloadFamiliesAndPets, reloadPets, toast, toastMsg, openModal, closeModal, modalNode, dataVersion, bumpData])

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}
