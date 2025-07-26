import { HookFormProvider } from "@/provider"
import { LoginForm, LogoBlock } from "./components"
import { LoginFieldValues } from "./types"
import { Button } from "@workspace/ui/components/button";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
} from "@workspace/ui/components/card"

const defaultValues: LoginFieldValues = {
  email: '',
  password: '',
}

const Login = () => {
  return (
    <div className="flex justify-center flex-wrap mt-10">
      <LogoBlock />
      <HookFormProvider<LoginFieldValues> options={{ defaultValues }}>
        <Card className="w-full max-w-sm">
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full">
              로그인
            </Button>
          </CardFooter>
          <CardAction className="flex justify-center items-center w-full">
            <CardDescription>
              계정이 없으신가요?
            </CardDescription>
            <Button variant="link">회원가입</Button>
          </CardAction>
        </Card >
      </HookFormProvider >
    </div>
  )
}

export default Login;