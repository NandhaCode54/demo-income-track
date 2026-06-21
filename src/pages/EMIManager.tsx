import React from 'react'
import { CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'

export default function EMIManager() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="EMI Tracker"
        description="Manage all your loans and EMI schedules."
      />
      <EmptyState
        icon={<CreditCard className="h-8 w-8" />}
        title="EMI Tracker coming soon"
        description="This page is under construction."
      />
    </div>
  )
}
