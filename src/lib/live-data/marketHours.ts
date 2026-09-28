/**
 * Indian Stock Market (NSE/BSE) Hours & Session Calculator
 * All checks use Indian Standard Time (IST, UTC+5:30)
 */

import { MarketSessionState } from './types';

export interface MarketSessionInfo {
  state: MarketSessionState;
  labelHindi: string;
  isLiveTrading: boolean;
  nextSessionTime?: string;
  currentIstTime: string;
}

export function getIndianMarketSession(): MarketSessionInfo {
  // Convert current time to Indian Standard Time (IST)
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const istTime = new Date(utcMs + 5.5 * 3600000);

  const dayOfWeek = istTime.getDay(); // 0 is Sunday, 6 is Saturday
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  const currentIstTimeStr = istTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  // Check Weekend
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      state: 'WEEKEND',
      labelHindi: 'बाजार बंद (सप्ताहांत)',
      isLiveTrading: false,
      nextSessionTime: 'सोमवार सुबह 09:15 बजे',
      currentIstTime: currentIstTimeStr,
    };
  }

  // Pre-Open Session: 09:00 AM to 09:15 AM IST (540 to 555 mins)
  if (currentMinutes >= 540 && currentMinutes < 555) {
    return {
      state: 'PRE_OPEN',
      labelHindi: 'प्री-ओपन सत्र (9:00 - 9:15 AM)',
      isLiveTrading: false,
      nextSessionTime: 'सामान्य ट्रेडिंग 09:15 AM',
      currentIstTime: currentIstTimeStr,
    };
  }

  // Live Trading Hours: 09:15 AM to 03:30 PM IST (555 to 930 mins)
  if (currentMinutes >= 555 && currentMinutes < 930) {
    return {
      state: 'OPEN',
      labelHindi: 'कारोबार जारी (LIVE)',
      isLiveTrading: true,
      currentIstTime: currentIstTimeStr,
    };
  }

  // Market Closed (After 3:30 PM IST or before 9:00 AM IST)
  return {
    state: 'CLOSED',
    labelHindi: 'बाजार बंद (Market Closed)',
    isLiveTrading: false,
    nextSessionTime: currentMinutes < 540 ? 'आज सुबह 09:15 AM' : 'अगले कारोबारी दिन सुबह 09:15 AM',
    currentIstTime: currentIstTimeStr,
  };
}
