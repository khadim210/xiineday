'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, MapPin, Clock, Thermometer, Droplets } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';

type EventCategory = 'agricultural' | 'weather' | 'personal' | 'reminder';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  category: EventCategory;
  location?: string;
  weatherImpact?: boolean;
}

const categoryColors: Record<EventCategory, { bg: string; text: string; border: string }> = {
  agricultural: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-300 dark:border-green-700' },
  weather: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-700' },
  personal: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-700' },
  reminder: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-700' },
};

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Plantation de Mil',
    description: 'Début de la plantation dans la parcelle Nord',
    date: new Date(2025, 9, 5),
    startTime: '08:00',
    endTime: '12:00',
    category: 'agricultural',
    location: 'Parcelle Nord',
    weatherImpact: true,
  },
  {
    id: '2',
    title: 'Irrigation Maïs',
    description: 'Système d\'irrigation à vérifier',
    date: new Date(2025, 9, 6),
    startTime: '06:00',
    endTime: '09:00',
    category: 'agricultural',
    location: 'Parcelle Est',
    weatherImpact: true,
  },
  {
    id: '3',
    title: 'Risque de pluie',
    description: 'Pluies abondantes prévues',
    date: new Date(2025, 9, 8),
    startTime: '14:00',
    endTime: '18:00',
    category: 'weather',
    weatherImpact: true,
  },
  {
    id: '4',
    title: 'Récolte Arachide',
    description: 'Début de la récolte',
    date: new Date(2025, 9, 15),
    startTime: '07:00',
    endTime: '16:00',
    category: 'agricultural',
    location: 'Parcelle Ouest',
  },
];

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    category: 'personal',
    date: new Date(),
    startTime: '09:00',
    endTime: '10:00',
  });

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.date, date));
  };

  const handleCreateEvent = () => {
    if (newEvent.title && newEvent.date) {
      const event: CalendarEvent = {
        id: Date.now().toString(),
        title: newEvent.title,
        description: newEvent.description || '',
        date: newEvent.date,
        startTime: newEvent.startTime || '09:00',
        endTime: newEvent.endTime || '10:00',
        category: newEvent.category as EventCategory,
        location: newEvent.location,
        weatherImpact: newEvent.weatherImpact,
      };
      setEvents([...events, event]);
      setIsDialogOpen(false);
      setNewEvent({
        category: 'personal',
        date: new Date(),
        startTime: '09:00',
        endTime: '10:00',
      });
    }
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div className="grid grid-cols-7 gap-2">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
          <div key={day} className="text-center font-semibold text-sm text-gray-600 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
        {days.map((day) => {
          const dayEvents = getEventsForDate(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);

          return (
            <motion.div
              key={day.toString()}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedDate(day)}
              className={`min-h-[100px] p-2 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : isToday
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="text-sm font-semibold mb-1">{format(day, 'd')}</div>
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded truncate ${categoryColors[event.category].bg} ${categoryColors[event.category].text}`}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">+{dayEvents.length - 2} plus</div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentMonth, { locale: fr });
    const weekEnd = endOfWeek(currentMonth, { locale: fr });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayEvents = getEventsForDate(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);

          return (
            <div key={day.toString()} className="space-y-2">
              <div
                className={`text-center p-2 rounded-lg font-semibold ${
                  isToday ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <div className="text-xs">{format(day, 'EEE', { locale: fr })}</div>
                <div className="text-lg">{format(day, 'd')}</div>
              </div>
              <div className="space-y-2 min-h-[400px]">
                {dayEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-2 rounded-lg border-l-4 ${categoryColors[event.category].bg} ${categoryColors[event.category].border} cursor-pointer`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="font-semibold text-sm">{event.title}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {event.startTime} - {event.endTime}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="space-y-2">
        <div className="text-center p-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg">
          <div className="text-2xl font-bold">{format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}</div>
        </div>
        <div className="space-y-1">
          {hours.map((hour) => {
            const hourEvents = dayEvents.filter((event) => {
              const eventHour = parseInt(event.startTime.split(':')[0]);
              return eventHour === hour;
            });

            return (
              <div key={hour} className="flex gap-2 min-h-[60px] border-b border-gray-200 dark:border-gray-700">
                <div className="w-20 text-sm text-gray-600 dark:text-gray-400 pt-1">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="flex-1 space-y-1">
                  {hourEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg border-l-4 ${categoryColors[event.category].bg} ${categoryColors[event.category].border}`}
                    >
                      <div className="font-semibold">{event.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{event.description}</div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.startTime} - {event.endTime}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1));
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentMonth(direction === 'prev' ? subWeeks(currentMonth, 1) : addWeeks(currentMonth, 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Calendrier Agricole
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gérez vos activités agricoles et événements
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-500 to-blue-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel événement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Créer un événement</DialogTitle>
                  <DialogDescription>
                    Ajoutez un nouvel événement à votre calendrier
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Plantation de Mil"
                      value={newEvent.title || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Détails de l'événement"
                      value={newEvent.description || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-time">Heure début</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={newEvent.startTime}
                        onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-time">Heure fin</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={newEvent.endTime}
                        onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select
                      value={newEvent.category}
                      onValueChange={(value) => setNewEvent({ ...newEvent, category: value as EventCategory })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agricultural">Agricole</SelectItem>
                        <SelectItem value="weather">Météo</SelectItem>
                        <SelectItem value="personal">Personnel</SelectItem>
                        <SelectItem value="reminder">Rappel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Lieu (optionnel)</Label>
                    <Input
                      id="location"
                      placeholder="Ex: Parcelle Nord"
                      value={newEvent.location || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleCreateEvent} className="w-full bg-gradient-to-r from-green-500 to-blue-500">
                    Créer l'événement
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => (view === 'week' ? navigateWeek('prev') : navigateMonth('prev'))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="text-xl font-bold">
                        {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => (view === 'week' ? navigateWeek('next') : navigateMonth('next'))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <Tabs value={view} onValueChange={(v) => setView(v as any)}>
                      <TabsList>
                        <TabsTrigger value="month">Mois</TabsTrigger>
                        <TabsTrigger value="week">Semaine</TabsTrigger>
                        <TabsTrigger value="day">Jour</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={view}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {view === 'month' && renderMonthView()}
                      {view === 'week' && renderWeekView()}
                      {view === 'day' && renderDayView()}
                    </motion.div>
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Mini Calendrier</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Événements du jour</CardTitle>
                  <CardDescription>
                    {format(selectedDate, 'd MMMM yyyy', { locale: fr })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getEventsForDate(selectedDate).length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        Aucun événement ce jour
                      </p>
                    ) : (
                      getEventsForDate(selectedDate).map((event) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-3 rounded-lg border-l-4 ${categoryColors[event.category].bg} ${categoryColors[event.category].border}`}
                        >
                          <div className="font-semibold text-sm mb-1">{event.title}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {event.description}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            {event.startTime} - {event.endTime}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </div>
                          )}
                          {event.weatherImpact && (
                            <Badge variant="secondary" className="mt-2">
                              Sensible à la météo
                            </Badge>
                          )}
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Légende</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(categoryColors).map(([key, colors]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${colors.bg} border-2 ${colors.border}`} />
                        <span className="text-sm capitalize">{key === 'agricultural' ? 'Agricole' : key === 'weather' ? 'Météo' : key === 'personal' ? 'Personnel' : 'Rappel'}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
