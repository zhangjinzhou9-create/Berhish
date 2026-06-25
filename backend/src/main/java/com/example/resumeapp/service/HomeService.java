package com.example.resumeapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class HomeService {

    private final ProfileService profileService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${restcountries.api.key:}")
    private String restCountriesApiKey;

    public HomeService(ProfileService profileService) {
        this.profileService = profileService;
    }

    public Map<String, Object> getHome(String country, String city) {
        Map<String, Object> profile = profileService.readBasicProfileSafely();

        String selectedCountry = hasText(country) ? country : safeText(profile.get("country"), "Japan");
        String selectedCity = hasText(city) ? city : safeText(profile.get("city"), "Kyoto");

        Map<String, Object> countryInfo = fetchCountryInfoSafely(selectedCountry);
        Map<String, Object> geoInfo = fetchGeoInfoSafely(selectedCity, selectedCountry);
        Map<String, Object> weatherInfo = fetchWeatherInfoSafely(geoInfo);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("profileName", safeText(profile.get("name"), "Student"));
        result.put("selectedCountry", selectedCountry);
        result.put("selectedCity", selectedCity);
        result.put("country", countryInfo);
        result.put("city", geoInfo);
        result.put("weather", weatherInfo);
        result.put("tips", buildTips(weatherInfo));
        return result;
    }

    private Map<String, Object> fetchCountryInfoSafely(String country) {
        try {
            return fetchCountryInfo(country);
        } catch (Exception e) {
            return localCountryInfo(country);
        }
    }

    private Map<String, Object> fetchGeoInfoSafely(String city, String country) {
        try {
            return fetchGeoInfo(city);
        } catch (Exception e) {
            Map<String, Object> fallback = new LinkedHashMap<>();
            fallback.put("name", city);
            fallback.put("country", country);
            fallback.put("latitude", 35.0116);
            fallback.put("longitude", 135.7681);
            fallback.put("timezone", "Asia/Tokyo");
            fallback.put("note", "Geocoding API could not find the city, so default coordinates were used.");
            return fallback;
        }
    }

    private Map<String, Object> fetchWeatherInfoSafely(Map<String, Object> geoInfo) {
        try {
            return fetchWeatherInfo(geoInfo);
        } catch (Exception e) {
            Map<String, Object> fallback = new LinkedHashMap<>();
            fallback.put("temperature", 18.0);
            fallback.put("windSpeed", 2.0);
            fallback.put("weatherCode", 61);
            fallback.put("condition", "Rainy");
            fallback.put("time", "Unknown");
            fallback.put("note", "Weather API could not be reached, so fallback weather was used.");
            return fallback;
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchCountryInfo(String country) {
        if (!hasText(restCountriesApiKey) || "rc_live_demo".equals(restCountriesApiKey)) {
            return localCountryInfo(country);
        }

        String url = UriComponentsBuilder
                .fromUriString("https://api.restcountries.com/countries/v5/names.common")
                .path("/{country}")
                .queryParam("response_fields", "names.common,capitals,region,population,languages,currencies")
                .queryParam("api-key", restCountriesApiKey)
                .buildAndExpand(country)
                .toUriString();

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        Map<String, Object> data = response == null ? null : (Map<String, Object>) response.get("data");
        List<Map<String, Object>> objects = data == null ? null : (List<Map<String, Object>>) data.get("objects");
        Map<String, Object> raw = objects == null || objects.isEmpty() ? new LinkedHashMap<>() : objects.get(0);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("name", readNestedText(raw, "names", "common", country));
        result.put("capital", readCapital(raw.get("capitals")));
        result.put("region", raw.getOrDefault("region", "Unknown"));
        result.put("population", raw.getOrDefault("population", 0));
        result.put("languages", readLanguageNames(raw.get("languages")));
        result.put("currencies", readCurrencyNames(raw.get("currencies")));
        return result;
    }

    private Map<String, Object> localCountryInfo(String country) {
        String key = country == null ? "" : country.trim().toLowerCase();
        Map<String, Object> result = new LinkedHashMap<>();

        switch (key) {
            case "japan" -> {
                result.put("name", "Japan");
                result.put("capital", "Tokyo");
                result.put("region", "Asia");
                result.put("population", 125000000);
                result.put("languages", List.of("Japanese"));
                result.put("currencies", List.of("Japanese yen"));
            }
            case "china" -> {
                result.put("name", "China");
                result.put("capital", "Beijing");
                result.put("region", "Asia");
                result.put("population", 1409000000);
                result.put("languages", List.of("Chinese"));
                result.put("currencies", List.of("Chinese yuan"));
            }
            case "united states", "usa", "us", "america" -> {
                result.put("name", "United States");
                result.put("capital", "Washington, D.C.");
                result.put("region", "Americas");
                result.put("population", 334900000);
                result.put("languages", List.of("English"));
                result.put("currencies", List.of("United States dollar"));
            }
            case "canada" -> {
                result.put("name", "Canada");
                result.put("capital", "Ottawa");
                result.put("region", "Americas");
                result.put("population", 41500000);
                result.put("languages", List.of("English", "French"));
                result.put("currencies", List.of("Canadian dollar"));
            }
            case "france" -> {
                result.put("name", "France");
                result.put("capital", "Paris");
                result.put("region", "Europe");
                result.put("population", 68000000);
                result.put("languages", List.of("French"));
                result.put("currencies", List.of("Euro"));
            }
            case "germany" -> {
                result.put("name", "Germany");
                result.put("capital", "Berlin");
                result.put("region", "Europe");
                result.put("population", 84000000);
                result.put("languages", List.of("German"));
                result.put("currencies", List.of("Euro"));
            }
            default -> {
                result.put("name", hasText(country) ? country : "Unknown");
                result.put("capital", "Unknown");
                result.put("region", "Unknown");
                result.put("population", 0);
                result.put("languages", new ArrayList<String>());
                result.put("currencies", new ArrayList<String>());
                result.put("note", "Country API could not be reached and no local country data matched the input.");
            }
        }

        return result;
    }

    private String readNestedText(Map<String, Object> raw, String firstKey, String secondKey, String fallback) {
        Object first = raw.get(firstKey);
        if (first instanceof Map<?, ?> map) {
            Object second = map.get(secondKey);
            if (second != null) {
                return second.toString();
            }
        }
        return hasText(fallback) ? fallback : "Unknown";
    }

    private String readCapital(Object raw) {
        if (raw instanceof List<?> list && !list.isEmpty()) {
            Object first = list.get(0);
            if (first instanceof Map<?, ?> capital) {
                Object name = capital.get("name");
                return name == null ? "Unknown" : name.toString();
            }
            return String.valueOf(first);
        }
        return "Unknown";
    }

    private List<String> readLanguageNames(Object raw) {
        List<String> result = new ArrayList<>();
        if (raw instanceof List<?> list) {
            for (Object item : list) {
                if (item instanceof Map<?, ?> language) {
                    Object name = language.get("name");
                    if (name != null) {
                        result.add(name.toString());
                    }
                }
            }
        }
        return result;
    }

    private List<String> readCurrencyNames(Object raw) {
        List<String> result = new ArrayList<>();
        if (raw instanceof List<?> list) {
            for (Object value : list) {
                if (value instanceof Map<?, ?> currency && currency.get("name") != null) {
                    result.add(currency.get("name").toString());
                }
            }
        } else if (raw instanceof Map<?, ?> map) {
            for (Object value : map.values()) {
                if (value instanceof Map<?, ?> currency && currency.get("name") != null) {
                    result.add(currency.get("name").toString());
                }
            }
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchGeoInfo(String city) {
        String url = UriComponentsBuilder
                .fromUriString("https://geocoding-api.open-meteo.com/v1/search")
                .queryParam("name", city)
                .queryParam("count", 1)
                .queryParam("language", "en")
                .queryParam("format", "json")
                .toUriString();

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        List<Map<String, Object>> results = response == null ? null : (List<Map<String, Object>>) response.get("results");
        if (results == null || results.isEmpty()) {
            throw new IllegalArgumentException("City not found: " + city);
        }

        Map<String, Object> raw = results.get(0);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("name", raw.get("name"));
        result.put("country", raw.get("country"));
        result.put("latitude", raw.get("latitude"));
        result.put("longitude", raw.get("longitude"));
        result.put("timezone", raw.get("timezone"));
        return result;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchWeatherInfo(Map<String, Object> geoInfo) {
        String url = UriComponentsBuilder
                .fromUriString("https://api.open-meteo.com/v1/forecast")
                .queryParam("latitude", geoInfo.get("latitude"))
                .queryParam("longitude", geoInfo.get("longitude"))
                .queryParam("current_weather", true)
                .toUriString();

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        Map<String, Object> current = response == null ? new LinkedHashMap<>() : (Map<String, Object>) response.get("current_weather");
        if (current == null) {
            current = new LinkedHashMap<>();
        }

        int weatherCode = toInt(current.get("weathercode"));
        double temperature = toDouble(current.get("temperature"));
        double windSpeed = toDouble(current.get("windspeed"));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("temperature", temperature);
        result.put("windSpeed", windSpeed);
        result.put("weatherCode", weatherCode);
        result.put("condition", weatherText(weatherCode));
        result.put("time", current.get("time"));
        return result;
    }

    private Map<String, Object> buildTips(Map<String, Object> weather) {
        double temperature = toDouble(weather.get("temperature"));
        String condition = String.valueOf(weather.get("condition"));

        String clothing;
        if (temperature < 10) {
            clothing = "Wear a warm coat";
        } else if (temperature < 20) {
            clothing = "A light jacket is suitable";
        } else {
            clothing = "Light clothes are enough";
        }

        String reminder = condition.toLowerCase().contains("rain") ?
                "Remember to bring an umbrella" :
                "Good weather for going out";

        Map<String, Object> tips = new LinkedHashMap<>();
        tips.put("clothing", clothing);
        tips.put("weatherTrend", condition);
        tips.put("reminder", reminder);
        tips.put("dailyTip", clothing + ". " + reminder + ".");
        return tips;
    }

    private boolean hasText(String text) {
        return text != null && !text.trim().isEmpty();
    }

    private String safeText(Object value, String fallback) {
        if (value == null) {
            return fallback;
        }
        String text = value.toString().trim();
        return text.isEmpty() || "null".equalsIgnoreCase(text) ? fallback : text;
    }

    private int toInt(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        return 0;
    }

    private double toDouble(Object value) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        return 0;
    }

    private String weatherText(int code) {
        if (code == 0) return "Clear sky";
        if (code <= 3) return "Cloudy";
        if (code <= 48) return "Foggy";
        if (code <= 67) return "Rainy";
        if (code <= 77) return "Snowy";
        if (code <= 82) return "Rain showers";
        if (code <= 99) return "Thunderstorm";
        return "Unknown";
    }
}
