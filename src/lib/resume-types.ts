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
