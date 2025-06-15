import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/Form";
import { Input } from "@workspace/ui/components/input";
import { Control, FieldValues, Path, RegisterOptions, UseFormProps } from "react-hook-form";


interface InputProps<T extends FieldValues> {
  control: Control<T>;
  label: string;
  name: Path<T>;
  type: string;
  placeholder: string;
  rules?: RegisterOptions<T, Path<T>>;
}

const FormInput = <T extends FieldValues>({ control, label, name, type, placeholder, rules }: InputProps<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem className="mb-[15px]">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type={type} placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default FormInput;