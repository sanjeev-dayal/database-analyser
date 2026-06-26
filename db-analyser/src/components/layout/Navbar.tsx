import { useEffect, useState } from "react";
import { Bell, Search, Sun, Moon } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";

type NotificationItem = {
  id: string;
  message: string;
  time: string;
};

const titles: Record<string, string> = {
  "/": "Upload Dataset",
  "/dashboard": "Dashboard",
  "/questions": "AI Questions",
  "/charts": "Charts",
  "/validation": "Data Validation",
  "/reports": "Reports",
};

export default function Navbar() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!notificationsOpen) return;

    const raw = localStorage.getItem("notifications");
    const parsed: NotificationItem[] = raw ? JSON.parse(raw) : [];
    setNotifications(parsed.slice(0, 8));
  }, [notificationsOpen]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const clearNotifications = () => {
    localStorage.removeItem("notifications");
    setNotifications([]);
  };

  return (
    <header className="h-20 border-b border-violet-900/40 bg-[#12111C]/70 backdrop-blur-xl flex items-center justify-between px-8">
      <div>
        <h1 className="text-2xl font-bold text-white">{titles[location.pathname] || "Dashboard"}</h1>
        <p className="text-gray-400 text-sm mt-1">AI Powered Database Analysis</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden xl:block">
          <Search className="absolute left-4 top-3 text-cyan-400" size={18} />
          <input
            placeholder="Search insights..."
            className="w-80 rounded-xl border border-violet-900/40 bg-[#0F0E17] py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-cyan-400"
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((open) => !open)}
            className="relative p-3 rounded-xl bg-[#171620] hover:bg-violet-900/20 transition"
            aria-label="Open notifications"
          >
            <Bell className="text-white" />
            {notifications.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400 text-[10px] font-bold text-black">
                {Math.min(notifications.length, 9)}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 z-10 mt-3 w-96 rounded-3xl border border-white/10 bg-[#12121A] p-4 shadow-2xl">
              <div className="mb-4 flex items-center justify-between text-sm text-gray-400">
                <span>Notifications</span>
                <button
                  type="button"
                  className="text-cyan-300 hover:text-cyan-200"
                  onClick={clearNotifications}
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="rounded-3xl border border-violet-800/30 bg-[#111118] p-4 text-sm text-gray-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className="rounded-3xl border border-violet-800/30 bg-[#111118] p-4">
                      <p className="text-sm text-white">{notification.message}</p>
                      <p className="mt-2 text-xs text-gray-500">{notification.time}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl border border-white/10 bg-[#171620] p-3 text-white transition hover:bg-violet-900/20"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}