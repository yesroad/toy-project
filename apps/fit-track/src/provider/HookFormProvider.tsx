'use client';

import { Form } from "@workspace/ui/components/Form";
import { ReactNode } from "react";
import { useForm, FieldValues, UseFormProps } from "react-hook-form";

interface IProps<T extends FieldValues> {
  children: ReactNode;
  options?: UseFormProps<T>;
}

const HookFormProvider = <T extends FieldValues>({ children, options }: IProps<T>) => {
  const methods = useForm<T>(options);

  return (
    <Form {...methods}>
      {children}
    </Form>
  )
};

export default HookFormProvider;
