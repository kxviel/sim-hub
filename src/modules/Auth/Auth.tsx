import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthForm } from "@/modules/Auth/useAuthForm";

const Login = () => {
	const {
		authMode,
		email,
		domain,
		confirmPassword,
		isLoading,
		isRegistering,
		username,
		password,

		handleSubmit,
		setConfirmPassword,
		setDomain,
		setEmail,
		setUsername,
		setPassword,
		switchAuthMode,
	} = useAuthForm();

	return (
		<section className="flex flex-col items-center justify-center flex-1 w-screen bg-accent">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="font-semibold">
						{isRegistering ? "Create an Account" : "Sign in to Simulation Hub"}
					</CardTitle>
					<CardDescription>
						{isRegistering
							? "Register with your name, email, and password."
							: "Enter your credentials to login."}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={handleSubmit}>
						{authMode === "register" && (
							<div className="space-y-2">
								<Label htmlFor="name">Username</Label>
								<Input
									className=""
									id="username"
									type="text"
									placeholder="lol_whatsup"
									value={username}
									onChange={(event) => setUsername(event.target.value)}
									required
									disabled={isLoading}
								/>
							</div>
						)}

						{authMode === "register" && (
							<div className="space-y-2">
								<Label htmlFor="domain">SSH Domain</Label>
								<Input
									className=""
									id="domain"
									type="text"
									placeholder="example.hpc.domain"
									value={domain}
									onChange={(event) => setDomain(event.target.value)}
									required
									disabled={isLoading}
								/>
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								className=""
								id="email"
								type="email"
								placeholder="researcher@institute.org"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								required
								disabled={isLoading}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								className=""
								id="password"
								type="password"
								placeholder="Password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								required
								disabled={isLoading}
								minLength={6}
							/>
						</div>

						{authMode === "register" && (
							<div className="space-y-2">
								<Label htmlFor="confirmPassword">Confirm Password</Label>
								<Input
									className=""
									id="confirmPassword"
									type="password"
									placeholder="Password"
									value={confirmPassword}
									onChange={(event) => setConfirmPassword(event.target.value)}
									required
									disabled={isLoading}
									minLength={6}
								/>
							</div>
						)}

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading
								? isRegistering
									? "Creating account..."
									: "Signing in..."
								: isRegistering
									? "Create Account"
									: "Sign In"}
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex-col gap-2">
					<div className="mt-4 text-center text-sm">
						{isRegistering ? "Already registered?" : "Need an account?"}{" "}
						<Button
							type="button"
							variant="link"
							className="h-auto p-0  underline-offset-4"
							onClick={switchAuthMode}
						>
							{isRegistering ? "Sign in" : "Register"}
						</Button>
					</div>
				</CardFooter>
			</Card>
		</section>
	);
};

export default Login;
