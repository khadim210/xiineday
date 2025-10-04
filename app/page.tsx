'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Map } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FiltersPanel from '@/components/FiltersPanel';
import Timeline from '@/components/Timeline';

const DynamicParcelMap = dynamic(() => import('@/components/DynamicParcelMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
    </div>
  ),
});

export default function HomePage() {
  const [selectedParcel, setSelectedParcel] = useState<any>(null);

  const handleParcelSelect = (parcel: any) => {
    setSelectedParcel(parcel);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Gestion des Parcelles
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Visualisez et gérez vos parcelles agricoles
              </p>
            </div>
            <Link href="/events">
              <Button className="bg-gradient-to-r from-green-500 to-blue-500">
                <Map className="h-4 w-4 mr-2" />
                Événements
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-4 gap-6 mb-8">
            <div className="lg:col-span-3">
              <Card className="border-2 h-[600px]">
                <CardContent className="p-0 h-full">
                  <DynamicParcelMap onParcelSelect={handleParcelSelect} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <FiltersPanel />
            </div>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Chronologie des Événements</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline selectedParcel={selectedParcel} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
