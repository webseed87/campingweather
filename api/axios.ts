import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://apis.data.go.kr/1360000',
  timeout: 15000, // 15초 타임아웃 설정
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance; 