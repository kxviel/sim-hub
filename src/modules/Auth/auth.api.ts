import { useMutation } from "@tanstack/react-query";

export type SignInBody = {
	email: string;
	password: string;
};

export type RegisterBody = SignInBody & {
	name: string;
};

export const signInAPI = async (body: SignInBody) => {
	const { data, error } = { data: "", error: "" };

	if (error) {
		throw error;
	}

	return data;
};

export const registerAPI = async ({ email, name, password }: RegisterBody) => {
	const { data, error } = { data: "", error: "" };
	// const { data, error } = await getBrowserSupabaseClient().auth.signUp({
	// 	email,
	// 	password,
	// 	options: {
	// 		data: {
	// 			full_name: name,
	// 		},
	// 	},
	// });

	if (error) {
		throw error;
	}

	return data;
};

export const useSignIn = () =>
	useMutation({
		mutationFn: signInAPI,
	});

export const useRegister = () =>
	useMutation({
		mutationFn: registerAPI,
	});
