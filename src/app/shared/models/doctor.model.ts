export interface DoctorModel {
  id?: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  availableDays: string[];
  workingHours: string;
  status: 'Available' | 'On Leave' | 'Unavailable';
}