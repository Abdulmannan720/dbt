export interface StateOption {
  code: string;
  name: string;
  aliases: string[];
}

export const INDIAN_STATES: StateOption[] = [
  { code: 'IN-AN', name: 'Andaman and Nicobar Islands', aliases: ['andaman', 'nicobar'] },
  { code: 'IN-AP', name: 'Andhra Pradesh', aliases: ['andhra pradesh', 'andhra', 'ap'] },
  { code: 'IN-AR', name: 'Arunachal Pradesh', aliases: ['arunachal'] },
  { code: 'IN-AS', name: 'Assam', aliases: ['assam', 'asom'] },
  { code: 'IN-BR', name: 'Bihar', aliases: ['bihar', 'gaya', 'patna', 'muzaffarpur', 'bhagalpur', 'darbhanga'] },
  { code: 'IN-CH', name: 'Chandigarh', aliases: ['chandigarh'] },
  { code: 'IN-CT', name: 'Chhattisgarh', aliases: ['chhattisgarh', 'raipur'] },
  { code: 'IN-DL', name: 'Delhi (NCT)', aliases: ['delhi', 'new delhi', 'ncr'] },
  { code: 'IN-GA', name: 'Goa', aliases: ['goa'] },
  { code: 'IN-GJ', name: 'Gujarat', aliases: ['gujarat', 'ahmedabad', 'surat'] },
  { code: 'IN-HR', name: 'Haryana', aliases: ['haryana', 'gurgaon', 'gurugram'] },
  { code: 'IN-HP', name: 'Himachal Pradesh', aliases: ['himachal', 'shimla'] },
  { code: 'IN-JK', name: 'Jammu and Kashmir', aliases: ['jammu', 'kashmir', 'srinagar'] },
  { code: 'IN-JH', name: 'Jharkhand', aliases: ['jharkhand', 'ranchi', 'jamshedpur'] },
  { code: 'IN-KA', name: 'Karnataka', aliases: ['karnataka', 'bengaluru', 'bangalore', 'mysuru'] },
  { code: 'IN-KL', name: 'Kerala', aliases: ['kerala', 'kochi', 'thiruvananthapuram'] },
  { code: 'IN-LA', name: 'Ladakh', aliases: ['ladakh', 'leh'] },
  { code: 'IN-MP', name: 'Madhya Pradesh', aliases: ['madhya pradesh', 'mp', 'bhopal', 'indore', 'jabalpur', 'gwalior', 'rewa'] },
  { code: 'IN-MH', name: 'Maharashtra', aliases: ['maharashtra', 'mumbai', 'pune', 'nagpur', 'nashik'] },
  { code: 'IN-MN', name: 'Manipur', aliases: ['manipur', 'imphal'] },
  { code: 'IN-ML', name: 'Meghalaya', aliases: ['meghalaya', 'shillong'] },
  { code: 'IN-MZ', name: 'Mizoram', aliases: ['mizoram', 'aizawl'] },
  { code: 'IN-NL', name: 'Nagaland', aliases: ['nagaland', 'kohima'] },
  { code: 'IN-OR', name: 'Odisha', aliases: ['odisha', 'orissa', 'bhubaneswar', 'cuttack'] },
  { code: 'IN-PB', name: 'Punjab', aliases: ['punjab', 'amritsar', 'ludhiana'] },
  { code: 'IN-RJ', name: 'Rajasthan', aliases: ['rajasthan', 'jaipur', 'jodhpur', 'udaipur', 'kota'] },
  { code: 'IN-SK', name: 'Sikkim', aliases: ['sikkim', 'gangtok'] },
  { code: 'IN-TN', name: 'Tamil Nadu', aliases: ['tamil nadu', 'chennai', 'coimbatore', 'madurai'] },
  { code: 'IN-TG', name: 'Telangana', aliases: ['telangana', 'hyderabad'] },
  { code: 'IN-TR', name: 'Tripura', aliases: ['tripura', 'agartala'] },
  { code: 'IN-UP', name: 'Uttar Pradesh', aliases: ['uttar pradesh', 'up', 'lucknow', 'kanpur', 'varanasi', 'agra', 'prayagraj', 'gorakhpur'] },
  { code: 'IN-UT', name: 'Uttarakhand', aliases: ['uttarakhand', 'dehradun', 'haridwar'] },
  { code: 'IN-WB', name: 'West Bengal', aliases: ['west bengal', 'kolkata', 'howrah'] },
];

export function getStateNameByCode(code: string | null): string {
  if (!code) return 'Any State (Central)';
  const match = INDIAN_STATES.find((s) => s.code === code);
  return match ? match.name : code;
}

export function getStateShortName(code: string | null): string {
  if (!code) return 'Central';
  const match = INDIAN_STATES.find((s) => s.code === code);
  return match ? match.name : code;
}
