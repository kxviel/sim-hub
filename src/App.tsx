import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function App() {
	const [name, setName] = useState("");

	return (
		<main className="antialiased flex flex-col min-h-svh w-screen">
			<Header />
			<Input
				id="greet-input"
				onChange={(e) => setName(e.currentTarget.value)}
				placeholder="Enter a name..."
			/>
			<Button>Greet</Button>
		</main>
	);
}

export default App;
