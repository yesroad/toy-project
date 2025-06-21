
import { HookFormProvider } from "@/provider"
import { LoginForm } from "./components"
import { LoginFieldValues } from "./types"
import Logo from '@/assets/logo.svg';
import { Button } from "@workspace/ui/components/button";

const defaultValues: LoginFieldValues = {
  email: '',
  password: '',
}

const Login = () => {
  return (
    <HookFormProvider<LoginFieldValues> options={{ defaultValues }}>
      <div className="h-full flex justify-center items-center">
        <div className="w-full max-w-[420px] flex justify-center flex-wrap">
          <Logo />
          <LoginForm />
          <Button size="lg" className="w-full mt-[20px]">로그인</Button>
        </div>
      </div>
    </HookFormProvider>
  )
}

export default Login;