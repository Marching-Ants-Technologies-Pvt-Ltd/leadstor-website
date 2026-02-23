'use client';

import { useState, useEffect } from 'react';
import { xFetch } from '@/utility/xFetch';
import { Corporate, Test } from '@/utility/TinyDB';

export default function ExtendedFormModal({
  invitationId,
  isOpen,
  onClose,
  onRefresh,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !invitationId) return;

    setLoading(true);
    setError(null);

    xFetch({
      path: `/services/invite/getExtendedFormData?invitationId=${invitationId}&time=${Date.now()}`,
      method: 'GET',
    })
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setError('Failed to load form data');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [isOpen, invitationId]);

  if (!isOpen) return null;

  const googleProfilePic =
    data?.form_data?.input_profilePicture &&
    `https://drive.google.com/uc?export=view&id=${data.form_data.input_profilePicture}`;

  const dummyAvatar = `https://api.dicebear.com/9.x/initials/svg?radius=10&size=100&seed=${data?.name ?? 'U'}`;

  const address = [
    data?.form_data?.address_line1,
    data?.form_data?.address_line2,
    data?.form_data?.address_city,
    data?.form_data?.address_state,
    data?.form_data?.address_code,
  ]
    .filter(Boolean)
    .join(' ');

  const openDriveFile = (fileId) => {
    if (!fileId) return;
    window.open(`https://drive.google.com/file/d/${fileId}/preview`, '_blank');
  };

  const handleEnableResubmit = async () => {
    if (!confirm('Really allow candidate to resubmit the form?')) return;

    try {
      await xFetch({
        path: `/services/invite/enableResubmitApplicationForm?invitationId=${invitationId}&time=${Date.now()}`,
        method: 'GET',
      });
      alert('Resubmit enabled');
      onRefresh?.();
      onClose();
    } catch (err) {
      alert('Failed to enable resubmit');
      console.error(err);
    }
  };

  const handleEdit = () => {
    // Reuse your existing getExtendedFormLink logic
    xFetch({
      path: `/services/invite/getExtendedFormLink`,
      method: 'POST',
      payload: {
        invitationId,
        testId: Test._id,
        time: Date.now(),
      },
    })
      .then((res) => {
        if (res.link) window.open(res.link, '_blank');
      })
      .catch(() => alert('Failed to get edit link'));
  };

  // ────────────────────────────────────────────────
  //  Not submitted yet
  // ────────────────────────────────────────────────
  if (!loading && data && (data.form_datetime ?? '').length < 5) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <img src={dummyAvatar} alt="avatar" className="mx-auto h-24 rounded-full" />
          <h3 className="mt-6 text-2xl font-bold">{data.name || 'Candidate'}</h3>
          <p className="mt-3 text-lg text-red-600 font-medium">Form Not Submitted Yet!</p>

          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
              Close
            </button>
            <button
              onClick={handleEdit}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
            >
              <i className="ri-pencil-line"></i>
              Submit Manually
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────
  //  Normal view (form submitted)
  // ────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold">Application Form Data</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">
            ×
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">Loading form data...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : (
            <>
              {/* Profile header */}
              <div className="text-center mb-8">
                <img
                  src={googleProfilePic || dummyAvatar}
                  alt="Profile"
                  className="mx-auto h-28 w-28 rounded-full object-cover border-4 border-gray-100 shadow"
                />
                <h3 className="mt-4 text-2xl font-bold">{data?.name}</h3>
                <p className="text-gray-500">
                  Submitted on {data?.form_datetime || '—'}
                </p>
              </div>

              {/* Basic Details */}
              <Section title="Basic Details">
                <InfoItem icon="ri-mail-line" label="Email" value={data?.email} />
                <InfoItem icon="ri-phone-line" label="Phone" value={data?.phone} />
                <InfoItem icon="ri-book-open-line" label="Course" value={data?.course} />
                <InfoItem icon="ri-home-4-line" label="Address" value={address || '—'} />
              </Section>

              {/* Parents */}
              <Section title="Parents / Guardian Details">
                <InfoItem
                  icon="ri-user-line"
                  label="Name"
                  value={data?.form_data?.parent_name || '—'}
                />
                <InfoItem
                  icon="ri-phone-line"
                  label="Phone"
                  value={data?.form_data?.parent_number || '—'}
                />
              </Section>

              {/* Education */}
              <Section title="Educational Qualification">
                <p className="text-gray-700 mb-3">
                  <i className="ri-graduation-cap-line mr-2"></i>
                  {data?.form_data?.current_edu || '—'}
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full border text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 text-left">Level</th>
                        <th className="p-3 text-left">Board/University</th>
                        <th className="p-3">CGPA/%</th>
                        <th className="p-3">Year</th>
                        <th className="p-3 text-center">Document</th>
                      </tr>
                    </thead>
                    <tbody>
                      <EduRow
                        level="Class 10"
                        board={data?.form_data?.std10_univeristy}
                        cgpa={data?.form_data?.std10_cgpa}
                        year={data?.form_data?.std10_year}
                        fileId={data?.form_data?.input_std10}
                      />
                      <EduRow
                        level="Class 12"
                        board={data?.form_data?.std12_university}
                        cgpa={data?.form_data?.std12_cgpa}
                        year={data?.form_data?.std12_year}
                        fileId={data?.form_data?.input_std12}
                      />
                      <EduRow
                        level="Graduation"
                        board={data?.form_data?.stdG_univeristy}
                        cgpa={data?.form_data?.stdG_cgpa}
                        year={data?.form_data?.stdG_year}
                        fileId={data?.form_data?.input_stdG}
                      />
                      <EduRow
                        level="Post Graduation"
                        board={data?.form_data?.stdPG_university}
                        cgpa={data?.form_data?.stdPG_cgpa}
                        year={data?.form_data?.stdPG_year}
                        fileId={data?.form_data?.input_stdPG}
                      />
                    </tbody>
                  </table>
                </div>
              </Section>

              {/* Work Experience */}
              <Section title="Work Experience">
                <InfoItem icon="ri-briefcase-4-line" label="Company" value={data?.form_data?.work_name || '—'} />
                <InfoItem icon="ri-medal-line" label="Designation" value={data?.form_data?.work_degi || '—'} />
                <InfoItem
                  icon="ri-time-line"
                  label="Experience"
                  value={
                    data?.form_data?.work_exp
                      ? `${data.form_data.work_exp} Years`
                      : '—'
                  }
                />
              </Section>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex flex-wrap gap-3 justify-end">
          {data?.form_data?.input_profilePicture && (
            <ActionButton
              icon="ri-image-line"
              label="Profile Picture"
              onClick={() => openDriveFile(data.form_data.input_profilePicture)}
            />
          )}
          {data?.form_data?.input_aadharcard && (
            <ActionButton
              icon="ri-id-card-line"
              label="Aadhaar Card"
              onClick={() => openDriveFile(data.form_data.input_aadharcard)}
            />
          )}
          {data?.form_data?.input_stdCV && (
            <ActionButton
              icon="ri-file-text-line"
              label="Curriculum Vitae"
              onClick={() => openDriveFile(data.form_data.input_stdCV)}
            />
          )}

          <ActionButton
            icon="ri-lock-unlock-line"
            label="Enable Resubmit"
            variant="success"
            onClick={handleEnableResubmit}
          />

          <ActionButton
            icon="ri-pencil-line"
            label="Edit Form"
            variant="primary"
            onClick={handleEdit}
          />

          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helper Components ──────────────────────────────────────

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h4 className="text-lg font-semibold mb-4 border-b pb-2">{title}</h4>
      {children}
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 mb-3">
      <i className={`${icon} text-xl text-gray-500 mt-1`}></i>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="font-medium">{value || '—'}</div>
      </div>
    </div>
  );
}

function EduRow({
  level,
  board,
  cgpa,
  year,
  fileId,
}) {
  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="p-3 font-medium">{level}</td>
      <td className="p-3">{board || '—'}</td>
      <td className="p-3 text-center">{cgpa || '—'}</td>
      <td className="p-3 text-center">{year || '—'}</td>
      <td className="p-3 text-center">
        {fileId ? (
          <button
            onClick={() => window.open(`https://drive.google.com/file/d/${fileId}/preview`, '_blank')}
            className="text-blue-600 hover:underline"
          >
            View
          </button>
        ) : (
          '—'
        )}
      </td>
    </tr>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  variant = 'default',
}) {
  const base = "flex items-center gap-2 px-5 py-2 rounded-lg transition";
  const styles = {
    default: "bg-gray-200 hover:bg-gray-300",
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
  };

  return (
    <button onClick={onClick} className={`${base} ${styles[variant]}`}>
      <i className={`${icon} text-lg`}></i>
      {label}
    </button>
  );
}