import React from 'react'
import { PieChart } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'

export default function Budget() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget"
        description="Set and monitor monthly spending limits by category."
      />
      <EmptyState
        icon={<PieChart className="h-8 w-8" />}
        title="Budget page coming soon"
        description="This page is under construction."
      />
    </div>
  )
}
