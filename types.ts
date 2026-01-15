export enum PricingStage {
  EARLY = 'EARLY',
  REGULAR = 'REGULAR',
  LATE = 'LATE',
  CLOSED = 'CLOSED'
}

export interface PricingTier {
  id: PricingStage;
  name: string;
  price: number;
  formattedPrice: string;
  startDate: Date;
  endDate: Date | null;
  features: string[];
}

export enum Category {
  PRINCIPIANTE = 'PRINCIPIANTE',
  INTERMEDIO = 'INTERMEDIO',
}

export enum Gender {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
}

export interface RegistrationFormData {
  fullName: string;
  documentId: string;
  age: string;
  phone: string;
  email: string;
  category: Category | '';
  gender: Gender | '';
  shirtSize: string;
  gym: string;
  emergencyName: string;
  emergencyPhone: string;
  paymentMethod: string;
  termsAccepted: boolean;
  paymentProof: File | null;
}

export interface FormErrors {
  [key: string]: string;
}

export enum RegistrationStatus {
  PENDING = 'PENDING_VALIDATION',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Registration {
  id: string;
  registration_id: string;
  full_name: string;
  document_id: string;
  age: number;
  phone: string;
  email: string;
  category: string;
  gender: string;
  shirt_size?: string;
  gym: string;
  emergency_name: string;
  emergency_phone: string;
  payment_method: string;
  status: RegistrationStatus;
  payment_proof_path: string;
  rejection_notes?: string;
  created_at: string;
}