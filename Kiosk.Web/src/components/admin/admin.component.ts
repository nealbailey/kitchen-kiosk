//-----------------------------------------------------------------------
// Source File:  "admin.component.ts"
// Create Date:  09/25/2026 10:18:00 AM
// Last Updated: 09/25/2026 10:18:00 AM
// Authors(s):   Neal Bailey <nealbailey@hotmail.com>
//-----------------------------------------------------------------------
// COMMERCIAL USE RIGHTS - PROHIBITED PUBLIC DISTRIBUTION
// Intellectual Property Rights Holder: Neal Bailey
// Software Rights Holder: Neal Bailey
//-----------------------------------------------------------------------
// The licensee's rights to use, modify, reproduce, release, perform,
// display, or disclose this technical data/computer software are
// restricted by US patent copyright protections. any reproduction
// of this technical data/computer software or portions thereof marked
// with this legend must also reproduce the all original markings.
//-----------------------------------------------------------------------
// Copyright (c) 2012-2022 Baileysoft Solutions.
//-----------------------------------------------------------------------
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

  /**
   * Constructor for the admin component.
   * @param router The Angular Router service for navigation.
   * @param adminService The service for admin-related API calls.
   * @param categoriesService The service for category-related API calls.
   * @param usersService The service for user-related API calls.
   * @param toastService The service for displaying toast notifications.
   * @param confirmationService The service for displaying confirmation dialogs.
   * @param homePageState The state management service for the home page.
   * @param userSessionService The service for managing user session information.
   */
  constructor(
    private router: Router,
    private adminService: AdminService,
    private categoriesService: CategoriesService,
    private usersService: UsersService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    public homePageState: HomePageState,
    public userSessionService: UserSessionService) { }

  // #region Component initialization
  async ngOnInit(): Promise<void> {
    if (!this.isLoggedIn) {
      this.showLoginRequired();
      return;
    }

    if (this.isAdmin)
      await this.refreshManagementData();
  }
  // #endregion

  // #region Getters
  get isLoggedIn(): boolean {
    return this.userSessionService.userIsLoggedIn();
  }

  get isAdmin(): boolean {
    return this.userSessionService.getUserSession()?.isAdmin === true;
  }
  // #endregion

  // #region Methods and Event Handlers
  /**
   * Changes the password for the currently logged-in user.
   * Validates the current, new, and confirm new password fields.
   * Displays success or error messages based on the result.
   */
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

  /**
   * Creates a new user with the specified username, email, password, and role.
   * Validates the input fields and displays success or error messages based on the result.
   */
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

  /**
   * Confirms the deletion of the selected user by displaying a confirmation dialog.
   * If confirmed, the deleteUser method is called to perform the deletion.
   */
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

  /**
   * Deletes the selected user.
   * Displays success or error messages based on the result.
   */
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

  /**
   * Creates a new category with the specified name.
   * Validates the input field and displays success or error messages based on the result.
   */
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

  /**
   * Confirms the deletion of the selected category by displaying a confirmation dialog.
   * If confirmed, the deleteCategory method is called to perform the deletion.
   */
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

  /**
   * Deletes the selected category.
   * Displays success or error messages based on the result.
   */
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

  /**
   * Validates the password form fields.
   * Checks for current password, new password, and confirmation.
   * Ensures the new password meets complexity requirements.
   * Returns an error message if validation fails, otherwise an empty string.
   */
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

  /**
   * Refreshes the management data, including users and categories.
   * Calls refreshUsers and refreshCategories concurrently.
   */
  private async refreshManagementData() {
    await Promise.all([this.refreshUsers(), this.refreshCategories()]);
  }

  /**
   * Refreshes the list of users by fetching them from the server.
   * Updates the homePageState with the retrieved users.
   * Displays an error message if the operation fails.
   */
  private async refreshUsers() {
    try {
      this.homePageState.users = await this.usersService.GetUsers();
    } catch (error) {
      this.toastService.showError(this.responseMessage(error, 'Unable to load users.'));
    }
  }

  /**
   * Refreshes the list of categories by fetching them from the server.
   * Updates the homePageState with the retrieved categories.
   * Displays an error message if the operation fails.
   */
  private async refreshCategories() {
    try {
      this.homePageState.categories = await this.categoriesService.GetCategories();
    } catch (error) {
      this.toastService.showError(this.responseMessage(error, 'Unable to load categories.'));
    }
  }

  /**
   * Displays a login required confirmation dialog.
   * Redirects the user to the home page upon acceptance.
   */
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

  /**
   * Extracts a user-friendly message from an API response.
   * Falls back to the provided fallback message if no specific message is found.
   * @param response The API response object.
   * @param fallback The fallback message to use if no specific message is found.
   * @returns The extracted message or the fallback message.
   */
  private responseMessage(response: ApiResponse | any, fallback: string): string {
    return response?.message ?? response?.Message ?? response?.error?.message ?? response?.error?.Message ?? fallback;
  }
  // #endregion
}