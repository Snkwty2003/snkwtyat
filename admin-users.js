// Firebase imports
import { auth, onAuthStateChanged, db, getDoc, doc, signOut } from "./firebase-config.js";

// التحقق من تسجيل الدخول
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'admin-login.html';
        return;
    }
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    if (!adminDoc.exists() || adminDoc.data().role !== 'admin') {
        window.location.href = 'admin-login.html';
        return;
    }
});

// تسجيل الخروج
window.logout = async function() {
    await signOut(auth);
    localStorage.removeItem('adminUser');
    window.location.href = 'admin-login.html';
}

// Sample users data
const users = [
    { id: 1, name: "أحمد محمد", email: "ahmed@example.com", role: "admin", registrationDate: "2024-01-01", status: "active", phone: "+966501234567", address: "الرياض، حي الملقا" },
    { id: 2, name: "سارة العلي", email: "sara@example.com", role: "user", registrationDate: "2024-01-05", status: "active", phone: "+966502345678", address: "جدة، حي الروضة" },
    { id: 3, name: "خالد الحربي", email: "khaled@example.com", role: "user", registrationDate: "2024-01-10", status: "pending", phone: "+966503456789", address: "الدمام، حي الشاطئ" },
    { id: 4, name: "منى السعيد", email: "mona@example.com", role: "user", registrationDate: "2024-01-12", status: "active", phone: "+966504567890", address: "مكة، حي العزيزية" },
    { id: 5, name: "فهد العتيبي", email: "fahad@example.com", role: "user", registrationDate: "2024-01-15", status: "inactive", phone: "+966505678901", address: "المدينة، حي القبلاء" }
];

const roleLabels = { admin: "مسؤول", user: "مستخدم" };
const statusLabels = { active: "نشط", inactive: "غير نشط", pending: "قيد الانتظار" };

function renderUsers(filteredUsers) {
    const tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = filteredUsers.map(user => `
        <tr>
            <td>
                <div class="user-info">
                    <div class="user-avatar">${user.name.charAt(0)}</div>
                    <span>${user.name}</span>
                </div>
            </td>
            <td>${user.email}</td>
            <td>${roleLabels[user.role]}</td>
            <td>${user.registrationDate}</td>
            <td><span class="user-status ${user.status}">${statusLabels[user.status]}</span></td>
            <td>
                <button class="btn btn-view" onclick="viewUser(${user.id})"><i class="fas fa-eye"></i> عرض</button>
                <button class="btn btn-edit" onclick="editUser(${user.id})"><i class="fas fa-edit"></i> تعديل</button>
                <button class="btn btn-delete" onclick="deleteUser(${user.id})"><i class="fas fa-trash"></i> حذف</button>
            </td>
        </tr>
    `).join("");
}

function filterUsers() {
    const status = document.getElementById("statusFilter").value;
    const role = document.getElementById("roleFilter").value;
    const search = document.getElementById("searchFilter").value.toLowerCase();

    let filtered = users;
    if (status !== "all") filtered = filtered.filter(u => u.status === status);
    if (role !== "all") filtered = filtered.filter(u => u.role === role);
    if (search) filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.phone.includes(search)
    );
    renderUsers(filtered);
}

window.viewUser = function(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        alert(`تفاصيل المستخدم:\nالاسم: ${user.name}\nالبريد: ${user.email}\nالهاتف: ${user.phone}\nالعنوان: ${user.address}\nالدور: ${roleLabels[user.role]}\nالحالة: ${statusLabels[user.status]}`);
    }
}

window.editUser = function(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        const newName = prompt("الاسم:", user.name);
        const newRole = prompt("الدور (admin/user):", user.role);
        const newStatus = prompt("الحالة (active/inactive/pending):", user.status);
        if (newName) user.name = newName;
        if (newRole && ["admin", "user"].includes(newRole)) user.role = newRole;
        if (newStatus && ["active", "inactive", "pending"].includes(newStatus)) user.status = newStatus;
        filterUsers();
    }
}

window.addUser = function() {
    const name = prompt("الاسم:");
    const email = prompt("البريد الإلكتروني:");
    if (name && email) {
        users.push({
            id: Date.now(),
            name, email,
            phone: "", address: "",
            role: "user", status: "active",
            registrationDate: new Date().toISOString().split("T")[0]
        });
        filterUsers();
        alert("تم إضافة المستخدم بنجاح");
    }
}

window.deleteUser = function(userId) {
    const user = users.find(u => u.id === userId);
    if (confirm(`هل أنت متأكد من حذف المستخدم "${user.name}"؟`)) {
        users.splice(users.findIndex(u => u.id === userId), 1);
        filterUsers();
    }
}

document.addEventListener("DOMContentLoaded", function() {
    renderUsers(users);
    document.getElementById("statusFilter").addEventListener("change", filterUsers);
    document.getElementById("roleFilter").addEventListener("change", filterUsers);
    document.getElementById("searchFilter").addEventListener("input", filterUsers);
});