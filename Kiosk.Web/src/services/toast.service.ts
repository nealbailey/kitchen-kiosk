import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

/**
* Utility service for displaying toast messages.
*/
@Injectable()
export class ToastService {
  /**
  * Default constructor
  */
  constructor(private messageService: MessageService) {
  }

  /**
   * Displays the error toast.  
   */
  showError(message: any) {
    console.error(message.toString());
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message.toString() });
  }

  /**
   * Displays the success toast.
   */
  showSuccess(message: any) {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: message.toString() });
  }

  /**
   * Displays the warning toast.
   */
  showWarning(message: any) {
    this.messageService.add({ severity: 'warn', summary: 'Warning', detail: message.toString() });
  }

  /**
   * Displays the info toast.
   */
  showInfo(message: any) {
    this.messageService.add({ severity: 'info', summary: 'Information', detail: message.toString() });
  }
}
