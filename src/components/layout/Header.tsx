"use client";

import React, { useState, useEffect } from "react";
import { CloudRain, Thermometer, Wind, Bell, Calendar, Cloud, Sun } from "lucide-react";

export default function Header() {
  const [weather, setWeather] = useState<{
    temp: number;
    windspeed: number;
    desc: string;
    icon: JSX.Element;
  } | null>(null);

  useEffect(() => {
    // Open-Meteo API for Wonosobo (Lat: -7.36, Lon: 109.90)
    fetch("https://api.open-meteo.com/v1/forecast?latitude=-7.36&longitude=109.90&current_weather=true")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.current_weather) {
          const { temperature, windspeed, weathercode } = data.current_weather;
          let desc = "Cerah";
          let icon = <Sun size={14} />;
          if (weathercode >= 1 && weathercode <= 3) {
            desc = "Berawan";
            icon = <Cloud size={14} />;
          } else if (weathercode >= 51) {
            desc = "Hujan";
            icon = <CloudRain size={14} />;
          }
          setWeather({ temp: temperature, windspeed, desc, icon });
        }
      })
      .catch((err) => console.error("Gagal mengambil cuaca:", err));
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: Location & Weather */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Thermometer size={15} className="text-teal-500" />
            <span className="text-sm font-semibold text-gray-700">
              PT. Perkebunan Tambi, Wonosobo
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 ml-5">Pemantauan Risiko & Cuaca Real-time</p>
        </div>

        {/* Right: Date, weather badge, notifications */}
        <div className="flex items-center gap-4">
          {/* Date */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar size={13} />
            <span>{dateStr}</span>
          </div>

          {/* Weather badge */}
          {weather ? (
            <>
              <div className="flex items-center gap-2 bg-sky-500 text-white px-3 py-1.5 rounded-lg shadow-sm shadow-sky-500/30">
                {weather.icon}
                <span className="text-xs font-semibold">{weather.desc}</span>
              </div>

              {/* Temp & Wind quick stats */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Thermometer size={13} className="text-orange-400" />
                  <span>{weather.temp}°C</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Wind size={13} className="text-blue-400" />
                  <span>{weather.windspeed} km/h</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-xs text-gray-400 italic">Memuat cuaca...</div>
          )}

          {/* Notifications */}
          <button className="relative w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <Bell size={16} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>

      {/* Page title bar */}
      <div className="px-6 py-2 bg-[#1a3a5c] flex items-center justify-between">
        <h1 className="text-white font-bold text-sm tracking-wider uppercase">
          Dashboard Supply Chain Risk Management
        </h1>
        <div className="hidden md:flex items-center gap-4 text-xs text-white/70">
          <span>Periode: Januari – Desember 2026</span>
          <span>|</span>
          <span className="text-teal-300 font-medium">● Live Data</span>
        </div>
      </div>
    </header>
  );
}
