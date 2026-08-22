"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  LogOut,
  Mail,
  Phone,
  Search,
  RefreshCw,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Archive,
  Download,
  X,
  Loader2,
  Calendar,
  Globe,
  Monitor,
  Send,
  MessageSquare,
  Filter,
} from "lucide-react";

interface ContactItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  ip?: string;
  userAgent?: string;
  status: "new" | "read" | "replied" | "archived";
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

interface CountsMap {
  all: number;
  new: number;
  read: number;
  replied: number;
  archived: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<{ email: string } | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Data states
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [counts, setCounts] = useState<CountsMap>({ all: 0, new: 0, read: 0, replied: 0, archived: 0 });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modals
  const [selectedContact, setSelectedContact] = useState<ContactItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotesInput, setAdminNotesInput] = useState("");

  // ── 1. Check Authentication on Mount ──
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/auth/me");
        const data = await res.json();
        if (!res.ok || !data.authenticated) {
          router.push("/admin/login");
        } else {
          setAdminUser(data.user);
          setAuthChecking(false);
        }
      } catch {
        router.push("/admin/login");
      }
    }
    checkAuth();
  }, [router]);

  // ── 2. Fetch Contact Submissions ──
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        page: page.toString(),
        limit: "25",
      });

      const res = await fetch(`/api/admin/contacts?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setContacts(data.data || []);
        setCounts(data.counts || { all: 0, new: 0, read: 0, replied: 0, archived: 0 });
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalRecords(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Failed to load contacts:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, page]);

  useEffect(() => {
    if (!authChecking) {
      fetchContacts();
    }
  }, [authChecking, fetchContacts]);

  // ── 3. Logout Handler ──
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
    } catch {
      router.push("/admin/login");
    }
  };

  // ── 4. Update Status or Notes ──
  const handleUpdateStatus = async (
    id: string,
    newStatus: "new" | "read" | "replied" | "archived",
    notes?: string
  ) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes: notes !== undefined ? notes : adminNotesInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setContacts((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status: newStatus, adminNotes: notes !== undefined ? notes : adminNotesInput } : c))
        );
        if (selectedContact && selectedContact._id === id) {
          setSelectedContact((prev) => (prev ? { ...prev, status: newStatus, adminNotes: notes !== undefined ? notes : adminNotesInput } : null));
        }
        fetchContacts();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // ── 5. Delete Contact Handler ──
  const handleDeleteContact = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setContacts((prev) => prev.filter((c) => c._id !== id));
        if (selectedContact?._id === id) setSelectedContact(null);
        setDeleteConfirmId(null);
        fetchContacts();
      }
    } catch (err) {
      console.error("Failed to delete contact:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // ── 6. Export to CSV ──
  const handleExportCsv = () => {
    if (contacts.length === 0) return;

    const headers = ["ID", "Date", "Name", "Email", "Phone", "Subject", "Message", "Status", "IP", "Admin Notes"];
    const rows = contacts.map((c) => [
      `"${c._id}"`,
      `"${new Date(c.createdAt).toLocaleString()}"`,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.email}"`,
      `"${c.phone || ""}"`,
      `"${(c.subject || "").replace(/"/g, '""')}"`,
      `"${c.message.replace(/"/g, '""')}"`,
      `"${c.status}"`,
      `"${c.ip || ""}"`,
      `"${(c.adminNotes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `labelcroponline_contacts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authChecking) {
    return (
      <div className="min-h-[85vh] bg-slate-100 flex flex-col items-center justify-center text-black pt-28 pb-16 gap-3">
        <Loader2 size={32} className="animate-spin text-[#051448]" />
        <span className="text-sm font-semibold text-black/70">Checking Admin Session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-slate-100 text-black pt-20 sm:pt-24 pb-16 px-3 sm:px-6">
      <div className="max-w-[1200px] mx-auto space-y-6">

        {/* ── Top Header inside max-w-[1200px] Container ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#051448]/20 rounded-md p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[#051448]/10 text-[#051448] flex items-center justify-center font-bold">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#051448] mb-0.5">
                <span>Admin Control Center</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#051448] tracking-tight">
                Customer Inquiries &amp; Contacts
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-[#051448]/20 px-3 py-1.5 rounded text-xs text-black font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="truncate max-w-[180px]">{adminUser?.email}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* ── Summary Metrics ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white border border-[#051448]/20 rounded-md p-4 shadow-xs">
            <div className="flex items-center justify-between text-black/60 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Total Inquiries</span>
              <MessageSquare size={16} className="text-[#051448]" />
            </div>
            <div className="text-2xl font-black text-black">{counts.all}</div>
            <div className="text-[11px] text-black/60 mt-0.5">All contact submissions</div>
          </div>

          <div className="bg-white border border-amber-300 rounded-md p-4 shadow-xs bg-amber-50/40">
            <div className="flex items-center justify-between text-amber-800 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">New Inquiries</span>
              <Clock size={16} className="text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-900">{counts.new}</div>
            <div className="text-[11px] text-amber-700 mt-0.5">Awaiting seller response</div>
          </div>

          <div className="bg-white border border-emerald-300 rounded-md p-4 shadow-xs bg-emerald-50/40">
            <div className="flex items-center justify-between text-emerald-800 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Replied</span>
              <CheckCircle size={16} className="text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-900">{counts.replied}</div>
            <div className="text-[11px] text-emerald-700 mt-0.5">Processed successfully</div>
          </div>

          <div className="bg-white border border-[#051448]/20 rounded-md p-4 shadow-xs">
            <div className="flex items-center justify-between text-black/60 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Archived</span>
              <Archive size={16} className="text-black/50" />
            </div>
            <div className="text-2xl font-black text-black">{counts.archived}</div>
            <div className="text-[11px] text-black/60 mt-0.5">Saved records</div>
          </div>
        </div>

        {/* ── Table & Search Controls Card ── */}
        <div className="bg-white border border-[#051448]/20 rounded-md shadow-xs overflow-hidden">

          {/* Control Bar */}
          <div className="p-4 border-b border-[#051448]/15 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60">
            {/* Status Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: "All Messages", count: counts.all },
                { id: "new", label: "New", count: counts.new },
                { id: "read", label: "Read", count: counts.read },
                { id: "replied", label: "Replied", count: counts.replied },
                { id: "archived", label: "Archived", count: counts.archived },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.id);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === tab.id
                      ? "bg-[#051448] text-white shadow-xs"
                      : "bg-white border border-[#051448]/20 text-black hover:bg-slate-100"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    statusFilter === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-black"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input & Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search name, email, query..."
                  className="w-full bg-white border border-[#051448]/30 rounded pl-8 pr-3 py-1.5 text-xs text-black placeholder:text-black/40 focus:outline-hidden focus:border-[#051448]"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/40 hover:text-black cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={fetchContacts}
                disabled={loading}
                className="p-2 rounded bg-white hover:bg-slate-100 border border-[#051448]/20 text-black transition-colors cursor-pointer"
                title="Refresh Submissions"
              >
                <RefreshCw size={14} className={loading ? "animate-spin text-[#051448]" : ""} />
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                disabled={contacts.length === 0}
                className="flex items-center gap-1.5 text-xs font-semibold bg-white hover:bg-slate-100 border border-[#051448]/20 text-black px-3 py-1.5 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download CSV export"
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-black font-bold uppercase tracking-wider border-b border-[#051448]/15">
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Subject &amp; Message</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#051448]/10 bg-white">
                {loading && contacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-black/60">
                      <Loader2 size={24} className="animate-spin mx-auto text-[#051448] mb-2" />
                      <span>Loading contact submissions...</span>
                    </td>
                  </tr>
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-black/60">
                      <MessageSquare size={32} className="mx-auto text-black/30 mb-2" />
                      <p className="font-semibold text-black">No contact messages found</p>
                      <p className="text-xs text-black/50 mt-1">
                        {searchTerm ? "Try searching with a different term" : "Messages submitted on the Contact Us page will appear here"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  contacts.map((item) => (
                    <tr
                      key={item._id}
                      className={`hover:bg-slate-50 transition-colors ${
                        item.status === "new" ? "bg-blue-50/30 font-medium" : ""
                      }`}
                    >
                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-black/70">
                        <div className="font-bold text-black">
                          {new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[11px] text-black/50">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>

                      {/* User Info */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-black text-sm">{item.name}</div>
                        <div className="flex flex-col gap-0.5 mt-0.5 text-black/70">
                          <a
                            href={`mailto:${item.email}`}
                            className="hover:text-[#051448] transition-colors truncate max-w-[200px]"
                            title={item.email}
                          >
                            {item.email}
                          </a>
                          {item.phone && (
                            <a
                              href={`tel:${item.phone}`}
                              className="hover:text-[#051448] transition-colors text-black/60 text-[11px]"
                            >
                              {item.phone}
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Subject & Message */}
                      <td className="py-3 px-4 max-w-xs sm:max-w-md">
                        <div className="font-semibold text-black truncate">
                          {item.subject || "General Inquiry"}
                        </div>
                        <p className="text-black/75 text-xs line-clamp-2 mt-0.5 leading-relaxed text-justify sm:text-left">
                          {item.message}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-tight ${
                            item.status === "new"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : item.status === "replied"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : item.status === "read"
                              ? "bg-blue-100 text-[#051448] border border-blue-200"
                              : "bg-slate-100 text-black/60 border border-slate-200"
                          }`}
                        >
                          {item.status === "new" && <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>}
                          {item.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedContact(item);
                              setAdminNotesInput(item.adminNotes || "");
                              if (item.status === "new") {
                                handleUpdateStatus(item._id, "read");
                              }
                            }}
                            className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-black transition-colors cursor-pointer border border-[#051448]/20"
                            title="View Full Details"
                          >
                            <Eye size={14} />
                          </button>

                          <a
                            href={`mailto:${item.email}?subject=Re: ${encodeURIComponent(item.subject || "LabelCropOnline Inquiry")}`}
                            onClick={() => handleUpdateStatus(item._id, "replied")}
                            className="p-1.5 rounded bg-blue-50 hover:bg-blue-100 text-[#051448] border border-blue-200 transition-colors cursor-pointer"
                            title="Reply via Email"
                          >
                            <Send size={14} />
                          </a>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(item._id)}
                            className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                            title="Delete Submission"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[#051448]/15 flex items-center justify-between text-xs text-black/70 bg-slate-50/60">
              <div>
                Showing page <strong className="text-black">{page}</strong> of <strong className="text-black">{totalPages}</strong> ({totalRecords} total items)
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded bg-white hover:bg-slate-100 border border-[#051448]/20 text-black font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded bg-white hover:bg-slate-100 border border-[#051448]/20 text-black font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Detailed Inspection Modal ── */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#051448] rounded-md w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#051448]/20 bg-slate-50">
              <div>
                <h3 className="font-bold text-base text-black flex items-center gap-2">
                  <span>Inquiry Details</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    selectedContact.status === "new"
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : selectedContact.status === "replied"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-blue-100 text-[#051448] border border-blue-200"
                  }`}>
                    {selectedContact.status}
                  </span>
                </h3>
                <p className="text-xs text-black/60 mt-0.5">
                  Received on {new Date(selectedContact.createdAt).toLocaleString("en-IN")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedContact(null)}
                className="p-1 rounded text-black/60 hover:text-black hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">

              {/* Sender Information Grid */}
              <div className="grid sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-md border border-[#051448]/15">
                <div>
                  <span className="text-black/60 font-medium block text-xs uppercase tracking-wider">Full Name</span>
                  <span className="font-bold text-black text-sm mt-0.5 block">{selectedContact.name}</span>
                </div>
                <div>
                  <span className="text-black/60 font-medium block text-xs uppercase tracking-wider">Email Address</span>
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="font-bold text-[#051448] hover:underline text-sm mt-0.5 block"
                  >
                    {selectedContact.email}
                  </a>
                </div>
                {selectedContact.phone && (
                  <div>
                    <span className="text-black/60 font-medium block text-xs uppercase tracking-wider">Phone</span>
                    <a
                      href={`tel:${selectedContact.phone}`}
                      className="font-bold text-black hover:underline text-sm mt-0.5 block"
                    >
                      {selectedContact.phone}
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-black/60 font-medium block text-xs uppercase tracking-wider">Subject</span>
                  <span className="font-semibold text-black text-sm mt-0.5 block">
                    {selectedContact.subject || "General Inquiry"}
                  </span>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                  Message Body
                </label>
                <div className="p-4 bg-slate-50 rounded-md border border-[#051448]/15 text-black whitespace-pre-wrap leading-relaxed text-justify">
                  {selectedContact.message}
                </div>
              </div>

              {/* Technical Audit Info */}
              <div className="p-3 bg-slate-50/60 rounded-md border border-slate-200 text-[11px] text-black/60 space-y-1">
                <div className="flex items-center gap-2">
                  <Globe size={13} className="text-[#051448]" />
                  <span><strong>IP Address:</strong> {selectedContact.ip || "unknown"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Monitor size={13} className="text-[#051448]" />
                  <span className="truncate"><strong>User Agent:</strong> {selectedContact.userAgent || "unknown"}</span>
                </div>
              </div>

              {/* Status Update & Admin Notes */}
              <div className="space-y-3 pt-3 border-t border-[#051448]/15">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">
                    Change Status
                  </label>
                  <div className="flex items-center gap-1.5">
                    {(["new", "read", "replied", "archived"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateStatus(selectedContact._id, st)}
                        disabled={actionLoading}
                        className={`px-3 py-1 rounded text-xs font-bold capitalize transition-colors cursor-pointer border ${
                          selectedContact.status === st
                            ? "bg-[#051448] text-white border-[#051448]"
                            : "bg-white text-black border-[#051448]/20 hover:bg-slate-100"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1">
                    Internal Admin Notes
                  </label>
                  <textarea
                    rows={2}
                    value={adminNotesInput}
                    onChange={(e) => setAdminNotesInput(e.target.value)}
                    placeholder="Add internal notes about this inquiry..."
                    className="w-full bg-white border border-[#051448]/30 rounded p-2.5 text-xs text-black placeholder:text-black/40 focus:outline-hidden focus:border-[#051448]"
                  />
                  <div className="mt-1.5 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedContact._id, selectedContact.status, adminNotesInput)}
                      disabled={actionLoading}
                      className="text-xs bg-slate-100 hover:bg-slate-200 border border-[#051448]/20 text-[#051448] px-3 py-1 rounded font-semibold transition-colors cursor-pointer"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-[#051448]/20 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(selectedContact._id)}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Delete Message</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedContact.email}?subject=Re: ${encodeURIComponent(selectedContact.subject || "LabelCropOnline Inquiry")}`}
                  onClick={() => handleUpdateStatus(selectedContact._id, "replied")}
                  className="flex items-center gap-1.5 bg-[#051448] hover:bg-[#071a5e] text-white font-bold text-xs px-4 py-2 rounded transition-colors cursor-pointer"
                >
                  <Send size={13} />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-red-300 rounded-md w-full max-w-md p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3 border border-red-200">
              <Trash2 size={22} />
            </div>
            <h3 className="text-lg font-bold text-black mb-1">Delete Contact Submission?</h3>
            <p className="text-xs text-black/65 mb-6 text-justify sm:text-center">
              This action will permanently remove this inquiry from your database and cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={actionLoading}
                className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteContact(deleteConfirmId)}
                disabled={actionLoading}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                <span>Yes, Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
