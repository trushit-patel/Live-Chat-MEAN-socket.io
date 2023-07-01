import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from './../myConfig'
import { User } from '../_models';

@Injectable({ providedIn: 'root' })
export class UserService {
	constructor(private http: HttpClient) { }

	getAll() {
		return this.http.get(`${config.baseApiUrl}/users/usersMe`);
	}

  getAllUsersExceptOne() {
		return this.http.get(`${config.baseApiUrl}/users/exceptMe`);
	}

	register(user: any) {
		return this.http.post(`${config.baseApiUrl}/users/registerMe`, user);
	}

	delete(id: number) {
		return this.http.delete(`${config.baseApiUrl}/users/${id}`);
	}
}
