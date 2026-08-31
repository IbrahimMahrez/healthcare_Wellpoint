import React, { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  const load = () => {
    api
      .get("/notifications/my")
      .then(({ data }) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!user) return;
    load();
    const interval = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const markAllRead = async () => {
    await api.patch("/notifications/read-all");
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
    setUnreadCount(0);
  };

  const markOneRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((n) => n.map((x) => (x._id === id ? { ...x, read: true } : x)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-primary-100 hover:ring-primary-300"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[85vw] rounded-2xl border border-primary-100 bg-white p-2 shadow-lg rtl:right-auto rtl:left-0">
          <div className="flex items-center justify-between px-2 py-1.5">
            <p className="text-sm font-semibold text-ink-900">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-medium text-primary-700">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-ink-500">No notifications yet.</p>
            )}
            {notifications.map((n) => (
              <Link
                key={n._id}
                to={n.link || "#"}
                onClick={() => {
                  if (!n.read) markOneRead(n._id);
                  setOpen(false);
                }}
                className={`block rounded-xl px-3 py-2 text-sm hover:bg-primary-50 ${!n.read ? "bg-primary-50/70" : ""}`}
              >
                <p className="font-medium text-ink-900">{n.title}</p>
                <p className="text-xs text-ink-500">{n.message}</p>
                <p className="mt-0.5 text-[10px] text-ink-500">{new Date(n.createdAt).toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
