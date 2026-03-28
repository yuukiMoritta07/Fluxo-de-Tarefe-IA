import { useEffect, useMemo, useState } from "react";
import "./App.css";

function App() {
  const [secao, setSecao] = useState("dashboard");
  const [modoEscuro, setModoEscuro] = useState(false);

  const [tarefas, setTarefas] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todas");

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prioridade, setPrioridade] = useState("media");
  const [prazo, setPrazo] = useState("");

  const [editandoId, setEditandoId] = useState(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editPrioridade, setEditPrioridade] = useState("media");
  const [editPrazo, setEditPrazo] = useState("");

  const [toast, setToast] = useState({
    mostrar: false,
    mensagem: "",
    tipo: "sucesso",
  });

  const [modalExcluir, setModalExcluir] = useState({
    aberto: false,
    id: null,
  });

  useEffect(() => {
    const tarefasSalvas = localStorage.getItem("taskflow_tarefas");
    const temaSalvo = localStorage.getItem("taskflow_tema");

    if (tarefasSalvas) setTarefas(JSON.parse(tarefasSalvas));
    if (temaSalvo) setModoEscuro(JSON.parse(temaSalvo));
  }, []);

  useEffect(() => {
    localStorage.setItem("taskflow_tarefas", JSON.stringify(tarefas));
  }, [tarefas]);

  useEffect(() => {
    localStorage.setItem("taskflow_tema", JSON.stringify(modoEscuro));
  }, [modoEscuro]);

  function mostrarToast(mensagem, tipo = "sucesso") {
    setToast({ mostrar: true, mensagem, tipo });
    setTimeout(() => {
      setToast({ mostrar: false, mensagem: "", tipo: "sucesso" });
    }, 2500);
  }

  function adicionarTarefa() {
    if (!titulo.trim()) return;

    const nova = {
      id: Date.now(),
      titulo,
      descricao,
      prioridade,
      prazo,
      concluida: false,
      criadaEm: new Date().toLocaleDateString("pt-BR"),
    };

    setTarefas([nova, ...tarefas]);
    setTitulo("");
    setDescricao("");
    setPrioridade("media");
    setPrazo("");
    setSecao("tarefas");
    mostrarToast("Tarefa criada com sucesso.");
  }

  function concluirTarefa(id) {
    const atualizadas = tarefas.map((tarefa) =>
      tarefa.id === id
        ? { ...tarefa, concluida: !tarefa.concluida }
        : tarefa
    );
    setTarefas(atualizadas);
    mostrarToast("Status da tarefa atualizado.");
  }

  function abrirModalExcluir(id) {
    setModalExcluir({ aberto: true, id });
  }

  function fecharModalExcluir() {
    setModalExcluir({ aberto: false, id: null });
  }

  function confirmarExclusao() {
    const atualizadas = tarefas.filter(
      (tarefa) => tarefa.id !== modalExcluir.id
    );
    setTarefas(atualizadas);
    fecharModalExcluir();
    mostrarToast("Tarefa excluída com sucesso.", "erro");
  }

  function iniciarEdicao(tarefa) {
    setEditandoId(tarefa.id);
    setEditTitulo(tarefa.titulo);
    setEditDescricao(tarefa.descricao);
    setEditPrioridade(tarefa.prioridade);
    setEditPrazo(tarefa.prazo || "");
  }

  function salvarEdicao(id) {
    if (!editTitulo.trim()) return;

    const atualizadas = tarefas.map((tarefa) =>
      tarefa.id === id
        ? {
            ...tarefa,
            titulo: editTitulo,
            descricao: editDescricao,
            prioridade: editPrioridade,
            prazo: editPrazo,
          }
        : tarefa
    );

    setTarefas(atualizadas);
    cancelarEdicao();
    mostrarToast("Tarefa editada com sucesso.");
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setEditTitulo("");
    setEditDescricao("");
    setEditPrioridade("media");
    setEditPrazo("");
  }

  function melhorarComIA(id) {
    const atualizadas = tarefas.map((tarefa) => {
      if (tarefa.id !== id) return tarefa;

      let novoTitulo = tarefa.titulo;
      let novaDescricao = tarefa.descricao;

      const texto = `${tarefa.titulo} ${tarefa.descricao}`.toLowerCase();

      if (texto.includes("estudar")) {
        novoTitulo = "Estudar com foco e meta definida";
        novaDescricao =
          "Separar 2 horas de estudo, revisar teoria, praticar exercícios e anotar os principais aprendizados.";
      } else if (texto.includes("linkedin")) {
        novoTitulo = "Otimizar perfil do LinkedIn para recrutadores";
        novaDescricao =
          "Melhorar foto, título profissional, resumo, competências e destacar projetos com resultados reais.";
      } else if (texto.includes("github") || texto.includes("portfolio")) {
        novoTitulo = "Evoluir projeto para portfólio profissional";
        novaDescricao =
          "Melhorar interface, organizar código, criar README forte e destacar tecnologias e funcionalidades.";
      } else {
        novoTitulo = `Plano de ação: ${tarefa.titulo}`;
        novaDescricao = tarefa.descricao?.trim()
          ? `${tarefa.descricao} | Dividir em etapas menores, definir prazo e resultado esperado.`
          : "Definir objetivo, etapas, prazo e resultado esperado para executar essa tarefa com clareza.";
      }

      return {
        ...tarefa,
        titulo: novoTitulo,
        descricao: novaDescricao,
      };
    });

    setTarefas(atualizadas);
    mostrarToast("Sugestão da IA aplicada.");
  }

  function formatarData(data) {
    if (!data) return "Sem prazo";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function tarefaAtrasada(tarefa) {
    if (!tarefa.prazo || tarefa.concluida) return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const prazoData = new Date(`${tarefa.prazo}T00:00:00`);
    return prazoData < hoje;
  }

  const tarefasFiltradas = useMemo(() => {
    return tarefas.filter((tarefa) => {
      const matchBusca =
        tarefa.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        tarefa.descricao.toLowerCase().includes(busca.toLowerCase());

      let matchFiltro = true;

      if (filtro === "concluidas") matchFiltro = tarefa.concluida;
      else if (filtro === "pendentes") matchFiltro = !tarefa.concluida;
      else if (filtro === "atrasadas") matchFiltro = tarefaAtrasada(tarefa);
      else if (["alta", "media", "baixa"].includes(filtro)) {
        matchFiltro = tarefa.prioridade === filtro;
      }

      return matchBusca && matchFiltro;
    });
  }, [tarefas, busca, filtro]);

  const total = tarefas.length;
  const concluidas = tarefas.filter((t) => t.concluida).length;
  const pendentes = total - concluidas;
  const altaPrioridade = tarefas.filter(
    (t) => t.prioridade === "alta" && !t.concluida
  ).length;
  const produtividade = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  const maxGrafico = Math.max(total, concluidas, pendentes, altaPrioridade, 1);

  const nomeDia = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <div className={modoEscuro ? "app dark" : "app"}>
      <aside className="sidebar">
        <div>
          <h2>TaskFlow AI</h2>
          <p>Sistema de Produtividade com IA</p>
        </div>

        <div className="menu">
          <button onClick={() => setSecao("dashboard")}>📊 Dashboard</button>
          <button onClick={() => setSecao("tarefas")}>✅ Tarefas</button>
        </div>

        <button className="tema-btn" onClick={() => setModoEscuro(!modoEscuro)}>
          {modoEscuro ? "☀️ Modo claro" : "🌙 Modo escuro"}
        </button>
      </aside>

      <main className="main">
        <header className="topo premium-topo">
          <div>
            <span className="mini-label">Painel inteligente</span>
            <h1>
              {secao === "dashboard"
                ? "Dashboard de Produtividade"
                : "Gerenciador de Tarefas"}
            </h1>
            <p>Organize sua rotina com mais clareza, foco e produtividade.</p>
          </div>

          <div className="topo-direita">
            <div className="data-box">
              <span>Hoje</span>
              <strong>{nomeDia}</strong>
            </div>
            <div className="avatar-box">CY</div>
          </div>
        </header>

        <section className="cadastro">
          <h3>Nova tarefa</h3>

          <input
            type="text"
            placeholder="Título da tarefa"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <textarea
            placeholder="Descrição da tarefa"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <div className="linha-form">
            <select
              value={prioridade}
              onChange={(e) => setPrioridade(e.target.value)}
            >
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>

            <input
              type="date"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
            />
          </div>

          <button className="nova-tarefa" onClick={adicionarTarefa}>
            + Adicionar tarefa
          </button>
        </section>

        {secao === "dashboard" ? (
          <>
            <section className="dashboard-grid">
              <div className="card-info">
                <span className="icone-card">📁</span>
                <h3>Total</h3>
                <p>{total}</p>
              </div>

              <div className="card-info">
                <span className="icone-card">✅</span>
                <h3>Concluídas</h3>
                <p>{concluidas}</p>
              </div>

              <div className="card-info">
                <span className="icone-card">⏳</span>
                <h3>Pendentes</h3>
                <p>{pendentes}</p>
              </div>

              <div className="card-info">
                <span className="icone-card">🔥</span>
                <h3>Urgentes</h3>
                <p>{altaPrioridade}</p>
              </div>
            </section>

            <section className="dashboard-duplo">
              <div className="bloco">
                <div className="titulo-bloco">
                  <h3>Produtividade</h3>
                  <span>{produtividade}%</span>
                </div>

                <div className="barra-progresso">
                  <div
                    className="barra-preenchida"
                    style={{ width: `${produtividade}%` }}
                  ></div>
                </div>

                <p className="resumo">
                  Acompanhe seu desempenho geral e mantenha consistência nas
                  entregas.
                </p>
              </div>

              <div className="bloco">
                <div className="titulo-bloco">
                  <h3>Gráfico rápido</h3>
                  <span>Resumo</span>
                </div>

                <div className="grafico">
                  <div className="barra-item">
                    <div
                      className="barra total"
                      style={{ height: `${(total / maxGrafico) * 140}px` }}
                    ></div>
                    <span>Total</span>
                  </div>

                  <div className="barra-item">
                    <div
                      className="barra concluidas"
                      style={{ height: `${(concluidas / maxGrafico) * 140}px` }}
                    ></div>
                    <span>Concluídas</span>
                  </div>

                  <div className="barra-item">
                    <div
                      className="barra pendentes"
                      style={{ height: `${(pendentes / maxGrafico) * 140}px` }}
                    ></div>
                    <span>Pendentes</span>
                  </div>

                  <div className="barra-item">
                    <div
                      className="barra urgentes"
                      style={{
                        height: `${(altaPrioridade / maxGrafico) * 140}px`,
                      }}
                    ></div>
                    <span>Urgentes</span>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="filtros">
              <input
                type="text"
                placeholder="Buscar tarefa..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />

              <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
                <option value="todas">Todas</option>
                <option value="concluidas">Concluídas</option>
                <option value="pendentes">Pendentes</option>
                <option value="atrasadas">Atrasadas</option>
                <option value="alta">Prioridade Alta</option>
                <option value="media">Prioridade Média</option>
                <option value="baixa">Prioridade Baixa</option>
              </select>
            </section>

            <section className="bloco">
              {tarefasFiltradas.length === 0 ? (
                <p className="sem-tarefas">Nenhuma tarefa encontrada.</p>
              ) : (
                tarefasFiltradas.map((tarefa) => (
                  <div
                    key={tarefa.id}
                    className={`tarefa ${tarefa.prioridade} ${
                      tarefaAtrasada(tarefa) ? "atrasada" : ""
                    }`}
                  >
                    {editandoId === tarefa.id ? (
                      <div className="edicao-area">
                        <input
                          type="text"
                          value={editTitulo}
                          onChange={(e) => setEditTitulo(e.target.value)}
                        />

                        <textarea
                          value={editDescricao}
                          onChange={(e) => setEditDescricao(e.target.value)}
                        />

                        <div className="linha-form">
                          <select
                            value={editPrioridade}
                            onChange={(e) => setEditPrioridade(e.target.value)}
                          >
                            <option value="alta">Alta</option>
                            <option value="media">Média</option>
                            <option value="baixa">Baixa</option>
                          </select>

                          <input
                            type="date"
                            value={editPrazo}
                            onChange={(e) => setEditPrazo(e.target.value)}
                          />
                        </div>

                        <div className="acoes">
                          <button
                            className="btn salvar"
                            onClick={() => salvarEdicao(tarefa.id)}
                          >
                            Salvar
                          </button>

                          <button className="btn cancelar" onClick={cancelarEdicao}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="tarefa-topo">
                          <div>
                            <span
                              className={
                                tarefa.concluida
                                  ? "tarefa-titulo concluida"
                                  : "tarefa-titulo"
                              }
                            >
                              {tarefa.titulo}
                            </span>

                            <p className="descricao">{tarefa.descricao}</p>
                          </div>

                          <span className={`badge ${tarefa.prioridade}`}>
                            {tarefa.prioridade}
                          </span>
                        </div>

                        <div className="info-extra">
                          <small className="data">
                            Criada em: {tarefa.criadaEm}
                          </small>
                          <small className="data">
                            Prazo: {formatarData(tarefa.prazo)}
                          </small>
                          {tarefaAtrasada(tarefa) && (
                            <small className="atrasada-texto">Atrasada</small>
                          )}
                        </div>

                        <div className="acoes">
                          <button
                            className="btn concluir"
                            onClick={() => concluirTarefa(tarefa.id)}
                          >
                            {tarefa.concluida ? "Desmarcar" : "Concluir"}
                          </button>

                          <button
                            className="btn editar"
                            onClick={() => iniciarEdicao(tarefa)}
                          >
                            Editar
                          </button>

                          <button
                            className="btn ia"
                            onClick={() => melhorarComIA(tarefa.id)}
                          >
                            Melhorar com IA
                          </button>

                          <button
                            className="btn excluir"
                            onClick={() => abrirModalExcluir(tarefa.id)}
                          >
                            Excluir
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </section>
          </>
        )}
      </main>

      {toast.mostrar && (
        <div className={`toast ${toast.tipo}`}>{toast.mensagem}</div>
      )}

      {modalExcluir.aberto && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Excluir tarefa</h3>
            <p>Tem certeza que deseja excluir esta tarefa?</p>
            <div className="modal-acoes">
              <button className="btn cancelar" onClick={fecharModalExcluir}>
                Cancelar
              </button>
              <button className="btn excluir" onClick={confirmarExclusao}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;