import { useState, useEffect } from 'react'
import { NextPage } from 'next'
import Link from 'next/link'

const Dashboard: NextPage = () => {
  const [currentStreak, setCurrentStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [sleepLogsCount, setSleepLogsCount] = useState(0)
  const [chronotype, setChronotype] = useState('')

  // Function to get dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning! ☀️'
    if (hour < 18) return 'Good Afternoon! ☀️'
    return 'Good Evening! 🌙'
  }

  // Function to get chronotype recommendations
  const getChronotypeInfo = (chronotype: string) => {
    const chronotypeMap: { [key: string]: any } = {
      'Definitely morning type': {
        type: 'Definitely Morning Type',
        bedtime: '9:00 PM',
        wakeTime: '5:00 AM',
        description: 'You naturally wake up early and feel most energetic in the morning'
      },
      'Moderately morning type': {
        type: 'Moderately Morning Type',
        bedtime: '10:00 PM',
        wakeTime: '6:00 AM',
        description: 'You prefer mornings but can adapt to slightly later schedules'
      },
      'Neither type': {
        type: 'Neither Type',
        bedtime: '11:00 PM',
        wakeTime: '7:00 AM',
        description: 'You have a flexible sleep schedule and adapt well to different times'
      },
      'Moderately evening type': {
        type: 'Moderately Evening Type',
        bedtime: '12:00 AM',
        wakeTime: '8:00 AM',
        description: 'You prefer evenings but can adjust to earlier schedules when needed'
      },
      'Definitely evening type': {
        type: 'Definitely Evening Type',
        bedtime: '1:00 AM',
        wakeTime: '9:00 AM',
        description: 'You naturally stay up late and feel most energetic in the evening'
      }
    }
    
    return chronotypeMap[chronotype] || {
      type: 'Unknown',
      bedtime: '11:00 PM',
      wakeTime: '7:00 AM',
      description: 'Take the chronotype test to get personalized recommendations'
    }
  }

  const chronotypeInfo = getChronotypeInfo(chronotype)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {getGreeting()}
          </h1>
          <p className="text-gray-600">Track your sleep journey</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{currentStreak}</div>
              <div className="text-sm text-gray-600">Current Streak</div>
              <div className="text-xs text-gray-500 mt-1">Best: {bestStreak} days</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{sleepLogsCount}</div>
              <div className="text-sm text-gray-600">Total Logs</div>
            </div>
          </div>
        </div>

        {/* Chronotype Information Card */}
        {chronotype && (
          <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Your Chronotype</h3>
            <div className="text-sm text-gray-600 mb-2">
              <strong>{chronotypeInfo.type}</strong>
            </div>
            <p className="text-xs text-gray-500 mb-3">{chronotypeInfo.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Bedtime:</span>
                <div className="font-medium">{chronotypeInfo.bedtime}</div>
              </div>
              <div>
                <span className="text-gray-500">Wake time:</span>
                <div className="font-medium">{chronotypeInfo.wakeTime}</div>
              </div>
            </div>
            <Link 
              href="/chronotype-quiz"
              className="block mt-3 text-center text-xs text-purple-600 hover:text-purple-700"
            >
              Not sure about your chronotype? Take the test again
            </Link>
          </div>
        )}

        {/* More Features Coming Soon */}
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
