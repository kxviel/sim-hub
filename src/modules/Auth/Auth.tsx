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
		email,
		handleSubmit,
		isLoading,
		isRegistering,
		name,
		password,
		setEmail,
		setName,
		setPassword,
		switchAuthMode,
	} = useAuthForm();

	return (
		<section className="flex flex-col items-center justify-center flex-1 w-screen bg-accent">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>
						{isRegistering ? "Create an account" : "Sign in to SimHub"}
					</CardTitle>
					<CardDescription>
						{isRegistering
							? "Register with your name, email, and password."
							: "Enter your credentials to login."}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={handleSubmit}>
						{isRegistering ? (
							<div className="space-y-2">
								<Label htmlFor="name">Name</Label>
								<Input
									className=""
									id="name"
									type="text"
									placeholder="Mr. Dr. Kevin"
									value={name}
									onChange={(event) => setName(event.target.value)}
									required
									disabled={isLoading}
								/>
							</div>
						) : null}

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
