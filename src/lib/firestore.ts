import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { FormStore } from '@/store/useFormStore'

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
