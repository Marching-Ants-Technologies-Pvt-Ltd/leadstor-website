"use client";
import React, { useEffect, useState } from "react";
import {
  RiUserLine,
  RiMailLine,
  RiBuildingLine,
  RiPhoneLine,
} from "react-icons/ri";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/ReactToastify.min.css';
import { xFetch } from "@/utility/xFetch";

export default function BusinessProfile() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    companyName: "",
    email: "",
    corporateId: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ============================
  // FETCH BUSINESS PROFILE
  // ============================
  const fetchProfile = async () => {
    console.log("Calling fetchProfile...");
    setLoading(true);

    await xFetch({
        path: `/services/profile/getBusinessDetails`
    })
    .then((res) => {
        console.log("Profile data fetched:", res);
        setForm({
            firstName: res.firstName || "",
            lastName: res.lastName || "",
            mobile: res.mobile || "",
            companyName: res.corporateName || "",
            email: res.corporateEmail || "",
        });
    })
    .catch((error) => {
        console.error(err);
        toast.error("Something went wrong while loading profile");
    })
    .finally(() => setSaving(false));
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ============================
  // UPDATE BUSINESS PROFILE
  // ============================
  const handleUpdate = async () => {
    setSaving(true);

    await xFetch({
        path: `/services/profile/updateBusinessDetails`,
        method: "POST",
        payload: form,
        isformdata: true,
    })
    .then((res) => {
        toast.success("Profile updated successfully!");
        //fetchProfile();
    })
    .catch((error) => {
        console.error(err);
        toast.error("Something went wrong, please try again.");
    })
    .finally(() => setSaving(false));
  };

  if (loading) {
    return <div className="p-5 text-center text-lg">Loading profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-xl rounded-xl border">
      <ToastContainer />

      <h2 className="text-2xl font-semibold mb-6 border-b pb-3">Business Profile</h2>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* FIRST NAME */}
        <div>
          <label className="text-sm font-medium">First Name</label>
          <div className="flex items-center border rounded-lg p-2 mt-1">
            <RiUserLine className="text-gray-500 mr-2" />
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* LAST NAME */}
        <div>
          <label className="text-sm font-medium">Last Name</label>
          <div className="flex items-center border rounded-lg p-2 mt-1">
            <RiUserLine className="text-gray-500 mr-2" />
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* MOBILE */}
        <div>
          <label className="text-sm font-medium">Mobile Number</label>
          <div className="flex items-center border rounded-lg p-2 mt-1">
            <RiPhoneLine className="text-gray-500 mr-2" />
            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* EMAIL */}
        <div>
          <label className="text-sm font-medium">Email</label>
          <div className="flex items-center border rounded-lg p-2 mt-1">
            <RiMailLine className="text-gray-500 mr-2" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* COMPANY NAME */}
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Company Name</label>
          <div className="flex items-center border rounded-lg p-2 mt-1">
            <RiBuildingLine className="text-gray-500 mr-2" />
            <input
              type="text"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

      </div>

      {/* BUTTON */}
      <div className="mt-6 text-right">
        <button
          onClick={handleUpdate}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {saving ? "Updating..." : "Update"}
        </button>
      </div>
    </div>
  );
}
