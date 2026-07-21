import { useMutation } from "@tanstack/react-query";
import http from "@/lib/http";

export type SignInBody = {
	email: string;
	password: string;
};

export type RegisterBody = SignInBody & {
	username: string;
	domain: string;
};

export const signInAPI = async (body: SignInBody) => {
	return http.post("/auth/admin_login", body);
};

export const registerAPI = async (body: RegisterBody) => {
	return http.post(`/register`, body);
};

export const useSignIn = () =>
	useMutation({
		mutationFn: signInAPI,
	});

export const useRegister = () =>
	useMutation({
		mutationFn: registerAPI,
	});
