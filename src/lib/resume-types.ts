export type Experiencia = {
  empresa: string;
  periodo: string;
  descricaoEmpresa: string;
  cargo: string;
  atividades: string;
};

export type Curriculo = {
  nome: string;
  dataNascimento: string;
  email: string;
  telefone: string;
  transporteProprio: "SIM" | "NAO" | "";
  cidade: string;
  objetivo: string;
  formacao: string[];
  experiencias: Experiencia[];
  competencias: string;
  entrevista: string;
};

export type AvaliacaoSecao = {
  titulo: string;
  paragrafos: string[];
};

export type Avaliacao = {
  tipo: "PDA" | "DISC";
  candidato: string;
  data: string;
  perfil: string;
  resumo: string;
  palavras: string[];
  secoes: AvaliacaoSecao[];
};

export const CURRICULO_VAZIO: Curriculo = {

  nome: "",
  dataNascimento: "",
  email: "",
  telefone: "",
  transporteProprio: "",
  cidade: "",
  objetivo: "",
  formacao: [],
  experiencias: [],
  competencias: "",
  entrevista: "",
};
