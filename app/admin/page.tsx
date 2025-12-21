export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Admin Dashboard</h1>
          <a
            href="/"
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            ← Back to Site
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Cards</h3>
            <p className="text-3xl font-bold text-gray-100">78</p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Talks</h3>
            <p className="text-3xl font-bold text-gray-100">76</p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Mappings</h3>
            <p className="text-3xl font-bold text-gray-100">76</p>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Welcome to the Admin Portal</h2>
          <p className="text-gray-300 mb-4">
            Phase 0 (Schema & Security) is complete! The admin portal infrastructure is ready.
          </p>
          <p className="text-gray-400 text-sm">
            Next: Phase 1 will add talks management, Phase 2 will add metadata fetching,
            Phase 3 will add mappings management, and Phase 4 will add the validation dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
