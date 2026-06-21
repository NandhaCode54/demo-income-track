import React from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'

export default function Calendar() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="View upcoming payments and financial events."
      />
      <EmptyState
        icon={<CalendarIcon className="h-8 w-8" />}
        title="Calendar coming soon"
        description="This page is under construction."
      />
    </div>
  )
}
