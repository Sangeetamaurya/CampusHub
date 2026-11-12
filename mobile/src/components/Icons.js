import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

export function Icon({ name, size = 22, color = colors.text, strokeWidth = 1.8 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  switch (name) {
    case 'home':
      return (
        <Svg {...common}>
          <Path d="M4 10.5 12 4l8 6.5" />
          <Path d="M6.5 9.8V20h11V9.8" />
          <Path d="M10 20v-5.5h4V20" />
        </Svg>
      );
    case 'clipboard':
      return (
        <Svg {...common}>
          <Rect x="6" y="4.5" width="12" height="15.5" rx="2" />
          <Path d="M9 4.5h6v2.2H9z" />
          <Path d="M9 11h6M9 14.5h4" />
        </Svg>
      );
    case 'search':
      return (
        <Svg {...common}>
          <Circle cx="11" cy="11" r="6" />
          <Path d="m16 16 4 4" />
        </Svg>
      );
    case 'user':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="8" r="3.2" />
          <Path d="M5.5 19.2c1.4-2.8 3.6-4.2 6.5-4.2s5.1 1.4 6.5 4.2" />
        </Svg>
      );
    case 'users':
      return (
        <Svg {...common}>
          <Circle cx="9" cy="9" r="2.6" />
          <Path d="M4.2 18c1-2.2 2.6-3.3 4.8-3.3 2.2 0 3.8 1.1 4.8 3.3" />
          <Circle cx="16.2" cy="9.2" r="2.2" />
          <Path d="M15 14.8c1.6.2 2.9 1 3.8 2.6" />
        </Svg>
      );
    case 'plus':
      return (
        <Svg {...common}>
          <Path d="M12 5.5v13M5.5 12h13" />
        </Svg>
      );
    case 'bell':
      return (
        <Svg {...common}>
          <Path d="M6.5 16.5h11l-.8-1.6V10a4.7 4.7 0 0 0-9.4 0v4.9z" />
          <Path d="M10 16.5a2 2 0 0 0 4 0" />
        </Svg>
      );
    case 'check':
      return (
        <Svg {...common}>
          <Path d="m5.5 12.5 4.2 4.2L18.5 8" />
        </Svg>
      );
    case 'x':
      return (
        <Svg {...common}>
          <Path d="M7 7l10 10M17 7 7 17" />
        </Svg>
      );
    case 'clock':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="12" r="7.5" />
          <Path d="M12 8.2V12l2.8 2" />
        </Svg>
      );
    case 'alert':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="12" r="7.5" />
          <Path d="M12 8.2v5" />
          <Path d="M12 16.2h.01" />
        </Svg>
      );
    case 'calendar':
      return (
        <Svg {...common}>
          <Rect x="4" y="5.5" width="16" height="14" rx="2" />
          <Path d="M8 4v3M16 4v3M4 10h16" />
        </Svg>
      );
    case 'pin':
      return (
        <Svg {...common}>
          <Path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" />
          <Circle cx="12" cy="11" r="1.8" />
        </Svg>
      );
    case 'chevronLeft':
      return (
        <Svg {...common}>
          <Path d="M14.5 5.5 8 12l6.5 6.5" />
        </Svg>
      );
    case 'chevronRight':
      return (
        <Svg {...common}>
          <Path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
        </Svg>
      );
    case 'mail':
      return (
        <Svg {...common}>
          <Rect x="3.5" y="5.5" width="17" height="13" rx="2" />
          <Path d="m4.5 7 7.5 6L19.5 7" />
        </Svg>
      );
    case 'award':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="9" r="4.5" />
          <Path d="m8.5 12.5-1.5 7 5-2.4 5 2.4-1.5-7" />
        </Svg>
      );
    case 'briefcase':
      return (
        <Svg {...common}>
          <Rect x="3.5" y="7.5" width="17" height="12" rx="2" />
          <Path d="M9 7.5V6.2A1.2 1.2 0 0 1 10.2 5h3.6A1.2 1.2 0 0 1 15 6.2v1.3M3.5 12h17" />
        </Svg>
      );
    case 'book':
      return (
        <Svg {...common}>
          <Path d="M5 5.5h6.2A2.8 2.8 0 0 1 14 8.3V19a2.2 2.2 0 0 0-2.2-1.6H5z" />
          <Path d="M19 5.5h-6.2A2.8 2.8 0 0 0 10 8.3V19a2.2 2.2 0 0 1 2.2-1.6H19z" />
        </Svg>
      );
    case 'eye':
      return (
        <Svg {...common}>
          <Path d="M2.8 12S6.2 6.8 12 6.8 21.2 12 21.2 12 17.8 17.2 12 17.2 2.8 12 2.8 12z" />
          <Circle cx="12" cy="12" r="2.4" />
        </Svg>
      );
    case 'eyeOff':
      return (
        <Svg {...common}>
          <Path d="M4 5.5 19 19" />
          <Path d="M9.2 9.4A3 3 0 0 0 12 15a3 3 0 0 0 2.4-1.2" />
          <Path d="M6.2 7.8C4.2 9.2 2.8 12 2.8 12S6.2 17.2 12 17.2c1.3 0 2.5-.3 3.5-.7" />
          <Path d="M10 6.9c.6-.1 1.3-.1 2-.1 5.8 0 9.2 5.2 9.2 5.2s-.7 1.2-2 2.4" />
        </Svg>
      );
    default:
      return null;
  }
}
