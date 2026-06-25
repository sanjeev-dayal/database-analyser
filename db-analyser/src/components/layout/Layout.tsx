import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex h-screen bg-[#09090B]">

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">

        <Navbar />

        <main className="flex-1 overflow-auto p-8 bg-gradient-to-br from-[#09090B] via-[#0F0E17] to-[#09090B]">

          <div className="max-w-7xl mx-auto">

            <Outlet />

          </div>

        </main>

      </div>

    </div>
  );
}