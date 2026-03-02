'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Loader2 } from 'lucide-react'

export default function DeleteSubscriptionButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setLoading(true)
    await supabase.from('subscriptions').delete().eq('id', id)
    router.push('/subscriptions')
    router.refresh()
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Are you sure?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex items-center gap-1 bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Delete'}
        </button>
        <button onClick={() => setConfirm(false)} className="text-sm text-slate-500 hover:text-slate-700">
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" />
      Delete
    </button>
  )
}
