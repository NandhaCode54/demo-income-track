import React from 'react'
import { Target } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'

export default function SavingsGoals() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Savings Goals"
        description="Create and track your family's savings targets."
      />
      <EmptyState
        icon={<Target className="h-8 w-8" />}
        title="Savings Goals coming soon"
        description="This page is under construction."
      />
    </div>
  )
}
