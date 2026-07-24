import { fmt, addDays } from './date';

export function seedEvents() {
  const today = fmt(new Date());
  const seed = {};
  seed[today] = [
    { id: 'e1', title: 'Deep work block', start: '09:30', end: '11:30', done: false, emoji: '💼' },
    { id: 'e2', title: 'Meet with founder AJ', start: '17:00', end: '18:00', done: true, emoji: '👥' },
  ];
  seed[fmt(addDays(new Date(), 1))] = [
    { id: 'e3', title: 'Dentist appointment', start: '15:00', end: null, done: false, emoji: '🦷' },
  ];
  seed[fmt(addDays(new Date(), 2))] = [
    { id: 'e4', title: 'Team standup', start: '10:00', end: '10:30', done: false, emoji: '🤝' },
  ];
  return seed;
}
