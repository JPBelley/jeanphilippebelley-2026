import { notFound } from 'next/navigation'
import HomeContent from './HomeContent'

export default function LabPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return <HomeContent />
}
