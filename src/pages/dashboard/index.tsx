import { NextPage } from 'next'

const Dashboard: NextPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Good Morning! ☀️</h1>
          <p className="text-gray-600">Track your sleep journey</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Current Streak</div>
              <div className="text-xs text-gray-500 mt-1">Best: 0 days</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Total Logs</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-2">More Features Coming Soon</h3>
          <p className="text-sm text-gray-600">
            We're working on sleep insights, personalized recommendations, and more!
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
