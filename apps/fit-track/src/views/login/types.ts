import { FieldValues } from 'react-hook-form';

export interface LoginFieldValues extends FieldValues {
  email: string;
  password: string;
}
