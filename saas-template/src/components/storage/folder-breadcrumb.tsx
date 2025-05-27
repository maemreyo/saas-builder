'use client'

import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface FolderBreadcrumbProps {
  currentFolder?: string
  onNavigate: (folderId: string | undefined) => void
}

interface BreadcrumbItem {
  id: string
  name: string
}

export function FolderBreadcrumb({ currentFolder, onNavigate }: FolderBreadcrumbProps) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (!currentFolder) {
      setBreadcrumbs([])
      return
    }

    const fetchBreadcrumbs = async () => {
      const items: BreadcrumbItem[] = []
      let folderId: string | null = currentFolder

      while (folderId) {
        const { data } = await supabase
          .from('folders')
          .select('id, name, parent_id')
          .eq('id', folderId)
          .single()

        if (data) {
          items.unshift({ id: data.id, name: data.name })
          folderId = data.parent_id
        } else {
          break
        }
      }

      setBreadcrumbs(items)
    }

    fetchBreadcrumbs()
  }, [currentFolder, supabase])

  return (
    <div className="flex items-center space-x-1 text-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate(undefined)}
        className="px-2"
      >
        Home
      </Button>
      
      {breadcrumbs.map((item, index) => (
        <div key={item.id} className="flex items-center">
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(item.id)}
            className="px-2"
          >
            {item.name}
          </Button>
        </div>
      ))}
    </div>
  )
}