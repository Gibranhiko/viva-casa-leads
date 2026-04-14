import { useState, useCallback } from 'react'
import { collection, getDocs, orderBy, query, limit, startAfter, type QueryDocumentSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface LeadRow {
  id: string
  nombre: string
  whatsapp: string
  email: string | null
  tipoCredito: string
  zonasInteres: string[]
  usoInmueble: string
  status: string
  createdAt: Date
  [key: string]: unknown
}

const PAGE_SIZE = 25

function docToLead(doc: QueryDocumentSnapshot): LeadRow {
  const data = doc.data()
  return {
    ...data,
    id: doc.id,
    createdAt: data.createdAt?.toDate() ?? new Date(),
  } as LeadRow
}

export function useLeads() {
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null)

  const loadInitial = useCallback(async () => {
    setLoading(true)
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'), limit(PAGE_SIZE))
    const snap = await getDocs(q)
    const docs = snap.docs
    setLeads(docs.map(docToLead))
    setLastDoc(docs[docs.length - 1] ?? null)
    setHasMore(docs.length === PAGE_SIZE)
    setLoading(false)
  }, [])

  const loadMore = useCallback(async () => {
    if (!lastDoc || loadingMore) return
    setLoadingMore(true)
    const q = query(
      collection(db, 'leads'),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(PAGE_SIZE)
    )
    const snap = await getDocs(q)
    const docs = snap.docs
    setLeads((prev) => [...prev, ...docs.map(docToLead)])
    setLastDoc(docs[docs.length - 1] ?? null)
    setHasMore(docs.length === PAGE_SIZE)
    setLoadingMore(false)
  }, [lastDoc, loadingMore])

  return { leads, loading, loadingMore, hasMore, loadInitial, loadMore }
}
