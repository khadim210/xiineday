'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ThumbsUp, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClimateCalendar } from '@/components/ClimateCalendar';
import { getWeather, getEventTypes, analyzeEventSchedule, getAllLocations, WeatherData, EventType } from '@/lib/api';
import { useAppStore } from '@/lib/store';

export default function EventsPage() {
  const { selectedLocation, setSelectedLocation } = useAppStore();
  const [locations, setLocations] = useState<string[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [selectedEventType, setSelectedEventType] = useState<string>('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [analysis, setAnalysis] = useState<Array<{ date: string; score: number; reasons: string[] }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; message: string }>>([
    {
      role: 'assistant',
      message: 'Bonjour ! Je peux vous aider à trouver le meilleur moment pour votre événement. Posez-moi une question sur la météo.',
    },
  ]);

  useEffect(() => {
    const loadData = async () => {
      const locs = await getAllLocations();
      const types = await getEventTypes();
      setLocations(locs);
      setEventTypes(types);
      if (types.length > 0) {
        setSelectedEventType(types[0].type);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadWeather = async () => {
      const data = await getWeather(selectedLocation);
      setWeather(data || null);
    };
    loadWeather();
  }, [selectedLocation]);

  const handleAnalyze = () => {
    if (weather && selectedEventType) {
      const eventType = eventTypes.find((e) => e.type === selectedEventType);
      if (eventType) {
        const results = analyzeEventSchedule(weather, eventType);
        setAnalysis(results);
      }
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatMessages((prev) => [...prev, { role: 'user', message: chatInput }]);

    setTimeout(() => {
      let response = '';
      const input = chatInput.toLowerCase();

      if (input.includes('ensoleillé') || input.includes('soleil')) {
        const sunnyDays = weather?.forecast.filter((d) => d.condition === 'Ensoleillé') || [];
        if (sunnyDays.length > 0) {
          response = `Les jours les plus ensoleillés sont : ${sunnyDays.map((d) => d.day).join(', ')}. Parfait pour un événement en extérieur !`;
        } else {
          response = 'Il n\'y a pas de journée complètement ensoleillée dans les prévisions.';
        }
      } else if (input.includes('pluie') || input.includes('pluvieux')) {
        const rainyDays = weather?.forecast.filter((d) => d.precipitation > 50) || [];
        if (rainyDays.length > 0) {
          response = `Attention, risque de pluie élevé ces jours : ${rainyDays.map((d) => d.day).join(', ')}. Je vous recommande d\'éviter ces dates.`;
        } else {
          response = 'Bonne nouvelle ! Aucun jour avec un fort risque de pluie dans les prévisions.';
        }
      } else if (input.includes('meilleur') || input.includes('recommand')) {
        if (analysis.length > 0) {
          const best = analysis.reduce((prev, current) => (current.score > prev.score ? current : prev));
          const day = weather?.forecast.find((d) => d.date === best.date);
          response = `Je recommande ${day?.day} (${best.date}) avec un score de ${best.score}/100. ${best.reasons.join(', ')}.`;
        } else {
          response = 'Veuillez d\'abord analyser un événement pour obtenir des recommandations.';
        }
      } else {
        response = `D'après les prévisions pour ${selectedLocation}, la météo semble ${weather?.current.condition.toLowerCase()}. Pour plus de détails, consultez l'onglet Recommandations.`;
      }

      setChatMessages((prev) => [...prev, { role: 'assistant', message: response }]);
    }, 500);

    setChatInput('');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <ThumbsUp className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Planifier un événement
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Trouvez le meilleur créneau pour votre événement en fonction des conditions météo.
            </p>
          </div>

          <Tabs defaultValue="plan" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="plan">Recommandations</TabsTrigger>
              <TabsTrigger value="calendar">Calendrier</TabsTrigger>
              <TabsTrigger value="chat">Chat IA</TabsTrigger>
            </TabsList>

            <TabsContent value="plan" className="space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Détails de l'événement</CardTitle>
                  <CardDescription>
                    Configurez votre événement pour obtenir des recommandations personnalisées
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-type">Type d'événement</Label>
                      <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                        <SelectTrigger id="event-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {eventTypes.map((type) => (
                            <SelectItem key={type.id} value={type.type}>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {type.type}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Lieu</Label>
                      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger id="location">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location} value={location}>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {location}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedEventType && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-semibold mb-2">Conditions idéales</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {eventTypes.find((e) => e.type === selectedEventType)?.idealConditions.description}
                      </p>
                    </div>
                  )}

                  <Button onClick={handleAnalyze} className="w-full bg-gradient-to-r from-green-500 to-blue-500">
                    Analyser les créneaux
                  </Button>
                </CardContent>
              </Card>

              {analysis.length > 0 && (
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Meilleurs créneaux</CardTitle>
                    <CardDescription>
                      Classement des jours selon les conditions météo pour votre événement
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis
                      .sort((a, b) => b.score - a.score)
                      .map((result, index) => {
                        const day = weather?.forecast.find((d) => d.date === result.date);
                        return (
                          <motion.div
                            key={result.date}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="p-4 rounded-lg border-2 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                {getScoreIcon(result.score)}
                                <div>
                                  <p className="font-semibold">{day?.day}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{result.date}</p>
                                </div>
                              </div>
                              <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                                {result.score}
                                <span className="text-sm">/100</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {result.reasons.map((reason, i) => (
                                <Badge key={i} variant="secondary">
                                  {reason}
                                </Badge>
                              ))}
                            </div>
                            {day && (
                              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t text-sm">
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Temp: </span>
                                  <span className="font-semibold">{day.tempMax}°C</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Pluie: </span>
                                  <span className="font-semibold">{day.precipitation}%</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Vent: </span>
                                  <span className="font-semibold">{day.windSpeed} km/h</span>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <ClimateCalendar location={selectedLocation} />
            </TabsContent>

            <TabsContent value="chat">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Assistant météo
                  </CardTitle>
                  <CardDescription>
                    Posez des questions sur les meilleures dates pour votre événement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-4 h-[400px] overflow-y-auto">
                    {chatMessages.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Quel jour est le plus ensoleillé ?"
                      className="flex-1"
                    />
                    <Button type="submit" className="bg-gradient-to-r from-green-500 to-blue-500">
                      Envoyer
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
