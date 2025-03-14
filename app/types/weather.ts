// 날씨 데이터 타입 정의
export interface WeatherItem {
  category: string;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
}

export interface ProcessedWeatherData {
  date: string;
  time: string;
  temp: number | null;
  minTemp: number | null;
  maxTemp: number | null;
  sky: string | null;
  pty: string | null;
  pop: number | null;
  reh: number | null;
  wsd: number | null;
  pcpCategory: string;
  pcpText: string;
  pcpValue: string | null;
  snoCategory: string;
  snoText: string;
  snoValue: string | null;
  maxPcpValue: string | null;
  maxSnoValue: string | null;
  // 원본 API 필드 (디버깅 및 직접 접근용)
  _TMP?: string;
  _TMN?: string;
  _TMX?: string;
  _POP?: string;
  _PTY?: string;
  _SKY?: string;
  _WSD?: string;
  _REH?: string;
  [key: string]: any; // 기타 원본 API 필드를 위한 인덱스 시그니처
}

export interface DailyWeatherData {
  date: string;
  dayOfWeek: string;
  minTemp: number | null;
  maxTemp: number | null;
  sky: string | null;
  pty: string | null;
  pop: number | null;
  pcpCategory: string;
  pcpText: string;
  pcpValue: string | null;
  snoCategory: string;
  snoText: string;
  snoValue: string | null;
  maxPcpValue: string | null;
  maxPcpCategory: string;
  maxPcpText: string;
  maxSnoValue: string | null;
  maxSnoCategory: string;
  maxSnoText: string;
  wsd: number | null;
  hourlyData: ProcessedWeatherData[];
}

export interface WeatherForecastProps {
  nx: number;
  ny: number;
  locationName: string;
  selectedDate?: string; // 선택한 날짜 (YYYY-MM-DD 형식)
  landRegId?: string; // 육상 중기예보 지역 코드
  taRegId?: string; // 기온 중기예보 지역 코드
}

export interface CampingTip {
  icon: any;
  title: string;
  message: string;
  style?: Record<string, any>;
}

export interface WeatherDataHookResult {
  processedData: ProcessedWeatherData[];
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  error: any;
  lastUpdated: Date;
  refresh: () => Promise<void>;
}

// 빈 객체를 기본 내보내기로 추가
const WeatherExport = {};
export default WeatherExport; 