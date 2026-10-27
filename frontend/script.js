/* =====================================================

   STUDENT EXPENSE TRACKER
   COMPLETE FRONTEND VERSION
===================================================== */


/* =========================
   HELPER
========================= */
// ========================================
// BACKEND API CONFIGURATION
// ========================================

const BACKEND_HOST =
    window.location.hostname === "127.0.0.1"
        ? "127.0.0.1"
        : "localhost";

const API_BASE_URL =
    `http://${BACKEND_HOST}:8080/student-expense-tracker-backend/api`;
    

const $ = id => document.getElementById(id);


const categories = [
    "Food",
    "Transport",
    "Education",
    "Shopping",
    "Other"
];


const icons = {

    Food: "🍔",

    Transport: "🚗",

    Education: "📚",

    Shopping: "🛍️",

    Other: "📦"

};


let loggedInUser = null;


let transactions = [];

let budgets = {};

let goal = 0;

let editId = null;

let toastTimer;

let categoryPieChart = null;
/* =========================
   DATE HELPER
========================= */

function todayString() {

    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/* =========================
   USER STORAGE KEY
========================= */

function userKey(type) {

    return `${type}_${loggedInUser}`;

}


/* =====================================================
   OLD DATA MIGRATION
===================================================== */

function migrateOldData() {

    if (!loggedInUser)
        return;


    /*
        Old project used:

        transactions
        budgets
        savingsGoal

        New project uses:

        transactions_username
        budgets_username
        goal_username
    */


    const newTransactionKey =
        userKey("transactions");


    const newBudgetKey =
        userKey("budgets");


    const newGoalKey =
        userKey("goal");


    const oldTransactions =
        localStorage.getItem(
            "transactions"
        );


    const oldBudgets =
        localStorage.getItem(
            "budgets"
        );


    const oldGoal =
        localStorage.getItem(
            "savingsGoal"
        );


    /*
        Only migrate if user-specific
        data doesn't already exist.
    */


    if (
        oldTransactions &&
        !localStorage.getItem(
            newTransactionKey
        )
    ) {

        try {

            const parsed =
                JSON.parse(oldTransactions);

            if (Array.isArray(parsed)) {

                localStorage.setItem(
                    newTransactionKey,
                    JSON.stringify(parsed)
                );

            }

        } catch (error) {

            console.log(
                "Old transaction migration failed."
            );

        }
    }


    if (
        oldBudgets &&
        !localStorage.getItem(
            newBudgetKey
        )
    ) {

        try {

            const parsed =
                JSON.parse(oldBudgets);

            localStorage.setItem(
                newBudgetKey,
                JSON.stringify(parsed)
            );

        } catch (error) {

            console.log(
                "Old budget migration failed."
            );

        }
    }


    if (
        oldGoal &&
        !localStorage.getItem(
            newGoalKey
        )
    ) {

        localStorage.setItem(
            newGoalKey,
            oldGoal
        );

    }

}


/* =========================
   STORAGE
========================= */

function loadUserData() {

    transactions = [];


    try {

        budgets =
            JSON.parse(
                localStorage.getItem(
                    userKey("budgets")
                ) || "{}"
            );

    } catch {

        budgets = {};

    }


    goal =
        Number(
            localStorage.getItem(
                userKey("goal")
            ) || 0
        );


    /*
        Clean old / invalid categories
    */

    transactions =
        transactions.map(t => ({

            ...t,

            category:
                categories.includes(t.category)
                    ? t.category
                    : "Other"

        }));


    saveUserData();

}


function saveUserData() {

    if (!loggedInUser)
        return;


    localStorage.setItem(

        userKey("budgets"),

        JSON.stringify(budgets)

    );


    localStorage.setItem(

        userKey("goal"),

        String(goal)

    );

}


/* =========================
   TOAST
========================= */

function showToast(message) {

    const toast =
        $("toast");


    toast.innerText =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2500);

}


/* =========================
   AUTH TABS
========================= */

$("loginTab").addEventListener(
    "click",
    () => {

        $("loginForm")
            .classList
            .remove("hidden");


        $("registerForm")
            .classList
            .add("hidden");


        $("loginTab")
            .classList
            .add("active");


        $("registerTab")
            .classList
            .remove("active");


        $("loginMessage").innerText = "";

        $("registerMessage").innerText = "";

    }
);


$("registerTab").addEventListener(
    "click",
    () => {

        $("registerForm")
            .classList
            .remove("hidden");


        $("loginForm")
            .classList
            .add("hidden");


        $("registerTab")
            .classList
            .add("active");


        $("loginTab")
            .classList
            .remove("active");


        $("loginMessage").innerText = "";

        $("registerMessage").innerText = "";

    }
);


/* =========================
   REGISTER - BACKEND
========================= */

$("registerBtn").addEventListener(
    "click",
    registerUser
);

async function registerUser() {

    const username =
        $("registerUsername").value.trim();

    const password =
        $("registerPassword").value;

    const confirmPassword =
        $("confirmPassword").value;

    const message =
        $("registerMessage");

    message.style.color = "#e74c3c";

    if (!username || !password || !confirmPassword) {
        message.innerText = "⚠️ Please fill all fields.";
        return;
    }

    if (username.length < 3) {
        message.innerText =
            "⚠️ Username must contain at least 3 characters.";
        return;
    }

    if (username.includes(" ")) {
        message.innerText =
            "⚠️ Username cannot contain spaces.";
        return;
    }

    if (password.length < 4) {
        message.innerText =
            "⚠️ Password must contain at least 4 characters.";
        return;
    }

    if (password !== confirmPassword) {
        message.innerText = "⚠️ Passwords do not match.";
        return;
    }

    try {

        const body = new URLSearchParams();
        body.append("username", username);
        body.append("password", password);

        const response = await fetch(
            `${API_BASE_URL}/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },
                body: body.toString(),
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok || data.success !== "true") {
            message.innerText =
                `❌ ${data.message || "Registration failed."}`;
            return;
        }

        message.style.color = "#27ae60";
        message.innerText =
            "✅ Account created successfully! Please login.";

        $("registerUsername").value = "";
        $("registerPassword").value = "";
        $("confirmPassword").value = "";

        setTimeout(() => {
            $("loginTab").click();
            $("loginUsername").value = username;
        }, 700);

    } catch (error) {

        console.error("Registration error:", error);

        message.innerText =
            "❌ Cannot connect to backend. Make sure Tomcat is running.";
    }
}


/* =========================
   LOGIN - BACKEND
========================= */

$("loginBtn").addEventListener(
    "click",
    login
);

async function login() {

    const username =
        $("loginUsername").value.trim();

    const password =
        $("loginPassword").value;

    const message =
        $("loginMessage");

    message.style.color = "#e74c3c";

    if (!username) {
        message.innerText =
            "⚠️ Please enter your username.";
        return;
    }

    if (!password) {
        message.innerText =
            "⚠️ Please enter your password.";
        return;
    }

    try {

        const body = new URLSearchParams();
        body.append("username", username);
        body.append("password", password);

        const response = await fetch(
            `${API_BASE_URL}/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },
                body: body.toString(),
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok || !(data.success === true || data.success === "true")) {
            message.innerText =
                `❌ ${data.message || "Invalid username or password."}`;
            return;
        }

        loggedInUser = data.username || username;

        $("loginUsername").value = "";
        $("loginPassword").value = "";
        message.innerText = "";

        showApp();

    } catch (error) {

        console.error("Login error:", error);

        message.innerText =
            "❌ Cannot connect to backend. Make sure Tomcat is running.";
    }
}


/* =========================
   SHOW APP
========================= */


async function showApp() {
    $("authPage").classList.add("hidden");
    $("appPage").classList.remove("hidden");

    $("currentUser").innerText = loggedInUser;
    $("welcomeText").innerText =
        `Welcome back, ${loggedInUser}!`;

    loadUserData();

    await loadTransactionsFromBackend();

    $("date").value = todayString();

    updateMonthOptions();

    // Database থেকে category-wise budgets load
    await loadBudgetsFromBackend();

    // Loaded budget-এর মাসগুলোও filter-এ দেখাবে
    updateMonthOptions();

    updateAll();
}


/* =========================
   LOGOUT - BACKEND
========================= */

$("logoutBtn").addEventListener(
    "click",
    logout
);

async function logout() {

    try {

        await fetch(
            `${API_BASE_URL}/logout`,
            {
                method: "POST",
                credentials: "include"
            }
        );

    } catch (error) {
        console.error("Logout error:", error);
    }

    loggedInUser = null;
    transactions = [];
    budgets = {};
    goal = 0;
    editId = null;

    $("appPage").classList.add("hidden");
    $("authPage").classList.remove("hidden");

    $("loginMessage").innerText = "";
    $("registerMessage").innerText = "";

    showToast("👋 Logged out successfully.");
}


/* =========================
   CHECK BACKEND SESSION
========================= */

async function checkBackendSession() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/session`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        if (!response.ok) {
            showLoginPage();
            return;
        }

        const data = await response.json();

        if (data.loggedIn === true) {

            loggedInUser = data.username;
            showApp();

        } else {

            showLoginPage();
        }

    } catch (error) {

        console.error("Session check failed:", error);
        showLoginPage();
    }
}


function showLoginPage() {

    loggedInUser = null;

    $("authPage").classList.remove("hidden");
    $("appPage").classList.add("hidden");
}


/* =========================
   DARK MODE
========================= */

let darkMode =
    localStorage.getItem(
        "darkMode"
    ) === "true";


function applyDarkMode() {

    document.body
        .classList
        .toggle(
            "dark",
            darkMode
        );


    $("darkModeBtn")
        .innerText =
        darkMode
            ? "☀️ Light Mode"
            : "🌙 Dark Mode";

}


$("darkModeBtn").addEventListener(
    "click",
    () => {

        darkMode =
            !darkMode;


        localStorage.setItem(
            "darkMode",
            darkMode
        );


        applyDarkMode();

    }
);


applyDarkMode();


/* =========================
   MONTH FUNCTIONS
========================= */

function getMonth(date) {

    return date
        ? date.substring(0, 7)
        : "";

}


function monthName(value) {

    if (
        value === "All"
    )
        return "All Months";


    const [
        year,
        month
    ] =
        value.split("-");


    return new Date(

        Number(year),

        Number(month) - 1

    ).toLocaleDateString(

        "en-US",

        {

            month: "long",

            year: "numeric"

        }

    );

}


function updateMonthOptions() {

    const oldValue =
        $("monthFilter").value;


    
const months = [
    ...new Set([
        ...transactions
            .map(t => getMonth(t.date))
            .filter(Boolean),
        ...Object.keys(budgets)
    ])
]
.sort()
.reverse();


    $("monthFilter")
        .innerHTML =
        `
            <option value="All">
                All Months
            </option>
        `;


    months.forEach(
        month => {

            $("monthFilter")
                .innerHTML +=
                `
                    <option value="${month}">
                        ${monthName(month)}
                    </option>
                `;

        }
    );


    if (
        months.includes(oldValue)
    ) {

        $("monthFilter")
            .value =
            oldValue;

    }

}


function selectedTransactions() {

    const selected =
        $("monthFilter").value;


    if (
        selected === "All"
    )
        return transactions;


    return transactions.filter(
        t =>
            getMonth(t.date)
            === selected
    );

}


/* =========================
   BACKEND TRANSACTIONS
========================= */

async function loadTransactionsFromBackend() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/transactions`,
            {
                method: "GET",
                credentials: "include",
                cache: "no-store"
            }
        );

        if (response.status === 401 || response.status === 403) {
            showLoginPage();
            showToast("⚠️ Session expired. Please login again.");
            return false;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to load transactions.");
        }

        const rows = Array.isArray(data)
            ? data
            : (data.transactions || data.data || []);

        transactions = rows.map(transaction => ({
            id: Number(transaction.id),
            description: transaction.description,
            amount: Number(transaction.amount),
            category: categories.includes(transaction.category)
                ? transaction.category
                : "Other",
            date: transaction.transactionDate || transaction.date
        }));

        return true;

    } catch (error) {

        console.error("Load transactions error:", error);
        showToast("❌ Could not load transactions from backend.");
        return false;
    }
}


/* =========================
   LOAD BUDGETS FROM DATABASE
========================= */

async function loadBudgetsFromBackend() {
    if (!loggedInUser) return false;

    const currentMonth = getMonth(todayString());

    // Transaction history-তে থাকা মাসগুলো এবং current month
    const months = [
        ...new Set([
            currentMonth,
            ...transactions
                .map(t => getMonth(t.date))
                .filter(Boolean),
            ...Object.keys(budgets)
        ])
    ];

    try {
        for (const month of months) {
            if (!/^\d{4}-\d{2}$/.test(month)) continue;

            for (const category of categories) {
                const params = new URLSearchParams({
                    month: `${month}-01`,
                    category: category
                });

                const response = await fetch(
                    `${API_BASE_URL}/budget?${params.toString()}`,
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store"
                    }
                );

                if (!response.ok) {
                    console.error(
                        `Could not load ${category} budget for ${month}:`,
                        response.status
                    );
                    continue;
                }

                const data = await response.json();

                // Backend-এর সম্ভাব্য response structure
                const savedBudget =
                    data.budget ??
                    data.data ??
                    data;

                if (
                    savedBudget &&
                    typeof savedBudget === "object" &&
                    !Array.isArray(savedBudget) &&
                    savedBudget.amount != null &&
                    Number(savedBudget.amount) > 0
                ) {
                    if (!budgets[month]) {
                        budgets[month] = {};
                    }

                    budgets[month][category] =
                        Number(savedBudget.amount);
                }
            }
        }

        // Database থেকে পাওয়া budget local storage-এও রাখবে
        saveUserData();

        return true;

    } catch (error) {
        console.error(
            "Load budgets from database failed:",
            error
        );

        showToast("⚠️ Database থেকে budget load করা যায়নি।");
        return false;
    }
}

async function addTransaction() {

    if (!loggedInUser) {
        showToast("⚠️ Please login first.");
        return;
    }

    const description =
        $("description").value.trim();

    const amountInput =
        $("amount").value;

    const value = Number(amountInput);

    const category =
        $("category").value;

    const date =
        $("date").value;

    if (!description || amountInput === "" || !category || !date) {
        showToast("⚠️ Please fill all fields.");
        return;
    }

    if (value === 0) {
        showToast("⚠️ Amount cannot be zero.");
        return;
    }

    const body = new URLSearchParams();
    body.append("description", description);
    body.append("amount", String(value));
    body.append("category", category);
    body.append("transactionDate", date);

    try {

        const wasEditing = editId !== null;
        let response;

        if (wasEditing) {

            body.append("id", String(editId));

            response = await fetch(
                `${API_BASE_URL}/transactions/update`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: body.toString(),
                    credentials: "include"
                }
            );

        } else {

            response = await fetch(
                `${API_BASE_URL}/transactions`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: body.toString(),
                    credentials: "include"
                }
            );
        }

        if (response.status === 401 || response.status === 403) {
            showLoginPage();
            showToast("⚠️ Session expired. Please login again.");
            return;
        }

        const data = await response.json();

        if (!response.ok || !(data.success === true || data.success === "true")) {
            throw new Error(data.message || "Transaction could not be saved.");
        }

        editId = null;
        $("addBtn").innerText = "Add Transaction";

        clearInputs();

        await loadTransactionsFromBackend();

        updateMonthOptions();
        $("monthFilter").value = getMonth(date);
        updateAll();

        showToast(
            wasEditing
                ? "✅ Transaction updated!"
                : "✅ Transaction saved to database!"
        );

    } catch (error) {

        console.error("Save transaction error:", error);
        showToast(`❌ ${error.message}`);
    }
}


$("addBtn").addEventListener(
    "click",
    addTransaction
);


function clearInputs() {

    $("description").value = "";
    $("amount").value = "";
    $("category").value = "";
    $("date").value = todayString();

}


/* =========================
   SUMMARY
========================= */

function updateSummary() {

    let totalIncome = 0;

    let totalExpense = 0;


    selectedTransactions()
        .forEach(transaction => {

            const value =
                Number(
                    transaction.amount
                );


            if (
                value > 0
            ) {

                totalIncome +=
                    value;

            }


            if (
                value < 0
            ) {

                totalExpense +=
                    Math.abs(value);

            }

        });


    const balance =
        totalIncome -
        totalExpense;


    $("balance")
        .innerText =
        `৳ ${balance.toLocaleString()}`;


    $("income")
        .innerText =
        `৳ ${totalIncome.toLocaleString()}`;


    $("expense")
        .innerText =
        `৳ ${totalExpense.toLocaleString()}`;


    updateIncomeExpenseChart(

        totalIncome,

        totalExpense

    );

}


/* =========================
   CATEGORY EXPENSE
========================= */

function categoryExpenses() {

    const result = {};


    categories.forEach(
        category => {

            result[category] =
                0;

        }
    );


    selectedTransactions()
        .forEach(transaction => {

            if (
                Number(
                    transaction.amount
                ) < 0
            ) {

                const category =
                    categories.includes(
                        transaction.category
                    )
                        ? transaction.category
                        : "Other";


                result[category] +=

                    Math.abs(
                        Number(
                            transaction.amount
                        )
                    );

            }

        });


    return result;

}


/* =========================
   STATISTICS
========================= */

function updateStatistics() {

    const data =
        categoryExpenses();


    const total =
        Object.values(data)
            .reduce(
                (sum, value) =>
                    sum + value,

                0
            );


    $("statistics")
        .innerHTML =
        "";


    categories.forEach(
        category => {

            const value =
                data[category];


            const percentage =
                total
                    ? (
                        value /
                        total
                    ) * 100

                    : 0;


            $("statistics")
                .innerHTML +=

                `

                <div class="stat-card">

                    <h4>
                        ${icons[category]}
                        ${category}
                    </h4>

                    <p>
                        ৳ ${value.toLocaleString()}
                    </p>

                    <small>
                        ${percentage.toFixed(1)}%
                    </small>

                </div>

                `;

        }
    );

}


/* =========================
   CATEGORY CHART
========================= */

function updateChart() {

    const data =
        categoryExpenses();


    const total =
        Object.values(data)
            .reduce(
                (sum, value) =>
                    sum + value,

                0
            );


    $("chart")
        .innerHTML =
        "";


    categories.forEach(
        category => {

            const value =
                data[category];


            const percentage =
                total
                    ? (
                        value /
                        total
                    ) * 100

                    : 0;


            $("chart")
                .innerHTML +=

                `

                <div class="chart-row">

                    <div class="chart-label">

                        ${icons[category]}
                        ${category}

                    </div>


                    <div class="chart-track">

                        <div
                            class="chart-bar"
                            style="width:${percentage}%">

                        </div>

                    </div>


                    <div class="chart-amount">

                        ৳ ${value.toLocaleString()}

                    </div>

                </div>

                `;

        }
    );

}


/* =========================
   CATEGORY DOUGHNUT CHART
========================= */

function updateCategoryPieChart() {
    const canvas = $("categoryPieChart");

    if (!canvas || typeof Chart === "undefined") {
        console.error("Pie chart canvas or Chart.js not found.");
        return;
    }

    const data = categoryExpenses();
    const values = categories.map(category => data[category]);

    if (categoryPieChart) {
        categoryPieChart.destroy();
        categoryPieChart = null;
    }

    categoryPieChart = new Chart(canvas, {
        type: "doughnut",

        data: {
            labels: categories,
            datasets: [{
                data: values,
                backgroundColor: [
                    "#3498db",
                    "#f39c12",
                    "#9b59b6",
                    "#e74c3c",
                    "#2ecc71"
                ],
                borderColor: "#1b2736",
                borderWidth: 3,
                hoverOffset: 8
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "62%",

            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: getComputedStyle(document.body)
                            .color,
                        padding: 18,
                        usePointStyle: true,
                        pointStyle: "circle"
                    }
                },

                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const amount = Number(context.raw) || 0;

                            return ` ${context.label}: ৳ ${amount.toLocaleString()}`;
                        }
                    }
                }
            }
        }
    });
}

/* =========================
   INCOME VS EXPENSE
========================= */

function updateIncomeExpenseChart(
    income,
    expense
) {

    const max =
        Math.max(
            income,
            expense,
            1
        );


    $("incomeBar")
        .style
        .width =
        `${(
            income /
            max
        ) * 100}%`;


    $("expenseBar")
        .style
        .width =
        `${(
            expense /
            max
        ) * 100}%`;


    $("incomeChartAmount")
        .innerText =
        `৳ ${income.toLocaleString()}`;


    $("expenseChartAmount")
        .innerText =
        `৳ ${expense.toLocaleString()}`;

}


/* =========================
   BUDGET
========================= */

$("setBudgetBtn")
    .addEventListener(
        "click",
        setBudget
    );



async function setBudget() {
    const category = $("budgetCategory").value;

    const amount = Number($("budgetAmount").value);

    let month = $("monthFilter").value;

    // All Months selected হলে current month ব্যবহার করবে
    if (month === "All") {
        month = getMonth(todayString());
    }

    if (!category || !Number.isFinite(amount) || amount <= 0) {
        showToast("⚠️ Select category and enter a valid budget.");
        return;
    }

    // Local storage-এ আগের মতো save
    if (!budgets[month]) {
        budgets[month] = {};
    }

    budgets[month][category] = amount;
    saveUserData();

    // Database-এর জন্য মাসের প্রথম দিন: YYYY-MM-DD
    const budgetMonth = `${month}-01`;

    try {
        const response = await fetch(`${API_BASE_URL}/budget`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            credentials: "include",
            body: new URLSearchParams({
                category: category,
                amount: String(amount),
                budgetMonth: budgetMonth
            }).toString()
        });

        const data = await response.json();

        if (!response.ok || data.success !== true) {
            console.error("Budget database save failed:", data);

            showToast(
                "⚠️ Budget local storage-এ save হয়েছে, কিন্তু database-এ save হয়নি।"
            );
            return;
        }

        $("budgetCategory").value = "";
        $("budgetAmount").value = "";

        updateBudget();

        showToast(`✅ ${category} budget database-এ save হয়েছে!`);

    } catch (error) {
        console.error("Budget API error:", error);

        $("budgetCategory").value = "";
        $("budgetAmount").value = "";

        updateBudget();

        showToast(
            "⚠️ Budget local storage-এ আছে, কিন্তু database connection check করুন।"
        );
    }
}



/* =========================
   UPDATE BUDGET
========================= */

function updateBudget() {

    let month =
        $("monthFilter")
            .value;


    if (
        month === "All"
    ) {

        month =
            getMonth(
                todayString()
            );

    }


    const monthBudgets =
        budgets[month] || {};


    const expenses =
        categoryExpenses();


    $("budgetList")
        .innerHTML =
        "";


    categories.forEach(
        category => {

            if (
                !monthBudgets[category]
            )
                return;


            const budget =
                Number(
                    monthBudgets[
                        category
                    ]
                );


            const spent =
                Number(
                    expenses[
                        category
                    ]
                );


            const percentage =
                budget
                    ? (
                        spent /
                        budget
                    ) * 100

                    : 0;


            const progress =
                Math.min(
                    percentage,
                    100
                );


            const exceeded =
                spent > budget;


            $("budgetList")
                .innerHTML +=

                `

                <div class="budget-card">

                    <div class="budget-header">

                        <strong>

                            ${icons[category]}
                            ${category}

                        </strong>


                        <span class="${
                            exceeded
                                ? "budget-warning"
                                : "budget-safe"
                        }">

                            ${
                                exceeded
                                    ? "⚠️ Exceeded"
                                    : `${percentage.toFixed(1)}% Used`
                            }

                        </span>

                    </div>


                    <div class="budget-header">

                        <span>

                            Spent:

                            <strong>
                                ৳ ${spent.toLocaleString()}
                            </strong>

                        </span>


                        <span>

                            Budget:

                            <strong>
                                ৳ ${budget.toLocaleString()}
                            </strong>

                        </span>

                    </div>


                    <div class="budget-progress">

                        <div
                            class="budget-progress-bar"
                            style="width:${progress}%">

                        </div>

                    </div>

                </div>

                `;

        }
    );


    if (
        !$("budgetList")
            .innerHTML
    ) {

        $("budgetList")
            .innerHTML =

            `

            <p style="color:#777">

                No budget set for this month.

            </p>

            `;

    }

}


/* =========================
   SAVINGS GOAL
========================= */

$("setGoalBtn")
    .addEventListener(
        "click",
        setSavingsGoal
    );

async function saveSavingsGoalToDatabase(goalAmount) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/savings-goal`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    goalAmount: String(goalAmount)
                }).toString(),
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok || data.success !== true) {
            console.error("Savings Goal save failed:", data);
            showToast("❌ Savings Goal database save failed.");
            return false;
        }

        showToast("✅ Savings Goal saved to database!");
        return true;

    } catch (error) {
        console.error("Savings Goal API error:", error);
        showToast("❌ Cannot connect to backend.");
        return false;
    }
}


function setSavingsGoal() {

    const value =
        Number(
            $("savingsGoal")
                .value
        );


    if (
        value <= 0
    ) {

        showToast(
            "⚠️ Enter a valid savings goal."
        );

        return;

    }


    goal =
        value;


    saveUserData();

saveSavingsGoalToDatabase(value);

    $("savingsGoal")
        .value =
        "";


    updateSavingsGoal();


    showToast(
        "🎯 Savings goal updated!"
    );

}


/* =========================
   UPDATE SAVINGS GOAL
========================= */

function updateSavingsGoal() {

    let income = 0;

    let expense = 0;


    selectedTransactions()
        .forEach(transaction => {

            const value =
                Number(
                    transaction.amount
                );


            if (
                value > 0
            ) {

                income +=
                    value;

            }


            if (
                value < 0
            ) {

                expense +=
                    Math.abs(value);

            }

        });


    const saved =
        Math.max(
            income - expense,
            0
        );


    const remaining =
        Math.max(
            goal - saved,
            0
        );


    const percentage =
        goal
            ? Math.min(
                (
                    saved /
                    goal
                ) * 100,

                100
            )

            : 0;


    $("goalAmount")
        .innerText =
        `৳ ${goal.toLocaleString()}`;


    $("savedAmount")
        .innerText =
        `৳ ${saved.toLocaleString()}`;


    $("remainingAmount")
        .innerText =
        `৳ ${remaining.toLocaleString()}`;


    $("goalProgressBar")
        .style
        .width =
        `${percentage}%`;


    if (
        !goal
    ) {

        $("goalMessage")
            .innerText =
            "Set a savings goal to start.";

    }

    else if (
        saved >= goal
    ) {

        $("goalMessage")
            .innerText =
            "🎉 Congratulations! Goal achieved!";

    }

    else {

        $("goalMessage")
            .innerText =
            `${percentage.toFixed(1)}% completed`;

    }

}


/* =========================
   TRANSACTION LIST
========================= */

function updateTransactions() {

    const search =
        $("searchInput")
            .value
            .toLowerCase()
            .trim();


    const selectedCategory =
        $("filterCategory")
            .value;


    const selectedType =
        $("filterType")
            .value;


    const list =
        selectedTransactions()

            .filter(transaction => {

                const text =

                    `${transaction.description}
                     ${transaction.category}`
                        .toLowerCase();


                const searchMatch =
                    text.includes(
                        search
                    );


                const categoryMatch =

                    selectedCategory ===
                    "All"

                        ||

                    transaction.category ===
                    selectedCategory;


                const typeMatch =

                    selectedType ===
                    "All"

                        ||

                    (
                        selectedType ===
                        "Income"

                        &&

                        Number(
                            transaction.amount
                        ) > 0
                    )

                        ||

                    (
                        selectedType ===
                        "Expense"

                        &&

                        Number(
                            transaction.amount
                        ) < 0
                    );


                return (

                    searchMatch &&

                    categoryMatch &&

                    typeMatch

                );

            })


            .sort(
                (a, b) =>

                    new Date(
                        b.date
                    )

                    -

                    new Date(
                        a.date
                    )
            );


    $("transactionList")
        .innerHTML =
        "";


    if (
        !list.length
    ) {

        $("transactionList")
            .innerHTML =

            `

            <li class="no-result">

                No transactions found.

            </li>

            `;

        return;

    }


    list.forEach(
        transaction => {

            const positive =
                Number(
                    transaction.amount
                ) > 0;


            const category =
                categories.includes(
                    transaction.category
                )
                    ? transaction.category
                    : "Other";


            $("transactionList")
                .innerHTML +=

                `

                <li class="transaction-item
                    ${
                        positive
                            ? "income-item"
                            : "expense-item"
                    }">


                    <div class="transaction-info">

                        <div class="transaction-description">

                            ${escapeHTML(
                                transaction.description
                            )}

                        </div>


                        <div class="transaction-meta">

                            ${icons[category]}
                            ${category}
                            •
                            ${escapeHTML(
                                transaction.date
                            )}

                        </div>

                    </div>


                    <div class="
                        transaction-amount
                        ${
                            positive
                                ? "income-text"
                                : "expense-text"
                        }
                    ">

                        ${positive ? "+" : "-"}

                        ৳

                        ${Math.abs(
                            Number(
                                transaction.amount
                            )
                        ).toLocaleString()}

                    </div>


                    <div class="transaction-buttons">

                        <button
                            class="edit-btn"
                            onclick="editTransaction(${transaction.id})">

                            ✏️ Edit

                        </button>


                        <button
                            class="delete-btn"
                            onclick="deleteTransaction(${transaction.id})">

                            🗑️ Delete

                        </button>

                    </div>

                </li>

                `;

        }
    );

}


/* =========================
   HTML SECURITY
========================= */

function escapeHTML(text) {

    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================
   EDIT TRANSACTION
========================= */

window.editTransaction =
    function(id) {

        const transaction =
            transactions.find(item => Number(item.id) === Number(id));

        if (!transaction)
            return;

        $("description").value = transaction.description;
        $("amount").value = transaction.amount;
        $("category").value = categories.includes(transaction.category)
            ? transaction.category
            : "Other";
        $("date").value = transaction.date;

        editId = Number(id);

        $("addBtn").innerText = "Update Transaction";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        showToast("✏️ Editing transaction...");
    };


/* =========================
   DELETE TRANSACTION
========================= */

window.deleteTransaction =
    async function(id) {

        if (!confirm("Are you sure you want to delete this transaction?"))
            return;

        try {

            const response = await fetch(
                `${API_BASE_URL}/transactions?id=${encodeURIComponent(id)}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            if (response.status === 401 || response.status === 403) {
                showLoginPage();
                showToast("⚠️ Session expired. Please login again.");
                return;
            }

            const data = await response.json();

            if (!response.ok || !(data.success === true || data.success === "true")) {
                throw new Error(data.message || "Transaction could not be deleted.");
            }

            await loadTransactionsFromBackend();
            updateMonthOptions();
            updateAll();

            showToast("🗑️ Transaction deleted.");

        } catch (error) {

            console.error("Delete transaction error:", error);
            showToast(`❌ ${error.message}`);
        }
    };


/* =========================
   CLEAR ALL
========================= */

$("clearAllBtn")
    .addEventListener(
        "click",
        async () => {

            if (!transactions.length) {
                showToast("No transactions to delete.");
                return;
            }

            if (!confirm("Delete ALL your transactions?"))
                return;

            try {

                const response = await fetch(
                    `${API_BASE_URL}/transactions/clear`,
                    {
                        method: "POST",
                        credentials: "include"
                    }
                );

                if (response.status === 401 || response.status === 403) {
                    showLoginPage();
                    showToast("⚠️ Session expired. Please login again.");
                    return;
                }

                const data = await response.json();

                if (!response.ok || !(data.success === true || data.success === "true")) {
                    throw new Error(data.message || "Transactions could not be deleted.");
                }

                transactions = [];
                editId = null;

                $("addBtn").innerText = "Add Transaction";
                $("monthFilter").value = "All";

                updateMonthOptions();
                updateAll();

                showToast("🗑️ All transactions deleted.");

            } catch (error) {

                console.error("Clear transactions error:", error);
                showToast(`❌ ${error.message}`);
            }
        }
    );


/* =========================
   CSV EXPORT
========================= */

$("exportBtn")
    .addEventListener(
        "click",
        exportCSV
    );


function exportCSV() {

    const data =
        selectedTransactions();


    if (
        !data.length
    ) {

        showToast(
            "No transactions available."
        );

        return;

    }


    let csv =
        "Description,Amount,Type,Category,Date\n";


    data.forEach(
        transaction => {

            const type =
                Number(
                    transaction.amount
                ) > 0

                    ? "Income"

                    : "Expense";


            const description =

                `"${String(
                    transaction.description
                ).replace(
                    /"/g,
                    '""'
                )}"`;


            const category =

                `"${String(
                    transaction.category
                ).replace(
                    /"/g,
                    '""'
                )}"`;


            csv +=

                `${description},` +

                `${transaction.amount},` +

                `${type},` +

                `${category},` +

                `${transaction.date}\n`;

        }
    );


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        `student-expenses-${loggedInUser}.csv`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    showToast(
        "📥 CSV exported successfully!"
    );

}


/* =========================
   FILTER EVENTS
========================= */

$("monthFilter")
    .addEventListener(
        "change",
        updateAll
    );


$("searchInput")
    .addEventListener(
        "input",
        updateTransactions
    );


$("filterCategory")
    .addEventListener(
        "change",
        updateTransactions
    );


$("filterType")
    .addEventListener(
        "change",
        updateTransactions
    );


/* =========================
   SIDEBAR NAVIGATION
========================= */

document
    .querySelectorAll(
        ".nav-btn"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".nav-btn"
                        )
                        .forEach(
                            btn =>
                                btn.classList
                                    .remove(
                                        "active"
                                    )
                        );


                    button.classList.add(
                        "active"
                    );


                    const section =
                        document.getElementById(
                            button.dataset.section
                        );


                    if (
                        section
                    ) {

                        section.scrollIntoView({

                            behavior:
                                "smooth"

                        });

                    }

                }
            );

        }
    );


/* =========================
   UPDATE EVERYTHING
========================= */

function updateAll() {

    updateSummary();

    updateStatistics();

    updateChart();
updateCategoryPieChart();
    updateBudget();

    updateSavingsGoal();

    updateTransactions();

}


/* =========================
   ENTER KEY LOGIN
========================= */

$("loginPassword")
    .addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                login();

            }

        }
    );


/* =========================
   ENTER KEY REGISTER
========================= */

$("confirmPassword")
    .addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                registerUser();

            }

        }
    );


/* =========================
   START APPLICATION
========================= */

checkBackendSession();