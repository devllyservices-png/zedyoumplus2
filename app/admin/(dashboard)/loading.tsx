export default function AdminDashboardLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center py-16">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
        <p className="text-sm text-gray-400">جاري التحميل...</p>
      </div>
    </div>
  )
}
