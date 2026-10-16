export function redirectToSso() {
	const ssoUrl = import.meta.env.VITE_SSO_URL?.trim();
	if (!ssoUrl) throw new Error("VITE_SSO_URL is required to renew authentication");
	const destination = new URL(ssoUrl);
	if (destination.protocol !== "https:" && destination.protocol !== "http:") {
		throw new Error("VITE_SSO_URL must be an HTTP or HTTPS URL");
	}
	window.location.replace(destination.href);
}
