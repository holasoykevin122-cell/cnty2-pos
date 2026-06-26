import React from 'react';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
import { colors } from '../theme';

export type IconName =
  | 'chart'
  | 'bag'
  | 'tag'
  | 'plus'
  | 'search'
  | 'camera'
  | 'image'
  | 'trash'
  | 'edit'
  | 'chevronRight'
  | 'chevronDown'
  | 'trendUp'
  | 'trendDown'
  | 'x'
  | 'minus'
  | 'check'
  | 'box'
  | 'arrowLeft'
  | 'cart'
  | 'sparkle'
  | 'calendar'
  | 'logout'
  | 'wallet';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
};

export function Icon({
  name,
  size = 22,
  color = colors.text,
  strokeWidth = 2,
  fill = 'none',
}: Props) {
  const s = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {render(name, s)}
    </Svg>
  );
}

function render(name: IconName, s: any) {
  switch (name) {
    case 'chart':
      return (
        <>
          <Line x1={18} y1={20} x2={18} y2={10} {...s} />
          <Line x1={12} y1={20} x2={12} y2={4} {...s} />
          <Line x1={6} y1={20} x2={6} y2={14} {...s} />
        </>
      );
    case 'bag':
      return (
        <>
          <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" {...s} />
          <Line x1={3} y1={6} x2={21} y2={6} {...s} />
          <Path d="M16 10a4 4 0 0 1-8 0" {...s} />
        </>
      );
    case 'cart':
      return (
        <>
          <Circle cx={9} cy={21} r={1} {...s} fill={s.stroke} />
          <Circle cx={20} cy={21} r={1} {...s} fill={s.stroke} />
          <Path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" {...s} />
        </>
      );
    case 'tag':
      return (
        <>
          <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" {...s} />
          <Line x1={7} y1={7} x2={7.01} y2={7} {...s} />
        </>
      );
    case 'plus':
      return (
        <>
          <Line x1={12} y1={5} x2={12} y2={19} {...s} />
          <Line x1={5} y1={12} x2={19} y2={12} {...s} />
        </>
      );
    case 'minus':
      return <Line x1={5} y1={12} x2={19} y2={12} {...s} />;
    case 'search':
      return (
        <>
          <Circle cx={11} cy={11} r={8} {...s} />
          <Line x1={21} y1={21} x2={16.65} y2={16.65} {...s} />
        </>
      );
    case 'camera':
      return (
        <>
          <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" {...s} />
          <Circle cx={12} cy={13} r={4} {...s} />
        </>
      );
    case 'image':
      return (
        <>
          <Rect x={3} y={3} width={18} height={18} rx={2} {...s} />
          <Circle cx={8.5} cy={8.5} r={1.5} {...s} />
          <Path d="M21 15l-5-5L5 21" {...s} />
        </>
      );
    case 'trash':
      return (
        <>
          <Path d="M3 6h18" {...s} />
          <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" {...s} />
        </>
      );
    case 'edit':
      return (
        <>
          <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" {...s} />
          <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" {...s} />
        </>
      );
    case 'chevronRight':
      return <Path d="M9 18l6-6-6-6" {...s} />;
    case 'chevronDown':
      return <Path d="M6 9l6 6 6-6" {...s} />;
    case 'arrowLeft':
      return (
        <>
          <Line x1={19} y1={12} x2={5} y2={12} {...s} />
          <Path d="M12 19l-7-7 7-7" {...s} />
        </>
      );
    case 'trendUp':
      return (
        <>
          <Path d="M23 6l-9.5 9.5-5-5L1 18" {...s} />
          <Path d="M17 6h6v6" {...s} />
        </>
      );
    case 'trendDown':
      return (
        <>
          <Path d="M23 18l-9.5-9.5-5 5L1 6" {...s} />
          <Path d="M17 18h6v-6" {...s} />
        </>
      );
    case 'x':
      return (
        <>
          <Line x1={18} y1={6} x2={6} y2={18} {...s} />
          <Line x1={6} y1={6} x2={18} y2={18} {...s} />
        </>
      );
    case 'check':
      return <Path d="M20 6L9 17l-5-5" {...s} />;
    case 'box':
      return (
        <>
          <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" {...s} />
          <Path d="M3.27 6.96L12 12.01l8.73-5.05" {...s} />
          <Line x1={12} y1={22.08} x2={12} y2={12} {...s} />
        </>
      );
    case 'sparkle':
      return (
        <Path
          d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z"
          {...s}
        />
      );
    case 'calendar':
      return (
        <>
          <Rect x={3} y={4} width={18} height={18} rx={2} {...s} />
          <Line x1={3} y1={9} x2={21} y2={9} {...s} />
          <Line x1={8} y1={2} x2={8} y2={6} {...s} />
          <Line x1={16} y1={2} x2={16} y2={6} {...s} />
        </>
      );
    case 'logout':
      return (
        <>
          <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" {...s} />
          <Path d="M16 17l5-5-5-5" {...s} />
          <Line x1={21} y1={12} x2={9} y2={12} {...s} />
        </>
      );
    case 'wallet':
      return (
        <>
          <Path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" {...s} />
          <Path d="M3 5v14a2 2 0 0 0 2 2h16v-5" {...s} />
          <Path d="M18 12a2 2 0 0 0 0 4h4v-4z" {...s} />
        </>
      );
    default:
      return null;
  }
}
