import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { CategoryValue } from '@/components/category-value';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { useSubmitTriage } from '@workspace/api-client-react';
import { AlertCircle, ArrowUpRight, Clipboard, ClipboardList, LockKeyhole, Send } from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Home() {
  const submitTriage = useSubmitTriage();
  const [nome, setNome] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitTriage.mutateAsync>> | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationError, setValidationError] = useState('');
  const [copyFeedback, setCopyFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  useEffect(() => {
    if (!copyFeedback) return;
    const timeoutId = window.setTimeout(() => setCopyFeedback(null), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [copyFeedback]);

  const suggestedReply =
    typeof result?.Resposta_sugerida === 'string' ? result.Resposta_sugerida : '';
  const hasSuggestedReply = suggestedReply.trim().length > 0;

  async function handleCopyDraft() {
    if (!hasSuggestedReply) return;

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API indisponível');
      }
      await navigator.clipboard.writeText(suggestedReply);
      setCopyFeedback({ message: 'Rascunho copiado.', isError: false });
    } catch {
      setCopyFeedback({ message: 'Não foi possível copiar. Selecione e copie o texto.', isError: true });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nome.trim() || !mensagem.trim()) {
      setValidationError('Preencha o nome fictício e a mensagem antes de continuar.');
      return;
    }
    setValidationError('');
    setErrorMessage('');
    setResult(null);
    setCopyFeedback(null);
    try {
      const response = await submitTriage.mutateAsync({ data: { nome: nome.trim(), mensagem: mensagem.trim() } });
      setResult(response);
    } catch (error: unknown) {
      const apiError = error as { data?: { error?: string } };
      const fallbackMessage =
        error instanceof TypeError
          ? 'Não foi possível conectar ao servidor. Verifique se ele está disponível antes de tentar novamente.'
          : 'Não foi possível confirmar a resposta do n8n. Nenhuma nova chamada automática foi feita.';
      setErrorMessage(apiError.data?.error || fallbackMessage);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="mx-auto flex h-full max-w-[1120px] items-center justify-between px-5 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="brand-mark" aria-hidden="true"><ClipboardList size={20} strokeWidth={2.1} /></span>
            <span className="display-font text-[15px] font-bold tracking-[-0.03em] text-[#24364a]">Central de Solicitações</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#64788d]">
            <span className="h-2 w-2 rounded-full bg-[#58a6a2]" aria-hidden="true" />
            Demonstração acadêmica
          </div>
        </div>
      </header>

      <main className="page-wrap">
        <section className="intro" aria-labelledby="page-title">
          <div className="eyebrow">Triagem de solicitações</div>
          <h1 id="page-title" className="main-title">Conte o que você precisa.</h1>
          <p className="intro-copy">
            Envie sua solicitação e acompanhe o andamento dela. Direto ao ponto, com transparência em cada etapa
          </p>
        </section>

        <div className="content-grid">
          <section className="panel form-panel" aria-labelledby="form-title">
            <div className="panel-heading">
              <div>
                <h2 id="form-title" className="panel-title">Nova solicitação</h2>
                <p className="panel-subtitle">Preencha os campos para iniciar a triagem.</p>
              </div>
              <span className="step-tag">01 / 01</span>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <div className="field-row">
                  <label className="field-label" htmlFor="nome">Nome fictício <span aria-hidden="true">*</span></label>
                  <span className="field-count">até 100 caracteres</span>
                </div>
                <input
                  id="nome"
                  className="field-control"
                  type="text"
                  autoComplete="name"
                  placeholder="Como podemos chamar você?"
                  value={nome}
                  maxLength={100}
                  required
                  aria-required="true"
                  aria-invalid={Boolean(validationError && !nome.trim())}
                  aria-describedby={validationError && !nome.trim() ? 'form-validation-error' : undefined}
                  onChange={(event) => setNome(event.target.value)}
                  data-testid="input-nome"
                />
              </div>

              <div className="field">
                <div className="field-row">
                  <label className="field-label" htmlFor="mensagem">Mensagem <span aria-hidden="true">*</span></label>
                  <span className="field-count">{mensagem.length} / 2.000</span>
                </div>
                <textarea
                  id="mensagem"
                  className="field-control"
                  placeholder="Escreva uma mensagem fictícia com o contexto necessário..."
                  value={mensagem}
                  maxLength={2000}
                  required
                  aria-required="true"
                  aria-invalid={Boolean(validationError && !mensagem.trim())}
                  aria-describedby={validationError && !mensagem.trim() ? 'form-validation-error' : undefined}
                  onChange={(event) => setMensagem(event.target.value)}
                  data-testid="input-mensagem"
                />
              </div>

              {validationError && (
                <p id="form-validation-error" className="field-error" role="alert" data-testid="text-validation-error">
                  {validationError}
                </p>
              )}

              <div className="privacy-note" role="note" data-testid="text-privacy-warning">
                <LockKeyhole size={16} aria-hidden="true" />
                <span><strong>Aviso:</strong> Projeto demonstrativo. Utilize apenas dados fictícios.</span>
              </div>

              {errorMessage && (
                <div className="error-state" role="alert" data-testid="status-submission-error">
                  <AlertCircle size={18} aria-hidden="true" />
                  <p><strong>Não foi possível concluir o envio.</strong><br />{errorMessage}</p>
                </div>
              )}

              <button className="submit-button" type="submit" disabled={submitTriage.isPending} data-testid="button-submit">
                {submitTriage.isPending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                    Analisando solicitação...
                  </>
                ) : (
                  <>Classificar solicitação <ArrowUpRight size={17} aria-hidden="true" /></>
                )}
              </button>
              <p className="form-footnote">Campos marcados com * são obrigatórios</p>
            </form>
          </section>

          <section className="panel result-panel" aria-labelledby="result-title" aria-live="polite">
            <div className="result-top">
              <div className="result-topline">
                <span className="result-kicker">Retorno da triagem</span>
                <span className="result-icon" aria-hidden="true"><Send size={17} /></span>
              </div>
              <h2 id="result-title" className="result-title">Resultado da solicitação</h2>
            </div>
            <div className="result-body">
              {submitTriage.isPending ? (
                <div className="result-data" aria-label="Processando solicitação" data-testid="status-loading">
                  <div><div className="loading-skeleton mb-3 w-20" /><div className="loading-skeleton w-3/4" /></div>
                  <div><div className="loading-skeleton mb-3 w-24" /><div className="loading-skeleton w-full" /></div>
                  <div><div className="loading-skeleton mb-3 w-24" /><div className="loading-skeleton w-2/3" /></div>
                </div>
              ) : result ? (
                <div className="result-data" data-testid="result-triage">
                  <div className="result-field">
                    <span className="result-label">Nome</span>
                    <p className="result-value" data-testid="text-result-name">{result.Nome}</p>
                  </div>
                  <div className="result-field">
                    <span className="result-label">Mensagem</span>
                    <p className="result-value" data-testid="text-result-message">{result.Mensagem}</p>
                  </div>
                  <div className="result-field">
                    <span className="result-label">Categoria</span>
                    <CategoryValue value={result.Categoria} />
                  </div>
                  <div>
                    <span className="result-label">Status</span>
                    <span className="status-value" data-testid="status-result">{result.Status}</span>
                  </div>
                  <section className="suggested-reply" aria-labelledby="suggested-reply-title">
                    <div className="suggested-reply-heading">
                      <h3 id="suggested-reply-title" className="suggested-reply-title">
                        Sugestão de resposta — revisão humana necessária
                      </h3>
                      <button
                        className="copy-button"
                        type="button"
                        onClick={handleCopyDraft}
                        disabled={!hasSuggestedReply}
                        aria-describedby="copy-feedback"
                        data-testid="button-copy-draft"
                      >
                        <Clipboard size={15} aria-hidden="true" />
                        Copiar rascunho
                      </button>
                    </div>
                    {hasSuggestedReply ? (
                      <p className="suggested-reply-content" data-testid="text-suggested-reply">
                        {suggestedReply}
                      </p>
                    ) : (
                      <p className="suggested-reply-content suggested-reply-empty" data-testid="text-suggested-reply">
                        Nenhuma sugestão de resposta foi retornada.
                      </p>
                    )}
                    <p
                      id="copy-feedback"
                      className={`copy-feedback${copyFeedback?.isError ? ' copy-feedback-error' : ''}`}
                      role="status"
                      aria-live="polite"
                    >
                      {copyFeedback?.message}
                    </p>
                  </section>
                </div>
              ) : (
                <div className="result-empty" data-testid="empty-triage-result">
                  <span className="empty-symbol" aria-hidden="true"><ClipboardList size={30} strokeWidth={1.7} /></span>
                  <h3 className="empty-title">Seu retorno aparecerá aqui</h3>
                  <p className="empty-copy">Após o envio, mostramos a resposta real recebida do fluxo de classificação.</p>
                </div>
              )}
            </div>
          </section>
        </div>
        <p className="footer-note">Ambiente demonstrativo · As classificações são retornadas pelo serviço conectado.</p>
      </main>
    </div>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
