import React from 'react'
import { Settings as SettingsIcon } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'

export default function Settings() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure your Family Finance Manager preferences."
      />
      <EmptyState
        icon={<SettingsIcon className="h-8 w-8" />}
        title="Settings coming soon"
        description="This page is under construction."
      />
    </div>
  )
}
