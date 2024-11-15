// middleware/login-block.js
const { MAX_LOGIN_ATTEMPTS, BLOCK_TIME } = require('../utils/config');

const loginAttempts = {};

function isBlocked(username) {
  if (!loginAttempts[username]) return false;
  
  const { attempts, blockedAt } = loginAttempts[username];
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    const now = Date.now();
    const blockTimePassed = (now - blockedAt) / (1000 * 60);
    const blockStartTime = new Date(blockedAt).toLocaleTimeString('pt-BR');

    if (blockTimePassed >= BLOCK_TIME) {
      delete loginAttempts[username];
      return false;
    }
    
    return { blocked: true, unblockIn: BLOCK_TIME - blockTimePassed, blockStartTime };
  }

  return false;
}

function addAttempt(username) {
  if (!loginAttempts[username]) {
    loginAttempts[username] = { attempts: 0, blockedAt: null };
  }
  loginAttempts[username].attempts += 1;

  if (loginAttempts[username].attempts >= MAX_LOGIN_ATTEMPTS) {
    loginAttempts[username].blockedAt = Date.now();
  }
}

module.exports = { isBlocked, addAttempt };
