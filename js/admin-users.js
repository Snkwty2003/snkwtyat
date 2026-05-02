// admin-users.js - Complete users management system

const users = [
    {
        id: 1,
        name: "أحمد محمد",
        email: "ahmed@example.com",
        role: "admin",
        registrationDate: "2024-01-01",
        status: "active",
        lastLogin: "2024-01-20",
        phone: "+966501234567",
        address: "الرياض، حي الملقا"
    },
    {
        id: 2,
        name: "سارة العلي",
        email: "sara@example.com",
        role: "user",
        registrationDate: "2024-01-05",
        status: "active",
        lastLogin: "2024-01-19",
        phone: "+966502345678",
        address: "جدة، حي الروضة"
    },
    {
        id: 3,
        name: "خالد الحربي",
        email: "khaled@example.com",
        role: "user",
        registrationDate: "2024-01-10",
        status: "pending",
        lastLogin: null,
        phone: "+966503456789",
        address: "الدمام، حي الشاطئ"
    },
    {
        id: 4,
        name: "منى السعيد",
        email: "mona@example.com",
        role: "user",
        registrationDate: "2024-01-12",
        status: "active",
        lastLogin: "2024-01-18",
        phone: "+966504567890",
        address: "مكة، حي العزيزية"
    },
    {
        id: 5,
        name: "فهد العتيبي",
        email: "fahad@example.com",
        role: "user",
        registrationDate: "2024-01-15",
        status: "inactive",
        lastLogin: "2024-01-10",
        phone: "+966505678901",
        address: "المدينة، حي القبلاء"
    },
    {
        id: 6,
        name: "نورة العمري",
        email: "noura@example.com",
        role: "user",
        registrationDate: "2024-01-18",
        status: "active",
        lastLogin: "2024-01-20",
        phone: "+966506789012",
        address: "الرياض، حي النخيل"
    },
    {
        id: 7,
        name: "عبدالله القحطاني",
        email: "abdullah@example.com",
        role: "admin",
        registrationDate: "2024-01-20",
        status: "active",
        lastLogin: "2024-01-20",
        phone: "+966507890123",
        address: "الخبر، حي العزيزية"
    },
    {
        id: 8,
        name: "ريم الدوسري",
        email: "reem@example.com",
        role: "user",
        registrationDate: "2024-01-22",
        status: "pending",
        lastLogin: null,
        phone: "+966508901234",
        address: "الدمام، حي الفيصلية"
    }
];

let currentPage = 1;
const itemsPerPage = 10;

// Status text mapping
const statusText = {
    active: 'نشط',
    inactive: 'غير نشط',
    pending: 'قيد الانتظار'
};

// Role text mapping
const roleText = {
    admin: 'مسؤول',
    user: 'مستخدم'
};

// Update statistics
function updateStatistics() {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const pendingUsers = users.filter(u => u.status === 'pending').length;
    const adminUsers = users.filter(u => u.role === 'admin').length;

    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('activeUsers').textContent = activeUsers;
    document.getElementById('pendingUsers').textContent = pendingUsers;
    document.getElementById('adminUsers').textContent = adminUsers;
}

// Filter users
function filterUsers() {
    const statusFilter = document.getElementById('statusFilter').value;
    const roleFilter = document.getElementById('roleFilter').value;
    const searchFilter = document.getElementById('searchFilter').value.toLowerCase();

    return users.filter(user => {
        if (statusFilter !== 'all' && user.status !== statusFilter) return false;
        if (roleFilter !== 'all' && user.role !== roleFilter) return false;
        if (searchFilter && (
            !user.name.toLowerCase().includes(searchFilter) &&
            !user.email.toLowerCase().includes(searchFilter)
        )) return false;
        return true;
    });
}

// Render users table
function renderUsers(filteredUsers = filterUsers()) {
    const tbody = document.getElementById('usersTableBody');
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    if (currentPage > totalPages) currentPage = totalPages || 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const usersToShow = filteredUsers.slice(startIndex, endIndex);

    tbody.innerHTML = usersToShow.map(user => `
        <tr>
            <td>
                <div class="user-info">
                    <div class="user-avatar">${user.name.charAt(0)}</div>
                    <div>
                        <div style="font-weight: 600; color: #333;">${user.name}</div>
                        <div style="font-size: 12px; color: #666;">${user.phone}</div>
                    </div>
                </div>
            </td>
            <td>${user.email}</td>
            <td>${roleText[user.role]}</td>
            <td>${user.registrationDate}</td>
            <td>${user.lastLogin || 'لم يسجل دخول'}</td>
            <td>
                <span class="user-status ${user.status}">
                    ${statusText[user.status]}
                </span>
            </td>
            <td>
                <button class="btn btn-view" onclick="viewUser(${user.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-edit" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-delete" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    renderPagination(totalPages);
    updateStatistics();
}

// Render pagination
function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    let html = `
        <button onclick="previousPage()" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i> السابق
        </button>
    `;

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    [...Array(endPage - startPage + 1)].forEach((_, i) => {
        const pageNum = startPage + i;
        html += `
            <button onclick="goToPage(${pageNum})" class="${pageNum === currentPage ? 'active' : ''}">
                ${pageNum}
            </button>
        `;
    });

    html += `
        <button onclick="nextPage()" ${currentPage === totalPages ? 'disabled' : ''}>
            التالي <i class="fas fa-chevron-left"></i>
        </button>
    `;

    pagination.innerHTML = html;
}

// Pagination functions
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderUsers();
    }
}

function nextPage() {
    const filteredUsers = filterUsers();
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderUsers();
    }
}

function goToPage(page) {
    currentPage = page;
    renderUsers();
}

// User actions
function viewUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>تفاصيل المستخدم</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="user-details">
                    <div class="user-avatar-large">${user.name.charAt(0)}</div>
                    <div class="user-info-large">
                        <h3>${user.name}</h3>
                        <p class="user-role">${roleText[user.role]}</p>
                    </div>
                </div>
                <div class="details-grid">
                    <div class="detail-item">
                        <label>البريد الإلكتروني</label>
                        <p>${user.email}</p>
                    </div>
                    <div class="detail-item">
                        <label>رقم الهاتف</label>
                        <p>${user.phone}</p>
                    </div>
                    <div class="detail-item">
                        <label>العنوان</label>
                        <p>${user.address}</p>
                    </div>
                    <div class="detail-item">
                        <label>تاريخ التسجيل</label>
                        <p>${user.registrationDate}</p>
                    </div>
                    <div class="detail-item">
                        <label>آخر دخول</label>
                        <p>${user.lastLogin || 'لم يسجل دخول'}</p>
                    </div>
                    <div class="detail-item">
                        <label>الحالة</label>
                        <span class="user-status ${user.status}">${statusText[user.status]}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>تعديل بيانات المستخدم</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <form id="editForm_${userId}">
                    <div class="form-group">
                        <label>الاسم</label>
                        <input type="text" name="name" value="${user.name}" required>
                    </div>
                    <div class="form-group">
                        <label>البريد الإلكتروني</label>
                        <input type="email" name="email" value="${user.email}" required>
                    </div>
                    <div class="form-group">
                        <label>الدور</label>
                        <select name="role">
                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>مستخدم</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>مسؤول</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>الحالة</label>
                        <select name="status">
                            <option value="active" ${user.status === 'active' ? 'selected' : ''}>نشط</option>
                            <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>غير نشط</option>
                            <option value="pending" ${user.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">حفظ التغييرات</button>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector(`#editForm_${userId}`).addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        user.name = formData.get('name');
        user.email = formData.get('email');
        user.role = formData.get('role');
        user.status = formData.get('status');
        
        renderUsers();
        modal.remove();
        alert('تم التحديث بنجاح!');
    });
}

function deleteUser(userId) {
    if (confirm('هل تريد حذف هذا المستخدم؟')) {
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users.splice(index, 1);
            renderUsers();
            alert('تم الحذف بنجاح');
        }
    }
}

function exportToExcel() {
    const headers = ['الاسم', 'البريد', 'الدور', 'الحالة', 'التسجيل', 'آخر دخول'];
    const csv = [
        headers,
        ...users.map(u => [
            u.name,
            u.email,
            roleText[u.role],
            statusText[u.status],
            u.registrationDate,
            u.lastLogin || 'لم يدخل'
        ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'users_' + new Date().toISOString().slice(0,10) + '.csv';
    link.click();
}

function showAddUserModal() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>إضافة مستخدم جديد</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <form id="addUserForm">
                    <div class="form-group">
                        <label>الاسم الكامل</label>
                        <input type="text" name="name" required>
                    </div>
                    <div class="form-group">
                        <label>البريد الإلكتروني</label>
                        <input type="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label>الدور</label>
                        <select name="role">
                            <option value="user">مستخدم</option>
                            <option value="admin">مسؤول</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>الحالة</label>
                        <select name="status">
                            <option value="active">نشط</option>
                            <option value="inactive">غير نشط</option>
                            <option value="pending">قيد الانتظار</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">إضافة المستخدم</button>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#addUserForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newUser = {
            id: Date.now(),
            name: formData.get('name'),
            email: formData.get('email'),
            role: formData.get('role'),
            status: formData.get('status'),
            registrationDate: new Date().toISOString().slice(0,10),
            lastLogin: null,
            phone: '',
            address: ''
        };
        
        users.unshift(newUser);
        renderUsers();
        modal.remove();
        e.target.reset();
        alert('تم إضافة المستخدم بنجاح!');
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('statusFilter').addEventListener('change', () => { currentPage = 1; renderUsers(); });
    document.getElementById('roleFilter').addEventListener('change', () => { currentPage = 1; renderUsers(); });
    document.getElementById('searchFilter').addEventListener('input', () => { currentPage = 1; renderUsers(); });
    
    renderUsers();
});

