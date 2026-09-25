import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Category } from 'src/models/category.model';
import { User } from 'src/models/user.model';
import { AdminService, ApiResponse } from 'src/services/admin.service';
import { CategoriesService } from 'src/services/categories.service';
import { HomePageState } from 'src/services/home.state';
import { ToastService } from 'src/services/toast.service';
import { UserSessionService } from 'src/services/userSession.service';
import { UsersService } from 'src/services/users.service';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'admin-root',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class adminComponent implements OnInit {
  currentPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';

  newUsername: string = '';
  newUserEmail: string = '';
  newUserPassword: string = '';
  confirmUserPassword: string = '';
  newUserRole: string = 'user';
  selectedUser: User = null;

  newCategoryName: string = '';
  selectedCategory: Category = null;

  isSavingPassword: boolean = false;
  isSavingUser: boolean = false;
  isDeletingUser: boolean = false;
  isSavingCategory: boolean = false;
  isDeletingCategory: boolean = false;

  passwordSectionExpanded: boolean = false;
  userSectionExpanded: boolean = false;
  categorySectionExpanded: boolean = false;

  readonly userRoleOptions = [
    { label: 'User', value: 'user' },
    { label: 'Administrator', value: 'admin' }
  ];

  constructor(
    private router: Router,
    private adminService: AdminService,
    private categoriesService: CategoriesService,
    private usersService: UsersService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    public homePageState: HomePageState,
    public userSessionService: UserSessionService) { }

  async ngOnInit(): Promise<void> {
    if (!this.isLoggedIn) {
      this.showLoginRequired();
      return;
    }

    if (this.isAdmin)
      await this.refreshManagementData();
  }

  get isLoggedIn(): boolean {
    return this.userSessionService.userIsLoggedIn();
  }

  get isAdmin(): boolean {
    return this.userSessionService.getUserSession()?.isAdmin === true;
  }

  async changePassword() {
    const validationError = this.validatePasswordForm(
      this.currentPassword,
      this.newPassword,
      this.confirmNewPassword);

    if (validationError) {
      this.toastService.showError(validationError);
      return;
    }

    this.isSavingPassword = true;
    try {
      const response = await this.adminService.changePassword({
        username: this.userSessionService.getUserSession().username,
        currentPassword: this.currentPassword,
        newPassword: this.newPassword
      });
      this.toastService.showSuccess(this.responseMessage(response, 'Password changed successfully.'));
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmNewPassword = '';
    } catch (error) {
      this.toastService.showError(this.responseMessage(error, 'Unable to change password.'));
    } finally {
      this.isSavingPassword = false;
    }
  }

  async createUser() {
    if (!this.newUsername.trim() || !this.newUserEmail.trim()) {
      this.toastService.showError('Username and email are required.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(this.newUserEmail.trim())) {
      this.toastService.showError('Enter a valid email address.');
      return;
    }

    const validationError = this.validatePasswordForm('', this.newUserPassword, this.confirmUserPassword, false);
    if (validationError) {
      this.toastService.showError(validationError);
      return;
    }

    this.isSavingUser = true;
    try {
      const response = await this.adminService.createUser({
        username: this.newUsername.trim(),
        email: this.newUserEmail.trim(),
        password: this.newUserPassword
      }, this.newUserRole === 'admin');
      this.toastService.showSuccess(this.responseMessage(response, 'User created successfully.'));
      this.newUsername = '';
      this.newUserEmail = '';
      this.newUserPassword = '';
      this.confirmUserPassword = '';
      this.newUserRole = 'user';
      await this.refreshUsers();
    } catch (error) {
      this.toastService.showError(this.responseMessage(error, 'Unable to create user.'));
    } finally {
      this.isSavingUser = false;
    }
  }

  confirmDeleteUser() {
    if (!this.selectedUser) {
      this.toastService.showError('Select a user to delete.');
      return;
    }

    this.confirmationService.confirm({
      key: 'adminConfirm',
      header: 'Delete User',
      icon: 'pi pi-exclamation-triangle',
      message: `Delete user '${this.selectedUser.userName}'?`,
      accept: () => this.deleteUser()
    });
  }

  async deleteUser() {
    this.isDeletingUser = true;
    try {
      const response = await this.adminService.deleteUser(this.selectedUser.userName);
      this.toastService.showSuccess(this.responseMessage(response, 'User deleted successfully.'));
      this.selectedUser = null;
      await this.refreshUsers();
    } catch (error) {
      this.toastService.showError(this.responseMessage(error, 'Unable to delete user.'));
    } finally {
      this.isDeletingUser = false;
    }
  }

  async createCategory() {
    const categoryName = this.newCategoryName.trim();
    if (!categoryName) {
      this.toastService.showError('Category name is required.');
      return;
    }

    this.isSavingCategory = true;
    try {
      const response = await this.adminService.createCategory(new Category(undefined, categoryName));
      this.toastService.showSuccess(this.responseMessage(response, 'Category created successfully.'));
      this.newCategoryName = '';
      await this.refreshCategories();
    } catch (error) {
      this.toastService.showError(this.responseMessage(error, 'Unable to create category.'));
    } finally {
      this.isSavingCategory = false;
    }
  }

  confirmDeleteCategory() {
    if (!this.selectedCategory) {
      this.toastService.showError('Select a category to delete.');
      return;
    }

    this.confirmationService.confirm({
      key: 'adminConfirm',
      header: 'Delete Category',
      icon: 'pi pi-exclamation-triangle',
      message: `Delete category '${this.selectedCategory.category}'?`,
      accept: () => this.deleteCategory()
    });
  }

  async deleteCategory() {
    this.isDeletingCategory = true;
    try {
      const response = await this.adminService.deleteCategory(this.selectedCategory);
      this.toastService.showSuccess(this.responseMessage(response, 'Category deleted successfully.'));
      this.selectedCategory = null;
      await this.refreshCategories();
    } catch (error) {
      this.toastService.showError(this.responseMessage(error, 'Unable to delete category.'));
    } finally {
      this.isDeletingCategory = false;
    }
  }

  private validatePasswordForm(currentPassword: string, password: string, confirmation: string, requireCurrent: boolean = true): string {
    if (requireCurrent && !currentPassword)
      return 'Current password is required.';
    if (!password || !confirmation)
      return 'New password and confirmation are required.';
    if (password !== confirmation)
      return 'New password and confirmation must match.';
    if (password.length < 6 ||
        !/[a-z]/.test(password) ||
        !/[A-Z]/.test(password) ||
        !/\d/.test(password) ||
        !/[^A-Za-z0-9]/.test(password))
      return 'Password must be at least 6 characters and include uppercase, lowercase, number, and symbol characters.';
    return '';
  }

  private async refreshManagementData() {
    await Promise.all([this.refreshUsers(), this.refreshCategories()]);
  }

  private async refreshUsers() {
    try {
      this.homePageState.users = await this.usersService.GetUsers();
    } catch (error) {
      this.toastService.showError(this.responseMessage(error, 'Unable to load users.'));
    }
  }

  private async refreshCategories() {
    try {
      this.homePageState.categories = await this.categoriesService.GetCategories();
    } catch (error) {
      this.toastService.showError(this.responseMessage(error, 'Unable to load categories.'));
    }
  }

  private showLoginRequired() {
    this.confirmationService.confirm({
      key: 'adminConfirm',
      header: 'Login Required',
      icon: 'pi pi-lock',
      message: 'You must log in to use administration features.',
      acceptLabel: 'Ok',
      rejectVisible: false,
      accept: () => this.router.navigateByUrl('/home')
    });
  }

  private responseMessage(response: ApiResponse | any, fallback: string): string {
    return response?.message ?? response?.Message ?? response?.error?.message ?? response?.error?.Message ?? fallback;
  }
}