import React, { useMemo, useRef, useState } from "react";
import "../styles/AvisosYComunicados.css";

export default function AvisosYComunicadosApp() {
  const [items, setItems] = useState(() => [
    {
      id: "c1",
      titulo: "Corte de agua programado",
      contenido:
        "Mañana de 10:00 a 12:00 habrá corte por mantenimiento. Gracias por su comprensión.",
      destinatarios: "Todos los residentes",
      fecha: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      adjuntoNombre: "aviso_mantenimiento.pdf",
    },
    {
      id: "c2",
      titulo: "Reunión del comité de seguridad",
      contenido:
        "Se convoca a los interesados el sábado a las 18:00 en el salón multiusos.",
      destinatarios: "Grupo: Torre B, Grupo: Estacionamientos",
      fecha: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      adjuntoNombre: "",
    },
  ]);

  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [destino, setDestino] = useState("todos"); // 'todos' | 'grupos'
  const [grupos, setGrupos] = useState([]);
  const [adjunto, setAdjunto] = useState(null);
  const [adjuntoPreview, setAdjuntoPreview] = useState(null);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'ok'|'error', msg }
  const [search, setSearch] = useState("");

  const errors = useMemo(() => {
    const e = {};
    if (!titulo.trim()) e.titulo = "Debe completar título";
    if (!contenido.trim()) e.contenido = "Debe completar contenido";
    if (destino === "grupos" && grupos.length === 0)
      e.destino = "Seleccione al menos un grupo";
    return e;
  }, [titulo, contenido, destino, grupos]);

  const maxChars = 1000;
  const remaining = maxChars - contenido.length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.titulo.toLowerCase().includes(q) ||
        it.contenido.toLowerCase().includes(q) ||
        it.destinatarios.toLowerCase().includes(q)
    );
  }, [items, search]);

  const onFile = (file) => {
    setAdjunto(file || null);
    if (!file) return setAdjuntoPreview(null);
    if (/image\//.test(file.type)) {
      const url = URL.createObjectURL(file);
      setAdjuntoPreview({ type: "image", url });
    } else {
      setAdjuntoPreview({ type: "file", name: file.name });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) {
      setToast({ type: "error", msg: "Revise los campos resaltados" });
      return;
    }
    try {
      setSending(true);
      await new Promise((r) => setTimeout(r, 600));
      const destinatariosTexto =
        destino === "todos"
          ? "Todos los residentes"
          : grupos.map((g) => `Grupo: ${g}`).join(", ");

      setItems((prev) => [
        {
          id: "c" + (prev.length + 1),
          titulo: titulo.trim(),
          contenido: contenido.trim(),
          destinatarios: destinatariosTexto,
          fecha: new Date().toISOString(),
          adjuntoNombre: adjunto?.name || "",
        },
        ...prev,
      ]);

      setTitulo("");
      setContenido("");
      setDestino("todos");
      setGrupos([]);
      setAdjunto(null);
      setAdjuntoPreview(null);
      setOpen(false);
      setToast({ type: "ok", msg: "Comunicado enviado y registrado" });
    } catch {
      setToast({
        type: "error",
        msg: "No se pudo enviar el comunicado, intente otra vez",
      });
    } finally {
      setSending(false);
    }
  };

  const addGrupo = (g) => {
    const v = g.trim();
    if (v && !grupos.includes(v)) setGrupos((p) => [...p, v]);
  };
  const removeGrupo = (g) => setGrupos((p) => p.filter((x) => x !== g));

  const titleRef = useRef(null);

  return (
    <div className="ac__app">
      <header className="ac__header" role="banner">
        <div className="ac__header-main">
          <h1>Avisos y comunicados</h1>
        </div>
        <div className="ac__header-actions">
          <button className="ac__btn ac__btn-primary" onClick={() => setOpen(true)}>
            + Nuevo comunicado
          </button>
        </div>
      </header>

      <section className="ac__toolbar" aria-label="Barra de herramientas">
        <input
          className="ac__input"
          placeholder="Buscar por título, contenido o destinatarios…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar comunicados"
        />
      </section>

      <section className="ac__list" aria-live="polite">
        {filtered.length === 0 ? (
          <div className="ac__empty">
            <div className="ac__empty-circle" aria-hidden="true" />
            <h3>Sin resultados</h3>
            <p>Intente con otros términos de búsqueda.</p>
          </div>
        ) : (
          filtered.map((it) => (
            <article className="ac__card" key={it.id}>
              <div className="ac__card-header">
                <h3 className="ac__card-title">{it.titulo}</h3>
                <time className="ac__date" dateTime={it.fecha}>
                  {new Date(it.fecha).toLocaleString()}
                </time>
              </div>
              <p className="ac__card-content">{it.contenido}</p>
              <div className="ac__meta">
                <span className="ac__pill">{it.destinatarios}</span>
                {it.adjuntoNombre && (
                  <span className="ac__pill ac__pill-file">📎 {it.adjuntoNombre}</span>
                )}
              </div>
            </article>
          ))
        )}
      </section>

      {open && (
        <div className="ac__modal" role="dialog" aria-modal="true" aria-labelledby="ac-modal-title">
          <div className="ac__modal-backdrop" onClick={() => !sending && setOpen(false)} />
          <div className="ac__modal-panel">
            <header className="ac__modal-header">
              <h2 id="ac-modal-title">Nuevo comunicado</h2>
              <button
                className="ac__icon-btn"
                aria-label="Cerrar"
                onClick={() => !sending && setOpen(false)}
              >
                ✕
              </button>
            </header>

            <form className="ac__form" onSubmit={handleSubmit} noValidate>
              <div className={`ac__field ${errors.titulo ? "ac__field-error" : ""}`}>
                <label htmlFor="titulo">
                  Título <span className="ac__req">*</span>
                </label>
                <input
                  id="titulo"
                  ref={titleRef}
                  className="ac__input"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
                {errors.titulo && <p className="ac__error">{errors.titulo}</p>}
              </div>

              <div className={`ac__field ${errors.contenido ? "ac__field-error" : ""}`}>
                <label htmlFor="contenido">
                  Contenido <span className="ac__req">*</span>
                </label>
                <textarea
                  id="contenido"
                  className="ac__textarea"
                  maxLength={maxChars}
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                  rows={6}
                />
                <div className="ac__helper">
                  {errors.contenido ? (
                    <p className="ac__error">{errors.contenido}</p>
                  ) : (
                    <span className={`ac__counter ${remaining <= 50 ? "warn" : ""}`}>
                      {remaining} caracteres restantes
                    </span>
                  )}
                </div>
              </div>

              <div className="ac__field">
                <label htmlFor="adjunto">
                  Adjuntar archivo o imagen {adjunto && <span className="ac__muted">{adjunto.name}</span>}
                </label>
                <input
                  id="adjunto"
                  type="file"
                  className="ac__file"
                  onChange={(e) => onFile(e.target.files?.[0])}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                />
                {adjuntoPreview && (
                  <div className="ac__preview">
                    {adjuntoPreview.type === "image" ? (
                      <img src={adjuntoPreview.url} alt="Vista previa del adjunto" />
                    ) : (
                      <div className="ac__preview-file">📎 {adjuntoPreview.name}</div>
                    )}
                    <button type="button" className="ac__icon-btn" onClick={() => onFile(null)}>
                      Quitar
                    </button>
                  </div>
                )}
              </div>

              <fieldset className={`ac__field ${errors.destino ? "ac__field-error" : ""}`}>
                <legend>
                  Destinatarios <span className="ac__req">*</span>
                </legend>
                <div className="ac__destinos">
                  <label className="ac__radio">
                    <input
                      type="radio"
                      name="destino"
                      value="todos"
                      checked={destino === "todos"}
                      onChange={() => setDestino("todos")}
                    />
                    <span>Todos los residentes</span>
                  </label>
                  <label className="ac__radio">
                    <input
                      type="radio"
                      name="destino"
                      value="grupos"
                      checked={destino === "grupos"}
                      onChange={() => setDestino("grupos")}
                    />
                    <span>Grupos específicos</span>
                  </label>
                </div>

                {destino === "grupos" && (
                  <GrupoSelector grupos={grupos} addGrupo={addGrupo} removeGrupo={removeGrupo} />
                )}
                {errors.destino && <p className="ac__error">{errors.destino}</p>}
              </fieldset>

              <div className="ac__form-actions">
                <button type="button" className="ac__btn" onClick={() => setOpen(false)} disabled={sending}>
                  Cancelar
                </button>
                <button className="ac__btn ac__btn-primary" disabled={sending}>
                  {sending ? "Enviando…" : "Enviar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`ac__toast ${toast.type === "ok" ? "ok" : "error"}`} onAnimationEnd={() => setToast(null)}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function GrupoSelector({ grupos, addGrupo, removeGrupo }) {
  const [input, setInput] = useState("");
  const [suggestions] = useState(["Torre A", "Torre B", "Torre C", "Estacionamientos", "Piscina", "Mantenimiento"]);

  const filtered = useMemo(() => {
    const q = input.trim().toLowerCase();
    return suggestions.filter((s) => s.toLowerCase().includes(q) && !grupos.includes(s));
  }, [input, suggestions, grupos]);

  return (
    <div className="ac__grupos">
      <div className="ac__chipbox">
        {grupos.map((g) => (
          <span className="ac__chip" key={g}>
            {g}
            <button type="button" className="ac__chip-x" onClick={() => removeGrupo(g)}>
              ×
            </button>
          </span>
        ))}
        <input
          className="ac__chip-input"
          placeholder="Escriba para agregar grupos…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addGrupo(input);
              setInput("");
            }
          }}
        />
      </div>
      {filtered.length > 0 && (
        <ul className="ac__suggest">
          {filtered.map((s) => (
            <li key={s}>
              <button type="button" className="ac__suggest-btn" onClick={() => { addGrupo(s); setInput(""); }}>
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}