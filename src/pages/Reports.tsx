import React from 'react'
import { BarChart2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'

export default function Reports() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Detailed financial reports and insights."
      />
      <EmptyState
        icon={<BarChart2 className="h-8 w-8" />}
        title="Reports coming soon"
        description="This page is under construction."
      />
    </div>
  )
}
