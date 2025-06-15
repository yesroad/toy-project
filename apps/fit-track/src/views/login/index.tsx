
import { HookFormProvider } from "@/provider"
import { LoginForm } from "./components"
import { LoginFieldValues } from "./types"

const defaultValues: LoginFieldValues = {
  email: '',
  password: '',
}

const Login = () => {

  return (
    <HookFormProvider<LoginFieldValues> options={{ defaultValues }}>
      <LoginForm />
    </HookFormProvider>
  )
}

export default Login;