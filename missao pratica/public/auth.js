// auth.js
// ...

// Função para exibir mensagem de usuário logado
function updateLoginStatus(isLoggedIn, user) {
  const status = document.getElementById("loginStatus");
  if (isLoggedIn) {
    status.textContent = `Logado como: ${user}`;
    status.classList.remove("logged-out");
    status.classList.add("logged-in");
  } else {
    status.textContent = "Não logado";
    status.classList.remove("logged-in");
    status.classList.add("logged-out");
  }
}

// Função para realizar login e armazenar o token e a data de expiração no localStorage
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const status = document.getElementById("loginStatus");
  

  console.log('usuario e senha',username,password);

  fetch('http://localhost:3000/api/auth/login', {
    method: "POST",
    body: JSON.stringify({ username, password }),
    headers: { "Content-Type": "application/json" }
  })
  .then(response => response.json())
  .then(data => {
    console.log('token recebido',data.token)
    if (data.token) {
      const decoded = parseJwt(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("tokenExp", decoded.exp * 1000);
      updateLoginStatus(true, username);
      alert("Login realizado com sucesso!");
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExp");
      updateLoginStatus(false);
      
      // Verifica se há uma mensagem de bloqueio com o tempo de desbloqueio 15/10
       
      console.log('data.message >>>',data.message)
      console.log('data.unblockIn >>>',data.unblockIn)

      if (data.message === 'Conta bloqueada após múltiplas tentativas falhas' && data.unblockIn) {
        status.textContent = `Usuário bloqueado desde ${data.blockStartTime}. Tente novamente em ${data.unblockIn} minutos.`;
        status.classList.add("logged-out");
      } else {
        alert(`Erro de autenticação: ${data.message}`);
      }
      //desabilitado em 15/10
      //alert(`Erro de autenticação  ${data.message}`);
    }
  })
  .catch(err => console.error("Erro:", err));
}

// Função para decodificar o token JWT
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(''));

  return JSON.parse(jsonPayload);
}


// Verificação do token
function isUserLoggedIn() {
  const token = localStorage.getItem("token");
  const tokenExp = localStorage.getItem("tokenExp");
  if (token && !isTokenExpired(tokenExp)) {
    return true;
  }
  return false;
}

// Verificar se o token expirou
function isTokenExpired(tokenExp) {
  const now = Date.now();
  return now > tokenExp;
}

// Função para listar perfis, apenas se estiver logado
function listUsers() {
  if (!isUserLoggedIn()) {
    alert("Faça login para acessar esta funcionalidade.");
    return;
  }
  // Fazer a solicitação da listagem de perfis
  fetch('http://localhost:3000/api/users', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  })
  .then(response => response.json())
  .then(data => {
    alert(JSON.stringify(data));
  })
  .catch(err => console.error("Erro:", err));
}
 
function listContracts(all = false) {
  if (!isUserLoggedIn()) {
    alert("Faça login para acessar esta funcionalidade.");
    return;
  }

  let endpoint = 'api/contracts';

  if (!all) {
    const empresa = prompt("Digite o nome da empresa para filtrar:");
    const inicio = prompt("Digite a data de início (YYYY-MM-DD) para filtrar:");
    
    if (!empresa || !inicio) {
      alert("Filtros não fornecidos. Operação cancelada.");
      return;
    }
     
    endpoint += `?empresa=${empresa}&inicio=${inicio}`;
  } else {
    endpoint += '/all';
  }

  fetch(`http://localhost:3000/${endpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  })
  .then(response => response.json())
  .then(data => {
    alert(JSON.stringify(data));
  })
  .catch(err => console.error("Erro:", err));
}

// Função para obter o perfil do usuário logado
function getUserProfile() {
  if (!isUserLoggedIn()) {
    alert("Faça login para acessar esta funcionalidade.");
    return;
  }

  // Fazer a solicitação para obter o perfil do usuário
  fetch('http://localhost:3000/api/auth/profile', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.message) {
      alert(data.message);
    } else {
      alert(`Perfil do usuário:\n\n${JSON.stringify(data, null, 2)}`);
    }
  })
  .catch(err => console.error("Erro ao obter perfil do usuário:", err));
}


document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault();
  login();
});

document.getElementById("btnListarPerfis").addEventListener("click", listUsers);
document.getElementById("btnListarContratos").addEventListener("click", () => listContracts(false));
document.getElementById("btnListarTodosContratos").addEventListener("click", () => listContracts(true));
document.getElementById("btnPerfilUsuario").addEventListener("click", getUserProfile);