import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Send, ArrowLeft, Loader2, Paperclip, X, RotateCw } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

export default function Consultation() {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket, joinRoom, sendMessage: socketSendMessage } = useSocket();

  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [uploading, setUploading] = useState(false);
  const [filePreview, setFilePreview] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const seenMessages = useRef(new Set());

  const [callActive, setCallActive] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    joinRoom(`room_${id}`);
    console.log("[Consultation] Joined room:", `room_${id}`);
    api.get(`/consultations/${id}`).then(({ data }) => setRoom(data)).catch((err) => {
      setError(err.response?.data?.message || "Couldn't open this consultation.");
    }).finally(() => setLoading(false));
  }, [id, joinRoom]);

  useEffect(() => {
    if (!socket || !id) return;

    socket.on("receive_message", (msg) => {
      console.log("[Consultation] receive_message received:", msg.content?.slice(0, 30));
      const key = msg._id || msg.id;
      if (seenMessages.current.has(key)) return;
      seenMessages.current.add(key);
      setMessages((prev) => {
        const exists = prev.some((m) => (m._id || m.id) === key);
        if (exists) return prev;
        const updated = [...prev, msg];
        return updated.sort((a, b) => new Date(a.createdAt || a.created_at || 0) - new Date(b.createdAt || b.created_at || 0));
      });
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });

    return () => { socket.off("receive_message"); };
  }, [socket, id]);

  const loadMessages = useCallback(async () => {
    try {
      const { data } = await api.get(`/consultations/${id}/messages?limit=50`);
      const msgs = data.messages || [];
      msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(msgs);
      msgs.forEach((m) => {
        seenMessages.current.add(m._id || m.id);
      });
    } catch (_) {}
  }, [id]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  const handleRefresh = async () => {
    setLoadingMessages(true);
    await loadMessages();
    setLoadingMessages(false);
  };

  const userId = String(user?.id || user?._id);
  const getIsMine = (m) => {
    const senderId = m.senderId || m.sender?._id;
    return String(senderId) === userId;
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    setUploading(true);
    try {
      const { data } = await api.post(`/consultations/${id}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const urls = data.urls || [];
      setFilePreview((prev) => [...prev, ...urls]);
      socketSendMessage({ room: `room_${id}`, message: `📎 ${urls.length} file(s) uploaded` });
    } catch (err) {
      console.error("Upload error:", err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() && !filePreview.length) return;
    const text = draft.trim();
    setDraft("");
    setFilePreview([]);
    console.log("[Consultation] Sending message via socket:", { room: `room_${id}`, message: text });
    console.log("[Consultation] Socket connected:", socket?.connected);
    socketSendMessage({ room: `room_${id}`, message: text });
  };

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pc.onicecandidate = (e) => {
      if (e.candidate) api.post(`/consultations/${id}/signals`, { kind: "candidate", payload: e.candidate }).catch(() => {});
    };
    pc.ontrack = (e) => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0]; };
    return pc;
  }, [id]);

  const getLocalStream = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  }, []);

  const startCall = async () => {
    try {
      setError("");
      const stream = await getLocalStream();
      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      pcRef.current = pc;
      setCallActive(true);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await api.post(`/consultations/${id}/signals`, { kind: "offer", payload: offer });
    } catch (err) {
      setError("Couldn't access camera/microphone. Check browser permissions.");
    }
  };

  const endCall = useCallback(async () => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setCallActive(false);
    try { await api.post(`/consultations/${id}/signals`, { kind: "hangup", payload: {} }); } catch (_) {}
  }, [id]);

  useEffect(() => () => endCall(), []);

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMicOn((v) => !v);
  };
  const toggleCam = () => {
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCamOn((v) => !v);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-ink-500">
        <Loader2 className="animate-spin" size={18} /> Opening consultation room...
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <Link to="/dashboard" className="mt-4 inline-block text-sm font-semibold text-primary-600">Back to dashboard</Link>
      </div>
    );
  }

  const appt = room?.appointment;
  const otherName = room?.myRole === "patient" ? appt?.providerId?.name || "Doctor" : appt?.patientId?.name || "Patient";

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 md:px-6">
      <Link to={room?.myRole === "doctor" ? "/doctor-dashboard" : "/dashboard"} className="flex items-center gap-1 text-sm text-ink-500 hover:text-primary-600">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-primary-100 bg-ink-900 p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-sm font-semibold text-white">Consultation with {otherName}</p>
            {!room?.canJoin && <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">This appointment isn't active</span>}
          </div>
          <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
            <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
            <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-3 right-3 h-24 w-36 rounded-lg border-2 border-white/30 object-cover shadow-lg" />
            {!callActive && <div className="absolute inset-0 flex items-center justify-center"><p className="text-sm text-white/60">No active call</p></div>}
          </div>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          <div className="mt-3 flex items-center justify-center gap-3">
            {!callActive ? (
              <button onClick={startCall} disabled={!room?.canJoin} className="flex items-center gap-2 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                <Video size={16} /> Start video call
              </button>
            ) : (
              <>
                <button onClick={toggleMic} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">{micOn ? <Mic size={18} /> : <MicOff size={18} />}</button>
                <button onClick={toggleCam} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">{camOn ? <Video size={18} /> : <VideoOff size={18} />}</button>
                <button onClick={endCall} className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"><PhoneOff size={18} /></button>
              </>
            )}
          </div>
        </div>

        <div className="flex h-[480px] flex-col rounded-2xl border border-primary-100 bg-white">
          <div className="border-b border-primary-100 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink-900">Chat</p>
              <button onClick={handleRefresh} disabled={loadingMessages} className="flex items-center gap-1 text-xs text-ink-400 hover:text-primary-600">
                <RotateCw size={12} className={loadingMessages ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {messages.length === 0 && !loadingMessages && <p className="text-center text-xs text-ink-400">No messages yet. Start the conversation!</p>}
            <div className="flex flex-col gap-2">
              {messages.map((m, i) => {
                const mine = getIsMine(m);
                const time = new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${mine ? "bg-primary-600 text-white rounded-br-md" : "bg-ink-50 text-ink-900 rounded-bl-md"}`}>
                      {m.content || m.text}
                      {m.files?.length > 0 && (
                        <div className="mt-1 flex gap-1">
                          {m.files.map((f, fi) => (
                            <a key={fi} href={f} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded bg-white/20 px-2 py-0.5 text-xs hover:bg-white/30">
                              <Paperclip size={12} /> {f.split("/").pop().slice(0, 20)}
                            </a>
                          ))}
                        </div>
                      )}
                      <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-ink-400"}`}>{time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div ref={chatEndRef} />
          </div>

          {filePreview.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 py-2 border-t border-primary-100">
              {filePreview.map((url, i) => (
                <div key={i} className="flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs text-primary-700">
                  <Paperclip size={12} />
                  <span className="max-w-[100px] truncate">{url.split("/").pop().slice(0, 25)}</span>
                  <button onClick={() => setFilePreview(filePreview.filter((_, j) => j !== i))} className="hover:text-red-500"><X size={12} /></button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-primary-100 p-2">
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100" disabled={uploading}>
              <Paperclip size={18} />
            </button>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message..." className="flex-1 rounded-full border border-ink-200 px-3 py-2 text-sm outline-none focus:border-primary-400" />
            <button type="submit" disabled={!draft.trim() && !filePreview.length} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white disabled:opacity-50"><Send size={15} /></button>
          </form>
        </div>
      </div>
    </div>
  );
}