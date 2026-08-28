const CHAVE = "talenta-sessao";

/** Credenciais padrão de uso da ferramenta (uso interno). */
export const USUARIO_PADRAO = "admin";
export const SENHA_PADRAO = "nightwaker2026";

export function validarCredenciais(usuario: string, senha: string) {
  return usuario.trim().toLowerCase() === USUARIO_PADRAO && senha === SENHA_PADRAO;
}


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
