"use client"

import { useFormContext } from "react-hook-form";
import { FormInput } from "@/components";
import { LoginFieldValues } from "../../types";

type LoginFormItem = {
  label: string;
  name: keyof LoginFieldValues & string;
  type: string;
  placeholder: string;
}[]

const DATA: LoginFormItem = [
  {
    label: '이메일',
    name: 'email',
    type: 'email',
    placeholder: '이메일을 입력하세요.'
  },
  {
    label: '비밀번호',
    name: 'password',
    type: 'password',
    placeholder: '비밀번호를 입력하세요.'
  },
]

const LoginForm = () => {
  const { control } = useFormContext<LoginFieldValues>();

  return (
    <div className="w-full mt-[40px]">
      {
        DATA.map(({ label, name, type, placeholder }) => (
          <FormInput key={name} control={control} label={label} type={type} name={name} placeholder={placeholder} />)
        )
      }
    </div>
  )
}

export default LoginForm;