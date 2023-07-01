import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { config } from './../myConfig'

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  constructor(private http: HttpClient) {}

  getUsersWithStatus() {
		return this.http.get(`${config.baseApiUrl}/users/status`);
	}

  getUserWithStatusExceptMe() {
		return this.http.get(`${config.baseApiUrl}/users/status/exceptMe`);
	}
}
