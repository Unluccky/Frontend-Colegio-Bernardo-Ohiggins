import { useState, useEffect, useCallback, useRef } from 'react';
import { mensajesApi, estudiantesApi, profesoresApi, asignaturasApi, apoderadosApi, usuariosUtpApi } from '../../api/endpoints';
import { MessageSquareText, Send, Search, User, GraduationCap, Users, Shield, ArrowLeft, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROLE_TO_TIPO = { ALUMNO: 'ESTUDIANTE', PROFESOR: 'PROFESOR', APODERADO: 'APODERADO', UTP: 'UTP' };

/** Genera clave única para una conversación entre dos usuarios */
function conversationKey(a, b) {
  const parts = [a, b].sort((x, y) => {
    const xStr = `${x.tipo}-${x.id}`;
    const yStr = `${y.tipo}-${y.id}`;
    return xStr.localeCompare(yStr);
  });
  return `${parts[0].tipo}-${parts[0].id}_${parts[1].tipo}-${parts[1].id}`;
}

export default function MensajesPage() {
  const { user } = useAuth();
  const chatEndRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [mensajes, setMensajes] = useState([]);
  const [currentUserInfo, setCurrentUserInfo] = useState({ id: null, tipo: null });
  const [selectedConvKey, setSelectedConvKey] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState('');
  const [contactsLoading, setContactsLoading] = useState(false);
  const [newMsgAsunto, setNewMsgAsunto] = useState('');
  const [newMsgContenido, setNewMsgContenido] = useState('');
  const [peopleMap, setPeopleMap] = useState({});

  // ── Obtener ID y tipo del usuario actual ──────────────────
  const resolveCurrentUser = useCallback(async () => {
    const tipo = ROLE_TO_TIPO[user?.role];
    if (!tipo) return { id: null, tipo: null };

    if (user.role === 'ALUMNO') {
      const res = await estudiantesApi.listar();
      const yo = res.data.find(e => e.rut === user.rut);
      return { id: yo?.id || null, tipo };
    }
    if (user.role === 'PROFESOR') {
      const res = await profesoresApi.listar();
      const yo = res.data.find(p => p.rut === user.rut);
      return { id: yo?.id || null, tipo };
    }
    if (user.role === 'APODERADO') {
      const [apoRes, estRes] = await Promise.all([
        apoderadosApi.buscarPorRut(user.rut),
        estudiantesApi.listar()
      ]);
      const apoderado = apoRes.data;
      const estudianteVinculado = apoderado?.estudiante?.id
        ? estRes.data.find(e => e.id === apoderado.estudiante.id)
        : null;
      return {
        id: apoderado?.id || null,
        tipo,
        estudianteVinculado: estudianteVinculado
          ? { id: estudianteVinculado.id, nombre: `${estudianteVinculado.nombre} ${estudianteVinculado.apellido}`, rut: estudianteVinculado.rut }
          : null
      };
    }
    const id = parseInt(user?.rut?.replace(/\D/g, '').slice(0, 9)) || null;
    return { id, tipo: 'UTP' };
  }, [user]);

  // ── Cargar todos los mensajes ──────────────────────────
  const loadMessages = useCallback(async () => {
    const info = await resolveCurrentUser();
    setCurrentUserInfo(info);
    if (!info.id || !info.tipo) {
      setMensajes([]);
      setLoading(false);
      return;
    }
    try {
      if (info.tipo === 'APODERADO' && info.estudianteVinculado?.id) {
        const [apoRes, estRes] = await Promise.all([
          mensajesApi.buscarPorUsuario(info.id, info.tipo),
          mensajesApi.buscarPorUsuario(info.estudianteVinculado.id, 'ESTUDIANTE')
        ]);
        const merged = [...(apoRes.data || []), ...(estRes.data || [])];
        const seen = new Set();
        setMensajes(merged.filter(m => {
          if (seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        }));
      } else {
        const res = await mensajesApi.buscarPorUsuario(info.id, info.tipo);
        setMensajes(res.data || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [resolveCurrentUser]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  // Scroll al último mensaje al abrir conversación
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConvKey, mensajes]);

  // ── Mapa de personas ──────────────────────────────────
  useEffect(() => {
    Promise.all([
      estudiantesApi.listar(),
      profesoresApi.listar(),
      apoderadosApi.listar()
    ]).then(([estRes, profRes, apoRes]) => {
      const map = {};
      estRes.data.forEach(e => {
        map[`est-${e.id}`] = { nombre: `${e.nombre} ${e.apellido}`, rut: e.rut, tipo: 'Estudiante' };
      });
      profRes.data.forEach(p => {
        map[`prof-${p.id}`] = { nombre: `${p.nombre} ${p.apellido}`, rut: p.rut, tipo: 'Profesor' };
      });
      apoRes.data.forEach(a => {
        map[`apo-${a.id}`] = { nombre: `${a.nombre} ${a.apellido}`, rut: a.rut, tipo: 'Apoderado' };
      });
      setPeopleMap(map);
      usuariosUtpApi.listar().then(utpRes => {
        const utpData = Array.isArray(utpRes.data) ? utpRes.data : [];
        utpData.forEach(u => {
          const utpId = parseInt(String(u.rut || '').replace(/\D/g, '').slice(0, 9));
          if (utpId) map[`utp-${utpId}`] = { nombre: `UTP ${u.rut}`, rut: u.rut, tipo: 'UTP' };
        });
        setPeopleMap({...map});
      }).catch(() => {});
    }).catch(console.error);
  }, []);

  // ── Resolver nombre ───────────────────────────────────
  const resolveName = (id, tipo) => {
    if (!id) return '—';
    const prefixMap = { ESTUDIANTE: 'est', PROFESOR: 'prof', APODERADO: 'apo', UTP: 'utp' };
    const prefix = prefixMap[tipo];
    if (prefix) {
      const entry = peopleMap[`${prefix}-${id}`];
      if (entry) return entry.nombre;
    }
    for (const p of ['est', 'prof', 'apo', 'utp']) {
      const entry = peopleMap[`${p}-${id}`];
      if (entry) return entry.nombre;
    }
    return `ID: ${id}`;
  };

  // ── Agrupar mensajes en conversaciones ────────────────
  const conversations = useCallback(() => {
    const groups = {};
    mensajes.forEach(m => {
      const userA = { id: m.remitenteId, tipo: m.remitenteTipo };
      const userB = { id: m.destinatarioId, tipo: m.destinatarioTipo };
      const key = conversationKey(userA, userB);
      if (!groups[key]) {
        groups[key] = {
          key,
          messages: [],
          otherUser: currentUserInfo.id === m.remitenteId && currentUserInfo.tipo === m.remitenteTipo
            ? userB : userA,
        };
      }
      groups[key].messages.push(m);
    });
    // Ordenar mensajes dentro de cada conversación por fecha
    Object.values(groups).forEach(g => {
      g.messages.sort((a, b) => new Date(a.fechaEnvio) - new Date(b.fechaEnvio));
      g.lastMessage = g.messages[g.messages.length - 1];
    });
    // Ordenar conversaciones: más reciente primero
    return Object.values(groups).sort((a, b) =>
      new Date(b.lastMessage.fechaEnvio) - new Date(a.lastMessage.fechaEnvio)
    );
  }, [mensajes, currentUserInfo]);

  const convList = conversations();
  const activeConv = convList.find(c => c.key === selectedConvKey);

  // ── Enviar respuesta desde el chat ────────────────────
  const handleSendReply = async () => {
    if (!replyText.trim() || !activeConv || !currentUserInfo.id) return;
    setSending(true);
    try {
      await mensajesApi.enviar({
        remitenteId: currentUserInfo.id,
        remitenteTipo: currentUserInfo.tipo,
        destinatarioId: activeConv.otherUser.id,
        destinatarioTipo: activeConv.otherUser.tipo,
        asunto: activeConv.messages[0]?.asunto || 'Sin asunto',
        contenido: replyText.trim(),
        leido: false
      });
      setReplyText('');
      await loadMessages();
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  // ── Enviar primer mensaje de nueva conversación ──────
  const handleNewConversation = async (contact) => {
    if (!currentUserInfo.id || !newMsgContenido.trim()) return;
    setSending(true);
    try {
      await mensajesApi.enviar({
        remitenteId: currentUserInfo.id,
        remitenteTipo: currentUserInfo.tipo,
        destinatarioId: contact.id,
        destinatarioTipo: contact.tipoBackend,
        asunto: newMsgAsunto.trim() || 'Sin asunto',
        contenido: newMsgContenido.trim(),
        leido: false
      });
      setShowNewChat(false);
      setNewMsgAsunto('');
      setNewMsgContenido('');
      await loadMessages();
      // Seleccionar la nueva conversación
      const userA = { id: currentUserInfo.id, tipo: currentUserInfo.tipo };
      const userB = { id: contact.id, tipo: contact.tipoBackend };
      setSelectedConvKey(conversationKey(userA, userB));
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  // ── Marcar como leído ─────────────────────────────────
  const markConversationAsRead = (conv) => {
    const noLeidos = conv.messages.filter(m =>
      !m.leido && m.destinatarioId === currentUserInfo.id && m.destinatarioTipo === currentUserInfo.tipo
    );
    noLeidos.forEach(m => {
      mensajesApi.actualizar(m.id, { ...m, leido: true }).catch(() => {});
    });
    if (noLeidos.length > 0) {
      setMensajes(prev => prev.map(m =>
        noLeidos.find(n => n.id === m.id) ? { ...m, leido: true } : m
      ));
    }
  };

  // ── Cargar contactos para nueva conversación ──────────
  const loadContacts = async () => {
    setContactsLoading(true);
    try {
      const [estRes, profRes, asigRes] = await Promise.all([
        estudiantesApi.listar(),
        profesoresApi.listar(),
        asignaturasApi.listar()
      ]);
      const estudiantes = estRes.data;
      const profesores = profRes.data;
      const asignaturas = asigRes.data;

      let utpUsers = [];
      try {
        const utpRes = await usuariosUtpApi.listar();
        utpUsers = utpRes.data;
      } catch {}

      const mapContacto = (item, tipoDisplay, tipoBackend, icon, curso) => ({
        id: item.id,
        nombre: `${item.nombre} ${item.apellido}`,
        rut: item.rut,
        tipoDisplay,
        tipoBackend,
        icon,
        curso
      });

      let contactos = [];

      if (user?.role === 'ALUMNO') {
        const yo = estudiantes.find(e => e.rut === user.rut);
        if (yo) {
          const compañeros = estudiantes.filter(e => e.curso === yo.curso && e.id !== yo.id);
          contactos.push(...compañeros.map(e => mapContacto(e, 'Estudiante', 'ESTUDIANTE', 'emerald', e.curso)));
          const asigsCurso = asignaturas.filter(a => a.nivelCurso === yo.curso);
          const profIds = [...new Set(asigsCurso.map(a => a.profesor?.id).filter(Boolean))];
          contactos.push(...profesores.filter(p => profIds.includes(p.id)).map(p => mapContacto(p, 'Profesor', 'PROFESOR', 'blue')));
        }
        contactos.push(...(Array.isArray(utpUsers) ? utpUsers : []).map(u => mapContacto({ ...u, id: parseInt(u.rut.replace(/\D/g, '').slice(0, 9)) }, 'UTP', 'UTP', 'purple')));
      } else if (user?.role === 'PROFESOR') {
        const yo = profesores.find(p => p.rut === user.rut);
        if (yo) {
          const asigsProf = asignaturas.filter(a => a.profesor?.id === yo.id);
          const cursos = [...new Set(asigsProf.map(a => a.nivelCurso).filter(Boolean))];
          contactos.push(...estudiantes.filter(e => cursos.includes(e.curso)).map(e => mapContacto(e, 'Estudiante', 'ESTUDIANTE', 'emerald', e.curso)));
          contactos.push(...profesores.filter(p => p.id !== yo.id).map(p => mapContacto(p, 'Profesor', 'PROFESOR', 'blue')));
        }
        contactos.push(...(Array.isArray(utpUsers) ? utpUsers : []).map(u => mapContacto({ ...u, id: parseInt(u.rut.replace(/\D/g, '').slice(0, 9)) }, 'UTP', 'UTP', 'purple')));
      } else if (user?.role === 'APODERADO') {
        try {
          const apoRes = await apoderadosApi.buscarPorRut(user.rut);
          const apoderado = apoRes.data;
          if (apoderado?.estudiante?.id) {
            const estudianteVinculado = estudiantes.find(e => e.id === apoderado.estudiante.id);
            if (estudianteVinculado) {
              contactos.push(...estudiantes.filter(e => e.curso === estudianteVinculado.curso && e.id !== estudianteVinculado.id)
                .map(e => mapContacto(e, 'Estudiante', 'ESTUDIANTE', 'emerald', e.curso)));
              const asigsCurso = asignaturas.filter(a => a.nivelCurso === estudianteVinculado.curso);
              const profIds = [...new Set(asigsCurso.map(a => a.profesor?.id).filter(Boolean))];
              contactos.push(...profesores.filter(p => profIds.includes(p.id)).map(p => mapContacto(p, 'Profesor', 'PROFESOR', 'blue')));
            }
          }
        } catch {}
        contactos.push(...(Array.isArray(utpUsers) ? utpUsers : []).map(u => mapContacto({ ...u, id: parseInt(u.rut.replace(/\D/g, '').slice(0, 9)) }, 'UTP', 'UTP', 'purple')));
      } else {
        contactos.push(...estudiantes.map(e => mapContacto(e, 'Estudiante', 'ESTUDIANTE', 'emerald', e.curso)));
        contactos.push(...profesores.map(p => mapContacto(p, 'Profesor', 'PROFESOR', 'blue')));
      }

      // Excluir contactos con los que ya tengo conversación
      const existingKeys = new Set(convList.map(c => c.key));
      const selfKey = `${currentUserInfo.tipo}-${currentUserInfo.id}`;
      contactos = contactos.filter(c => {
        const otherKey = `${c.tipoBackend}-${c.id}`;
        const keyA = conversationKey(
          { id: currentUserInfo.id, tipo: currentUserInfo.tipo },
          { id: c.id, tipo: c.tipoBackend }
        );
        return !existingKeys.has(keyA);
      });

      setContacts(contactos);
    } catch (e) { console.error(e); }
    finally { setContactsLoading(false); }
  };

  const openNewChat = async () => {
    setShowNewChat(true);
    setContactSearch('');
    setNewMsgAsunto('');
    setNewMsgContenido('');
    await loadContacts();
  };

  const openConversation = (conv) => {
    setSelectedConvKey(conv.key);
    markConversationAsRead(conv);
  };

  const contactColorMap = {
    ESTUDIANTE: { bg: 'bg-emerald-100', text: 'text-emerald-600', icon: <GraduationCap size={18} className="text-emerald-600" />, badge: 'bg-emerald-100 text-emerald-700' },
    PROFESOR: { bg: 'bg-blue-100', text: 'text-blue-600', icon: <Users size={18} className="text-blue-600" />, badge: 'bg-blue-100 text-blue-700' },
    UTP: { bg: 'bg-purple-100', text: 'text-purple-600', icon: <Shield size={18} className="text-purple-600" />, badge: 'bg-purple-100 text-purple-700' },
    APODERADO: { bg: 'bg-amber-100', text: 'text-amber-600', icon: <User size={18} className="text-amber-600" />, badge: 'bg-amber-100 text-amber-700' },
  };

  const filteredContacts = contacts.filter(c =>
    `${c.nombre} ${c.rut} ${c.tipoDisplay}`.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const noLeidos = (conv) => conv.messages.filter(m =>
    !m.leido && m.destinatarioId === currentUserInfo.id && m.destinatarioTipo === currentUserInfo.tipo
  ).length;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mensajes</h1>
          <p className="text-sm text-gray-500 mt-1">
            {convList.length} conversación{convList.length !== 1 ? 'es' : ''}
          </p>
        </div>
        <button onClick={openNewChat} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nueva Conversación
        </button>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* ── Lista de conversaciones ────────────────────── */}
        <div className="w-80 lg:w-96 shrink-0 card p-0 flex flex-col">
          <div className="p-3 border-b border-gray-100 shrink-0">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Buscar conversaciones..." className="input-field pl-9 text-sm" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="flex justify-center py-12"><div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
            ) : convList.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                <MessageSquareText size={40} className="mx-auto mb-2 text-gray-200" />
                Sin conversaciones
              </div>
            ) : (
              convList.map(conv => {
                const otros = noLeidos(conv);
                const otroNombre = resolveName(conv.otherUser.id, conv.otherUser.tipo);
                const pref = { ESTUDIANTE: 'est', PROFESOR: 'prof', APODERADO: 'apo', UTP: 'utp' }[conv.otherUser.tipo];
                const entry = peopleMap[`${pref}-${conv.otherUser.id}`];
                const colors = contactColorMap[conv.otherUser.tipo] || contactColorMap.ESTUDIANTE;

                return (
                  <button
                    key={conv.key}
                    onClick={() => openConversation(conv)}
                    className={`w-full text-left p-3.5 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                      selectedConvKey === conv.key ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      {colors.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-gray-800 truncate">{otroNombre}</span>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {new Date(conv.lastMessage.fechaEnvio).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage.contenido}</p>
                    </div>
                    {otros > 0 && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-1">
                        {otros}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Chat de la conversación activa ─────────────── */}
        <div className="flex-1 card p-0 flex flex-col min-w-0">
          {activeConv ? (
            <>
              {/* Cabecera del chat */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
                <button onClick={() => setSelectedConvKey(null)} className="lg:hidden p-1 rounded hover:bg-gray-100">
                  <ArrowLeft size={18} />
                </button>
                {(() => {
                  const pref = { ESTUDIANTE: 'est', PROFESOR: 'prof', APODERADO: 'apo', UTP: 'utp' }[activeConv.otherUser.tipo];
                  const entry = peopleMap[`${pref}-${activeConv.otherUser.id}`];
                  const colors = contactColorMap[activeConv.otherUser.tipo] || contactColorMap.ESTUDIANTE;
                  return (
                    <>
                      <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center`}>
                        {colors.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {resolveName(activeConv.otherUser.id, activeConv.otherUser.tipo)}
                        </p>
                        <p className="text-[11px] text-gray-400">{entry?.tipo || activeConv.otherUser.tipo}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Mensajes del chat */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeConv.messages.map(m => {
                  const esMio = m.remitenteId === currentUserInfo.id && m.remitenteTipo === currentUserInfo.tipo;
                  return (
                    <div key={m.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] min-w-[120px] ${
                        esMio
                          ? 'bg-blue-600 text-white rounded-2xl rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md'
                      } px-4 py-2.5`}>
                        <p className="text-sm whitespace-pre-wrap break-words">{m.contenido}</p>
                        <div className={`flex items-center gap-1 mt-1 ${esMio ? 'justify-end' : 'justify-start'}`}>
                          <span className={`text-[10px] ${esMio ? 'text-blue-200' : 'text-gray-400'}`}>
                            {new Date(m.fechaEnvio).toLocaleString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {esMio && (
                            <span className={`text-[10px] ${m.leido ? 'text-blue-100' : 'text-blue-300'}`}>
                              {m.leido ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input de respuesta */}
              <div className="p-4 border-t border-gray-100 shrink-0">
                <div className="flex items-end gap-2">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    placeholder="Escribe un mensaje... (Enter para enviar)"
                    className="input-field flex-1 resize-none text-sm"
                    rows={2}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={sending || !replyText.trim()}
                    className="btn-primary p-3 rounded-xl disabled:opacity-50"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageSquareText size={64} className="mx-auto mb-4 text-gray-200" />
                <p className="text-lg font-medium text-gray-500 mb-1">Selecciona una conversación</p>
                <p className="text-sm">O inicia una nueva conversación</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal: Nueva Conversación ──────────────────── */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold">Nueva Conversación</h3>
              <p className="text-xs text-gray-500 mt-1">Selecciona un contacto para iniciar un chat</p>
            </div>

            <div className="p-4 border-b border-gray-100 space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Buscar contacto..." value={contactSearch}
                  onChange={e => setContactSearch(e.target.value)} className="input-field pl-9 text-sm" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                <input type="text" value={newMsgAsunto}
                  onChange={e => setNewMsgAsunto(e.target.value)}
                  placeholder="¿De qué trata el mensaje?"
                  className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                <textarea value={newMsgContenido}
                  onChange={e => setNewMsgContenido(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="input-field text-sm" rows={3} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {contactsLoading ? (
                <div className="flex justify-center py-8"><div className="w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <Search size={28} className="mx-auto mb-2" />
                  {contacts.length === 0 ? 'Ya tienes conversación con todos los contactos disponibles' : 'Sin resultados'}
                </div>
              ) : (
                filteredContacts.map((c, i) => {
                  const colors = contactColorMap[c.tipoBackend] || contactColorMap.ESTUDIANTE;
                  return (
                    <button key={`${c.tipoBackend}-${c.id}-${i}`}
                      onClick={() => handleNewConversation(c)}
                      className="w-full text-left p-3.5 hover:bg-blue-50 transition-colors flex items-center gap-3"
                    >
                      <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center shrink-0`}>
                        {colors.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{c.nombre}</p>
                        <p className="text-xs text-gray-500">{c.rut}</p>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colors.badge} shrink-0`}>
                        {c.tipoDisplay}{c.curso ? ` · ${c.curso}°` : ''}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowNewChat(false)} className="btn-secondary text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
