export type CorreiosEnvironment = 'production' | 'homologation';

export interface CorreiosConfig {
  environment: CorreiosEnvironment;
  usuario: string;
  senha: string;
  codAdministrativo: string;
  cartaoPostagem: string;
  numeroContrato: string;
  cnpjEmpresa: string;
  codigoServico: string;
  wsdlUrl?: string;
  timeoutMs?: number;
  rejectUnauthorized?: boolean;
}

export interface Party {
  nome: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  referencia?: string;
  ddd?: string;
  telefone?: string;
  dddCelular?: string;
  celular?: string;
  email?: string;
  identificacao?: string;
  sms?: boolean;
}

export interface CollectionItem {
  item?: number;
  desc?: string;
  entrega?: string;
  num?: string;
  id?: string;
}

export interface CollectionRequest {
  tipo?: 'A';
  ag: number | string;
  valorDeclarado?: number;
  servicoAdicional?: string;
  ar?: number | string;
  remetente: Party;
  objCol?: CollectionItem;
}

export interface IssueAuthorizationInput {
  destinatario: Party;
  coleta: CollectionRequest;
  codigoServico?: string;
}

export interface TrackByOrderNumberInput {
  numeroPedido: string | number;
  tipoBusca?: 'H';
  tipoSolicitacao?: 'A';
}

export interface TrackByDateInput {
  /** ISO date YYYY-MM-DD */
  data: string;
  tipoSolicitacao?: 'A';
}

export interface CancelOrderInput {
  numeroPedido: string | number;
  tipo?: 'A';
}

export interface IssueAuthorizationResult {
  numeroColeta?: string;
  prazo?: string;
  statusObjeto?: string;
  codigoErro?: string | number;
  descricaoErro?: string;
  dataSolicitacao?: string;
  raw: unknown;
}

export interface TrackResult {
  coleta: unknown;
  raw: unknown;
}

export interface CancelOrderResult {
  objetoPostal: unknown;
  raw: unknown;
}