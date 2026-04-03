import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import locationsData from '../data/egypt_locations.json';

interface LocationSelectProps {
  onLocationChange: (location: { governorate: string; city: string }) => void;
  className?: string;
  initialGov?: string;
  initialCity?: string;
}

// Convert JSON object into a typed Record
const locations: Record<string, string[]> = locationsData;

const LocationSelect = ({ onLocationChange, className = "", initialGov = "", initialCity = "" }: LocationSelectProps) => {
  const { t } = useTranslation();
  
  const [selectedGov, setSelectedGov] = useState<string>(initialGov);
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const onLocationChangeRef = useRef(onLocationChange);

  // Keep ref in sync so effects don't depend on callback identity.
  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  const governorates = useMemo(() => Object.keys(locations).sort(), []);
  const cities = useMemo(() => selectedGov ? locations[selectedGov] || [] : [], [selectedGov]);

  useEffect(() => {
    // Only invoke when selected values actually change.
    if (selectedGov || selectedCity) {
      onLocationChangeRef.current({ governorate: selectedGov, city: selectedCity });
    }
  }, [selectedGov, selectedCity]);

  // Sync internal state when parent-provided initial values change (without causing loops).
  useEffect(() => {
    setSelectedGov((prev) => (prev !== initialGov ? initialGov : prev));
    setSelectedCity((prev) => (prev !== initialCity ? initialCity : prev));
  }, [initialGov, initialCity]);

  const handleGovChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGov(e.target.value);
    setSelectedCity(''); // Reset city when governorate changes
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">
          {t('auth.gov', 'Governorate')} <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedGov}
          onChange={handleGovChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent outline-none bg-white text-gray-900 transition-shadow"
        >
          <option value="" disabled>{t('auth.select_gov', 'Select Governorate')}</option>
          {governorates.map((gov) => (
            <option key={gov} value={gov}>
              {/* Translate governorate name if translation exists, otherwise show english */}
              {t(`locations.${gov}`, gov)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">
          {t('auth.city', 'City')} <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          required
          disabled={!selectedGov}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent outline-none bg-white text-gray-900 transition-shadow disabled:bg-gray-100 disabled:opacity-50"
        >
          <option value="" disabled>{t('auth.select_city', 'Select City')}</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {t(`locations.${city}`, city)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LocationSelect;
