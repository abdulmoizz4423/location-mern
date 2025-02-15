import React, { lazy, Suspense } from "react";

const EmergencyGoodsManagement = lazy(() =>
  import("./EmergencyGoodsManagement")
);
const RescuerCreation = lazy(() => import("./RescuerCreation"));
const AnnouncementCreation = lazy(() => import("./AnnouncementCreation"));
const StatisticsSection = lazy(() => import("./StatisticsSection"));
const StorageTable = lazy(() => import("./StorageTable"));

export const GoodsSection = ({ goods, setGoods }) => (
  <Suspense fallback={<div>Loading...</div>}>
    <EmergencyGoodsManagement goods={goods} setGoods={setGoods} />
  </Suspense>
);

export const RescuerSection = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <RescuerCreation />
  </Suspense>
);

export const AnnouncementSection = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <AnnouncementCreation />
  </Suspense>
);

export const StatisticsSectionWrapper = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <StatisticsSection />
  </Suspense>
);

export const StorageSection = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <StorageTable />
  </Suspense>
);
