'use client';

import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Code2,
  Database,
  Globe2,
  LayoutDashboard,
  Package,
  Sparkles,
  UserRound,
} from 'lucide-react';

const services = [
  'SEO - Technical, On-Page, Off-Page & Local SEO',
  'AI Agent Development',
  'Custom Web Development',
  'ERP Software Development',
  'Business Process Automation',
  'Custom Digital Solutions',
];

const erpFeatures = [
  ['Employee Management', 'Centralized employee information and records.'],
  ['Attendance Management', 'Digital employee attendance tracking.'],
  ['Leave & Weekly Off', 'Leave, holidays, and weekly-off management.'],
  ['SMS Notifications', 'Automated notifications for relevant staff dates.'],
  ['Payroll', 'Employee salary and payroll information management.'],
  ['Customer / Contact Management', 'Organized management of relevant contacts.'],
  ['Inventory', 'Digital stock and inventory management.'],
  ['Expenses', 'Recording and monitoring organizational expenses.'],
  ['Reports & Dashboard', 'Centralized reporting and operational overview.'],
];

const futurePlans = [
  'Advanced SMS automation',
  'WhatsApp notifications',
  'Biometric attendance integration',
  'Advanced reporting',
  'AI-powered ERP assistance',
  'Additional workflow automation',
  'Mobile application support',
  'Additional organizational modules',
];

export function WebsiteHistory() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-slate-950 px-6 py-7 text-white shadow-xs">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">Company History & Profile</span>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">MFH-TECH</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          Practical technology and digital solutions for businesses and organizations, from SEO and AI automation to custom software and ERP development.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2">
            <BriefcaseBusiness className="h-4 w-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-900">Company Overview</h2>
          </div>
          <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-slate-500">Company Head & Co-founder</dt><dd className="mt-1 font-bold text-slate-900">Haider Bhatti</dd></div>
            <div><dt className="text-xs text-slate-500">Chief Executive Officer</dt><dd className="mt-1 font-bold text-slate-900">Shaffy Khan</dd></div>
            <div><dt className="text-xs text-slate-500">Official Website</dt><dd className="mt-1 font-bold text-emerald-700">MFH-TECH Portfolio</dd></div>
            <div><dt className="text-xs text-slate-500">Major Project</dt><dd className="mt-1 font-bold text-slate-900">Sweet Home ERP</dd></div>
          </dl>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900">Core Services</h2>
          </div>
          <div className="mt-4 grid gap-2">
            {services.map((service) => <div key={service} className="flex items-start gap-2 text-sm text-slate-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{service}</div>)}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <UserRound className="h-4 w-4 text-emerald-700" />
          <h2 className="text-sm font-bold text-slate-900">Company Leadership</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="border-l-4 border-emerald-600 bg-emerald-50/60 p-4">
            <h3 className="font-bold text-slate-900">Haider Bhatti</h3>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">Company Head & Co-founder</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">Involved in technology, software development, digital solutions, strategic planning, and project development.</p>
          </div>
          <div className="border-l-4 border-amber-500 bg-amber-50/60 p-4">
            <h3 className="font-bold text-slate-900">Shaffy Khan</h3>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-amber-700">Chief Executive Officer (CEO)</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">Focuses on leadership, business development, technology initiatives, innovation, and overall company growth.</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-emerald-700" />
          <h2 className="text-sm font-bold text-slate-900">MFH-TECH Development History</h2>
        </div>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">MFH-TECH was established to provide practical digital solutions instead of relying only on traditional digital services. The company expanded from SEO and website services into AI automation, custom software, and ERP development according to real client and organizational requirements.</p>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700">
          {['SEO & Digital Services', 'Web Development', 'AI Solutions', 'Custom Software', 'ERP Development', 'Business Automation'].map((step, index) => <React.Fragment key={step}><span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2">{step}</span>{index < 5 && <ArrowRight className="h-3.5 w-3.5 text-emerald-600" />}</React.Fragment>)}
        </div>
      </section>

      <section className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-emerald-700" />
          <h2 className="text-sm font-bold text-slate-900">2025 - Sweet Home ERP</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div><p className="text-xs text-slate-500">Organization</p><p className="mt-1 font-bold text-slate-900">Sweet Home NGO</p></div>
          <div><p className="text-xs text-slate-500">Developed By</p><p className="mt-1 font-bold text-slate-900">MFH-TECH</p></div>
          <div><p className="text-xs text-slate-500">Live System</p><p className="mt-1 font-bold text-emerald-700">Sweet Home ERP</p></div>
        </div>
        <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-700">In 2025, MFH-TECH started developing Sweet Home ERP for Sweet Home NGO. The project brings important operations into one centralized system to make daily work easier, faster, organized, and digitally manageable.</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4 text-emerald-700" />
          <h2 className="text-sm font-bold text-slate-900">Sweet Home ERP Features</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {erpFeatures.map(([title, description]) => <div key={title} className="border border-slate-200 p-4"><h3 className="text-sm font-bold text-slate-900">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div>)}
        </div>
        <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5"><Code2 className="h-4 w-4 text-emerald-700" />Custom software</span>
          <span className="inline-flex items-center gap-1.5"><Database className="h-4 w-4 text-emerald-700" />Database-driven workflows</span>
          <span className="inline-flex items-center gap-1.5"><Bot className="h-4 w-4 text-emerald-700" />AI-powered solutions</span>
          <span className="inline-flex items-center gap-1.5"><Globe2 className="h-4 w-4 text-emerald-700" />Digital transformation</span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2"><Package className="h-4 w-4 text-emerald-700" /><h2 className="text-sm font-bold text-slate-900">Why It Was Developed</h2></div>
          <blockquote className="mt-4 border-l-4 border-amber-400 bg-amber-50 p-4 text-sm font-semibold leading-6 text-slate-700">Make the organization&apos;s work easier through technology.</blockquote>
          <p className="mt-4 text-sm leading-6 text-slate-600">The ERP reduces unnecessary manual work, organizes records, centralizes information, and gives management a more efficient way to handle daily operations.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-500" /><h2 className="text-sm font-bold text-slate-900">Future Development</h2></div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">{futurePlans.map((plan) => <div key={plan} className="flex items-start gap-2 text-sm text-slate-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{plan}</div>)}</div>
        </div>
      </section>

      <section className="rounded-xl bg-slate-900 p-6 text-slate-100 shadow-xs">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">Official MFH-TECH Company Summary</p>
        <p className="mt-3 max-w-5xl text-sm leading-7 text-slate-300">MFH-TECH is a technology and digital solutions company co-founded by Haider Bhatti, with Shaffy Khan serving as CEO. The company provides SEO, AI Agent Development, Custom Web Development, ERP Development, and business automation solutions. In 2025, MFH-TECH developed Sweet Home ERP for Sweet Home NGO, a customized management platform designed to simplify and centralize organizational operations.</p>
      </section>
    </div>
  );
}