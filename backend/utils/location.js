const getRandomLocation = (center, radius) => {
  const y0 = center.latitude;
  const x0 = center.longitude;
  const rd = radius / 111300; // about 111300 meters in one degree

  const u = Math.random();
  const v = Math.random();

  const w = rd * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);

  const newLat = y + y0;
  const newLon = x + x0;

  return { latitude: newLat, longitude: newLon };
};

module.exports = { getRandomLocation };
