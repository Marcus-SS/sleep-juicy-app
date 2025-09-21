import { NextPage } from 'next'
import Link from 'next/link'

const SleepLog: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6 pt-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Sleep Log</h1>
          <p className="text-gray-600">Track your sleep patterns</p>
        </div>

        {/* Add New Log Button */}
        <Link
          href="/sleep-log/last-night"
          className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-3 rounded-xl font-medium mb-6 shadow-sm"
        >
          Log Last Night's Sleep
        </Link>

        {/* Sleep Logs List */}
        <div className="bg-white rounded-xl p-6 text-center shadow-sm">
          <div className="text-4xl mb-4">😴</div>
          <h3 className="font-semibold text-gray-800 mb-2">No sleep logs yet</h3>
          <p className="text-gray-600 text-sm mb-4">
            Start tracking your sleep to see patterns and improve your rest.
          </p>
          <Link
            href="/sleep-log/last-night"
            className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Log Your First Night
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SleepLog
