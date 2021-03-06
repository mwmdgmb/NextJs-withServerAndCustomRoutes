
import auth0 from 'auth0-js';
import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';

const CLIENT_ID = process.env.CLIENT_ID;

class Auth0 {
	constructor() {
		this.auth0 = new auth0.WebAuth({
			domain: 'dev-5z8osyph.auth0.com',
			clientID: CLIENT_ID,
			redirectUri: `${process.env.BASE_URL}/callback`,
			responseType: 'token id_token',
			scope: 'openid profile'
		});
		this.login = this.login.bind(this);
		this.logout = this.logout.bind(this);
		this.handleAuthentication = this.handleAuthentication.bind(this);
	}

	handleAuthentication() {
		return new Promise((reject, resolve) => {
			this.auth0.parseHash((err, authResult) => {
				if (authResult && authResult.accessToken && authResult.idToken) {
					this.setSession(authResult);
					resolve();
				} else if (err) {
					reject(err);
					console.log(err);
				}
			});
		});
	}

	login() {
		this.auth0.authorize();
	}
	setSession(authResult) {
		// save token
		const expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime());

		Cookies.set('jwt', authResult.idToken);
	}

	logout() {
		Cookies.remove('jwt');
		this.auth0.logout({
			returnTo: 'https://mohammad-garmabi.now.sh',
			clientID: CLIENT_ID
		});
	}

	verifyToken(token) {
		if (token) {
			const decodedToken = jwt.decode(token);
			const expirestAt = decodedToken.exp * 1000;

			return ( decodedToken && new Date().getTime() < expirestAt) ? decodedToken : undefined;
		}
		return undefined;
	}

	clientAuth() {
		// return this.isAuthenticated();
		const token = Cookies.getJSON('jwt');
		const verifiedToken = this.verifyToken(token);
		return verifiedToken;
	}

	 serverAuth(req) {
		if (req.headers.cookie) {
			const tokenCookie = req.headers.cookie.split(';').find((c) => c.trim().startsWith('jwt='));

			if (!tokenCookie) {
				return undefined;
			}

			const token = tokenCookie.split('=')[1];
			const verifiedToken = this.verifyToken(token);

			return verifiedToken;
		}
		return undefined;
	}
}

const auth0Client = new Auth0();
export default auth0Client;
