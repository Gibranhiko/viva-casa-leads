import { doc, setDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { FormStore } from '@/store/useFormStore'
import type { SellerFormStore } from '@/store/useSellerFormStore'
import { calcularRedFlags } from '@/store/useSellerFormStore'

const INFONAVIT_TYPES = ['infonavit_tradicional', 'infonavit_total', 'cofinavit', 'unamos_creditos', 'segundo_credito']

export async function submitLead(store: FormStore) {
  const ref = doc(db, 'leads', store.leadId)

  const base = {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: 'nuevo',
    fuente: 'facebook_marketplace',

    nombre: store.nombre.trim(),
    whatsapp: store.whatsapp,
    email: store.email,

    edad: store.edad,
    estadoCivil: store.estadoCivil,
    dependientes: store.dependientes,
    domicilioActual: {
      municipio: store.domicilioMunicipio,
      fraccionamiento: store.domicilioFraccionamiento,
      calle: store.domicilioCalle,
      cp: store.domicilioCP,
    },

    situacionLaboral: store.situacionLaboral,
    empresa: store.empresa,
    ingresoMensual: store.ingresoMensual,

    tipoCredito: store.tipoCredito,

    usoInmueble: store.usoInmueble,
    zonasInteres: store.zonasInteres,
    tipoInmueble: store.tipoInmueble,
    caracteristicas: store.caracteristicas,
    comentarios: store.comentarios,
  }

  let extra: Record<string, unknown> = {}

  if (store.tipoCredito && INFONAVIT_TYPES.includes(store.tipoCredito)) {
    extra.infonavit = {
      nss: store.nss,
      nssImageUrl: store.nssImageUrl,
      precalificacion: store.precalificacion,
      participantes: store.participantes,
    }
  } else if (store.tipoCredito === 'banco') {
    extra.banco = {
      bancoPreferencia: store.bancoPreferencia,
      tieneEnganche: store.tieneEnganche,
    }
  } else if (store.tipoCredito === 'recursos_propios') {
    extra.recursosPropios = {
      presupuesto: store.presupuesto,
    }
  }

  await setDoc(ref, { ...base, ...extra })
}

export async function updateLeadStatus(leadId: string, status: string) {
  await updateDoc(doc(db, 'leads', leadId), {
    status,
    updatedAt: serverTimestamp(),
  })
}

export async function submitSellerLead(store: SellerFormStore) {
  const ref = doc(db, 'seller-leads', store.sellerId)
  const redFlags = calcularRedFlags(store)
  await setDoc(ref, {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: 'nuevo',
    fuente: 'formulario_web',

    nombre: store.nombre.trim(),
    whatsapp: store.whatsapp,
    email: store.email,

    municipio: store.municipio,
    fraccionamiento: store.fraccionamiento,
    calle: store.calle,
    cp: store.cp,
    tipoPropiedad: store.tipoPropiedad,
    recamaras: store.recamaras,
    banos: store.banos,
    m2Construccion: store.m2Construccion,
    antiguedad: store.antiguedad,
    condicionFisica: store.condicionFisica,

    fotoPaths: store.fotoPaths,

    ocupacion: store.ocupacion,
    luzEstado: store.luzEstado,
    aguaEstado: store.aguaEstado,
    gasEstado: store.gasEstado,
    predialAlCorriente: store.predialAlCorriente,

    estadoCivil: store.estadoCivil,

    tieneEscrituras: store.tieneEscrituras,
    numeroDuenos: store.numeroDuenos,
    duenosDisponibles: store.duenosDisponibles,

    situacionCredito: store.situacionCredito,
    cesionInfonvitInteres: store.cesionInfonvitInteres,
    cancelacionInfonvitRegistrada: store.cancelacionInfonvitRegistrada,

    cuotasCondominio: store.cuotasCondominio,

    redFlags,

    precioPedido: store.precioPedido,
    urgencia: store.urgencia,
    comentarios: store.comentarios,
  })
}

export async function updateSellerLeadStatus(id: string, status: string) {
  await updateDoc(doc(db, 'seller-leads', id), {
    status,
    updatedAt: serverTimestamp(),
  })
}

export async function updateLead(id: string, data: Record<string, unknown>) {
  await updateDoc(doc(db, 'leads', id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteLead(id: string) {
  await deleteDoc(doc(db, 'leads', id))
}

export interface SellerLeadEditable {
  nombre: string
  whatsapp: string
  email: string | null
  municipio: string
  fraccionamiento: string
  calle: string
  cp: string
  precioPedido: number | null
  urgencia: string | null
  comentarios: string | null
  fotoPaths: string[]
}

export async function updateSellerLead(id: string, data: SellerLeadEditable) {
  await updateDoc(doc(db, 'seller-leads', id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteSellerLead(id: string) {
  await deleteDoc(doc(db, 'seller-leads', id))
}
