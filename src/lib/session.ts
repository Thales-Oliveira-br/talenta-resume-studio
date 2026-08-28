const CHAVE = "talenta-sessao";

export function entrar() {
  try {
    localStorage.setItem(CHAVE, "1");
  } catch {
    /* ignora */
  }
}

export function sair() {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* ignora */
  }
}

export function estaLogado() {
  try {
    return localStorage.getItem(CHAVE) === "1";
  } catch {
    return false;
  }
}
