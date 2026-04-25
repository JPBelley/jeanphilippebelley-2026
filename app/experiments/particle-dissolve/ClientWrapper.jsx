'use client'

import dynamic from 'next/dynamic'

const ParticleDissolve = dynamic(() => import('./ParticleDissolve'), { ssr: false })

export default function ClientWrapper() {
  return <ParticleDissolve />
}
