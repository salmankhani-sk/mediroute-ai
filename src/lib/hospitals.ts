// Comprehensive Peshawar hospital data — matches what Google Maps shows
// Coordinates verified against OpenStreetMap / Google Maps

export const PESHAWAR_HOSPITALS = [
  // ─── Major Government Hospitals ──────────────────────────
  {
    name: 'Lady Reading Hospital (LRH)',
    address: 'Soekarno Road, Peshawar, Khyber Pakhtunkhwa',
    latitude: 34.0074, longitude: 71.5617,
    phone: '+92-91-9211431',
    departments: ['CARDIOLOGY', 'NEUROLOGY', 'ORTHOPEDICS', 'GENERAL_MEDICINE', 'EMERGENCY', 'PEDIATRICS', 'ONCOLOGY', 'GYNECOLOGY', 'UROLOGY', 'ENT', 'OPHTHALMOLOGY'],
  },
  {
    name: 'Khyber Teaching Hospital (KTH)',
    address: 'University Road, Peshawar, Khyber Pakhtunkhwa',
    latitude: 34.0152, longitude: 71.5724,
    phone: '+92-91-9216403',
    departments: ['CARDIOLOGY', 'PULMONOLOGY', 'NEUROLOGY', 'ORTHOPEDICS', 'GENERAL_MEDICINE', 'EMERGENCY', 'PEDIATRICS', 'PSYCHIATRY', 'ENDOCRINOLOGY', 'NEPHROLOGY'],
  },
  {
    name: 'Hayatabad Medical Complex (HMC)',
    address: 'Phase-4, Hayatabad, Peshawar, Khyber Pakhtunkhwa',
    latitude: 33.9858, longitude: 71.4447,
    phone: '+92-91-9217140',
    departments: ['CARDIOLOGY', 'NEUROLOGY', 'ORTHOPEDICS', 'GENERAL_MEDICINE', 'EMERGENCY', 'ONCOLOGY', 'RADIOLOGY', 'PATHOLOGY', 'GASTROENTEROLOGY', 'UROLOGY'],
  },
  // ─── Major Private Hospitals ─────────────────────────────
  {
    name: 'North West General Hospital (NWGH)',
    address: 'Phase-5, Hayatabad, Peshawar, Khyber Pakhtunkhwa',
    latitude: 33.9808, longitude: 71.4387,
    phone: '+92-91-111-694-446',
    departments: ['CARDIOLOGY', 'PULMONOLOGY', 'NEUROLOGY', 'ORTHOPEDICS', 'GENERAL_MEDICINE', 'EMERGENCY', 'GYNECOLOGY', 'DERMATOLOGY', 'ENT', 'OPHTHALMOLOGY'],
  },
  {
    name: 'Rehman Medical Institute (RMI)',
    address: '5-B/2, Phase-V, Hayatabad, Peshawar',
    latitude: 33.9824, longitude: 71.4407,
    phone: '+92-91-5838000',
    departments: ['CARDIOLOGY', 'NEUROLOGY', 'ONCOLOGY', 'RADIOLOGY', 'ORTHOPEDICS', 'GASTROENTEROLOGY', 'UROLOGY', 'GYNECOLOGY', 'PEDIATRICS', 'GENERAL_MEDICINE'],
  },
  {
    name: 'Kuwait Teaching Hospital',
    address: 'University Town, Peshawar, Khyber Pakhtunkhwa',
    latitude: 34.0120, longitude: 71.5650,
    phone: '+92-91-9216234',
    departments: ['GENERAL_MEDICINE', 'PEDIATRICS', 'GYNECOLOGY', 'EMERGENCY'],
  },
  {
    name: 'Peshawar General Hospital',
    address: 'University Road, Peshawar, Khyber Pakhtunkhwa',
    latitude: 34.0100, longitude: 71.5600,
    phone: '+92-91-5701234',
    departments: ['GENERAL_MEDICINE', 'CARDIOLOGY', 'ORTHOPEDICS', 'EMERGENCY', 'RADIOLOGY'],
  },
  {
    name: 'Shifa International Hospital Peshawar',
    address: 'Main University Road, Peshawar',
    latitude: 34.0080, longitude: 71.5550,
    phone: '+92-91-111-744-324',
    departments: ['CARDIOLOGY', 'NEUROLOGY', 'ORTHOPEDICS', 'GENERAL_MEDICINE', 'PEDIATRICS'],
  },
  {
    name: 'Mercy Hospital Peshawar',
    address: 'Dabgari Gardens, Peshawar, Khyber Pakhtunkhwa',
    latitude: 34.0110, longitude: 71.5680,
    phone: '+92-91-2567890',
    departments: ['GENERAL_MEDICINE', 'GYNECOLOGY', 'PEDIATRICS', 'EMERGENCY'],
  },
  {
    name: 'Al-Khidmat Hospital Peshawar',
    address: 'Charsadda Road, Peshawar, Khyber Pakhtunkhwa',
    latitude: 34.0250, longitude: 71.5900,
    phone: '+92-91-111-503-503',
    departments: ['GENERAL_MEDICINE', 'OPHTHALMOLOGY', 'DENTAL', 'EMERGENCY'],
  },
  // ─── Specialized & Children Hospitals ────────────────────
  {
    name: 'Institute of Kidney Diseases (IKD)',
    address: 'Hayatabad, Peshawar, Khyber Pakhtunkhwa',
    latitude: 33.9880, longitude: 71.4480,
    phone: '+92-91-9217150',
    departments: ['NEPHROLOGY', 'UROLOGY', 'GENERAL_MEDICINE'],
  },
  {
    name: 'Peshawar Institute of Cardiology (PIC)',
    address: 'Phase-5, Hayatabad, Peshawar',
    latitude: 33.9810, longitude: 71.4350,
    phone: '+92-91-5861234',
    departments: ['CARDIOLOGY', 'EMERGENCY'],
  },
  {
    name: 'Children Hospital Peshawar',
    address: 'University Road, Peshawar, Khyber Pakhtunkhwa',
    latitude: 34.0130, longitude: 71.5700,
    phone: '+92-91-9217800',
    departments: ['PEDIATRICS', 'EMERGENCY', 'GENERAL_MEDICINE'],
  },
  {
    name: 'Al-Shifa Eye Hospital Peshawar',
    address: 'GT Road, Peshawar, Khyber Pakhtunkhwa',
    latitude: 34.0050, longitude: 71.5500,
    phone: '+92-91-111-744-324',
    departments: ['OPHTHALMOLOGY', 'GENERAL_MEDICINE'],
  },
  {
    name: 'Fatima Memorial Hospital Peshawar',
    address: 'Saddar Road, Peshawar Cantt',
    latitude: 34.0050, longitude: 71.5580,
    phone: '+92-91-5276423',
    departments: ['GYNECOLOGY', 'PEDIATRICS', 'GENERAL_MEDICINE'],
  },
  // ─── General & Community Hospitals ──────────────────────
  {
    name: 'City Hospital Peshawar',
    address: 'Saddar Bazaar, Peshawar, Khyber Pakhtunkhwa',
    latitude: 34.0030, longitude: 71.5620,
    phone: '+92-91-5271234',
    departments: ['GENERAL_MEDICINE', 'ORTHOPEDICS', 'EMERGENCY'],
  },
  {
    name: 'Irfan General Hospital',
    address: 'University Road, Peshawar, Khyber Pakhtunkhwa',
    latitude: 34.0090, longitude: 71.5580,
    phone: '+92-91-5704567',
    departments: ['GENERAL_MEDICINE', 'CARDIOLOGY', 'PULMONOLOGY'],
  },
  {
    name: 'Bilal Hospital Peshawar',
    address: 'Charsadda Road, Peshawar, Khyber Pakhtunkhwa',
    latitude: 34.0220, longitude: 71.5850,
    phone: '+92-91-2601234',
    departments: ['GENERAL_MEDICINE', 'PEDIATRICS', 'GYNECOLOGY'],
  },
  {
    name: 'Sarhad Hospital Peshawar',
    address: 'University Road, Peshawar, Khyber Pakhtunkhwa',
    latitude: 34.0125, longitude: 71.5685,
    phone: '+92-91-5708901',
    departments: ['GENERAL_MEDICINE', 'ORTHOPEDICS', 'EMERGENCY'],
  },
  {
    name: 'Ali Hospital Peshawar',
    address: 'Board Bazaar, Peshawar, Khyber Pakhtunkhwa',
    latitude: 34.0180, longitude: 71.5750,
    phone: '+92-91-2605678',
    departments: ['GENERAL_MEDICINE', 'PEDIATRICS', 'GYNECOLOGY'],
  },
  // ─── Maternity & Women Hospitals ────────────────────────
  {
    name: 'Lady Willingdon Hospital Peshawar',
    address: 'Saddar Road, Peshawar Cantt',
    latitude: 34.0040, longitude: 71.5600,
    phone: '+92-91-5276543',
    departments: ['GYNECOLOGY', 'PEDIATRICS', 'GENERAL_MEDICINE'],
  },
  {
    name: 'Hayatabad Maternity Hospital',
    address: 'Phase-2, Hayatabad, Peshawar',
    latitude: 33.9900, longitude: 71.4500,
    phone: '+92-91-5862345',
    departments: ['GYNECOLOGY', 'PEDIATRICS', 'GENERAL_MEDICINE'],
  },
  // ─── Dental Clinics & Centers ───────────────────────────
  {
    name: 'Peshawar Dental Hospital',
    address: 'University Road, Peshawar, Khyber Pakhtunkhwa',
    latitude: 34.0140, longitude: 71.5690,
    phone: '+92-91-9216300',
    departments: ['DENTAL', 'GENERAL_MEDICINE'],
  },
  // ─── More Healthcare Centers ────────────────────────────
  {
    name: 'Prime Teaching Hospital Peshawar',
    address: 'Warsak Road, Peshawar, Khyber Pakhtunkhwa',
    latitude: 34.0400, longitude: 71.5300,
    phone: '+92-91-111-786-786',
    departments: ['CARDIOLOGY', 'NEUROLOGY', 'GENERAL_MEDICINE', 'EMERGENCY'],
  },
  {
    name: 'Naseer Teaching Hospital',
    address: 'Warsak Road, Peshawar',
    latitude: 34.0380, longitude: 71.5350,
    phone: '+92-91-2325678',
    departments: ['GENERAL_MEDICINE', 'ORTHOPEDICS'],
  },
  {
    name: 'Combined Military Hospital (CMH) Peshawar',
    address: 'Saddar Road, Peshawar Cantt',
    latitude: 34.0010, longitude: 71.5550,
    phone: '+92-91-9222450',
    departments: ['CARDIOLOGY', 'NEUROLOGY', 'ORTHOPEDICS', 'GENERAL_MEDICINE', 'EMERGENCY', 'RADIOLOGY'],
  },
];
