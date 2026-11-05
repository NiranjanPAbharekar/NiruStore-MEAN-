
import { CommonModule } from '@angular/common';
import { Component, OnInit ,ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  terms?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UsersApiResponse {
  status: string;
  totalUsers: number;
  users: User[];
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserListComponent implements OnInit {

  private readonly apiUrl = 'https://nirustore-mean-1.onrender.com/api/users';

  users: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  searchTerm = '';
  selectedStatus = 'all';

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  pageNumbers: number[] = [];

  startItem = 0;
  endItem = 0;

  constructor(private http: HttpClient,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadUsers();
  }

loadUsers(): void {
  console.log('Loading users API started...');

  this.isLoading = true;
  this.errorMessage = '';

  this.http.get<UsersApiResponse>(
    'https://nirustore-mean-1.onrender.com/api/users'
  ).subscribe({
    next: (response) => {
      console.log('API response received:', response);

      this.users = Array.isArray(response.users)
        ? response.users.map((user) => ({
            ...user,
            phone: user.phone ?? '',
            status: user.status ?? 'Active'
          }))
        : [];

      console.log('Users array assigned:', this.users);

      this.applyFilters();

      this.isLoading = false;

      console.log('Loading finished:', this.isLoading);
      this.cdr.detectChanges();
    },

    error: (error) => {
      console.error('Users API error:', error);

      this.errorMessage =
        'Unable to load users. Please check the API and backend server.';

      this.isLoading = false;
      this.cdr.detectChanges();
    },

    complete: () => {
      console.log('Users API request completed.');
    }
  });
}

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredUsers = this.users.filter((user) => {
      const matchesSearch =
        !search ||
        (user.name ?? '').toLowerCase().includes(search) ||
        (user.email ?? '').toLowerCase().includes(search) ||
        (user.phone ?? '').toLowerCase().includes(search) ||
        (user._id ?? '').toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'all' ||
        (user.status ?? 'Active').toLowerCase() ===
          this.selectedStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.max(
      1,
      Math.ceil(this.filteredUsers.length / this.pageSize)
    );

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;

    this.paginatedUsers = this.filteredUsers.slice(
      startIndex,
      startIndex + this.pageSize
    );

    this.startItem =
      this.filteredUsers.length === 0 ? 0 : startIndex + 1;

    this.endItem = Math.min(
      startIndex + this.pageSize,
      this.filteredUsers.length
    );

    this.pageNumbers = Array.from(
      { length: this.totalPages },
      (_, index) => index + 1
    );

    console.log('Users:', this.users);
    console.log('Filtered users:', this.filteredUsers);
    console.log('Paginated users:', this.paginatedUsers);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getInitials(name: string): string {
    return (name ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  getStatusClass(status: string | undefined): string {
    return (status ?? 'Active').toLowerCase() === 'inactive'
      ? 'bg-red-100 text-red-700'
      : 'bg-green-100 text-green-700';
  }

  viewUser(user: User): void {
    console.log('Viewing user:', user);
    alert(
      `Name: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone || 'Not provided'}`
    );
  }

  editUser(user: User): void {
    console.log('Editing user:', user);
    alert(`Edit user functionality for ${user.name} needs to be connected.`);
  }

  deleteUser(user: User): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) {
      return;
    }

    // Connect this method to your DELETE API before using it.
    alert(
      'Delete API is not connected yet. No user has been deleted.'
    );
  }
}
