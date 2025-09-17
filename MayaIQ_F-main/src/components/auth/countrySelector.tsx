import React, { useEffect, useState } from "react";
import Select, { SingleValue, StylesConfig } from "react-select";
import { getData } from "country-list";
import { COUNTRY_FLAG_LINK } from "@/resource/const/const";

// Define the type for a country option
interface CountryOption {
  label: string;
  value: string;
  flag: string;
}

interface CountrySelectorProps {
  customStyles: any,
  selectedCountryCode: string | undefined,
  onChange: (value: CountryOption | null) => void;
}

// Get country data with flags
const countries: CountryOption[] = getData().map(({ name, code }) => ({
  label: name,
  value: code,
  flag: `${COUNTRY_FLAG_LINK}${code.toLowerCase()}.png`,
}));

// Custom label with flag
const formatOptionLabel = ({ label, flag }: CountryOption) => (
  <div style={{ display: "flex", alignItems: "center" }}>
    <img
      src={flag}
      alt={`Flag of ${label}`}
      style={{ width: 20, height: 15, marginRight: 10 }}
    />
    <span>{label}</span>
  </div>
);

const CountrySelector: React.FC<CountrySelectorProps> = ({ 
    customStyles,
    selectedCountryCode,
    onChange 
    }) => {
    
    const [selectedCountry, setSelectedCountry] = useState<CountryOption | undefined>()

    useEffect(() => {
        setSelectedCountry(countries.find(ct => ct.value === selectedCountryCode))
    }, [selectedCountryCode]);

    return (
        <Select<CountryOption, false>
            options={countries}
            onChange={(value: SingleValue<CountryOption>) => onChange(value)}
            placeholder="Select a country"
            formatOptionLabel={formatOptionLabel}
            value={selectedCountry}
            styles={customStyles}
            blurInputOnSelect={false}
            isClearable
        />
    );
};

export default CountrySelector;
