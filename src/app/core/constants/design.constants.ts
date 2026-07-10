import { SelectOption } from '../models/design.models';

export const CUSTOMER_OPTIONS: SelectOption[] = [
  { label: 'ABC Jewellers', value: '1' },
  { label: 'Royal Gems Pvt Ltd', value: '2' },
  { label: 'Diamond Palace', value: '3' },
  { label: 'Golden Heritage', value: '4' },
  { label: 'Silver Spark', value: '5' },
  { label: 'Platinum Craft', value: '6' },
  { label: 'Emerald House', value: '7' },
  { label: 'Pearl Boutique', value: '8' },
];

export const BRANCH_OPTIONS: SelectOption[] = [
  { label: 'Mumbai HQ', value: 'Mumbai HQ' },
  { label: 'Delhi Branch', value: 'Delhi Branch' },
  { label: 'Chennai Branch', value: 'Chennai Branch' },
  { label: 'Kolkata Branch', value: 'Kolkata Branch' },
  { label: 'Bangalore Branch', value: 'Bangalore Branch' },
];

export const CATEGORY_OPTIONS: SelectOption[] = [
  { label: 'Ring', value: 'Ring' },
  { label: 'Necklace', value: 'Necklace' },
  { label: 'Bracelet', value: 'Bracelet' },
  { label: 'Earring', value: 'Earring' },
  { label: 'Pendant', value: 'Pendant' },
  { label: 'Bangle', value: 'Bangle' },
];

export const SUB_CATEGORY_OPTIONS: SelectOption[] = [
  { label: 'Wedding', value: 'Wedding' },
  { label: 'Bridal', value: 'Bridal' },
  { label: 'Casual', value: 'Casual' },
  { label: 'Traditional', value: 'Traditional' },
  { label: 'Modern', value: 'Modern' },
  { label: 'Antique', value: 'Antique' },
];

export const MATERIAL_OPTIONS: SelectOption[] = [
  { label: 'Gold', value: 'Gold' },
  { label: 'Silver', value: 'Silver' },
  { label: 'Platinum', value: 'Platinum' },
  { label: 'Diamond', value: 'Diamond' },
];

export const PURITY_OPTIONS: SelectOption[] = [
  { label: '18K', value: '18K' },
  { label: '22K', value: '22K' },
  { label: '24K', value: '24K' },
  { label: '925', value: '925' },
  { label: '950', value: '950' },
];

export const DESIGNER_OPTIONS: SelectOption[] = [
  { label: 'John Mathew', value: 'John Mathew' },
  { label: 'Sarah Thomas', value: 'Sarah Thomas' },
  { label: 'Ravi Kumar', value: 'Ravi Kumar' },
  { label: 'Emily Chen', value: 'Emily Chen' },
  { label: 'Priya Sharma', value: 'Priya Sharma' },
  { label: 'Michael Brown', value: 'Michael Brown' },
];

export const STATUS_OPTIONS: SelectOption[] = [
  { label: 'Approved', value: 'Approved' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Inactive', value: 'Inactive' },
];

export const SIMULATED_TOTAL_RECORDS = 100_000;
export const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];
