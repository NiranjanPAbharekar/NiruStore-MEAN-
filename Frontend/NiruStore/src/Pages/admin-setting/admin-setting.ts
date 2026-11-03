
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

type SettingsSection =
  | 'profile'
  | 'store'
  | 'password'
  | 'notifications'
  | 'orders';

interface AdminProfile {
  fullName: string;
  email: string;
  phone: string;
}

interface StoreInformation {
  name: string;
  email: string;
  phone: string;
  currency: 'INR' | 'USD';
  address: string;
}

interface NotificationSettings {
  newOrders: boolean;
  lowStock: boolean;
  newCustomers: boolean;
}

interface OrderSettings {
  autoConfirm: boolean;
  cod: boolean;
  allowCancellation: boolean;
}

interface SavedAdminSettings {
  admin?: Partial<AdminProfile>;
  store?: Partial<StoreInformation>;
  notifications?: Partial<NotificationSettings>;
  orderSettings?: Partial<OrderSettings>;
}

@Component({
  selector: 'app-admin-setting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-setting.html',
  styleUrl: './admin-setting.css'
})
export class AdminSetting implements OnInit {

  private readonly storageKey = 'niruStoreAdminSettings';

  activeSection: SettingsSection = 'profile';

  message = '';
  messageType: 'success' | 'error' = 'success';

  admin: AdminProfile = {
    fullName: 'Niranjan Pabharekar',
    email: 'admin@nirustore.com',
    phone: '+91 98765 43210'
  };

  store: StoreInformation = {
    name: 'NiruStore',
    email: 'support@nirustore.com',
    phone: '+91 7021373427',
    currency: 'INR',
    address: 'Mumbai, Maharashtra, India'
  };

  password = {
    current: '',
    newPassword: '',
    confirmPassword: ''
  };

  notifications: NotificationSettings = {
    newOrders: true,
    lowStock: true,
    newCustomers: true
  };

  orderSettings: OrderSettings = {
    autoConfirm: true,
    cod: true,
    allowCancellation: true
  };

  ngOnInit(): void {
    this.loadSettings();
  }

  // =====================================================
  // TOP TAB NAVIGATION
  // =====================================================

  setActiveSection(section: SettingsSection): void {
    this.activeSection = section;
    this.clearMessage();
  }

  // =====================================================
  // ADMIN PROFILE INITIALS
  // =====================================================

  getInitials(name: string): string {
    return (name ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || 'AD';
  }

  // =====================================================
  // SAVE SETTINGS
  // =====================================================

  saveChanges(): void {
    const settings: SavedAdminSettings = {
      admin: this.admin,
      store: this.store,
      notifications: this.notifications,
      orderSettings: this.orderSettings
    };

    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(settings)
      );

      this.showMessage(
        'Settings saved successfully in this browser.',
        'success'
      );

    } catch (error) {
      console.error('Unable to save admin settings:', error);

      this.showMessage(
        'Unable to save settings. Check your browser storage settings.',
        'error'
      );
    }
  }

  // =====================================================
  // LOAD SAVED SETTINGS
  // =====================================================

  loadSettings(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);

      if (!saved) {
        return;
      }

      const settings = JSON.parse(
        saved
      ) as SavedAdminSettings;

      this.admin = {
        ...this.admin,
        ...(settings.admin ?? {})
      };

      this.store = {
        ...this.store,
        ...(settings.store ?? {})
      };

      this.notifications = {
        ...this.notifications,
        ...(settings.notifications ?? {})
      };

      this.orderSettings = {
        ...this.orderSettings,
        ...(settings.orderSettings ?? {})
      };

    } catch (error) {
      console.error('Unable to load admin settings:', error);

      this.showMessage(
        'Saved settings could not be loaded. Default settings are displayed.',
        'error'
      );
    }
  }

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  changePassword(): void {
    this.clearMessage();

    if (
      !this.password.current.trim() ||
      !this.password.newPassword ||
      !this.password.confirmPassword
    ) {
      this.showMessage(
        'Please fill in all password fields.',
        'error'
      );
      return;
    }

    if (this.password.newPassword.length < 6) {
      this.showMessage(
        'New password must be at least 6 characters.',
        'error'
      );
      return;
    }

    if (
      this.password.newPassword !==
      this.password.confirmPassword
    ) {
      this.showMessage(
        'New password and confirm password do not match.',
        'error'
      );
      return;
    }

    /*
     * Password changes require a secure backend API.
     * The API must verify the current password, hash the
     * new password, and save it securely.
     *
     * Never save passwords in localStorage.
     */

    this.showMessage(
      'The fields are valid, but password changes are not connected to a backend API yet.',
      'error'
    );
  }

  // =====================================================
  // DISPLAY MESSAGE
  // =====================================================

  private showMessage(
    message: string,
    type: 'success' | 'error'
  ): void {
    this.message = message;
    this.messageType = type;
  }

  private clearMessage(): void {
    this.message = '';
  }
}
