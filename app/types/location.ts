export interface Location {
  id: string;
  name: string;
  district: string;
  nx: number;
  ny: number;
}

// 빈 객체를 기본 내보내기로 추가
const LocationExport = {};
export default LocationExport; 