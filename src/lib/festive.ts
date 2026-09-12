import { db } from '@/lib/db';

export interface FestiveCard {
  id: string;
  type: 'image' | 'video';
  mediaUrl: string;
  badge: string;
  badgeIcon?: string;
  tag: string;
  title: string;
  subtitle: string;
  footerText?: string;
  linkUrl?: string;
  linkText?: string;
}

export interface FestiveConfig {
  enabled: boolean;
  headerTag: string;
  headerTagIcon?: string;
  brandPrefix: string;
  mainTitle: string;
  subtitle: string;
  primaryBtnText: string;
  shareBtnText: string;
  posterModalImage?: string;
  tickerText: string;
  tickerWebsite: string;
  tickerOffice: string;
  cards: FestiveCard[];
}

export const DEFAULT_FESTIVE_CONFIG: FestiveConfig = {
  enabled: true,
  headerTag: 'श्रीकृष्ण जन्माष्टमी एवं लॉन्च विशेष',
  headerTagIcon: '✨',
  brandPrefix: 'दैनिक मान्यवर',
  mainTitle: 'लॉन्च एवं सनातन विशेष',
  subtitle: 'इस पावन अवसर पर आपके अपने समाचार पत्र का नया डिजिटल अवतार — सच की धारा, जन-जन की पुकार',
  primaryBtnText: 'बड़ा पोस्टर देखें',
  shareBtnText: 'शेयर करें',
  posterModalImage: '/imgg.jpg',
  tickerText: 'दैनिक मान्यवर - निष्पक्ष, निर्भीक, जन-सरोकारों को समर्पित पत्रकारिता',
  tickerWebsite: 'www.dainikmanyavar.com',
  tickerOffice: 'जौनपुर / लखनऊ',
  cards: [
    {
      id: 'card-1',
      type: 'image',
      mediaUrl: '/imgg.jpg',
      badge: 'लॉन्च',
      badgeIcon: '🔥',
      tag: 'आधिकारिक घोषणा',
      title: 'दैनिक मान्यवर का लॉन्च',
      subtitle: 'नई सोच, नई ऊर्जा और नए संकल्प के साथ... सच की धारा, जन-जन की पुकार',
      footerText: '📱 QR कोड स्कैन कर वेबसाइट देखें',
      linkUrl: '',
      linkText: 'विस्तार से',
    },
    {
      id: 'card-2',
      type: 'video',
      mediaUrl: '/sanatan1.mp4',
      badge: 'श्रीकृष्ण जन्मोत्सव',
      badgeIcon: '🦚',
      tag: 'सनातन रील #1',
      title: 'माखन चोर, नंद किशोर | पावन दही हांडी उत्सव',
      subtitle: 'दैनिक मान्यवर का विशेष डिजिटल अनावरण व दिव्य प्रस्तुति',
      footerText: '',
      linkUrl: '',
      linkText: '',
    },
    {
      id: 'card-3',
      type: 'video',
      mediaUrl: '/sanatan2.mp4',
      badge: 'काशी दिव्य गंगा आरती',
      badgeIcon: '🔱',
      tag: 'सनातन रील #2',
      title: 'हर हर गंगे | काशी के पावन घाट व प्रभात आरती',
      subtitle: 'सनातन संस्कृति, भारतीय धरोहर एवं दैनिक मान्यवर संदेश',
      footerText: '',
      linkUrl: '',
      linkText: '',
    },
  ],
};

export async function getFestiveConfig(): Promise<FestiveConfig> {
  try {
    const settings = await db.siteSetting.findMany({
      where: {
        key: { in: ['festive_section_enabled', 'festive_section_data'] },
      },
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    const isEnabled = settingsMap['festive_section_enabled'] !== 'false';
    const rawData = settingsMap['festive_section_data'];

    if (!rawData) {
      return {
        ...DEFAULT_FESTIVE_CONFIG,
        enabled: isEnabled,
      };
    }

    try {
      const parsed = JSON.parse(rawData);
      return {
        ...DEFAULT_FESTIVE_CONFIG,
        ...parsed,
        enabled: isEnabled,
      };
    } catch {
      return {
        ...DEFAULT_FESTIVE_CONFIG,
        enabled: isEnabled,
      };
    }
  } catch (err) {
    console.error('Error fetching festive config:', err);
    return DEFAULT_FESTIVE_CONFIG;
  }
}
