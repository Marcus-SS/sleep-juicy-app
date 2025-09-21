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

export default function SleepLog() {
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSleepLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('sleep_logs')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;
        setSleepLogs(data || []);
      } catch (error) {
        console.error('Error fetching sleep logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSleepLogs();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateSleepDuration = (bedtime: string, wakeTime: string) => {
    const bed = new Date(`2000-01-01T${bedtime}`);
    const wake = new Date(`2000-01-01T${wakeTime}`);
    
    if (wake < bed) {
      wake.setDate(wake.getDate() + 1);
    }
    
    const diff = wake.getTime() - bed.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sleep logs...</p>
        </div>
      </div>
    );
  }

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
        {sleepLogs.length === 0 ? (
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
        ) : (
          <div className="space-y-3">
            {sleepLogs.map((log) => (
              <div key={log.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">
                    {formatDate(log.date)}
                  </h3>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < log.sleep_quality ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Bedtime</div>
                    <div className="font-medium">{log.bedtime}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Wake time</div>
                    <div className="font-medium">{log.wake_time}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Duration</div>
                    <div className="font-medium">
                      {calculateSleepDuration(log.bedtime, log.wake_time)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
