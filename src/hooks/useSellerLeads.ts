import { useState, useCallback } from 'react'
import { collection, getDocs, orderBy, query, limit, startAfter, type QueryDocumentSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { RedFlag } from '@/types/sellerLead'

export interface SellerLeadRow {
  id: string
  nombre: string
  whatsapp: string
  email: string | null
  municipio: string
  tipoPropiedad: string | null
  situacionCredito: string | null
  urgencia: string | null
  status: string
  redFlags: RedFlag[]
  createdAt: Date
  [key: string]: unknown
}

const PAGE_SIZE = 25

function docToSellerLead(doc: QueryDocumentSnapshot): SellerLeadRow {
  const data = doc.data()
  return {
    ...data,
    id: doc.id,
    redFlags: data.redFlags ?? [],
    createdAt: data.createdAt?.toDate() ?? new Date(),
  } as SellerLeadRow
}

export function useSellerLeads() {
  const [leads, setLeads] = useState<SellerLeadRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null)

  const loadInitial = useCallback(async () => {
    setLoading(true)
    const q = query(collection(db, 'seller-leads'), orderBy('createdAt', 'desc'), limit(PAGE_SIZE))
    const snap = await getDocs(q)
    const docs = snap.docs
    setLeads(docs.map(docToSellerLead))
    setLastDoc(docs[docs.length - 1] ?? null)
    setHasMore(docs.length === PAGE_SIZE)
    setLoading(false)
  }, [])

  const loadMore = useCallback(async () => {
    if (!lastDoc || loadingMore) return
    setLoadingMore(true)
    const q = query(
      collection(db, 'seller-leads'),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(PAGE_SIZE)
    )
    const snap = await getDocs(q)
    const docs = snap.docs
    setLeads((prev) => [...prev, ...docs.map(docToSellerLead)])
    setLastDoc(docs[docs.length - 1] ?? null)
    setHasMore(docs.length === PAGE_SIZE)
    setLoadingMore(false)
  }, [lastDoc, loadingMore])

  return { leads, loading, loadingMore, hasMore, loadInitial, loadMore }
}
