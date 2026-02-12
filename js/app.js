/* ---------- THEME ---------- */
const themeSelect = document.getElementById("themeSelect");
const savedTheme = localStorage.getItem("theme") || "dark";
document.body.className = savedTheme;
themeSelect.value = savedTheme;

themeSelect.onchange = () => {
  document.body.className = themeSelect.value;
  localStorage.setItem("theme", themeSelect.value);
};

/* ---------- AUTH STATE ---------- */
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

/* ---------- NAV ---------- */
const app = document.getElementById("app");
const accountBtn = document.getElementById("accountBtn");
document.getElementById("homeLogo").onclick = loadTodo;

/* ---------- DAYS ---------- */
const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
let currentDay = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

/* ---------- TASK DATA ---------- */
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveAll() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("users", JSON.stringify(users));
}

/* ---------- HEADER ---------- */
function updateHeader() {
  if (currentUser) {
    accountBtn.textContent = "Logout";
    accountBtn.onclick = logout;
  } else {
    accountBtn.textContent = "Login / Register";
    accountBtn.onclick = loadLogin;
  }
}
updateHeader();

/* ---------- PAGES ---------- */
function loadTodo() {
  app.innerHTML = `
    <div class="todo-card">
      <h2>My Tasks</h2>

      <div class="days">
        ${days.map(d =>
          `<div class="day ${d===currentDay?"active":""}"
           onclick="selectDay('${d}')">${d}</div>`).join("")}
      </div>

      <input id="taskTitle" placeholder="Task title">
      <textarea id="taskDesc" placeholder="Task description"></textarea>

      <div class="top-row">
        <div class="counters">
          <span id="cDone">Completed: 0</span>
          <span id="cProg">In Progress: 0</span>
          <span id="cPend">Pending: 0</span>
        </div>
        <button onclick="addTask()">Add</button>
      </div>

      <div class="task-list" id="taskList"></div>
      <div id="empty" class="empty"></div>
    </div>
  `;
  render();
}

function loadLogin() {
  app.innerHTML = `
    <div class="todo-card">
      <h2>Login</h2>
      <input id="loginEmail" placeholder="Email">
      <input id="loginPass" type="password" placeholder="Password">
      <button onclick="handleLogin()">Login</button>
      <p style="margin-top:10px;cursor:pointer;color:var(--accent)"
         onclick="loadRegister()">Don't have an account? Register</p>
    </div>
  `;
}

function loadRegister() {
  app.innerHTML = `
    <div class="todo-card">
      <h2>Register</h2>
      <input id="regEmail" placeholder="Email">
      <input id="regPass" type="password" placeholder="Password">
      <button onclick="handleRegister()">Register</button>
      <p style="margin-top:10px;cursor:pointer;color:var(--accent)"
         onclick="loadLogin()">Already have an account? Login</p>
    </div>
  `;
}

/* ---------- AUTH LOGIC ---------- */
function handleRegister() {
  const email = regEmail.value.trim();
  const pass = regPass.value.trim();
  if (!email || !pass) return alert("Fill all fields");

  if (users.find(u => u.email === email)) {
    alert("User already exists");
    return;
  }

  const user = { email, pass };
  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));
  currentUser = user;
  localStorage.setItem("currentUser", JSON.stringify(user));
  updateHeader();
  loadTodo();
}

function handleLogin() {
  const email = loginEmail.value.trim();
  const pass = loginPass.value.trim();

  const user = users.find(u => u.email === email && u.pass === pass);
  if (!user) return alert("Invalid credentials");

  currentUser = user;
  localStorage.setItem("currentUser", JSON.stringify(user));
  updateHeader();
  loadTodo();
}

function logout() {
  localStorage.removeItem("currentUser");
  currentUser = null;
  updateHeader();
  loadLogin();
}

/* ---------- TASK LOGIC ---------- */
function selectDay(d) {
  currentDay = d;
  loadTodo();
}

function addTask() {
  const t = taskTitle.value.trim();
  const d = taskDesc.value.trim();
  if (!t) return;

  tasks.push({
    id: Date.now(),
    title:t,
    desc:d,
    status:"pending",
    day:currentDay
  });
  saveAll();
  loadTodo();
}

function updateStatus(id,v) {
  tasks.find(t=>t.id===id).status=v;
  saveAll();
  render();
}

function editTask(id) {
  const task = tasks.find(t=>t.id===id);
  const t = prompt("Edit title", task.title);
  const d = prompt("Edit description", task.desc);
  if (t!==null) task.title=t;
  if (d!==null) task.desc=d;
  saveAll();
  render();
}

function del(id) {
  tasks = tasks.filter(t=>t.id!==id);
  saveAll();
  render();
}

function render() {
  const list = document.getElementById("taskList");
  const empty = document.getElementById("empty");
  list.innerHTML="";

  let c=0,p=0,ip=0;
  const today = tasks.filter(t=>t.day===currentDay);

  if (!today.length) {
    empty.textContent = "No tasks for this day ✨";
  } else empty.textContent="";

  today.forEach(t=>{
    if(t.status==="completed") c++;
    else if(t.status==="in-progress") ip++;
    else p++;

    list.innerHTML+=`
      <div class="task ${t.status}">
        <div class="task-header">
          <b>${t.title}</b>
          <div class="task-actions">
            <button onclick="editTask(${t.id})">Edit</button>
            <button onclick="del(${t.id})">Delete</button>
          </div>
        </div>
        <div class="task-desc">${t.desc||"No description"}</div>
        <select onchange="updateStatus(${t.id},this.value)">
          <option value="pending" ${t.status==="pending"?"selected":""}>Pending</option>
          <option value="in-progress" ${t.status==="in-progress"?"selected":""}>In Progress</option>
          <option value="completed" ${t.status==="completed"?"selected":""}>Completed</option>
        </select>
      </div>`;
  });

  cDone.textContent=`Completed: ${c}`;
  cProg.textContent=`In Progress: ${ip}`;
  cPend.textContent=`Pending: ${p}`;
}

/* ---------- INIT ---------- */
loadTodo();