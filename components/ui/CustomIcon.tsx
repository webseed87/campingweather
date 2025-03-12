import React from 'react';
import { SvgXml } from 'react-native-svg';
import { View } from 'react-native';

// 텐트 아이콘 SVG
const tentIcon = `
<svg width="58" height="47" viewBox="0 0 58 47" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_75_12)">
<path d="M41.4789 27C40.9593 27 40.454 26.7373 40.1688 26.2652L25.7249 2.27254C25.2957 1.55879 25.5321 0.636538 26.2556 0.211499C26.9781 -0.21354 27.9127 0.0220362 28.3419 0.735781L42.7859 24.7284C43.2151 25.4422 42.9787 26.3644 42.2552 26.7895C42.0116 26.9328 41.7427 27.001 41.4789 27.001V27Z" fill="currentColor"/>
<path d="M16.5211 27C16.2562 27 15.9883 26.9318 15.7448 26.7884C15.0223 26.3634 14.7848 25.4412 15.2141 24.7274L29.658 0.735763C30.0873 0.0220179 31.0218 -0.212556 31.7444 0.211481C32.4669 0.63652 32.7043 1.55877 32.2751 2.27252L17.8311 26.2652C17.547 26.7383 17.0406 27 16.5211 27Z" fill="currentColor"/>
<path d="M27.5951 19.5698L24.9192 24.3144C24.3479 25.3279 25.0897 26.5759 26.2637 26.5759H31.7353C32.9225 26.5759 33.6633 25.3038 33.0656 24.2904L30.27 19.5458C29.6692 18.5273 28.1755 18.5413 27.5941 19.5708L27.5951 19.5698Z" fill="currentColor"/>
</g>
</svg>
`;

// 위치 아이콘 SVG
const locationIcon = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
</svg>
`;

// 정보 아이콘 SVG
const infoIcon = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="currentColor"/>
</svg>
`;

// 아이콘 타입 정의
export type IconName = 'tent' | 'location' | 'info';

interface CustomIconProps {
  name: IconName;
  size?: number;
  color: string;
}

export const CustomIcon: React.FC<CustomIconProps> = ({ name, size = 24, color }) => {
  // 아이콘 선택
  let iconSvg;
  switch (name) {
    case 'tent':
      iconSvg = tentIcon;
      break;
    case 'location':
      iconSvg = locationIcon;
      break;
    case 'info':
      iconSvg = infoIcon;
      break;
    default:
      iconSvg = tentIcon;
  }

  // SVG 색상 변경을 위해 currentColor를 실제 색상으로 대체
  const svgWithColor = iconSvg.replace(/currentColor/g, color);

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <SvgXml xml={svgWithColor} width={size} height={size} />
    </View>
  );
};

export default CustomIcon; 