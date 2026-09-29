import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppSettings } from 'src/appSettings';
import { Category } from 'src/models/category.model';

export interface ApiResponse {
  status: string;
  message: string;
}

export interface RegisterUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  username: string;
  currentPassword: string;
  newPassword: string;
}

@Injectable()
export class AdminService {
  constructor(private http: HttpClient) { }

  async changePassword(request: ChangePasswordRequest) {
    return await this.http.post<ApiResponse>(AppSettings.API_CHANGE_PASSWORD, request)
      .pipe(catchError(this.handleError)).toPromise();
  }

  async createUser(request: RegisterUserRequest, isAdministrator: boolean) {
    const url = isAdministrator ? AppSettings.API_CREATE_ADMIN : AppSettings.API_CREATE_USER;
    return await this.http.post<ApiResponse>(url, request)
      .pipe(catchError(this.handleError)).toPromise();
  }

  async deleteUser(username: string) {
    return await this.http.delete<ApiResponse>(AppSettings.API_DELETE_USER, { body: { username } })
      .pipe(catchError(this.handleError)).toPromise();
  }

  async createCategory(category: Category) {
    return await this.http.post<ApiResponse>(AppSettings.API_CREATE_CATEGORY, category)
      .pipe(catchError(this.handleError)).toPromise();
  }

  async deleteCategory(category: Category) {
    return await this.http.post<ApiResponse>(AppSettings.API_DELETE_CATEGORY, category)
      .pipe(catchError(this.handleError)).toPromise();
  }

  private handleError(caught: any) {
    return throwError(caught?.error ?? caught);
  }
}