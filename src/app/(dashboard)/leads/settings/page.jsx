'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import CourseAndFee from '@/components/dashboard/Lead/Settings/CourseAndFee';
import Sources from '@/components/dashboard/Lead/Settings/Sources';
import Statuses from '@/components/dashboard/Lead/Settings/Statuses';
import Preferences from '@/components/dashboard/Lead/Settings/Preferences';
import FieldMapping from '@/components/dashboard/Lead/Settings/FieldMapping';
import TableReorder from '@/components/dashboard/Lead/Settings/TableReorder';
import CurrencySettings from '@/components/dashboard/Lead/Settings/CurrencySettings';
import LeadAllocation from '@/components/dashboard/Lead/Settings/LeadAllocation';
import Images from '@/components/dashboard/Lead/Settings/Images';
import WelcomeTemplate from '@/components/dashboard/Lead/Settings/WelcomeTemplate';
import EmailTemplateManager from '@/components/dashboard/Lead/Settings/EmailTemplateManager';
import StatusTemplateMapping from '@/components/dashboard/Lead/Settings/StatusTemplateMapping';
import CourseTemplateMapping from '@/components/dashboard/Lead/Settings/CourseTemplateMapping';
import JustdialSulekha from '@/components/dashboard/Lead/Settings/JustdialSulekha';
import WebSync from '@/components/dashboard/Lead/Settings/WebSync';
import WhatsAppConfig from '@/components/dashboard/Lead/Settings/WhatsAppConfig';
import WhatsAppAutomation from '@/components/dashboard/Lead/Settings/WhatsAppAutomation';
import Calendly from '@/components/dashboard/Lead/Settings/Calendly';
import GoogleDrive from '@/components/dashboard/Lead/Settings/GoogleDrive';

// ICONS
import { RiArrowDownSLine, RiArrowRightSLine } from "react-icons/ri";

export default function Settings() {
  const router = useRouter();

  const [activeMenu, setActiveMenu] = useState("courses");
  const [openMenus, setOpenMenus] = useState({});   // main collapse
  const [openSubMenus, setOpenSubMenus] = useState({}); // nested collapse

  // ---------------------------------------
  // COLLAPSIBLE MENU STRUCTURE
  // ---------------------------------------

  const menuStructure = [
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
  ];

  // ---------------------------------------
  // RENDER CONTENT
  // ---------------------------------------

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
      
      default:
        return <div className="text-gray-500">Select an item from the menu</div>;
    }
  };

  // ---------------------------------------
  // MAIN MENU TOGGLE (Accordion)
  // ---------------------------------------

  const toggleMenu = (key) => {
    setOpenMenus({
      [key]: !openMenus[key]   // open clicked, close others
    });
  };

  // ---------------------------------------
  // NESTED SUB MENU TOGGLE (Inside Templates)
  // ---------------------------------------

  const toggleSubMenu = (key) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="flex h-full border rounded-md shadow-sm">

      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-4 flex flex-col justify-between">
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-700">Settings</h3>

          <ul className="space-y-2 text-gray-700">

            {menuStructure.map((menu) => (
              <li key={menu.key}>
                
                {/* MAIN MENU */}
                <div
                  onClick={() => toggleMenu(menu.key)}
                  className="cursor-pointer flex justify-between items-center px-2 py-2 hover:bg-gray-200 rounded"
                >
                  <span>{menu.label}</span>
                  {openMenus[menu.key] ? (
                    <RiArrowDownSLine size={18} />
                  ) : (
                    <RiArrowRightSLine size={18} />
                  )}
                </div>

                {/* SUB MENUS */}
                {openMenus[menu.key] && (
                  <ul className="ml-4 mt-1 space-y-1 border-l pl-3 border-gray-300">

                    {menu.children.map((child) => {

                      // -----------------------------
                      // NESTED SUBMENU (Template Mapping)
                      // -----------------------------
                      if (child.nested) {
                        return (
                          <li key={child.key}>
                            {/* Nested Parent */}
                            <div
                              onClick={() => toggleSubMenu(child.key)}
                              className="cursor-pointer flex justify-between items-center px-2 py-1 hover:bg-gray-200 rounded"
                            >
                              <span>{child.label}</span>
                              {openSubMenus[child.key] ? (
                                <RiArrowDownSLine size={16} />
                              ) : (
                                <RiArrowRightSLine size={16} />
                              )}
                            </div>

                            {/* Nested Children */}
                            {openSubMenus[child.key] && (
                              <ul className="ml-4 mt-1 space-y-1 border-l pl-3 border-gray-300">
                                {child.children.map((sub) => (
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

                      // -----------------------------
                      // NORMAL CHILD MENU
                      // -----------------------------
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
        </div>

        {/* BACK BUTTON */}
        <button
          onClick={() => router.push('/leads')}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ← Back
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <section className="flex-1 p-6 bg-white">{renderContent()}</section>
    </div>
  );
}
