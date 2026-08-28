const CHAVE = "talenta-sessao";

/** Credenciais liberadas para uso da ferramenta (uso interno). */
const CREDENCIAIS: Array<{ usuario: string; senha: string }> = [
  { usuario: "admin", senha: "nightwaker2026" },
  { usuario: "elizabete@elizabetescain.com.br", senha: "123@abc" },
];

export function validarCredenciais(usuario: string, senha: string) {
  const login = usuario.trim().toLowerCase();
  return CREDENCIAIS.some((c) => c.usuario === login && c.senha === senha);
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
