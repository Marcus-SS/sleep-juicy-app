import { NextPage } from 'next'

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🌙</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Sleep Juicy AI Coach</h1>
        <p className="text-gray-600 mb-6">Your personal sleep advisor</p>
        <div className="space-y-2">
          <a href="/dashboard" className="block bg-purple-600 text-white px-6 py-3 rounded-lg font-medium">
            Go to Dashboard
          </a>
          <a href="/coach" className="block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium">
            Chat with Coach
          </a>
        </div>
      </div>
    </div>
  )
}

export default Home
