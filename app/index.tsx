import { ResizeMode, Video } from "expo-av";
import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { IconButton } from "react-native-paper";
import Animated, {
  FadeInDown,
  FadeInUp
} from "react-native-reanimated";
import getWeatherData, { SimplifiedWeather } from "../axios";

const { width, height } = Dimensions.get("window");

/* -------------------- VIDEO MAP -------------------- */
const WEATHER_VIDEOS = {
  clear: require("../assets/videos/clear-sky.webm"),
  clouds: require("../assets/videos/scattered-clouds.webm"),
  rain: require("../assets/videos/rain.webm"),
  mist: require("../assets/videos/mist.webm"),
  thunder: require("../assets/videos/thunderstorm.webm"),
  snow: require("../assets/videos/snow.webm"),
  default: require("../assets/videos/clear-sky.webm"),
};

export default function Index() {
  const [city, setCity] = useState("Kolkata");
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<SimplifiedWeather | null>(null);
  const [background, setBackground] = useState(WEATHER_VIDEOS.default);

  const dayArr = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  const getDate = () => {
    const d = new Date();
    return `${dayArr[d.getDay()]}, ${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
  };

  const setVideoFromCondition = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes("thunder")) setBackground(WEATHER_VIDEOS.thunder);
    else if (t.includes("rain") || t.includes("drizzle")) setBackground(WEATHER_VIDEOS.rain);
    else if (t.includes("snow")) setBackground(WEATHER_VIDEOS.snow);
    else if (t.includes("mist") || t.includes("fog")) setBackground(WEATHER_VIDEOS.mist);
    else if (t.includes("cloud")) setBackground(WEATHER_VIDEOS.clouds);
    else if (t.includes("clear")) setBackground(WEATHER_VIDEOS.clear);
    else setBackground(WEATHER_VIDEOS.default);
  };

  const handleSearch = async () => {
    if (!city.trim()) return;
    try {
      setLoading(true);
      const data = await getWeatherData(city);
      if (data) {
        setWeather(data);
        setVideoFromCondition(data.condition.text);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const dayIndex = new Date().getDay() + 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* BACKGROUND VIDEO */}
      <Video
        source={background}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.darkOverlay} />

      <View style={styles.safeArea}>
        {/* TOP SEARCH BAR */}
        <Animated.View entering={FadeInUp.delay(200).duration(1000)} style={styles.searchContainer}>
          <BlurView intensity={30} tint="light" style={styles.searchBlur}>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="Search city..."
              placeholderTextColor="#ddd"
              style={styles.input}
              onSubmitEditing={handleSearch}
            />
            <IconButton
              icon="magnify"
              iconColor="white"
              size={24}
              onPress={handleSearch}
              disabled={loading}
              style={styles.searchIcon}
            />
          </BlurView>
        </Animated.View>

        {weather && (
          <View style={styles.content}>
            {/* MAIN WEATHER INFO */}
            <Animated.View entering={FadeInDown.delay(400).duration(1000)} style={styles.mainInfo}>
              <Text style={styles.dateText}>{getDate()}</Text>
              <Text style={styles.locationText}>{weather.name}</Text>

              <View style={styles.tempContainer}>
                <Text style={styles.tempText}>{Math.round(weather.temp_c)}°</Text>
                <Image
                  source={{ uri: `https:${weather.condition.icon}` }}
                  style={styles.weatherIcon}
                />
              </View>

              <Text style={styles.conditionText}>{weather.condition.text}</Text>

              <BlurView intensity={20} tint="light" style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Humidity</Text>
                  <Text style={styles.detailValue}>{weather.humidity}%</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Country</Text>
                  <Text style={styles.detailValue}>{weather.country}</Text>
                </View>
              </BlurView>
            </Animated.View>

            {/* FORECAST SECTION */}
            <Animated.View entering={FadeInDown.delay(600).duration(1000)} style={styles.forecastContainer}>
              <Text style={styles.forecastTitle}>Daily Forecast</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.forecastScroll}
              >
                {weather.forecast.map((day, index) => (
                  <BlurView key={index} intensity={40} tint="light" style={styles.forecastCard}>
                    <Text style={styles.forecastDay}>
                      {dayArr[(dayIndex + index) % 7].substring(0, 3)}
                    </Text>
                    <Image
                      source={{ uri: `https:${day.condition.icon}` }}
                      style={styles.forecastIcon}
                    />
                    <Text style={styles.forecastTemp}>{Math.round(day.avg_temp_c)}°</Text>
                  </BlurView>
                ))}
              </ScrollView>
            </Animated.View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  safeArea: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  searchContainer: {
    marginBottom: 40,
  },
  searchBlur: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    paddingHorizontal: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 18,
    color: "white",
    fontWeight: "500",
  },
  searchIcon: {
    margin: 0,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 40,
  },
  mainInfo: {
    alignItems: "center",
  },
  dateText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  locationText: {
    color: "white",
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 5,
  },
  tempContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  tempText: {
    fontSize: 100,
    color: "white",
    fontWeight: "200",
  },
  weatherIcon: {
    width: 100,
    height: 100,
  },
  conditionText: {
    fontSize: 24,
    color: "white",
    fontWeight: "400",
    marginTop: -10,
  },
  detailsRow: {
    flexDirection: "row",
    marginTop: 40,
    borderRadius: 20,
    padding: 20,
    width: "100%",
    justifyContent: "space-around",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  detailItem: {
    alignItems: "center",
  },
  detailLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    marginBottom: 5,
  },
  detailValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  divider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    height: "100%",
  },
  forecastContainer: {
    marginTop: 20,
  },
  forecastTitle: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
    marginBottom: 15,
    marginLeft: 5,
  },
  forecastScroll: {
    paddingRight: 20,
  },
  forecastCard: {
    width: Dimensions.get("window").width / 2,
    height: 140,
    borderRadius: 25,
    padding: 15,
    alignItems: "center",
    marginRight: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "space-between",
  },
  forecastDay: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  forecastIcon: {
    width: 45,
    height: 45,
  },
  forecastTemp: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});

