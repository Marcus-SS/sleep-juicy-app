import { useState } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'

interface SleepEvent {
  type: 'fall_asleep' | 'wake_up'
  time: string
}

const LastNightSleepLog: NextPage = () => {
  const router = useRouter()
  const [bedtime, setBedtime] = useState('')
  const [wakeTime, setWakeTime] = useState('')
  const [sleepQuality, setSleepQuality] = useState(3)
  const [events, setEvents] = useState<SleepEvent[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editType, setEditType] = useState<'fall_asleep' | 'wake_up'>('fall_asleep')
  const [editTime, setEditTime] = useState('')

  const addEvent = (type: 'fall_asleep' | 'wake_up') => {
    const now = new Date()
    const timeString = now.toTimeString().slice(0, 5)
    
    setEvents(prev => [...prev, { type, time: timeString }])
  }

  const startEditEvent = (index: number) => {
    setEditingIndex(index)
    setEditType(events[index].type)
    setEditTime(events[index].time)
  }

  const saveEditEvent = () => {
    if (editingIndex !== null) {
      setEvents(prev => prev.map((event, idx) => 
        idx === editingIndex ? { type: editType, time: editTime } : event
      ))
      setEditingIndex(null)
    }
  }

  const cancelEditEvent = () => {
    setEditingIndex(null)
  }

  const deleteEvent = (index: number) => {
    setEvents(prev => prev.filter((_, idx) => idx !== index))
  }

  const calculateSleepDuration = () => {
    if (!bedtime || !wakeTime) return ''
    
    const bed = new Date(`2000-01-01T${bedtime}`)
    const wake = new Date(`2000-01-01T${wakeTime}`)
    
    if (wake < bed) {
      wake.setDate(wake.getDate() + 1)
    }
    
    const diff = wake.getTime() - bed.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // For demo purposes, just redirect back to sleep log
    alert('Sleep log saved! (Demo mode)')
    router.push('/sleep-log')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6 pt-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Last Night's Sleep</h1>
          <p className="text-gray-600">Log your sleep details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Sleep Times */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Sleep Times</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedtime
                </label>
                <input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wake Time
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            {bedtime && wakeTime && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600">Total Sleep Duration:</div>
                <div className="text-lg font-semibold text-purple-600">
                  {calculateSleepDuration()}
                </div>
              </div>
            )}
          </div>

          {/* Sleep Quality */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Sleep Quality</h3>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setSleepQuality(rating)}
                  className={`text-2xl transition-colors ${
                    rating <= sleepQuality ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>
            <div className="text-center text-sm text-gray-600 mt-2">
              {sleepQuality === 1 && 'Very Poor'}
              {sleepQuality === 2 && 'Poor'}
              {sleepQuality === 3 && 'Fair'}
              {sleepQuality === 4 && 'Good'}
              {sleepQuality === 5 && 'Excellent'}
            </div>
          </div>

          {/* Sleep Events */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Sleep Events</h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => addEvent('fall_asleep')}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg"
                >
                  Fell Asleep
                </button>
                <button
                  type="button"
                  onClick={() => addEvent('wake_up')}
                  className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-lg"
                >
                  Woke Up
                </button>
              </div>
            </div>

            {events.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                No events logged yet. Tap the buttons above to add sleep events.
              </p>
            ) : (
              <ul className="space-y-2">
                {events.map((event, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${event.type === 'fall_asleep' ? 'bg-blue-500' : 'bg-yellow-400'}`}></span>
                    {editingIndex === idx ? (
                      <div className="flex flex-wrap items-center gap-2 w-full">
                        <select
                          value={editType}
                          onChange={e => setEditType(e.target.value as 'fall_asleep' | 'wake_up')}
                          className="rounded-lg border-2 border-gray-200 px-3 py-1 focus:outline-none focus:border-purple-500"
                        >
                          <option value="fall_asleep">Fall Asleep</option>
                          <option value="wake_up">Wake Up</option>
                        </select>
                        <input
                          type="time"
                          value={editTime}
                          onChange={e => setEditTime(e.target.value)}
                          className="rounded-lg border-2 border-gray-200 px-3 py-1 focus:outline-none focus:border-purple-500"
                        />
                        <button
                          type="button"
                          onClick={saveEditEvent}
                          className="px-3 py-1 rounded-full text-white text-sm"
                          style={{ background: 'linear-gradient(90deg, #5d905c, #8cc455)' }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditEvent}
                          className="px-3 py-1 rounded-full border-2 border-gray-300 text-gray-700 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium text-gray-800">
                          {event.type === 'fall_asleep' ? 'Fell Asleep' : 'Woke Up'}
                        </span>
                        <span className="ml-2 text-gray-500">{event.time}</span>
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEditEvent(idx)}
                            className="px-3 py-1 rounded-full border-2 border-gray-300 text-gray-700 text-xs hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteEvent(idx)}
                            className="px-3 py-1 rounded-full text-white text-xs"
                            style={{ background: 'linear-gradient(90deg, #843484, #47154f)' }}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-medium shadow-sm"
            >
              Save Sleep Log
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LastNightSleepLog
