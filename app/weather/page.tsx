'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Thermometer, Wind, Droplets, Gauge, Sun as SunIcon, Map } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WeatherIcon } from '@/components/ui-custom/WeatherIcon';
import { ClimateCalendar } from '@/components/ClimateCalendar';
import { getWeather, getAllLocations, WeatherData } from '@/lib/api';
import { useAppStore } from '@/lib/store';

export default function WeatherPage() {
  const { selectedLocation, setSelectedLocation } = useAppStore();
  const [locations, setLocations] = useState<string[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLocations = async () => {
      const locs = await getAllLocations();
      setLocations(locs);
    };
    loadLocations();
  }, []);

  useEffect(() => {
    const loadWeather = async () => {
      setLoading(true);
      const data = await getWeather(selectedLocation);
      setWeather(data || null);
      setLoading(false);
    };
    loadWeather();
  }, [selectedLocation]);

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Données météo non disponibles</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Prévisions météo
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              <Select value={selectedLocation} onValueChange={handleLocationChange}>
                <SelectTrigger className="w-[250px]">
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

              <Link href="/weather/enhanced">
                <Button className="bg-gradient-to-r from-green-500 to-blue-500">
                  <Map className="h-4 w-4 mr-2" />
                  Vue Interactive
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2 border-2 bg-gradient-to-br from-blue-500 to-green-500 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-white">{weather.city}</CardTitle>
                    <p className="text-blue-100">{weather.country}</p>
                  </div>
                  <WeatherIcon icon={weather.current.icon} className="h-16 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-6xl font-bold">{weather.current.temp}°</span>
                  <span className="text-2xl text-blue-100">
                    Ressenti {weather.current.feelsLike}°
                  </span>
                </div>
                <p className="text-xl mb-6 text-blue-100">{weather.current.condition}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-blue-100">
                      <Wind className="h-4 w-4" />
                      <span className="text-sm">Vent</span>
                    </div>
                    <span className="text-lg font-semibold">{weather.current.windSpeed} km/h</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-blue-100">
                      <Droplets className="h-4 w-4" />
                      <span className="text-sm">Humidité</span>
                    </div>
                    <span className="text-lg font-semibold">{weather.current.humidity}%</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-blue-100">
                      <Gauge className="h-4 w-4" />
                      <span className="text-sm">Pression</span>
                    </div>
                    <span className="text-lg font-semibold">{weather.current.pressure} hPa</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-blue-100">
                      <SunIcon className="h-4 w-4" />
                      <span className="text-sm">UV Index</span>
                    </div>
                    <span className="text-lg font-semibold">{weather.current.uvIndex}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Détails supplémentaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Direction du vent</span>
                  <span className="font-semibold">{weather.current.windDirection}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Précipitations</span>
                  <span className="font-semibold">{weather.current.precipitation}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Température ressentie</span>
                  <span className="font-semibold">{weather.current.feelsLike}°C</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Prévisions sur 5 jours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {weather.forecast.map((day, index) => (
                      <motion.div
                        key={day.date}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 border-2 hover:shadow-md transition-shadow"
                      >
                        <p className="font-semibold mb-2">{day.day}</p>
                        <div className="flex justify-center mb-3">
                          <WeatherIcon icon={day.icon} className="h-10 w-10 text-blue-600" />
                        </div>
                        <div className="text-center mb-2">
                          <p className="text-2xl font-bold">{day.tempMax}°</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{day.tempMin}°</p>
                        </div>
                        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center justify-between">
                            <span>Pluie</span>
                            <span className="font-semibold">{day.precipitation}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Vent</span>
                            <span className="font-semibold">{day.windSpeed} km/h</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <ClimateCalendar location={selectedLocation} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
