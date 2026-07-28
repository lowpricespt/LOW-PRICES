import { apiClient } from '@/services/api';

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  postalCode: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
}

export type AddressInput = Omit<Address, 'id'>;

export async function fetchMyAddresses(): Promise<Address[]> {
  const { data } = await apiClient.get<Address[]>('/addresses');
  return data;
}

export async function createAddress(input: Partial<AddressInput>): Promise<Address> {
  const { data } = await apiClient.post<Address>('/addresses', input);
  return data;
}

export async function updateAddress(id: string, input: Partial<AddressInput>): Promise<Address> {
  const { data } = await apiClient.patch<Address>(`/addresses/${id}`, input);
  return data;
}

export async function deleteAddress(id: string): Promise<void> {
  await apiClient.delete(`/addresses/${id}`);
}
