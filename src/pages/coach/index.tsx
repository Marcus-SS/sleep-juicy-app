import { NextPage } from 'next'

const Coach: NextPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Sleep Juicy AI Coach</h1>
          <p className="text-gray-600">Your personal sleep advisor</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="font-semibold text-gray-800 mb-2">AI Coach Coming Soon</h3>
            <p className="text-sm text-gray-600 mb-4">
              Our AI sleep coach is being trained to provide personalized sleep advice and insights.
            </p>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-700">
                "Hello! I'm Luna, your AI sleep coach. I'm here to help you improve your sleep quality and establish healthy sleep habits. How can I assist you today?"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Coach
