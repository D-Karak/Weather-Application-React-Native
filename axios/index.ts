import axios from "axios";
const APIKEY = process.env.APIKEY;
export interface SimplifiedWeather {
  name: string;
  region: string;
  country: string;
  condition: {
    text: string;
    icon: string;
    code: number;
  };
  humidity: number;
  temp_c: number;
  forecast: {
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    avg_temp_c: number;
  }[];
}
async function getWeatherData(city: string): Promise<SimplifiedWeather | void> {


  const url = `https://api.weatherapi.com/v1/forecast.json?key=${APIKEY}&q=${city}&days=5`;
  try {
    const response = await axios.get(url)
    const { current, forecast, location } = response.data;
    const { name, region, country } = location;
    const { condition, humidity, temp_c } = current;
    const [f_day, s_day, t_day] = forecast.forecastday;
    return (
      {
        name,
        region,
        country,
        condition,
        humidity,
        temp_c,
        forecast: [
          {
            condition: f_day.day.condition,
            avg_temp_c: f_day.day.avgtemp_c,
          },
          {
            condition: s_day.day.condition,
            avg_temp_c: s_day.day.avgtemp_c,
          },
          {
            condition: t_day.day.condition,
            avg_temp_c: t_day.day.avgtemp_c,
          }
        ]
      }
    )
  }
  catch (e) {
    console.log(e)
  }
}

export default getWeatherData
