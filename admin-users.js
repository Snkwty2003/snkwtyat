// Sample users data
const users = [
    {
        id: 1,
        name: "أحمد محمد",
        email: "ahmed@example.com",
        role: "admin",
        registrationDate: "2024-01-01",
        status: "active",
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
        phone: "+966505678901",
        address: "المدينة، حي القبلاء"
    }
];

// Role labels
const roleLabels = {
    admin: "مسؤول",
    user: "مستخدم"
};

// Status labels
const statusLabels = {
    active: "نشط",
    inactive: "غير نشط",
    pending: "قيد الانتظار"
};

// Render users table
function renderUsers(filteredUsers) {
    const tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = filteredUsers.map(user => `
        <tr>
            <td>
                <div class="user-info">
                    <div class="user-avatar">
                        ${user.name.charAt(0)}
                    </div>
                    <span>${user.name}</span>
                </div>
            </td>
            <td>${user.email}</td>
            <td>${roleLabels[user.role]}</td>
            <td>${user.registrationDate}</td>
            <td>
                <span class="user-status ${user.status}">
                    ${statusLabels[user.status]}
                </span>
            </td>
            <td>
                <button class="btn btn-view" onclick="viewUser(${user.id})">
                    <i class="fas fa-eye"></i> عرض
                </button>
                <button class="btn btn-edit" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i> تعديل
                </button>
                <button class="btn btn-delete" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </td>
        </tr>
    `).join("");
}

// Filter users
function filterUsers() {
    const status = document.getElementById("statusFilter").value;
    const role = document.getElementById("roleFilter").value;
    const search = document.getElementById("searchFilter").value.toLowerCase();

    let filtered = users;

    if (status !== "all") {
        filtered = filtered.filter(user => user.status === status);
    }

    if (role !== "all") {
        filtered = filtered.filter(user => user.role === role);
    }

    if (search) {
        filtered = filtered.filter(user =>
            user.name.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search) ||
            user.phone.includes(search)
        );
    }

    renderUsers(filtered);
}

// View user details
function viewUser(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        alert(`تفاصيل المستخدم:

الاسم: ${user.name}
البريد: ${user.email}
الهاتف: ${user.phone}
العنوان: ${user.address}
الدور: ${roleLabels[user.role]}
الحالة: ${statusLabels[user.status]}
تاريخ التسجيل: ${user.registrationDate}`);
    }
}

// Edit user
function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        const newName = prompt("الاسم:", user.name);
        const newEmail = prompt("البريد الإلكتروني:", user.email);
        const newPhone = prompt("رقم الهاتف:", user.phone);
        const newAddress = prompt("العنوان:", user.address);
        const newRole = prompt("الدور (admin/user):", user.role);
        const newStatus = prompt("الحالة (active/inactive/pending):", user.status);

        if (newName) user.name = newName;
        if (newEmail) user.email = newEmail;
        if (newPhone) user.phone = newPhone;
        if (newAddress) user.address = newAddress;
        if (newRole && ["admin", "user"].includes(newRole)) user.role = newRole;
        if (newStatus && ["active", "inactive", "pending"].includes(newStatus)) user.status = newStatus;

        filterUsers();
        alert("تم تحديث بيانات المستخدم بنجاح");
    }
}

// Add new user
function addUser() {
    const name = prompt("الاسم:");
    const email = prompt("البريد الإلكتروني:");
    const phone = prompt("رقم الهاتف:");
    const address = prompt("العنوان:");
    const role = prompt("الدور (admin/user):", "user");
    const status = prompt("الحالة (active/inactive/pending):", "active");

    if (name && email) {
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            phone: phone || "",
            address: address || "",
            role: role && ["admin", "user"].includes(role) ? role : "user",
            status: status && ["active", "inactive", "pending"].includes(status) ? status : "active",
            registrationDate: new Date().toISOString().split("T")[0]
        };

        users.push(newUser);
        filterUsers();
        alert("تم إضافة المستخدم بنجاح");
    }
}

// Delete user
function deleteUser(userId) {
    const user = users.find(u => u.id === userId);
    if (confirm(`هل أنت متأكد من حذف المستخدم "${user.name}"؟

هذا الإجراء لا يمكن التراجع عنه.`)) {
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users.splice(index, 1);
            filterUsers();
            alert("تم حذف المستخدم بنجاح");
        }
    }
}

// Initialize
document.addEventListener("DOMContentLoaded", function() {
    renderUsers(users);

    // Add event listeners to filters
    document.getElementById("statusFilter").addEventListener("change", filterUsers);
    document.getElementById("roleFilter").addEventListener("change", filterUsers);
    document.getElementById("searchFilter").addEventListener("input", filterUsers);
});
