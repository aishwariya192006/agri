import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Plus, Droplets, Sprout, Wind, Scissors, MapPin, X } from 'lucide-react';

const initialTasks = [
  { id: 1, title: 'Irrigate Wheat Field', type: 'irrigation', date: '2026-06-16', time: '06:00 AM', crop: 'Wheat — Field A', priority: 'High' },
  { id: 2, title: 'Apply NPK Fertilizer', type: 'fertilizer', date: '2026-06-18', time: '05:30 PM', crop: 'Cotton — Field B', priority: 'Medium' },
  { id: 3, title: 'Weed Control', type: 'weeding', date: '2026-06-20', time: '07:00 AM', crop: 'Cotton — Field B', priority: 'Medium' },
  { id: 4, title: 'Harvest Preparation', type: 'harvesting', date: '2026-06-25', time: 'All Day', crop: 'Wheat — Field A', priority: 'High' },
  { id: 5, title: 'Pest Monitoring', type: 'monitoring', date: '2026-06-22', time: '10:00 AM', crop: 'Wheat — Field A', priority: 'Low' },
];

const typeConfig = {
  irrigation: { icon: Droplets, color: '#7A9BB5', dot: '#7A9BB5' },
  fertilizer: { icon: Sprout, color: '#4A9B3F', dot: '#C4A35A' },
  weeding: { icon: Wind, color: '#A8C5A0', dot: '#A8C5A0' },
  harvesting: { icon: Scissors, color: '#CD853F', dot: '#8B5A2B' },
  monitoring: { icon: MapPin, color: '#C4A35A', dot: '#C4A35A' },
};

const priorityColor = { High: '#F87171', Medium: '#C4A35A', Low: '#4A9B3F' };

export default function FarmCalendar() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('agrimate_tasks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return initialTasks; }
    }
    return initialTasks;
  });

  useEffect(() => {
    localStorage.setItem('agrimate_tasks', JSON.stringify(tasks));
  }, [tasks]);
  const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const today = new Date().getDate();
  const currentActualMonth = new Date().getMonth();
  const currentActualYear = new Date().getFullYear();
  const isCurrentMonthView = currentMonth.getMonth() === currentActualMonth && currentMonth.getFullYear() === currentActualYear;

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = i - firstDay + 1;
    return d > 0 && d <= daysInMonth ? d : null;
  });

  const getTasksForDay = day => {
    if (!day) return [];
    const ds = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => t.date === ds);
  };

  const submitNewTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      type: 'monitoring',
      date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(today).padStart(2, '0')}`,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      crop: 'General',
      priority: 'Medium'
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#C4A35A' }}>Farm Calendar</div>
          <div style={{ color: '#A8C5A0', fontSize: 14, marginTop: 4 }}>Manage daily farm tasks and AI-scheduled activities</div>
        </div>
        <motion.button onClick={() => setIsModalOpen(true)} whileTap={{ scale: 0.97 }} className="btn-primary">
          <Plus size={15} /> Add Task
        </motion.button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Calendar */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#F5ECD7' }}>
              {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button 
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(196,163,90,0.1)', border: '1px solid rgba(196,163,90,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C4A35A' }}>
                <ChevronLeft size={15} />
              </button>
              <button 
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(196,163,90,0.1)', border: '1px solid rgba(196,163,90,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C4A35A' }}>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 8, textAlign: 'center' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ color: '#6B8A65', fontSize: 11, fontWeight: 700, padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
            {days.map((day, i) => {
              const dayTasks = getTasksForDay(day);
              const isToday = isCurrentMonthView && day === today;
              return (
                <div key={i} style={{
                  minHeight: 64, borderRadius: 10, border: `1px solid ${isToday ? '#C4A35A' : 'rgba(196,163,90,0.08)'}`,
                  background: isToday ? 'rgba(196,163,90,0.1)' : day ? 'rgba(13,27,10,0.4)' : 'transparent',
                  padding: '6px 4px', cursor: day ? 'pointer' : 'default', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => day && !isToday && (e.currentTarget.style.borderColor = 'rgba(196,163,90,0.3)')}
                  onMouseLeave={e => day && !isToday && (e.currentTarget.style.borderColor = 'rgba(196,163,90,0.08)')}
                >
                  {day && (
                    <>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isToday ? '#C4A35A' : 'transparent',
                        color: isToday ? '#0A1508' : '#F5ECD7',
                        fontSize: 12, fontWeight: isToday ? 700 : 400, marginBottom: 4,
                      }}>{day}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {dayTasks.slice(0, 3).map(t => (
                          <div key={t.id} title={t.title} style={{ width: 7, height: 7, borderRadius: '50%', background: typeConfig[t.type].dot }} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#C4A35A' }}>Upcoming Tasks</div>
            <span style={{ background: 'rgba(196,163,90,0.1)', color: '#A8C5A0', fontSize: 10, padding: '3px 8px', borderRadius: 8 }}>Next 7 Days</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto' }}>
            {tasks.sort((a, b) => a.date.localeCompare(b.date)).map(t => {
              const conf = typeConfig[t.type];
              const Icon = conf.icon;
              return (
                <motion.div key={t.id} whileHover={{ scale: 1.02 }} style={{
                  background: 'rgba(13,27,10,0.5)', border: '1px solid rgba(196,163,90,0.1)',
                  borderRadius: 12, padding: '10px 12px', cursor: 'pointer',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(196,163,90,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(196,163,90,0.1)'}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${conf.dot}18`, border: `1px solid ${conf.dot}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={17} color={conf.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#F5ECD7', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{t.title}</div>
                      <div style={{ color: '#A8C5A0', fontSize: 11, marginBottom: 5 }}>{t.crop}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#6B8A65', fontSize: 11 }}>{new Date(t.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} · {t.time}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: priorityColor[t.priority], background: `${priorityColor[t.priority]}18`, borderRadius: 8, padding: '2px 6px' }}>{t.priority}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(10, 20, 10, 0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              background: '#0D1B0A', border: '1px solid rgba(196,163,90,0.2)',
              borderRadius: 16, padding: 24, width: '90%', maxWidth: 400,
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#C4A35A', margin: 0 }}>Add New Task</h3>
              <button onClick={() => { setIsModalOpen(false); setNewTaskTitle(''); }} style={{ background: 'transparent', border: 'none', color: '#A8C5A0', cursor: 'pointer', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#6B8A65', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>TASK TITLE</label>
              <input
                autoFocus
                type="text"
                placeholder="E.g., Inspect irrigation pipes..."
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitNewTask()}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 8,
                  background: 'rgba(196,163,90,0.05)', border: '1px solid rgba(196,163,90,0.2)',
                  color: '#F5ECD7', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={() => { setIsModalOpen(false); setNewTaskTitle(''); }}
                style={{
                  padding: '8px 16px', borderRadius: 8, background: 'transparent',
                  color: '#A8C5A0', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600
                }}
              >Cancel</button>
              <button onClick={submitNewTask} className="btn-primary" style={{ padding: '8px 20px' }}>
                Save Task
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
