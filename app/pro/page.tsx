'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sprout, Droplets, TriangleAlert as AlertTriangle, TrendingUp, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getWeather, getCrops, getAllLocations, WeatherData, CropData } from '@/lib/api';
import { useAppStore } from '@/lib/store';

export default function ProPage() {
  const { selectedLocation, setSelectedLocation } = useAppStore();
  const [locations, setLocations] = useState<string[]>([]);
  const [crops, setCrops] = useState<CropData[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<CropData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const locs = await getAllLocations();
      const cropsData = await getCrops();
      setLocations(locs);
      setCrops(cropsData);
      if (cropsData.length > 0) {
        setSelectedCrop(cropsData[0]);
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

  const calculateIrrigationNeed = () => {
    if (!weather || !selectedCrop) return 0;
    const avgHumidity = weather.forecast.reduce((sum, day) => sum + day.humidity, 0) / weather.forecast.length;
    const avgPrecipitation = weather.forecast.reduce((sum, day) => sum + day.precipitation, 0) / weather.forecast.length;

    if (avgHumidity > 70 && avgPrecipitation > 50) return 20;
    if (avgHumidity > 60 && avgPrecipitation > 30) return 40;
    if (avgHumidity > 50) return 60;
    return 85;
  };

  const getAlerts = (): Array<{ type: string; message: string; icon: any }> => {
    if (!weather) return [];
    const alerts: Array<{ type: string; message: string; icon: any }> = [];

    weather.forecast.forEach((day) => {
      if (day.precipitation > 70) {
        alerts.push({
          type: 'warning',
          message: `Fortes pluies prévues ${day.day} - Protégez vos cultures`,
          icon: AlertTriangle,
        });
      }
      if (day.tempMax > 35) {
        alerts.push({
          type: 'danger',
          message: `Températures élevées ${day.day} - Augmentez l'irrigation`,
          icon: AlertTriangle,
        });
      }
      if (day.windSpeed > 25) {
        alerts.push({
          type: 'info',
          message: `Vents forts ${day.day} - Vérifiez les cultures fragiles`,
          icon: AlertTriangle,
        });
      }
    });

    return alerts.slice(0, 5);
  };

  const getPlantingRecommendation = () => {
    if (!weather || !selectedCrop) return null;

    const avgTemp = weather.forecast.reduce((sum, day) => sum + (day.tempMax + day.tempMin) / 2, 0) / weather.forecast.length;
    const totalRain = weather.forecast.reduce((sum, day) => sum + day.precipitation, 0);

    const tempOk = avgTemp >= selectedCrop.idealConditions.tempMin && avgTemp <= selectedCrop.idealConditions.tempMax;
    const rainAdequate = totalRain > 10;

    if (tempOk && rainAdequate) {
      return { status: 'excellent', message: 'Conditions optimales pour la plantation' };
    } else if (tempOk || rainAdequate) {
      return { status: 'good', message: 'Conditions acceptables pour la plantation' };
    } else {
      return { status: 'poor', message: 'Conditions non favorables - Attendez une meilleure période' };
    }
  };

  const irrigationNeed = calculateIrrigationNeed();
  const alerts = getAlerts();
  const plantingRec = getPlantingRecommendation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-600 to-green-500">
                <Sprout className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  XiineDay Pro
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Gestion agricole intelligente</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="border-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  Besoin d'arrosage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold mb-2">{irrigationNeed}%</div>
                <div className="h-2 mb-3 bg-green-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-500"
                    style={{ width: `${irrigationNeed}%` }}
                  />
                </div>
                <p className="text-green-100">
                  {irrigationNeed > 70
                    ? 'Arrosage fortement recommandé'
                    : irrigationNeed > 40
                    ? 'Arrosage modéré nécessaire'
                    : 'Arrosage minimal requis'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Alertes actives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2">{alerts.length}</div>
                <p className="text-gray-600 dark:text-gray-400">
                  {alerts.length > 0 ? 'Vérifiez les alertes ci-dessous' : 'Aucune alerte pour le moment'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Conditions actuelles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Température</span>
                    <span className="font-semibold">{weather?.current.temp}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Humidité</span>
                    <span className="font-semibold">{weather?.current.humidity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Pluie</span>
                    <span className="font-semibold">{weather?.current.precipitation}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="irrigation" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="irrigation">Arrosage</TabsTrigger>
              <TabsTrigger value="crops">Cultures</TabsTrigger>
              <TabsTrigger value="alerts">Alertes</TabsTrigger>
            </TabsList>

            <TabsContent value="irrigation" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                    <CardDescription>Sélectionnez votre localisation et votre culture</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Localisation</label>
                      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger>
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
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Recommandations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="font-semibold text-sm mb-1">Fréquence d'arrosage</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {irrigationNeed > 70 ? '2-3 fois par jour' : irrigationNeed > 40 ? '1 fois par jour' : 'Tous les 2-3 jours'}
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="font-semibold text-sm mb-1">Meilleur moment</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Tôt le matin (6h-8h) ou en fin d'après-midi (17h-19h)
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="font-semibold text-sm mb-1">Quantité estimée</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {irrigationNeed > 70 ? '25-30 L/m²' : irrigationNeed > 40 ? '15-20 L/m²' : '8-12 L/m²'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="crops" className="space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {crops.map((crop) => (
                  <Card
                    key={crop.id}
                    className={`cursor-pointer border-2 transition-all hover:shadow-lg ${
                      selectedCrop?.id === crop.id ? 'ring-2 ring-green-500' : ''
                    }`}
                    onClick={() => setSelectedCrop(crop)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{crop.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="secondary">{crop.waterRequirements}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedCrop && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle>{selectedCrop.name}</CardTitle>
                      <CardDescription>Informations de culture</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Période de plantation</p>
                        <p className="font-semibold">{selectedCrop.plantingPeriod}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Période de récolte</p>
                        <p className="font-semibold">{selectedCrop.harvestPeriod}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Besoins en eau</p>
                        <p className="font-semibold">{selectedCrop.waterRequirements}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Humidité du sol idéale</p>
                        <p className="font-semibold">{selectedCrop.idealConditions.soilMoisture}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle>Recommandation de plantation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {plantingRec && (
                        <div
                          className={`p-4 rounded-lg ${
                            plantingRec.status === 'excellent'
                              ? 'bg-green-50 dark:bg-green-900/20'
                              : plantingRec.status === 'good'
                              ? 'bg-yellow-50 dark:bg-yellow-900/20'
                              : 'bg-red-50 dark:bg-red-900/20'
                          }`}
                        >
                          <p className="font-semibold mb-2 flex items-center gap-2">
                            {plantingRec.status === 'excellent' && <span className="text-2xl">✓</span>}
                            {plantingRec.status === 'good' && <span className="text-2xl">!</span>}
                            {plantingRec.status === 'poor' && <span className="text-2xl">✗</span>}
                            {plantingRec.message}
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Température moyenne</span>
                              <span className="font-semibold">
                                {Math.round(
                                  weather!.forecast.reduce((sum, day) => sum + (day.tempMax + day.tempMin) / 2, 0) /
                                    weather!.forecast.length
                                )}
                                °C
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Plage idéale</span>
                              <span className="font-semibold">
                                {selectedCrop.idealConditions.tempMin}-{selectedCrop.idealConditions.tempMax}°C
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 space-y-2">
                        <h4 className="font-semibold text-sm">Étapes de croissance</h4>
                        {selectedCrop.growthStages.map((stage, index) => (
                          <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                            <p className="font-semibold">{stage.stage}</p>
                            <p className="text-gray-600 dark:text-gray-400">{stage.duration}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {stage.irrigation}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="alerts">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Alertes météo agricoles</CardTitle>
                  <CardDescription>Notifications importantes pour protéger vos cultures</CardDescription>
                </CardHeader>
                <CardContent>
                  {alerts.length > 0 ? (
                    <div className="space-y-3">
                      {alerts.map((alert, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className={`p-4 rounded-lg border-l-4 ${
                            alert.type === 'danger'
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                              : alert.type === 'warning'
                              ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
                              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <alert.icon
                              className={`h-5 w-5 ${
                                alert.type === 'danger'
                                  ? 'text-red-600'
                                  : alert.type === 'warning'
                                  ? 'text-orange-600'
                                  : 'text-blue-600'
                              }`}
                            />
                            <p className="font-medium">{alert.message}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600 dark:text-gray-400">Aucune alerte pour le moment</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        Les conditions météo sont favorables pour vos cultures
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
