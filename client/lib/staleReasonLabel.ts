export function staleReasonLabel(reason: string, locale: 'th' | 'en'): string {
  if (locale === 'en') return reason
  return ({
    'Missing or invalid update time': 'ไม่มีเวลาอัปเดตที่ใช้ได้',
    'Price data is older than 30 minutes': 'ข้อมูลราคาเก่ากว่า 30 นาที',
    'Few cities have usable prices': 'มีข้อมูลราคาที่ใช้ได้เพียงไม่กี่เมือง',
    'Low recent sales volume': 'ยอดขายล่าสุดต่ำ',
  } as Record<string, string>)[reason] ?? 'ข้อมูลนี้มีข้อจำกัด โปรดตรวจราคาในเกม'
}
