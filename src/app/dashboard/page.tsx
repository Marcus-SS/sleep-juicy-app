'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface SleepLog {
  id: string;
  date: string;
  bedtime: string;
  wake_time: string;
  sleep_quality: number;
  created_at: string;
}

interface ChronotypeInfo {
  type: string;
  bedtime: string;
  wakeTime: string;
  description: string;
}

export default function Dashboard() {
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [chronotype, setChronotype] = useState<string>('');

  // Function to get dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning! ☀️';
    if (hour < 18) return 'Good Afternoon! ☀️';
    return 'Good Evening! 🌙';
  };

  // Function to calculate streaks
  const calculateStreaks = (logs: SleepLog[]) => {
    if (logs.length === 0) return { current: 0, best: 0 };

    // Sort logs by date (newest first)
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check current streak from today backwards
    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = new Date(sortedLogs[i].date);
      logDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (logDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate best streak
    for (let i = 0; i < sortedLogs.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const currentDate = new Date(sortedLogs[i].date);
        const prevDate = new Date(sortedLogs[i - 1].date);
        const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          bestStreak = Math.max(bestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak);
    
    return { current: currentStreak, best: bestStreak };
  };

  // Function to get chronotype recommendations
  const getChronotypeInfo = (chronotype: string): ChronotypeInfo => {
    const chronotypeMap: { [key: string]: ChronotypeInfo } = {
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
    };
    
    return chronotypeMap[chronotype] || {
      type: 'Unknown',
      bedtime: '11:00 PM',
      wakeTime: '7:00 AM',
      description: 'Take the chronotype test to get personalized recommendations'
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user's chronotype
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('chronotype')
            .eq('id', user.id)
            .single();
          
          if (profile?.chronotype) {
            setChronotype(profile.chronotype);
          }
        }

        // Fetch sleep logs
        const { data: logs } = await supabase
          .from('sleep_logs')
          .select('*')
          .order('date', { ascending: false });

        if (logs) {
          setSleepLogs(logs);
          const streaks = calculateStreaks(logs);
          setCurrentStreak(streaks.current);
          setBestStreak(streaks.best);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const chronotypeInfo = getChronotypeInfo(chronotype);

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
              <div className="text-2xl font-bold text-green-600">{sleepLogs.length}</div>
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
  );
}
