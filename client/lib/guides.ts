import type { Locale } from './seo'

type Guide = { title: string; description: string; intro: string; sections: { title: string; body: string }[]; faq: { q: string; a: string }[]; cta: string; href: string }
export const LAST_CHECKED = '2026-09-25'

export const guides: Record<Locale, Record<string, Guide>> = {
  th: {
    'market-price-freshness': {
      title: 'วิธีเช็คราคาไอเทม Albion Online Asia ทุกเมือง', description: 'วิธีค้นหาราคาไอเทม Albion Online Asia เปรียบเทียบทุกเมือง และอ่านเวลาของราคาตั้งขายกับคำสั่งซื้อ',
      intro: 'ค้นหาชื่อไอเทมหรือรหัสสินค้าเพื่อดูราคาที่ผู้เล่นรายงานในแต่ละเมืองบน Asia Server ข้อมูลมาจาก Albion Online Data Project จึงควรตรวจเวลาของราคาทุกครั้งก่อนซื้อขาย',
      sections: [
        { title: 'ค้นหาสินค้าและเลือกเมือง', body: 'เปิดหน้าค้นหาราคา พิมพ์ Bag, Sword หรือ Potion หรือใส่รหัสไอเทมอย่าง T4_BAG จากนั้นเปิดการ์ดสินค้าที่ตรงชื่อ ดูราคาของแต่ละเมือง และเลือกเฉพาะเมืองที่ต้องการเปรียบเทียบได้' },
        { title: 'อ่าน Best Sell กับ Best Buy Order', body: 'Best Sell คือราคาตั้งขายต่ำสุดที่รายงาน เหมาะสำหรับดูต้นทุนเมื่อจะซื้อ ส่วน Best Buy Order คือคำสั่งซื้อสูงสุดที่รายงาน เหมาะสำหรับดูราคาที่อาจขายทันทีได้ แต่คำสั่งซื้ออาจเปลี่ยนก่อนคุณเข้าเกม' },
        { title: 'ตัวอย่างการอ่านราคา', body: 'สมมติกระเป๋า Best Sell 10,000 Silver ที่ Bridgewatch และ Best Buy Order 12,000 ที่ Martlock ส่วนต่าง 2,000 ยังไม่ใช่กำไรสุทธิ ต้องตรวจเวลาอัปเดตทั้งสองฝั่ง หักภาษี และดูว่าคำสั่งซื้อยังอยู่ในเกม' },
        { title: 'Fresh, Old และปริมาณขาย', body: 'Fresh หมายถึงรายงานไม่เกิน 30 นาที; Old คือเก่ากว่านั้นหรือไม่มีเวลาอัปเดต เวลาของราคาตั้งขายกับคำสั่งซื้อแยกกัน ประวัติยอดขาย 7 วันช่วยประเมินว่ามีการซื้อขาย แต่ไม่รับประกันว่าจะขายสินค้าของคุณได้ครบ' },
      ],
      faq: [
        { q: 'ทำไมบางเมืองไม่มีราคา?', a: 'อาจยังไม่มีผู้ใช้ AODP Client รายงานราคาที่ใช้ได้ของสินค้านั้นในเมืองดังกล่าว' },
        { q: 'ราคาเหมือนในเกมเสมอหรือไม่?', a: 'ไม่ ตลาดเปลี่ยนได้ตลอด ควรตรวจในเกมก่อนใช้เงินจำนวนมาก' },
        { q: 'ควรดูราคาไหนตอนซื้อ?', a: 'ดู Best Sell และตรวจเวลาอัปเดตของราคาตั้งขายฝั่งนั้น' },
        { q: 'ควรดูราคาไหนตอนขายทันที?', a: 'ดู Best Buy Order และตรวจว่าคำสั่งซื้อยังอยู่ในเกม' },
      ], cta: 'ค้นหาราคาสินค้า', href: '/th',
    },
    'trade-route-profit-tax': {
      title: 'หาเงินด้วยการซื้อขายข้ามเมือง Albion Asia', description: 'วิธีใช้ Route Planner และโอกาสซื้อขาย Albion Asia พร้อมคำนวณกำไรหลังภาษีและตรวจความสดของราคา',
      intro: 'ซื้อเมืองหนึ่งแล้วขายอีกเมืองอาจได้กำไร แต่ส่วนต่างราคายังไม่ใช่กำไรจริง เครื่องมือใช้สมมติฐานภาษี 6.5% และช่วยคัดเส้นทางจากรายงานของผู้เล่น',
      sections: [
        { title: 'ใช้ Route Planner กับสินค้าที่สนใจ', body: 'ค้นหาสินค้า เปิด Route Planner บนการ์ด เลือกเมืองต้นทาง จำนวน คุณภาพ และวิธีขาย เลือก “ตั้งขาย” เพื่อเทียบราคาตั้งขายที่อาจต้องรอ หรือ “ขายทันที” เพื่อเทียบ Buy Order ที่ยังต้องตรวจว่ามีอยู่จริง' },
        { title: 'เริ่มจากหน้าโอกาสวันนี้', body: 'หากยังไม่รู้จะซื้ออะไร ให้เปิดหน้าโอกาสวันนี้ เลือกเงินทุน 50K, 100K, 500K หรือกำหนดเอง และเมืองต้นทาง ระบบตรวจสินค้าที่คัดไว้ 50 รายการ ตัวกรองขั้นสูงกำหนดกำไรขั้นต่ำ ยอดขายต่อวัน อายุข้อมูล และวิธีขายได้' },
        { title: 'ตัวอย่างกำไรหลังหักภาษี', body: 'ซื้อ 10 ชิ้น ชิ้นละ 5,000 ใช้ทุน 50,000 Silver ขายชิ้นละ 6,000 ได้รายรับ 60,000 ก่อนหักภาษี หากใช้สมมติฐานภาษี 6.5% จะเหลือ 56,100 และกำไรประมาณ 6,100 ก่อนค่าเดินทาง การตั้งขายซ้ำ และสินค้าที่ขายไม่หมด' },
        { title: 'เช็กก่อนออกเดินทาง', body: 'ดูเวลาต้นทางกับปลายทางแยกกัน เทียบจำนวนสินค้าที่จะขนกับปริมาณขายย้อนหลัง และตรวจราคาในเกมจริง หากข้อมูล 2 ชั่วโมงไม่มีผล คุณเลือกดูข้อมูลได้ถึง 24 ชั่วโมง แต่ข้อมูลเก่าควรใช้สำรวจเท่านั้น' },
      ],
      faq: [
        { q: 'ทำไมกำไรจริงต่างจากเว็บ?', a: 'ราคาอาจเปลี่ยน สินค้าอาจขายไม่หมด และค่าธรรมเนียมจริงขึ้นกับ Premium และวิธีขาย' },
        { q: 'ตั้งขายกับขายทันทีต่างกันอย่างไร?', a: 'ตั้งขายอาจได้ราคาสูงกว่าแต่ต้องรอ ส่วนขายทันทีรับ Buy Order ได้เงินเร็วกว่าแต่คำสั่งซื้ออาจหายไป' },
        { q: 'ควรเริ่มด้วยเงินเท่าไร?', a: 'เริ่มจำนวนน้อยเพื่อทดสอบว่าซื้อและขายได้จริงก่อนเพิ่มทุน' },
        { q: 'ข้อมูลเก่าใช้ได้ไหม?', a: 'ใช้สำรวจแนวคิดได้ แต่ต้องตรวจราคาทั้งสองเมืองในเกมก่อนเดินทาง' },
      ], cta: 'ค้นหาโอกาสซื้อขาย', href: '/th/opportunities',
    },
    'black-market-asia': {
      title: 'วิธีขาย Black Market Albion และคำนวณกำไร', description: 'เปรียบเทียบ Buy Order ของ Black Market Albion Asia กับราคาต้นทาง พร้อมดูเวลา ปริมาณขาย และความเสี่ยงขนส่ง',
      intro: 'Black Market ใน Caerleon รับซื้ออุปกรณ์จากผู้เล่นเพื่อนำไปเป็น loot ของเกม ราคาที่ต่างจากเมืองอื่นเป็นเพียงจุดเริ่มต้น ต้องดูคำสั่งซื้อจริงและความเสี่ยงในการเดินทางด้วย',
      sections: [
        { title: 'หาไอเทมที่อาจขายได้', body: 'ค้นหาอุปกรณ์ที่สนใจ ดูราคาตั้งขายต่ำสุดในเมืองต้นทาง และดู Best Buy Order ของ Black Market จากนั้นเปิด Route Planner เลือกเมืองต้นทางและ “ขายทันที” เพื่อเทียบกับคำสั่งซื้อ ไม่ใช้ราคาตั้งขายแทนราคา Buy Order' },
        { title: 'ตัวอย่างการประเมิน', body: 'สมมติซื้อเกราะ 20,000 Silver แล้ว Black Market มี Buy Order 27,000 ส่วนต่าง 7,000 ยังไม่ได้หักค่าใช้จ่ายหรือความเสี่ยง ตรวจเวลาของสองราคาและคำสั่งซื้อในเกมก่อนขน อย่าคิดว่าหลายชิ้นจะขายได้ราคาเดียวกัน' },
        { title: 'ปริมาณขายและความเสี่ยง', body: 'เปิดประวัติราคาเพื่อดูปริมาณที่รายงาน แล้วเปรียบเทียบกับจำนวนที่ต้องการขาย เส้นทางเข้า Caerleon อาจผ่านพื้นที่อันตราย เครื่องมือไม่ได้คิดมูลค่าความเสี่ยงของสินค้าที่อาจสูญเสีย' },
      ],
      faq: [
        { q: 'Black Market อยู่ที่ไหน?', a: 'อยู่ใน Caerleon และทำงานต่างจากตลาดผู้เล่นทั่วไป' },
        { q: 'ควรใช้ราคาตั้งขายหรือ Buy Order?', a: 'หากต้องการขายทันทีให้เทียบกับ Buy Order ของ Black Market' },
        { q: 'กำไรสูงแปลว่าดีเสมอไหม?', a: 'ไม่ ข้อมูลเก่า ปริมาณขายต่ำ หรือความเสี่ยงระหว่างทางอาจลบกำไรทั้งหมด' },
        { q: 'เว็บรวมความเสี่ยงการถูกฆ่าในกำไรหรือไม่?', a: 'ไม่ ผู้เล่นต้องประเมินเส้นทาง อุปกรณ์ และมูลค่าที่อาจสูญเสียเอง' },
      ], cta: 'เปรียบเทียบราคากับ Black Market', href: '/th',
    },
    'gold-premium-asia': {
      title: 'ราคาทองและค่า Premium Albion Online Asia', description: 'วิธีอ่านราคาทอง Albion Online Asia จากกราฟ พร้อมเวลาอัปเดต ช่วงสูงต่ำ และความเกี่ยวข้องกับค่า Premium',
      intro: 'กราฟทองแสดงข้อมูลที่ชุมชนรายงานบน Asia Server ไม่ใช่ราคาสดจากเกม ราคาทองมีผลต่อ Silver ที่ต้องใช้ซื้อ Premium แต่เว็บยังไม่ได้คำนวณราคา Premium จริง',
      sections: [
        { title: 'ดูกราฟราคาทอง Asia', body: 'เปิดหน้าตลาดทอง เลือกช่วง 7, 30 หรือ 90 วัน แล้วดูราคาล่าสุด เวลาอัปเดต ค่าสูงสุด ค่าต่ำสุด และจำนวนตัวอย่างในช่วงที่เลือก หากช่วงนั้นไม่มีข้อมูล เว็บจะแจ้งตามจริง ไม่ใช้ราคาจากช่วงอื่นแทน' },
        { title: 'Gold เกี่ยวกับค่า Premium อย่างไร', body: 'หาก Premium ใช้ Gold จำนวนเท่าเดิม แต่ Gold หนึ่งหน่วยแพงขึ้น จำนวน Silver ที่ต้องเตรียมก็อาจเพิ่มขึ้น ตรวจราคา Premium จริงในเกมเสมอ เพราะกราฟนี้ไม่ได้บอกจำนวน Gold ที่ต้องใช้ในขณะนั้น' },
        { title: 'ทำไมราคาจึงเปลี่ยน', body: 'ความต้องการ Premium ปริมาณ Gold ในตลาด กิจกรรมและการอัปเดตเกมอาจกระทบราคา กราฟย้อนหลังช่วยให้เห็นสิ่งที่เกิดขึ้นแล้ว แต่ไม่สามารถทำนายการซื้อขายครั้งต่อไปได้' },
      ],
      faq: [
        { q: 'กราฟคือราคาสดหรือไม่?', a: 'ไม่ เป็นข้อมูลล่าสุดที่แหล่งข้อมูลชุมชนมีอยู่ โปรดตรวจเวลาอัปเดต' },
        { q: 'เว็บคำนวณราคา Premium ให้หรือไม่?', a: 'ยังไม่คำนวณ ค่า Premium จริงควรตรวจในเกม' },
        { q: 'ทำไมบางช่วงไม่มีกราฟ?', a: 'ตัวอย่างที่มีอาจไม่ครอบคลุมช่วงที่เลือก ลองเลือกช่วงที่ยาวขึ้น' },
        { q: 'ราคาจะขึ้นต่อหรือไม่?', a: 'ไม่มีใครรับประกันได้ กราฟย้อนหลังไม่ใช่การพยากรณ์' },
      ], cta: 'ดูตลาดทอง Asia', href: '/th/gold',
    },
  },
  en: {
    'market-price-freshness': {
      title: 'Check Albion Online Asia Item Prices in Every City', description: 'Search Albion Online Asia item prices by city and learn to read listing prices, buy orders, timestamps, and volume.',
      intro: 'Search an item, compare city prices, and check when each side was reported. The Albion Online Data Project receives observations from players browsing in-game markets, so this is not a live game feed.',
      sections: [
        { title: 'Search and compare cities', body: 'Open the item search and type a name such as Bag, Sword, or Potion, or enter an item ID. Choose the matching item and compare city cards. Best Sell is the lowest reported listing you could buy from; Best Buy Order is the highest reported order you could sell into immediately.' },
        { title: 'Example: a bag between two cities', body: 'Suppose a bag shows Best Sell at 10,000 silver in Bridgewatch and Best Buy Order at 12,000 in Martlock. The 2,000-silver spread is not net profit. Check the update time for both prices, then account for tax, transport, and whether the buy order still exists in game.' },
        { title: 'Freshness and sales volume', body: 'Fresh means a price observation is no more than 30 minutes old. Old means it is older or its timestamp is missing. Sell and Buy Order timestamps are separate. Seven-day reported volume can suggest demand, but it does not guarantee your quantity will sell.' },
      ],
      faq: [
        { q: 'Why does a city have no price?', a: 'No contributor may have reported a usable price for that item and city.' },
        { q: 'Do prices always match the game?', a: 'No. Markets can change after a report. Verify important trades in game.' },
        { q: 'Which price should I check before buying?', a: 'Check Best Sell, the lowest reported listing, and its own timestamp.' },
        { q: 'Which price should I check to sell immediately?', a: 'Check Best Buy Order and its timestamp; the order may have changed.' },
      ], cta: 'Search Asia item prices', href: '/en',
    },
    'trade-route-profit-tax': {
      title: 'Find Albion Asia Trade Routes and Estimate Profit After Tax', description: 'Use the Route Planner or Opportunities to compare city prices, tax, freshness, and reported sales volume.',
      intro: 'A profitable trade needs more than a price difference. Compare the purchase city and sale city, account for the displayed 6.5% tax assumption, and check both timestamps before travelling.',
      sections: [
        { title: 'Use the Route Planner', body: 'Search an item and open its Route Planner. Choose an origin city, quantity, quality, and sell method. “List for sale” uses a reported listing price but may require waiting; “Quick sell” uses a reported buy order and may execute sooner if the order still exists.' },
        { title: 'Start with Opportunities', body: 'For a broader search, open Daily Asia Opportunities. Choose a budget and origin city; the tool screens 50 selected items. Use advanced filters for minimum profit, daily volume, data age, and sell method. If two-hour data is empty, you may explicitly inspect reports up to 24 hours old.' },
        { title: 'Example: calculate a route', body: 'Buying ten items for 5,000 silver each costs 50,000. Selling ten at 6,000 returns 60,000 before charges. With the displayed 6.5% tax assumption, estimated proceeds are 56,100 and estimated profit is 6,100 silver before transport, relisting, and unsold stock.' },
        { title: 'Before travelling', body: 'Check source and target timestamps separately, compare your quantity with reported volume, and confirm both prices in game. Start small when demand is uncertain. A listing price does not guarantee a sale.' },
      ],
      faq: [
        { q: 'Why can actual profit differ?', a: 'Prices and orders can move; stock may not sell, and your actual fees depend on Premium and the sell method.' },
        { q: 'What is the difference between listing and quick selling?', a: 'Listing asks a price and may take time. Quick selling accepts a buy order if one remains available.' },
        { q: 'How much should I invest?', a: 'Test liquidity with a small quantity before committing more silver.' },
        { q: 'Can I use older reports?', a: 'Use them to explore ideas, then verify both markets in game before trading.' },
      ], cta: 'Find Asia trade opportunities', href: '/en/opportunities',
    },
    'black-market-asia': {
      title: 'Sell to the Albion Asia Black Market: Orders and Risks', description: 'Compare Albion Asia Black Market buy orders with source prices, freshness, volume, and transport risk.',
      intro: 'The Black Market in Caerleon buys gear from players for the game loot system. A spread between a royal city and a Black Market buy order is only a starting point; transport and stale prices can erase it.',
      sections: [
        { title: 'Find a candidate item', body: 'Search for a piece of equipment. Compare its lowest reported listing in a source city with the Black Market Best Buy Order. Open the Route Planner, select the source city, and choose Quick sell to compare buy orders rather than ordinary listings.' },
        { title: 'Example: check net proceeds', body: 'If a piece of armor costs 20,000 silver and the Black Market buy order is 27,000, the 7,000 spread is before charges and travel risk. Check both timestamps and the actual order in game; do not assume you can sell multiple pieces at that price.' },
        { title: 'Volume and transport risk', body: 'Review reported sales volume and the quantity you plan to carry. Routes to Caerleon can pass through dangerous areas. The calculator cannot price the risk of losing your cargo, and historical volume cannot guarantee an immediate sale.' },
      ],
      faq: [
        { q: 'Where is the Black Market?', a: 'It is in Caerleon and operates differently from a regular player market.' },
        { q: 'Should I use a listing price or a buy order?', a: 'For an immediate sale, compare with the Black Market buy order.' },
        { q: 'Is the highest margin always best?', a: 'No. Old observations, low volume, and transport risk can erase the apparent gain.' },
        { q: 'Does the estimate include the risk of being killed?', a: 'No. Judge the route and how much cargo you can afford to lose yourself.' },
      ], cta: 'Compare Black Market item prices', href: '/en',
    },
    'gold-premium-asia': {
      title: 'Albion Online Asia Gold Prices and Premium Costs', description: 'Read the Albion Online Asia gold price chart, update time, sample count, and factors affecting Premium costs.',
      intro: 'The gold chart shows community-reported observations for Asia, not a direct live quote. Gold prices can affect the silver needed for Premium, but this site does not calculate the current in-game Premium price.',
      sections: [
        { title: 'Read the Asia gold chart', body: 'Open the gold page and choose a 7, 30, or 90-day range. Compare the latest reported price and update time with the high, low, and number of samples in the selected period. If a range has no observations, the chart says so.' },
        { title: 'How Gold relates to Premium', body: 'When more silver is needed per Gold, a Gold-denominated Premium purchase can require more silver, assuming the Gold amount stays the same. Check the actual Premium price in game: the chart alone does not give a final cost.' },
        { title: 'Why prices change', body: 'Player demand for Premium, gold supply, game events, and updates can move prices. A historical trend describes previous observations; it does not predict the next trade.' },
      ],
      faq: [
        { q: 'Is this a live in-game Gold price?', a: 'No. It is the latest observation available from the community data source; check the timestamp.' },
        { q: 'Does this site calculate the Premium cost?', a: 'No. Check the current Premium amount in game.' },
        { q: 'Why is my selected chart range empty?', a: 'The available observations may not cover that period. Try a longer range.' },
        { q: 'Should I buy Gold because the chart rose?', a: 'A past rise is not a reliable forecast or a recommendation to buy.' },
      ], cta: 'View Asia gold prices', href: '/en/gold',
    },
  },
}
