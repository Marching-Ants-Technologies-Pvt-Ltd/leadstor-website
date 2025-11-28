'use client';

import React, { useState, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { RiArrowDownSLine, RiArrowRightSLine } from "react-icons/ri";

// ---------------------------------------------------
// ⚡ 1. DYNAMIC IMPORTS (Lazy Loading)
// ---------------------------------------------------
const Statuses = dynamic(() => import('@/components/dashboard/Lead/Settings/Statuses'), { ssr: false });
const Sources = dynamic(() => import('@/components/dashboard/Lead/Settings/Sources'), { ssr: false });
const LeadAllocation = dynamic(() => import('@/components/dashboard/Lead/Settings/LeadAllocation'), { ssr: false });
const FieldMapping = dynamic(() => import('@/components/dashboard/Lead/Settings/FieldMapping'), { ssr: false });
const TableReorder = dynamic(() => import('@/components/dashboard/Lead/Settings/TableReorder'), { ssr: false });
const CourseAndFee = dynamic(() => import('@/components/dashboard/Lead/Settings/CourseAndFee'), { ssr: false });
const Preferences = dynamic(() => import('@/components/dashboard/Lead/Settings/Preferences'), { ssr: false });
const Images = dynamic(() => import('@/components/dashboard/Lead/Settings/Images'), { ssr: false });
const CurrencySettings = dynamic(() => import('@/components/dashboard/Lead/Settings/CurrencySettings'), { ssr: false });

const WelcomeTemplate = dynamic(() => import('@/components/dashboard/Lead/Settings/WelcomeTemplate'), { ssr: false });
const EmailTemplateManager = dynamic(() => import('@/components/dashboard/Lead/Settings/EmailTemplateManager'), { ssr: false });
const StatusTemplateMapping = dynamic(() => import('@/components/dashboard/Lead/Settings/StatusTemplateMapping'), { ssr: false });
const CourseTemplateMapping = dynamic(() => import('@/components/dashboard/Lead/Settings/CourseTemplateMapping'), { ssr: false });

const JustdialSulekha = dynamic(() => import('@/components/dashboard/Lead/Settings/JustdialSulekha'), { ssr: false });
const WebSync = dynamic(() => import('@/components/dashboard/Lead/Settings/WebSync'), { ssr: false });
const WhatsAppConfig = dynamic(() => import('@/components/dashboard/Lead/Settings/WhatsAppConfig'), { ssr: false });
const WhatsAppAutomation = dynamic(() => import('@/components/dashboard/Lead/Settings/WhatsAppAutomation'), { ssr: false });
const Calendly = dynamic(() => import('@/components/dashboard/Lead/Settings/Calendly'), { ssr: false });
const GoogleDrive = dynamic(() => import('@/components/dashboard/Lead/Settings/GoogleDrive'), { ssr: false });
const IVRSettings = dynamic(() => import('@/components/dashboard/Lead/Settings/IVRSettings'), { ssr: false });
const Facebook = dynamic(() => import('@/components/dashboard/Lead/Settings/Facebook'), { ssr: false });

const Loading = dynamic(() => import('@/components/dashboard/Lead/Settings/loading'), { ssr: false });


// ---------------------------------------------------
// ⚡ 2. SETTINGS PAGE
// ---------------------------------------------------
export default function Settings() {
  const router = useRouter();

  // Active selected content
  const [activeMenu, setActiveMenu] = useState("courses");

  // Dropdown states
  const [openMenus, setOpenMenus] = useState({});
  const [openSubMenus, setOpenSubMenus] = useState({});

  // ---------------------------------------------------
  // MENU STRUCTURE MEMOIZED (Optimized)
  // ---------------------------------------------------
  const menuStructure = useMemo(
    () => [
      {
        label: "Integrations",
        key: "integrations",
        collapsible: true,
        children: [
          { key: "facebook", label: "Facebook" },
          { key: "justdial", label: "Justdial - Sulekha" },
          { key: "webSync", label: "WebSync" },
          { key: "IVR", label: "IVR" },
          {
            key: "whatsApp",
            label: "WhatsApp",
            nested: true,
            children: [
              { key: "whatsAppConfig", label: "WhatsApp Config" },
              { key: "whatsAppAutomation", label: "WhatsApp Automation" },
            ]
          },
          { key: "googleDrive", label: "Google Drive" },
          { key: "calendly", label: "Calendly" },
        ]
      },

      {
        label: "Templates",
        key: "templates",
        collapsible: true,
        children: [
          { key: "welcomeTemplate", label: "Welcome Template" },
          { key: "emailTemplateManagement", label: "Email Template Management" },
          {
            key: "templateMapping",
            label: "Template Mapping",
            nested: true,
            children: [
              { key: "templateStatusWise", label: "Status - Course Wise" },
              { key: "templateCourseWise", label: "Course Wise" },
            ]
          }
        ]
      },

      {
        label: "Lead Settings",
        key: "leadSetup",
        collapsible: true,
        children: [
          { key: "statuses", label: "Statuses" },
          { key: "courses", label: "Courses & Fee" },
          { key: "sources", label: "Sources" },
          { key: "leadAllocation", label: "Lead Allocation" },
          { key: "mapping", label: "Field Mapping" },
          { key: "tableReorder", label: "Table Reorder" },
        ]
      },

      {
        label: "General",
        key: "general",
        collapsible: true,
        children: [
          { key: "preferences", label: "Preferences" },
          { key: "images", label: "Images" },
          { key: "currencySettings", label: "Currency Settings" }
        ]
      }
    ],
    []
  );


  // ---------------------------------------------------
  // SELECT CONTENT LAZILY
  // ---------------------------------------------------
  const renderContent = () => {
    switch (activeMenu) {
      case "statuses": return <Statuses />;
      case "sources": return <Sources />;
      case "leadAllocation": return <LeadAllocation />;
      case "mapping": return <FieldMapping />;
      case "tableReorder": return <TableReorder />;
      case "courses": return <CourseAndFee />;
      case "preferences": return <Preferences />;
      case "images": return <Images />;
      case "currencySettings": return <CurrencySettings />;

      case "welcomeTemplate": return <WelcomeTemplate />;
      case "emailTemplateManagement": return <EmailTemplateManager />;
      case "templateStatusWise": return <StatusTemplateMapping />;
      case "templateCourseWise": return <CourseTemplateMapping />;

      case "justdial": return <JustdialSulekha />;
      case "webSync": return <WebSync />;
      case "whatsAppConfig": return <WhatsAppConfig />;
      case "whatsAppAutomation": return <WhatsAppAutomation />;
      case "calendly": return <Calendly />;
      case "googleDrive": return <GoogleDrive />;
      case "facebook": return <Facebook />;
      case "IVR": return <IVRSettings />;

      default:
        return <div className="text-gray-500">Select an item from the menu</div>;
    }
  };


  // ---------------------------------------------------
  // TOGGLES
  // ---------------------------------------------------
  const toggleMenu = (key) => {
    setOpenMenus({ [key]: !openMenus[key] }); // closes other menus
  };

  const toggleSubMenu = (key) => {
    setOpenSubMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };


  // ---------------------------------------------------
  // PAGE LAYOUT
  // ---------------------------------------------------
  return (
    <div className="flex h-full border rounded-md shadow-sm">

      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-100 p-4 overflow-y-auto">
        <h3 className="mb-4 text-lg font-semibold text-gray-700">Settings</h3>

        <ul className="space-y-2 text-gray-700">

          {menuStructure.map(menu => (
            <li key={menu.key}>
              <div
                onClick={() => toggleMenu(menu.key)}
                className="cursor-pointer flex justify-between items-center px-2 py-2 hover:bg-gray-200 rounded"
              >
                <span>{menu.label}</span>
                {openMenus[menu.key] ? <RiArrowDownSLine /> : <RiArrowRightSLine />}
              </div>

              {openMenus[menu.key] && (
                <ul className="ml-4 mt-1 space-y-1 border-l pl-3 border-gray-300">
                  {menu.children.map(child => {

                    if (child.nested) {
                      return (
                        <li key={child.key}>
                          <div
                            onClick={() => toggleSubMenu(child.key)}
                            className="cursor-pointer flex justify-between items-center px-2 py-1 hover:bg-gray-200 rounded"
                          >
                            <span>{child.label}</span>
                            {openSubMenus[child.key] ? <RiArrowDownSLine /> : <RiArrowRightSLine />}
                          </div>

                          {openSubMenus[child.key] && (
                            <ul className="ml-4 mt-1 space-y-1 border-l pl-3 border-gray-300">
                              {child.children.map(sub => (
                                <li
                                  key={sub.key}
                                  onClick={() => setActiveMenu(sub.key)}
                                  className={`cursor-pointer px-2 py-1 rounded ${
                                    activeMenu === sub.key
                                      ? "bg-blue-100 text-blue-600 font-medium"
                                      : "hover:text-blue-600"
                                  }`}
                                >
                                  {sub.label}
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    }

                    return (
                      <li
                        key={child.key}
                        onClick={() => setActiveMenu(child.key)}
                        className={`cursor-pointer px-2 py-1 rounded ${
                          activeMenu === child.key
                            ? "bg-blue-100 text-blue-600 font-medium"
                            : "hover:text-blue-600"
                        }`}
                      >
                        {child.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          ))}

        </ul>

        <button
          onClick={() => router.push('/leads')}
          className="w-full mt-4 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ← Back
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <section className="flex-1 p-6 bg-white overflow-y-auto">
        <Suspense fallback={<Loading />}>
          {renderContent()}
        </Suspense>
      </section>

    </div>
  );
}
