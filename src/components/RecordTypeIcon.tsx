import type { RecordType } from '@/types';

interface Props {
  type: RecordType;
  strokeColor: string;
  size?: number;
}

export function RecordTypeIcon({ type, strokeColor, size = 22 }: Props) {
  const svgProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24' as const,
    fill: 'none' as const,
    stroke: strokeColor,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (type) {
    case 'lab_report':
      return (
        <svg {...svgProps}>
          <path d="M14 2v6h6M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/>
          <path d="M9 15h6M9 11h2"/>
        </svg>
      );
    case 'prescription':
      return (
        <svg {...svgProps}>
          <path d="M10 2v4M14 2v4M9 16l2 2 4-4"/>
          <rect x="4" y="4" width="16" height="18" rx="2"/>
        </svg>
      );
    case 'imaging':
      return (
        <svg {...svgProps}>
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="9" cy="9" r="2"/>
          <path d="m21 15-5-5L5 21"/>
        </svg>
      );
    case 'vaccination':
      return (
        <svg {...svgProps}>
          <path d="M19 14c1.5-1.5 2-3 2-5a5 5 0 0 0-10 0c0 2 .5 3.5 2 5"/>
          <circle cx="14" cy="9" r="1"/>
          <path d="M5 15c1.5 1.5 2 3 2 5"/>
        </svg>
      );
    case 'consultation':
      return (
        <svg {...svgProps}>
          <path d="M8 2v4M16 2v4M3 10h18"/>
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
        </svg>
      );
    case 'discharge_summary':
      return (
        <svg {...svgProps}>
          <path d="M14 2v6h6M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/>
          <path d="M9 13h6M9 17h4"/>
        </svg>
      );
    default:
      return (
        <svg {...svgProps}>
          <path d="M14 2v6h6M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/>
          <path d="M9 15h6M9 11h2"/>
        </svg>
      );
  }
}
